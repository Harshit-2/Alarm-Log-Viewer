using System;
using System.Collections.Generic;
using System.Text;
using UserLibrary.Models;

namespace UserLibrary.Repos
{
    public interface IUserRepository
    {
        Task<User> GetByIdAsync(string id);
        Task<List<User>> GetAllAsync();
        Task<User> GetByCredentialsAsync(string username, string password);
        Task AddAsync(User user);
        Task UpdateAsync(string id, User user);
        Task DeleteAsync(string id);
    }
}
