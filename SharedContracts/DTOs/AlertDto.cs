using System;
using System.Collections.Generic;
using System.Text;

namespace SharedContracts.DTOs
{
    public class AlertDto
    {
        public string AlertId { get; set; }
        public string RoomId { get; set; }
        public decimal Temperature { get; set; }
        public string Status { get; set; }
        public string AlertTime { get; set; }
    }
}
