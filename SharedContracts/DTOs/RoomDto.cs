using System;
using System.Collections.Generic;
using System.Text;

namespace SharedContracts.DTOs
{
    public class RoomDto
    {
        public string RoomId { get; set; }
        public string RoomName { get; set; }
        public int MinTemp { get; set; }
        public int MaxTemp { get; set; }
    }
}
