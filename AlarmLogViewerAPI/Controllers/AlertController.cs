using AlertsLibrary.Models;
using AlertsLibrary.Repos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserLibrary.Repos;

namespace AlarmLogViewerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class AlertController : ControllerBase
    {
        private readonly IAlertRepository alertRepo;

        // ILogger writes messages to the console/output window while the app is running
        // It helps developers see what is happening in real-time
        private readonly ILogger<AlertController> _logger;

        // Constructor: ASP.NET Core automatically provides these when the controller is created
        public AlertController(IAlertRepository alertRepository, ILogger<AlertController> logger)
        {
            alertRepo = alertRepository;
            _logger = logger;
        }

        // GET all alerts
        [HttpGet]
        [ProducesResponseType(200)]
        public async Task<ActionResult> GetAll()
        {
            List<Alert> alerts = await alertRepo.GetAllAlertsAsync();
            _logger.LogInformation("Fetched all alerts. Total count: {Count}", alerts.Count);
            return Ok(alerts);
        }

        // GET all activity logs
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



        // GET all alerts for a specific room
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
                // No alerts found for this room yet — return empty list instead of error
                return Ok(new List<Alert>());
            }
        }



        // POST — Technician creates a new alert (temperature out of range)
        [HttpPost]
        [ProducesResponseType(201)]
        [ProducesResponseType(400)]
        public async Task<ActionResult> Insert(Alert alert)
        {
            try
            {
                await alertRepo.AddAsync(alert);

                // Log to console
                _logger.LogInformation(
                    "ALERT CREATED — AlertId: {AlertId}, RoomId: {RoomId}, Temp: {Temp}°C, Status: {Status}",
                    alert.AlertId, alert.RoomId, alert.Temperature, alert.Status);

                // Log to database
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

        // PUT — Update an alert (used for: filing reason, marking resolved, etc.)
        [HttpPut("{id}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        public async Task<ActionResult> Update(string id, Alert alert)
        {
            try
            {
                await alertRepo.UpdateAlertAsync(id, alert);

                // Decide what kind of update this is and log it clearly
                if (alert.Status == "Resolved")
                {
                    // Supervisor marked it as resolved
                    _logger.LogInformation(
                        "ALERT RESOLVED — AlertId: {AlertId}, RoomId: {RoomId}, Resolution: {Note}",
                        id, alert.RoomId, alert.ResolutionNote ?? "No note provided");

                    await alertRepo.LogActivityAsync(
                        "Alert Resolved by Supervisor",
                        $"AlertId={id} | RoomId={alert.RoomId} | Resolution: {alert.ResolutionNote ?? "No note provided"}");
                }
                else if (!string.IsNullOrEmpty(alert.Reason))
                {
                    // Technician filed a reason
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

        // DELETE — Supervisor permanently removes an alert
        [HttpDelete("{id}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult> Delete(string id)
        {
            try
            {
                await alertRepo.DeleteAsync(id);

                // Log to console
                _logger.LogInformation("ALERT DELETED — AlertId: {AlertId}", id);

                // Log to database
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



        // This is called automatically by the Room service when a new room is created
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
