namespace Backend.DTOs
{
    public class SubjectResponseDto
    {
        public Guid Id { get; set; }    
        public string Name { get; set; } = string.Empty;

        public Guid ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;

        public Guid TeacherId { get; set; }
        public string TeacherName { get; set; } = string.Empty;
    }
}
