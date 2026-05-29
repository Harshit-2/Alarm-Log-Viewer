using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RoomsLibrary.Models;
using RoomsLibrary.Repos;

namespace RoomViewerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    
    public class RoomController : ControllerBase
    {
        private readonly IRoomRepository roomRepo;

        
        private readonly ILogger<RoomController> _logger;

        public RoomController(IRoomRepository roomRepository, ILogger<RoomController> logger)
        {
            roomRepo = roomRepository;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(200)]
        public async Task<ActionResult> GetAll()
        {
            List<Room> rooms = await roomRepo.GetAllAsync();
            return Ok(rooms);
        }



        [HttpPost]
        [ProducesResponseType(201)]
        [ProducesResponseType(400)]

        public async Task<ActionResult> Insert([FromBody] Room room)
        {
            try
            {
                await roomRepo.AddAsync(room);

                
                _logger.LogInformation(
                    "ROOM CREATED — RoomId: {RoomId}, Name: {Name}, MinTemp: {Min}°C, MaxTemp: {Max}°C, CreatedBy: {UserId}",
                    room.RoomId, room.RoomName, room.MinTemp, room.MaxTemp, room.CreatedByUserId);

                HttpClient tempHttp = new HttpClient() { BaseAddress = new Uri("http://localhost:5155/api/Temperature/") };
                await tempHttp.PostAsJsonAsync("Room", new { RoomId = room.RoomId });

                HttpClient alertHttp = new HttpClient() { BaseAddress = new Uri("http://localhost:5179/api/Alert/") };
                await alertHttp.PostAsJsonAsync("Room", new { RoomId = room.RoomId });

                return Created($"api/rooms/{room.RoomId}", room);
            }

            catch (RoomException ex)
            {
                _logger.LogError("Failed to create room {RoomId}: {Error}", room.RoomId, ex.Message);
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        public async Task<ActionResult> Update(string id, [FromBody] Room room)
        {
            try
            {
                await roomRepo.UpdateAsync(room.RoomId, room);
                _logger.LogInformation(
                    "ROOM UPDATED — RoomId: {RoomId}, Name: {Name}, MinTemp: {Min}°C, MaxTemp: {Max}°C",
                    room.RoomId, room.RoomName, room.MinTemp, room.MaxTemp);
                return Ok(room);
            }
            catch (RoomException ex)
            {
                _logger.LogError("Failed to update room {RoomId}: {Error}", room.RoomId, ex.Message);
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]

        public async Task<ActionResult> Delete(string id)
        {
            try
            {
                await roomRepo.DeleteAsync(id);
                _logger.LogInformation("ROOM DELETED — RoomId: {RoomId}", id);
                return Ok("Room deleted successfully");
            }
            catch (RoomException ex)
            {
                _logger.LogError("Failed to delete room {RoomId}: {Error}", id, ex.Message);
                return NotFound(ex.Message);
            }
        }

        [HttpPost("User")]
        [AllowAnonymous]
        public async Task<ActionResult> InsertUserStub([FromBody] User user)
        {
            try
            {
                await roomRepo.AddUserStubAsync(user);
                return Ok();
            }
            catch (RoomException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}