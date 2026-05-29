using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using RoomsLibrary.Models;
using UserLibrary.Repos;

namespace RoomsLibrary.Repos
{
    public class EFRoomRepository : IRoomRepository
    {
        RoomDbContext context = new RoomDbContext();

        public async Task AddAsync(Room room)
        {
            try
            {
                await context.Rooms.AddAsync(room);
                await context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new RoomException(ex.Message);
            }
        }

        public async Task<List<Room>> GetAllAsync()
        {
            return await context.Rooms.ToListAsync();
        }

        public async Task<Room> GetByIdAsync(string id)
        {
            Room room = await context.Rooms.FirstOrDefaultAsync(r => r.RoomId == id);

            if (room == null)
            {
                throw new RoomException("No such room");
            }
            return room;
        }



        public async Task UpdateAsync(string id, Room room)
        {
            try
            {
                var existingRoom = await context.Rooms.FirstOrDefaultAsync(r => r.RoomId == id);

                if (existingRoom == null)
                {
                    throw new RoomException("Room not found");
                }
                
                existingRoom.RoomName = room.RoomName;
                existingRoom.MinTemp = room.MinTemp;
                existingRoom.MaxTemp = room.MaxTemp;
                existingRoom.CreatedByUserId = room.CreatedByUserId;
                existingRoom.CreatedAt = room.CreatedAt;

                await context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new RoomException(ex.Message);
            }
        }

        public async Task DeleteAsync(string id)
        {
            var roomToDel = await GetByIdAsync(id);
            try
            {
                context.Rooms.Remove(roomToDel);
                await context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new RoomException(ex.Message);
            }
        }

        public async Task AddUserStubAsync(User user)
        {
            try
            {
                await context.Users.AddAsync(user);
                await context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new RoomException(ex.Message);
            }
        }
    }
}