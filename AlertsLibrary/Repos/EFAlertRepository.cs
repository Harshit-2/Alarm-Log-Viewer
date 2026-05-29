using System;
using System.Collections.Generic;
using System.Text;
using AlertsLibrary.Models;
using Microsoft.EntityFrameworkCore;
using UserLibrary.Repos;

namespace AlertsLibrary.Repos
{
    public class EFAlertRepository : IAlertRepository
    {
        AlertDbContext context = new AlertDbContext();
        public async Task AddAsync(Alert alert)
        {
            try
            {
                await context.Alerts.AddAsync(alert);
                await context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new AlertException(ex.Message);
            }
        }


        public async Task<List<Alert>> GetAllAlertsAsync()
        {
            List<Alert> alerts = await context.Alerts.ToListAsync();
            return alerts;
        }

        public async Task<List<ActivityLog>> GetLogsAsync()
        {
            
            return await context.ActivityLogs.OrderByDescending(log => log.Timestamp).ToListAsync();
        }

        public async Task<Alert> GetByAlertIdAsync(string id)
        {
            Alert alert = await context.Alerts.FirstOrDefaultAsync(x => x.AlertId == id);
            if (alert == null)
            {
                throw new AlertException("No such alert");
            }
            return alert;
        }



        public async Task UpdateAlertAsync(string id, Alert alert)
        {
            try
            {
                var existingAlert = await context.Alerts.FirstOrDefaultAsync(x => x.AlertId == id);
                if (existingAlert == null)
                {
                    throw new AlertException("No alert found with the given ID");
                }

                
                existingAlert.RoomId = alert.RoomId;
                existingAlert.Temperature = alert.Temperature;
                existingAlert.Status = alert.Status;
                existingAlert.AlertTime = alert.AlertTime;
                existingAlert.Reason = alert.Reason; 
                existingAlert.ResolutionNote = alert.ResolutionNote; 

                await context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new AlertException(ex.Message);
            }
        }

        async Task<List<Alert>> IAlertRepository.GetByRoomIdAsync(string roomId)
        {
            var roomAlerts = await context.Alerts
                                          .Where(alert => alert.RoomId == roomId)
                                          .ToListAsync();

            if (roomAlerts.Count == 0)
            {
                throw new AlertException("No alerts found for the given room");
            }

            return roomAlerts;
        }

        public async Task DeleteAsync(string id)
        {
            var alertToDel = await GetByAlertIdAsync(id);
            try
            {
                context.Alerts.Remove(alertToDel);
                await context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new AlertException(ex.Message);
            }
        }

        public async Task AddRoomStubAsync(Room room)
        {
            try
            {
                await context.Rooms.AddAsync(room);
                await context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new AlertException(ex.Message);
            }
        }

        
        
        public async Task LogActivityAsync(string action, string details)
        {
            var log = new ActivityLog
            {
                Action = action,
                Details = details,
                Timestamp = DateTime.Now  
            };
            await context.ActivityLogs.AddAsync(log);
            await context.SaveChangesAsync();
        }


    }
}
