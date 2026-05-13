using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TemperatureLibrary.Models;
using TemperatureLibrary.Repos;

namespace TemperatureWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TemperatureController : ControllerBase
    {
        private readonly ITemperatureRepository _repository;

        public TemperatureController(ITemperatureRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var temps = await _repository.GetAllTemperaturesAsync();
            return Ok(temps);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var temp = await _repository.GetByIdAsync(id);
            return Ok(temp);
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
                // No temperatures recorded for this room yet — return empty list instead of error
                return Ok(new List<Temperature>());
            }
        }

        [HttpGet("room/{roomId}/latest")]
        public async Task<IActionResult> GetLatestByRoom(string roomId)
        {
            var temp = await _repository.GetLatestByRoomIdAsync(roomId);
            return Ok(temp);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Temperature temperature)
        {
            await _repository.AddAsync(temperature);
            return CreatedAtAction(nameof(GetById), new { id = temperature.ReadingId }, temperature);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Temperature temperature)
        {
            await _repository.UpdateAsync(id, temperature);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _repository.DeleteAsync(id);
            return NoContent();
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