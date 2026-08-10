namespace Backend.DTOs
{
    public class UserResponseDto
    {
        public Guid Id { get; set; }
        public string LoginId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public Guid? ClassId { get; set; }
        public string? ClassName { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}