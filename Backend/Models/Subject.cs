using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Subject
    {

        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public Guid ClassId { get; set; }

        public Class? Class { get; set; }

        [Required]
        public Guid TeacherId { get; set; }

        public User? Teacher { get; set; }

        public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    }
}
