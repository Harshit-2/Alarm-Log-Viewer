using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TemperatureLibrary.Models;
using TemperatureLibrary.Repos;

namespace TemperatureWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    
    public class TemperatureController : ControllerBase
    {
        private readonly ITemperatureRepository _repository;

        
        private readonly ILogger<TemperatureController> _logger;

        public TemperatureController(ITemperatureRepository repository, ILogger<TemperatureController> logger)
        {
            _repository = repository;
            _logger = logger;
        }



        [HttpGet("room/{roomId}")]
        public async Task<IActionResult> GetByRoom(string roomId)
        {
            try
            {
                var temp = await _repository.GetByRoomIdAsync(roomId);
                return Ok(temp);
            }
            catch (TemperatureException)
            {
                
                return Ok(new List<Temperature>());
            }
        }



        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Temperature temperature)
        {
            await _repository.AddAsync(temperature);

            
            _logger.LogInformation(
                "TEMPERATURE RECORDED — ReadingId: {Id}, RoomId: {RoomId}, Value: {Temp}°C",
                temperature.ReadingId, temperature.RoomId, temperature.TemperatureValue);

            return StatusCode(201, temperature);
        }



        [HttpPost("Room")]
        [AllowAnonymous]
        public async Task<IActionResult> InsertRoomStub([FromBody] Room room)
        {
            try
            {
                await _repository.AddRoomStubAsync(room);
                return Ok();
            }
            catch (TemperatureLibrary.Repos.TemperatureException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}