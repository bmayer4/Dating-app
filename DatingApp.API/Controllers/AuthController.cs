using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;

namespace DatingApp.API.Controllers
{
    [Route("api/[controller]")]
    //[ApiController]  //1. enforces attribute routing, 2. validates request (don't need FromBody with this)
    public class AuthController: ControllerBase
    {
        private readonly IAuthRepository _repo;
        private readonly IConfiguration _config;

        public AuthController(IAuthRepository repo, IConfiguration config)
        {
            _repo = repo;
            _config = config;
        }   

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserForRegisterDto userForRegisterDto) 
        {
            //class decoration  [ApiController] does this for us (as well as [FromBody]), so this isn't necessary here, but ill leave it
            if (!ModelState.IsValid) {
                return BadRequest(ModelState);
            }

            userForRegisterDto.Username = userForRegisterDto.Username.ToLower();

            if (await _repo.UserExists(userForRegisterDto.Username)) {
                return BadRequest("Username already exists!");
            }

            var userToCreate = new User //use automapper here????..
            {
                Username = userForRegisterDto.Username
            };

            var createdUser = await _repo.Register(userToCreate, userForRegisterDto.Password);

            return StatusCode(201);  //will change later
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserForLoginDto userForLoginDto) 
        {
            //throw new Exception("Computer says NO!");
            if (!ModelState.IsValid) {
                return BadRequest(ModelState); 
            }

            var userFromRepo = await _repo.Login(userForLoginDto.Username.ToLower(), userForLoginDto.Password);

            if (userFromRepo == null) {
                return Unauthorized();  //dont want to give user hint like username doesnt exist or incorrect pw
            }

            //implicitly-typed array
            var claims = new [] 
            {
                new Claim(ClaimTypes.NameIdentifier, userFromRepo.Id.ToString()),
                 new Claim(ClaimTypes.Name, userFromRepo.Username)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.GetSection("AppSettings:Token").Value));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);  //in production environments would encypt token itself with https and certificates..

            return Ok(new {
                token = tokenHandler.WriteToken(token)
            });
        } 
    }
}