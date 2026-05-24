using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using TemperatureLibrary.Models;

namespace TemperatureLibrary.Repos
    {
    public class EFTemperatureRepository : ITemperatureRepository
    {
        TemperatureDbContext context = new TemperatureDbContext();

        public async Task AddAsync(Temperature temperature)
        {
            try
            {
                await context.Temperatures.AddAsync(temperature);
                await context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new TemperatureException(ex.Message);
            }
        }



        public async Task<Temperature> GetByRoomIdAsync(string roomId)
        {
            try
            {
                var temp = await context.Temperatures
                    .FirstOrDefaultAsync(t => t.RoomId == roomId);

                if (temp == null)
                {
                    throw new TemperatureException("No temperature found for this room");
                }

                return temp;
            }
            catch (Exception ex)
            {
                throw new TemperatureException(ex.Message);
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
                throw new TemperatureException(ex.Message);
            }
        }
    }
}