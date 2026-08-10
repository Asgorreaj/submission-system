using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
   
    public class GradeSubmissionDto
    {
        [Required]
        [Range(0, 1000)]
        
        public int MarksObtained { get; set; }

        [MaxLength(1000)]
        public string? Feedback { get; set; }
        
    }
}