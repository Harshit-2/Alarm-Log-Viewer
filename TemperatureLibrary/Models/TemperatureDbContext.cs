using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace TemperatureLibrary.Models
{
    public class TemperatureDbContext: DbContext
    {
        public TemperatureDbContext()
        {
        }

        public TemperatureDbContext(DbContextOptions options) : base(options)
        {
        }

        public virtual DbSet<Temperature> Temperatures { get; set; }
        public virtual DbSet<Room> Rooms { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer("Server=LTIN732805\\SQLEXPRESS;Database=PrjTemperatureLogDB;Trusted_connection=true;TrustServerCertificate=true;");
        }
    }
}
