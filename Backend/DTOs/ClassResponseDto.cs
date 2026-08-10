namespace Backend.DTOs
{
    public class ClassResponseDto
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Section { get; set; }
        public int StudentCount { get; set; }
    }
}
