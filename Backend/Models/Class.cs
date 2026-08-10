using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Class
    {

        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Section { get; set; }

        public ICollection<User> Students { get; set; } = new List<User>();

        public ICollection<Subject> Subjects { get; set; } = new List<Subject>();

    }
}
