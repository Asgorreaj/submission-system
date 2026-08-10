using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class UpdateUserDto
    {
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^(Admin|Teacher|Student)$", ErrorMessage = "Role must be Admin, Teacher, or Student")]
        public string Role { get; set; } = string.Empty;

        public Guid? ClassId { get; set; }
    }
}