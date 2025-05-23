
using System.ComponentModel.DataAnnotations;

namespace TicketServiceApp.DTOs
{
    public class CreateTicketDto
    {



        [Required]
        [MaxLength(200)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;


    }
}