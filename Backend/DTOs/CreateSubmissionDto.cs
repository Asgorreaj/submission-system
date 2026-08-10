using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    
    public class CreateSubmissionDto
    {
        [Required]
        public Guid AssignmentId { get; set; }

        [MaxLength(5000)]
        public string? Answer { get; set; }
        
    }
}