using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class CreateAssignmentDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }
        

        [Required]
        public DateTime Deadline { get; set; }

        [Required]
        [Range(1, 1000)]
        public int MaxMarks { get; set; }

        [Required]
        public Guid ClassId { get; set; }

        [Required]
        public Guid SubjectId { get; set; }
    }
}
