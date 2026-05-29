using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace RoomsLibrary.Models
{
    [Table("Rooms")]
    public class Room
    {
        [Key]
        [Column(TypeName = "VARCHAR(6)")]
        public string RoomId { get; set; }

        [Column(TypeName = "VARCHAR(30)")]
        public string RoomName { get; set; }

        public int MinTemp { get; set; }
        public int MaxTemp { get; set; }

        [Column(TypeName = "VARCHAR(6)")]
        [ForeignKey("userNavigation")]
        public string CreatedByUserId { get; set; } 

        [Column(TypeName = "VARCHAR(30)")]
        public string CreatedAt { get; set; }

        public virtual User? userNavigation { get; set; }
        public virtual ICollection<Alert> Alerts { get; set; } = new List<Alert>();
        public virtual ICollection<Temperature> Temperatures { get; set; } = new List<Temperature>();
    }
}
