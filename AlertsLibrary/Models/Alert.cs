using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace AlertsLibrary.Models
{
    [Table("Alerts")]
    public class Alert
    {
        [Key]
        [Column(TypeName = "VARCHAR(6)")]
        public string AlertId { get; set; }

        [Column(TypeName = "VARCHAR(6)")]
        [ForeignKey("RoomNavigation")]
        public string RoomId { get; set; }
        public virtual Room? RoomNavigation { get; set; }
        public decimal Temperature { get; set; }

        [Column(TypeName = "VARCHAR(30)")]
        public string Status { get; set; }

        [Column(TypeName = "VARCHAR(30)")]
        public string AlertTime { get; set; }

        // Reason filed by the technician explaining why the temperature went out of range
        [Column(TypeName = "VARCHAR(200)")]
        public string? Reason { get; set; }
    }
}
