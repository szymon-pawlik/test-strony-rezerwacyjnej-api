
using System;
using System.ComponentModel.DataAnnotations;

namespace TicketServiceApp.Models
{
    public enum TicketStatus
    {
        Open,
        InProgress,
        CustomerReply,
        Resolved,
        Closed
    }

    public class Ticket
    {
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; } 

        [Required]
        [EmailAddress]
        public string UserEmail { get; set; } = string.Empty; 

        [Required]
        [MaxLength(200)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        public TicketStatus Status { get; set; } = TicketStatus.Open;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastUpdatedAt { get; set; }
        public ICollection<TicketReply>? Replies { get; set; } 



    }
}