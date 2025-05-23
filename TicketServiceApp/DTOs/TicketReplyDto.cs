
using System;

namespace TicketServiceApp.DTOs
{
    public class TicketReplyDto
    {
        public Guid Id { get; set; }
        public Guid TicketId { get; set; }
        public Guid ReplierUserId { get; set; }
        public string? ReplierUserEmail { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime RepliedAt { get; set; }
    }
}