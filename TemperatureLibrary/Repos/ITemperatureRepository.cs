using System;
using System.Collections.Generic;
using System.Text;
using TemperatureLibrary.Models;

namespace TemperatureLibrary.Repos
{
    public interface ITemperatureRepository
    {
        Task<Temperature> GetByRoomIdAsync(string roomId);
        Task AddAsync(Temperature temperature);
        Task AddRoomStubAsync(Room room);
    }
}
