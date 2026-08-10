using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class CreateClassDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Section { get; set; }
    }
}
