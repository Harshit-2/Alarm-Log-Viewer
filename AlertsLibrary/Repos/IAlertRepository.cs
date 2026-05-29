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
        Task<List<ActivityLog>> GetLogsAsync();

        Task AddAsync(Alert alert);
        Task UpdateAlertAsync(string id, Alert alert);
        Task DeleteAsync(string id);
        Task AddRoomStubAsync(Room room);

        
        Task LogActivityAsync(string action, string details);


    }
}
