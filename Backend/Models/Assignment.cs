using System.ComponentModel.DataAnnotations;
namespace Backend.Models
{
    public class Assignment
    {

        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        [Required]
        public DateTime Deadline { get; set; }

        [Required]
        [Range (1, 1000)]
        public int MaxMarks { get; set; }

        [Required]
        public string Status { get; set; } = "Draft";

        // foregin key for subject

        [Required]  
        public Guid ClassId { get; set; }
        public Class? Class { get; set; }

        [Required]
        public Guid SubjectId { get; set; }
        public Subject? Subject { get; set; }

        [Required]
        public Guid TeacherId { get; set; }
        public User? Teacher { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Submission> Submissions { get; set; } = new List<Submission>();




    }
}
