using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace RoomsLibrary.Models
{
    [Table("Users")]
    public class User
    {
        [Key]
        [Column(TypeName ="VARCHAR(6)")]
        public string UserId { get; set; }

        public virtual ICollection<Room> Rooms { get; set; } = new List<Room>();
    }
}
