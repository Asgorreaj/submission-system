using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Submission
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid AssignmentId { get; set; }
        public Assignment? Assignment { get; set; }

        [Required]
        public Guid StudentId { get; set; }
        public User? Student { get; set; }

        
        [MaxLength(5000)]
        public string? Answer { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        public int? MarksObtained { get; set; }

        [MaxLength(1000)]
        public string? Feedback { get; set; }

        [Required]
        public string Status { get; set; } = "Submitted";

        
        [MaxLength(255)]
        public string? FileName { get; set; } 

        [MaxLength(100)]
        public string? FileContentType { get; set; } 

        public byte[]? FileData { get; set; } 
    }
}