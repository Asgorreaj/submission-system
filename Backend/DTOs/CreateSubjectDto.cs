using System.ComponentModel.DataAnnotations;
namespace Backend.DTOs
{
    public class CreateSubjectDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public Guid ClassId { get; set; }

        [Required]
        public Guid TeacherId { get; set; }
    }
}
