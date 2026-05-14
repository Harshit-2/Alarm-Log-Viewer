using System;
using System.Collections.Generic;
using System.Text;
using AlertsLibrary.Models;

namespace AlertsLibrary.Repos
{
    public interface IAlertRepository
    {
        Task<Alert> GetByAlertIdAsync(string id);
        Task<List<Alert>> GetAllAlertsAsync();
        Task<List<Alert>> GetByRoomIdAsync(string roomId);
        Task<Alert> GetByStatusAsync(string status);
        Task AddAsync(Alert alert);
        Task UpdateAlertAsync(string id, Alert alert);
        Task DeleteAsync(string id);
        Task AddRoomStubAsync(Room room);

        // Saves a log entry to the database with the action name, details, and current timestamp
        Task LogActivityAsync(string action, string details);

        // Gets all activity logs (supervisor can view the full history)
        Task<List<ActivityLog>> GetAllLogsAsync();
    }
}
