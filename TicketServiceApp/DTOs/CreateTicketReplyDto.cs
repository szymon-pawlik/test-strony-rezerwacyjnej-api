
using System.ComponentModel.DataAnnotations;

namespace TicketServiceApp.DTOs
{
    public class CreateTicketReplyDto
    {
        [Required]
        public string Message { get; set; } = string.Empty;
    }
}