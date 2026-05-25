using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using UserLibrary.Models;
using UserLibrary.Repos;

namespace UserViewerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository userRepo;

        public UserController(IUserRepository userRepository)
        {
            userRepo = userRepository;
        }

        [HttpGet]
        [ProducesResponseType(200)]
        public async Task<ActionResult> GetAll()
        {
            List<User> users = await userRepo.GetAllAsync();
            return Ok(users);
        }



        [HttpGet("credentials")]
        [AllowAnonymous]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult> GetByCredentials([FromQuery] string username, [FromQuery] string password)
        {
            try
            {
                User user = await userRepo.GetByCredentialsAsync(username, password);
                return Ok(user);
            }
            catch (UserException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPost]
        [AllowAnonymous]
        [ProducesResponseType(201)]
        [ProducesResponseType(400)]
        public async Task<ActionResult> Insert([FromBody] User user, [FromQuery] string adminKey = null)
        {
            try
            {
                if (user.Role == "Admin")
                {
                    if (adminKey != "cognizant")
                    {
                        return BadRequest("Invalid Admin Authorization Key. Registration failed.");
                    }
                }

                await userRepo.AddAsync(user);

                HttpClient roomHttp = new HttpClient() { BaseAddress = new Uri("http://localhost:5286/api/Room/") };
                await roomHttp.PostAsJsonAsync("User", new { UserId = user.UserId });

                return Created($"api/user/{user.UserId}", user);
            }
            catch (UserException ex)
            {
                return BadRequest(ex.Message);
            }
        }



        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult> Delete(string id)
        {
            try
            {
                await userRepo.DeleteAsync(id);
                return Ok("User deleted successfully");
            }
            catch (UserException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}