using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace RoomsLibrary.Models
{
    [Table("Tempratures")]
    public class Temperature
    {
        [Key]
        [Column(TypeName = "VARCHAR(6)")]
        public string ReadingId { get; set; }

        [Column(TypeName = "VARCHAR(6)")]
        [ForeignKey("RoomNavigation")]
        public string RoomId { get; set; }

        public virtual Room? RoomNavigation { get; set; }
    }
}
