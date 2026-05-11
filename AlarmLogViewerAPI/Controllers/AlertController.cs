using AlertsLibrary.Models;
using AlertsLibrary.Repos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserLibrary.Repos;

namespace AlarmLogViewerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AlertController : ControllerBase
    {
        private readonly IAlertRepository alertRepo;

        public AlertController(IAlertRepository alertRepository)
        {
            alertRepo = alertRepository;
        }

        [HttpGet]
        [ProducesResponseType(200)]
        public async Task<ActionResult> GetAll()
        {
            List<Alert> alerts = await alertRepo.GetAllAlertsAsync();
            return Ok(alerts);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult> GetOne(string id)
        {
            try
            {
                Alert alert = await alertRepo.GetByAlertIdAsync(id);
                return Ok(alert);
            }
            catch (AlertException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("room/{roomId}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<List<Alert>>> GetByRoom(string roomId)
        {
            try
            {
                var roomAlerts = await alertRepo.GetByRoomIdAsync(roomId);
                return Ok(roomAlerts);
            }
            catch (AlertException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("status/{status}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult> GetByStatus(string status)
        {
            try
            {
                Alert alert = await alertRepo.GetByStatusAsync(status);
                return Ok(alert);
            }
            catch (AlertException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPost]
        [ProducesResponseType(201)]
        [ProducesResponseType(400)]
        public async Task<ActionResult> Insert(Alert alert)
        {
            try
            {
                await alertRepo.AddAsync(alert);
                return Created($"api/alert/{alert.AlertId}", alert);
            }
            catch (AlertException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        public async Task<ActionResult> Update(string id, Alert alert)
        {
            try
            {
                await alertRepo.UpdateAlertAsync(id, alert);
                return Ok(alert);
            }
            catch (AlertException ex)
            {
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
                await alertRepo.DeleteAsync(id);
                return Ok("User deleted successfully");
            }
            catch (UserException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPost("Room")]
        [AllowAnonymous]
        public async Task<ActionResult> InsertRoomStub([FromBody] Room room)
        {
            try
            {
                await alertRepo.AddRoomStubAsync(room);
                return Ok();
            }
            catch (AlertException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
