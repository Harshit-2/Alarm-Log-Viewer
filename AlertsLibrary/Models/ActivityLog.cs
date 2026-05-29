using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlertsLibrary.Models
{
    
    
    [Table("ActivityLogs")]
    public class ActivityLog
    {
        
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LogId { get; set; }

        
        [Column(TypeName = "VARCHAR(100)")]
        public string Action { get; set; }

        
        [Column(TypeName = "VARCHAR(500)")]
        public string Details { get; set; }

        
        public DateTime Timestamp { get; set; }
    }
}
