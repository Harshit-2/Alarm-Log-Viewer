using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using UserLibrary.Models;

namespace UserLibrary.Repos
{
    public class EFUserRepository : IUserRepository
    {
        UserDbContext context = new UserDbContext();
        public async Task AddAsync(User user)
        {
            try
            {
                await context.Users.AddAsync(user);
                await context.SaveChangesAsync();
            }
            catch (Exception ex) {
                throw new UserException(ex.Message);
            }
        }

        public async Task DeleteAsync(string id)
        {
            var userToDel = await GetByIdAsync(id);
            try
            {
                context.Users.Remove(userToDel);
                await context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new UserException(ex.Message);
            }
        }

        public async Task<List<User>> GetAllAsync()
        {
            List<User> users = await context.Users.ToListAsync();
            return users;
        }

        public async Task<User> GetByIdAsync(string id)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.UserId == id);
            if (user == null)
            {
                throw new UserException($"No user found with id {id}");
            }
            return user;
        }

        public async Task<User> GetByCredentialsAsync(string username, string password)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Username == username && u.Password == password);
            if (user == null)
            {
                throw new UserException("Invalid username or password");
            }
            return user;
        }

        public async Task UpdateAsync(string id, User user)
        {
            try
            {
                var existingUser = await context.Users.FirstOrDefaultAsync(u => u.UserId == id);
                if (existingUser == null)
                {
                    throw new UserException($"No user found with id {id}");
                }

                // Update fields
                existingUser.Username = user.Username;
                existingUser.Password = user.Password;
                existingUser.Role = user.Role;

                await context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new UserException(ex.Message);
            }
        }
    }
}
