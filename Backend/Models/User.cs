using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string Fullname { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        
        [MaxLength(20)]
        public string? LoginId { get; set; }
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = string.Empty;

        public Guid? ClassId { get; set; }
        public Class? Class { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}