using System.Threading.Tasks;
using AutoMapper;
using CloudinaryDotNet;
using DatingApp.API.Data;
using DatingApp.API.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using DatingApp.API.Dtos;
using System.Security.Claims;
using CloudinaryDotNet.Actions;
using DatingApp.API.Models;
using System.Linq;
using System;

namespace DatingApp.API.Controllers
{
    [Route("api/users/{userId}/photos")]
    [ApiController]
    public class PhotosController : ControllerBase
    {
        private readonly IDatingRepository _repo;
        private readonly IMapper _mapper;
        private readonly IOptions<CloudinarySettings> _cloudinaryConfig;
        private Cloudinary _cloudinary;

        public PhotosController(IDatingRepository repo, IMapper mapper, IOptions<CloudinarySettings> cloudinaryConfig)
        {
            _mapper = mapper;
            _repo = repo;
            _cloudinaryConfig = cloudinaryConfig;

            Account acc = new Account(
                _cloudinaryConfig.Value.CloudName,
                _cloudinaryConfig.Value.ApiKey,
                _cloudinaryConfig.Value.ApiSecret
            );

            _cloudinary = new Cloudinary(acc);
        }

        [HttpGet("{id}", Name = "GetPhoto")]  
        public async Task<IActionResult> GetPhoto(int userId, int id)
        {
            var photoFromRepo = await _repo.GetPhoto(userId, id);

            if (photoFromRepo == null) {
                return BadRequest();
            }

            var photoToReturn = _mapper.Map<PhotoForReturnDto>(photoFromRepo);

            return Ok(photoToReturn);
        }

        [HttpPost]  //FromForm to recognize file
        public async Task<IActionResult> AddPhotoForUser(int userId, [FromForm] PhotoForCreationDto photoForCreationDto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) // id matches token id
            {
                return Unauthorized();
            }

            var userFromRepo = await _repo.GetUser(userId);

            var file = photoForCreationDto.File;
            var uploadResult = new ImageUploadResult();  //store result from cloudinary

            if (file == null) {   //maybe validation would be better..
                return BadRequest();   //don't want to call length on null file
            }

            if (file.Length > 0) 
            {
                //OpenReadStream reads files into memory, using so we can dispose of it
                using(var stream = file.OpenReadStream())
                {
                    var uploadParams = new ImageUploadParams()  //object initializer syntax
                     {
                        File = new FileDescription(file.Name, stream),
                        Transformation = new Transformation().Width(500).Height(500).Crop("fill").Gravity("face")
                     };

                     uploadResult = _cloudinary.Upload(uploadParams);
                }
            }

            photoForCreationDto.Url = uploadResult.Uri.ToString();
            photoForCreationDto.PublicId = uploadResult.PublicId;

            var photoEntity = _mapper.Map<Photo>(photoForCreationDto);

            if (!userFromRepo.Photos.Any(p => p.IsMain))
            {
                photoEntity.IsMain = true;
            }

            userFromRepo.Photos.Add(photoEntity);  //add as child so userId gets set in photoEntity

            if (!await _repo.SaveAll())
            {
                throw new Exception($"Failed to upload photo."); 
            }

            var photoToReturn = _mapper.Map<PhotoForReturnDto>(photoEntity);
            
            return CreatedAtRoute("GetPhoto", new { userId = userId, id = photoEntity.Id }, photoToReturn );
        }

        [HttpPatch("{id}/setMain")]   //teacher used post and said it is easier for property but I wanted to follow rest
        public async Task<IActionResult> SetMainPhoto(int userId, int id) 
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) 
            {
                return Unauthorized();
            }

            var photoFromRepo = await _repo.GetPhoto(userId, id);

            if (photoFromRepo == null) {
                return BadRequest();
            }

            if (photoFromRepo.IsMain == true) {
                return BadRequest("This is already the main photo");
            }

            var mainPhotoForUser = await _repo.GetMainPhotoForUser(userId);

            if (mainPhotoForUser == null) {
                return BadRequest();
            }

            mainPhotoForUser.IsMain = false;

            photoFromRepo.IsMain = true;

            if (!await _repo.SaveAll())
            {
                throw new Exception($"Failed to set photo as main.");  
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhoto(int userId, int id)
         {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) 
            {
                return Unauthorized();
            }

            var photoFromRepo = await _repo.GetPhoto(userId, id);

            if (photoFromRepo == null) {
                return BadRequest();
            }

             if (photoFromRepo.IsMain == true) {  //this is fine for our app
                return BadRequest("You can't delete main photo");
            }

            var deleteParams = new DeletionParams(photoFromRepo.PublicId);
            var result = _cloudinary.Destroy(deleteParams);

            if (result.Result == "ok") {
                _repo.Delete(photoFromRepo);  // not deleting seed photos since they arent front cloudinary, teacher shows us how but thats ok   
            }

            if (!await _repo.SaveAll())
            {
                throw new Exception($"Failed to delete photo with id of {id}.");  
            }

            return NoContent();
         }

    }
}