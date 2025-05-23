
using System;
using System.Collections.Generic;
using TicketServiceApp.Models; 

namespace TicketServiceApp.DTOs
{
    public class TicketDetailDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserEmail { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public TicketStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastUpdatedAt { get; set; }
        public List<TicketReplyDto>? Replies { get; set; } 
    }
}