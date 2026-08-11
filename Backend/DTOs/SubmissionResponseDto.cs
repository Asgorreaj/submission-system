namespace Backend.DTOs
{
    public class SubmissionResponseDto
    {
        public Guid Id { get; set; }
        public Guid AssignmentId { get; set; }
        public string AssignmentTitle { get; set; } = string.Empty;
        public Guid StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string? Answer { get; set; }
        public DateTime SubmittedAt { get; set; }
        public int? MarksObtained { get; set; }
        public string? Feedback { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? FileName { get; set; }
        public bool HasFile { get; set; }
        public string? GradedByTeacherName { get; set; }


    }
}