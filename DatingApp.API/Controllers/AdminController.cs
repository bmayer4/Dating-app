using System.Threading.Tasks;
using DatingApp.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using DatingApp.API.Dtos;
using Microsoft.AspNetCore.Identity;
using DatingApp.API.Models;
using AutoMapper;
using System.Collections.Generic;
using System;
using CloudinaryDotNet;
using Microsoft.Extensions.Options;
using DatingApp.API.Helpers;
using CloudinaryDotNet.Actions;

namespace DatingApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController: ControllerBase
    {
        private readonly DataContext _context;
        private readonly IDatingRepository _repo;
        private readonly IMapper _mapper;
        private readonly UserManager<User> _userManager;
        private readonly IOptions<CloudinarySettings> _cloudinaryConfig;
        private Cloudinary _cloudinary;

        public AdminController(DataContext context, UserManager<User> userManager, IDatingRepository repo, IMapper mapper, IOptions<CloudinarySettings> cloudinaryConfig)
        {
            _context = context;
            _userManager = userManager;
            _repo = repo;
            _mapper = mapper;
             _cloudinaryConfig = cloudinaryConfig;

            Account acc = new Account(
                _cloudinaryConfig.Value.CloudName,
                _cloudinaryConfig.Value.ApiKey,
                _cloudinaryConfig.Value.ApiSecret
            );

            _cloudinary = new Cloudinary(acc);
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpGet("usersWithRoles")]
        public async Task<IActionResult> GetUsersWithRoles()
         {
            //  we want a list of users long with roles they belong to, need to use a join, LINQ query syntax is much clearer
             var userList = await (from user in _context.Users orderby user.UserName
                                    select new {
                                        Id = user.Id,  //gets converted to camalcase
                                        Username = user.UserName,
                                        Roles = (from userRole in user.UserRoles
                                                join role in _context.Roles on userRole.RoleId equals role.Id
                                                select role.Name).ToList()
                                    }).ToListAsync();    

            // var userList = await _context.Users
            //     .OrderBy(u => u.UserName)
            //     .Select(u => new {
            //         id = u.Id,
            //         userName = u.UserName,
            //         Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList()
            // }).ToListAsync();  

             return Ok(userList);
         }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("editRoles/{userName}")]
        public async Task<IActionResult> EditRoles(string userName, [FromBody] RoleEditDto roleEditDto)
        {
            var user = await _userManager.FindByNameAsync(userName);

            var userRoles = await _userManager.GetRolesAsync(user);

            var selectedRoles = roleEditDto.RoleNames;

            selectedRoles = selectedRoles ?? new string[] {};  //users could be removed from all roles

            var result = await _userManager.AddToRolesAsync(user, selectedRoles.Except(userRoles));  // except roles user is aready a member of

            if (!result.Succeeded)
            {
                return BadRequest("Failed to add to roles");
            }

            result = await _userManager.RemoveFromRolesAsync(user, userRoles.Except(selectedRoles));

            if (!result.Succeeded)
            {
                return BadRequest("Failed to remove the roles");
            }

            return Ok(await _userManager.GetRolesAsync(user));
        }
 
        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpGet("photosForModeration")]
        public async Task<IActionResult> GetPhotosForModeration()
         {
            var UnnaprovedPhotosFromRepo = await _repo.GetPhotosForApproval();

            var photosToReturn = _mapper.Map<IEnumerable<PhotoForDetailDto>>(UnnaprovedPhotosFromRepo);

            return Ok(photosToReturn);
         }

        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpPatch("photos/{id}/approve")]
        public async Task<IActionResult> ApprovePhoto(int id)
         {
            var photoFromRepo = await _repo.GetPhotoForAdmin(id);

             if (photoFromRepo == null) {
                return BadRequest();
            }

            photoFromRepo.IsApproved = true;

            if (!await _repo.SaveAll())
            {
                throw new Exception($"Failed to approve photo with id of {id}.");  
            }

            return NoContent();
         }

        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpDelete("photos/{id}/reject")]
        public async Task<IActionResult> RejectPhoto(int id)
         {
            var photoFromRepo = await _repo.GetPhotoForAdmin(id);

             if (photoFromRepo == null) {
                return BadRequest();
            }

            if (photoFromRepo.IsApproved || photoFromRepo.IsMain) {
                return BadRequest();
            }

            var deleteParams = new DeletionParams(photoFromRepo.PublicId);
            var result = _cloudinary.Destroy(deleteParams);

            if (result.Result == "ok") {
                _repo.Delete(photoFromRepo);  
            }

            if (!await _repo.SaveAll())
            {
                throw new Exception($"Failed to delete photo with id of {id}.");  
            }

            return NoContent();
         }

    }
}