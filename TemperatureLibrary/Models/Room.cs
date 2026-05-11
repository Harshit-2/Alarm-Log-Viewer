using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace TemperatureLibrary.Models
{
    [Table("Rooms")]
    public class Room
    {
        [Key]
        [Column(TypeName ="VARCHAR(6)")]
        public string RoomId { get; set; }

        public virtual ICollection<Temperature> Temperatures { get; set; } = new List<Temperature>();
    }
}
