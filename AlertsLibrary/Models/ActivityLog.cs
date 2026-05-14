using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlertsLibrary.Models
{
    // This table saves a record every time someone does something important in the app
    // e.g. "Supervisor marked alert A12345 as Resolved" at 10:45 AM
    [Table("ActivityLogs")]
    public class ActivityLog
    {
        // Auto-incremented ID (SQL Server handles this automatically)
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LogId { get; set; }

        // Short name for the action e.g. "Alert Created", "Room Deleted"
        [Column(TypeName = "VARCHAR(100)")]
        public string Action { get; set; }

        // More detail about what happened in plain English
        [Column(TypeName = "VARCHAR(500)")]
        public string Details { get; set; }

        // Exact date and time the action happened
        public DateTime Timestamp { get; set; }
    }
}
