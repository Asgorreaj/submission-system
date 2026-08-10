using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class LoginDto
    {
        [Required]
        public string LoginId { get; set; } = string.Empty;
        

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}