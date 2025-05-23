
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TicketServiceApp.Models
{
    public class TicketReply
    {
        public Guid Id { get; set; }

        [Required]
        public Guid TicketId { get; set; } 
        
        public Ticket? Ticket { get; set; } 

        [Required]
        public Guid ReplierUserId { get; set; } 

        public string? ReplierUserEmail { get; set; } 

        [Required]
        public string Message { get; set; } = string.Empty;

        public DateTime RepliedAt { get; set; } = DateTime.UtcNow;
    }
}