namespace Backend.DTOs
{
    public class AssignmentResponseDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime Deadline { get; set; }
        public int MaxMarks { get; set; }
        public string Status { get; set; } = string.Empty;
        

        public Guid ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;

        public Guid SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;

        public Guid TeacherId { get; set; }
        public string TeacherName { get; set; } = string.Empty;
    }
}
