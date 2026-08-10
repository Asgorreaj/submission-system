using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    // EKhon EI DTO SHUDHU Admin USE korবে (protected endpoint DIYE)
    public class CreateUserDto
    {
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        public string Password { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^(Admin|Teacher|Student)$", ErrorMessage = "Role must be Admin, Teacher, or Student")]
        public string Role { get; set; } = string.Empty;

        public Guid? ClassId { get; set; }
       
    }
}