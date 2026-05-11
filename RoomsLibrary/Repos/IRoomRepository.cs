using System;
using System.Collections.Generic;
using System.Text;
using RoomsLibrary.Models;

namespace RoomsLibrary.Repos
{
    public interface IRoomRepository
    {
        Task<Room> GetByIdAsync(string id);
        Task<List<Room>> GetAllAsync();
        Task<List<Room>> GetByCreatorAsync(string userId);
        Task AddAsync(Room room);
        Task UpdateAsync(string id, Room room);
        Task DeleteAsync(string id);
        Task AddUserStubAsync(User user);
    }
}
