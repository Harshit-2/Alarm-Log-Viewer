using AlertsLibrary.Models;
using AlertsLibrary.Repos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserLibrary.Repos;

namespace AlarmLogViewerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    
    public class AlertController : ControllerBase
    {
        private readonly IAlertRepository alertRepo;

        
        
        private readonly ILogger<AlertController> _logger;

        
        public AlertController(IAlertRepository alertRepository, ILogger<AlertController> logger)
        {
            alertRepo = alertRepository;
            _logger = logger;
        }

        
        [HttpGet]
        [ProducesResponseType(200)]
        public async Task<ActionResult> GetAll()
        {
            List<Alert> alerts = await alertRepo.GetAllAlertsAsync();
            _logger.LogInformation("Fetched all alerts. Total count: {Count}", alerts.Count);
            return Ok(alerts);
        }

        
        [HttpGet("logs")]
        [ProducesResponseType(200)]
        public async Task<ActionResult> GetLogs()
        {
            try
            {
                var logs = await alertRepo.GetLogsAsync();
                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError("Failed to fetch activity logs: {Error}", ex.Message);
                return BadRequest("Failed to fetch logs");
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
            catch (AlertException)
            {
                
                return Ok(new List<Alert>());
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

                
                _logger.LogInformation(
                    "ALERT CREATED — AlertId: {AlertId}, RoomId: {RoomId}, Temp: {Temp}°C, Status: {Status}",
                    alert.AlertId, alert.RoomId, alert.Temperature, alert.Status);

                
                await alertRepo.LogActivityAsync(
                    "Alert Created",
                    $"AlertId={alert.AlertId} | RoomId={alert.RoomId} | Temp={alert.Temperature}°C | Status={alert.Status}");

                return Created($"api/alert/{alert.AlertId}", alert);
            }
            catch (AlertException ex)
            {
                _logger.LogError("Failed to create alert for RoomId={RoomId}: {Error}", alert.RoomId, ex.Message);
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

                
                if (alert.Status == "Resolved")
                {
                    
                    _logger.LogInformation(
                        "ALERT RESOLVED — AlertId: {AlertId}, RoomId: {RoomId}, Resolution: {Note}",
                        id, alert.RoomId, alert.ResolutionNote ?? "No note provided");

                    await alertRepo.LogActivityAsync(
                        "Alert Resolved by Supervisor",
                        $"AlertId={id} | RoomId={alert.RoomId} | Resolution: {alert.ResolutionNote ?? "No note provided"}");
                }
                else if (!string.IsNullOrEmpty(alert.Reason))
                {
                    
                    _logger.LogInformation(
                        "REASON FILED — AlertId: {AlertId}, RoomId: {RoomId}, Reason: {Reason}",
                        id, alert.RoomId, alert.Reason);

                    await alertRepo.LogActivityAsync(
                        "Reason Filed by Technician",
                        $"AlertId={id} | RoomId={alert.RoomId} | Reason: {alert.Reason}");
                }

                return Ok(alert);
            }
            catch (AlertException ex)
            {
                _logger.LogError("Failed to update alert {AlertId}: {Error}", id, ex.Message);
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

                
                _logger.LogInformation("ALERT DELETED — AlertId: {AlertId}", id);

                
                await alertRepo.LogActivityAsync(
                    "Alert Deleted by Supervisor",
                    $"AlertId={id} was permanently deleted");

                return Ok("Alert deleted successfully");
            }
            catch (AlertException ex)
            {
                _logger.LogError("Failed to delete alert {AlertId}: {Error}", id, ex.Message);
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("Room/{roomId}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        public async Task<ActionResult> DeleteByRoom(string roomId)
        {
            try
            {
                try
                {
                    var roomAlerts = await alertRepo.GetByRoomIdAsync(roomId);
                    foreach (var alert in roomAlerts)
                    {
                        await alertRepo.DeleteAsync(alert.AlertId);
                    }
                }
                catch (AlertException)
                {
                }

                await alertRepo.LogActivityAsync(
                    "Room Deleted by Technician",
                    $"RoomId={roomId} and its alerts were permanently deleted");

                return Ok("Room alerts deleted successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
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
