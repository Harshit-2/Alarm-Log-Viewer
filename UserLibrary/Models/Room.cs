using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace UserLibrary.Models
{
    [Table("Rooms")]
    public class Room
    {
        [Key]
        [Column(TypeName ="VARCHAR(6)")]
        public string RoomId { get; set; }

        [Column(TypeName = "VARCHAR(6)")]
        [ForeignKey("UserNavigation")]
        public string CreateByUserId { get; set; }

        public virtual User? UserNavigation { get; set; }
    }
}
