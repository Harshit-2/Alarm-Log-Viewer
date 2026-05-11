using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace AlertsLibrary.Models
{
    public class AlertDbContext: DbContext
    {
        public AlertDbContext()
        {
        }

        public AlertDbContext(DbContextOptions options) : base(options)
        {
        }

        public virtual DbSet<Alert> Alerts { get; set; }
        public virtual DbSet<Room> Rooms { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer("Server=LTIN732805\\SQLEXPRESS;Database=PrjAlertsLogDB;Trusted_connection=true;TrustServerCertificate=true;");
        }
    }
}
