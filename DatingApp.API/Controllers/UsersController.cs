using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DatingApp.API.Controllers
{
    [ServiceFilter(typeof(LogUserActivity))]
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController: ControllerBase
    {
        private readonly IDatingRepository _repo;
        private readonly IMapper _mapper;

        public UsersController(IDatingRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] UserParams userParams)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var userFromRepo = await _repo.GetUser(currentUserId, false);  //  not necessary to null check since userId was found

            userParams.UserId = currentUserId;

            if (string.IsNullOrEmpty(userParams.Gender))
            {
                userParams.Gender = userFromRepo.Gender == "male" ? "female" : "male";
            }

            var users = await _repo.GetUsers(userParams);

            Response.AddPaginationHeader(users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages);

            var usersToReturn = _mapper.Map<IEnumerable<UserForListDto>>(users);

            return Ok(usersToReturn);
        }

        [HttpGet("{id}", Name = "GetUser")]
        public async Task<IActionResult> GetUser(int id)
        {
            //for photo appoval
            var isCurrentUser = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value) == id;
           
            var user = await _repo.GetUser(id, isCurrentUser);

            if (user == null) {
                return BadRequest();
            }

            var userToReturn = _mapper.Map<UserForDetailDto>(user);

            return Ok(userToReturn);
        }

        [HttpPut("{id}")] 
        public async Task<IActionResult> EditUser(int id, [FromBody] UserForUpdateDto userforUpdateDto)
        {
            if (id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) // id matches token id
            {
                return Unauthorized();
            }

            var userFromRepo = await _repo.GetUser(id, true);

            _mapper.Map(userforUpdateDto, userFromRepo);

            if (!await _repo.SaveAll())
            {
                throw new Exception($"Updating user {id} failed on save."); 
            }
            
            return NoContent();
        }

        [HttpPost("{id}/like/{recipientId}")]
        public async Task<IActionResult> LikeUser(int id, int recipientId)
        {
            if (id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)) // id matches token id
            {
                return Unauthorized();
            }

            var likeFromRepo = await _repo.GetLike(id, recipientId);

            if (likeFromRepo != null) {
                return BadRequest("You've already liked this user");
            }

            var recipientFromRepo = await _repo.GetUser(recipientId, false);

            if (recipientFromRepo == null) {
                return NotFound();
            }

            var like = new Like()
            {
                LikerId = id,   //LikerId is foreign key here, so would go under user.Likees
                LikeeId = recipientId
            };

            _repo.Add<Like>(like);

            if (!await _repo.SaveAll())
            {
                throw new Exception($"Updating user {id} failed on save."); 
            }
            
            return Ok();
        }
    }
}