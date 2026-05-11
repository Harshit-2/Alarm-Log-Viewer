using System;
using System.Collections.Generic;
using System.Text;
using TemperatureLibrary.Models;

namespace TemperatureLibrary.Repos
{
    public interface ITemperatureRepository
    {
        Task<Temperature> GetByIdAsync(string id);
        Task<Temperature> GetByRoomIdAsync(string roomId);
        Task<Temperature> GetLatestByRoomIdAsync(string roomId);
        Task<List<Temperature>> GetAllTemperaturesAsync();
        Task AddAsync(Temperature temperature);
        Task UpdateAsync(string id, Temperature temperature);
        Task DeleteAsync(string id);
        Task AddRoomStubAsync(Room room);
    }
}
