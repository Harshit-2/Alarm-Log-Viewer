using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace UserLibrary.Models
{
    public class UserDbContext: DbContext
    {
        public UserDbContext()
        {
        }

        public UserDbContext(DbContextOptions options) : base(options)
        {
        }

        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<Room> Rooms { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer("Server=LTIN732805\\SQLEXPRESS;Database=PrjUserLogDB;Trusted_connection=true;TrustServerCertificate=true;");
        }
    }
}
