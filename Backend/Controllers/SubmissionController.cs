using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/submissions")]
    [Authorize]
    public class SubmissionController : ControllerBase
    {
        private readonly AppDbContext _context;
        private static readonly string[] AllowedExtensions = { ".pdf", ".doc", ".docx", ".xls", ".xlsx" };

        private const long MaxFileSize = 10 * 1024 * 1024; // 10 MB

        public SubmissionController(AppDbContext context)
        {
            _context = context;
        }

        private Guid GetLoggedInUserId()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.Parse(userIdString!);
        }

        private string GetLoggedInUserRole()
        {
            return User.FindFirstValue(ClaimTypes.Role)!;
        }


        [HttpPost]
        [Authorize(Roles = "Student")]
        [Consumes("multipart/form-data")]

        [RequestSizeLimit(MaxFileSize + 1_000_000)]

        public async Task<ActionResult<SubmissionResponseDto>> CreateSubmission(
            [FromForm] CreateSubmissionDto dto,
            IFormFile? file)

        {
            var studentId = GetLoggedInUserId();

            var assignment = await _context.Assignments.FirstOrDefaultAsync(a => a.Id == dto.AssignmentId);
            if (assignment == null)
            {
                return BadRequest(new { message = "Assignment not found" });
            }

            if (assignment.Status != "Published")
            {
                return BadRequest(new { message = "Cannot submit to an unpublished assignment" });
            }


            var student = await _context.Users.FirstOrDefaultAsync(u => u.Id == studentId);
            if (assignment.ClassId != student!.ClassId)
            {
                return Forbid();

            }


            if (string.IsNullOrWhiteSpace(dto.Answer) && file == null)
            {
                return BadRequest(new { message = "Provide either an answer text or a file" });
            }

            var existingSubmission = await _context.Submissions
                .FirstOrDefaultAsync(s => s.AssignmentId == dto.AssignmentId && s.StudentId == studentId);
            if (existingSubmission != null)
            {
                return BadRequest(new { message = "You have already submitted this assignment. Use update instead." });
            }


            byte[]? fileData = null;
            string? fileName = null;
            string? fileContentType = null;

            if (file != null)
            {
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();


                if (!AllowedExtensions.Contains(extension))
                {
                    return BadRequest(new { message = $"File type not allowed. Allowed: {string.Join(", ", AllowedExtensions)}" });
                }

                if (file.Length > MaxFileSize)
                {
                    return BadRequest(new { message = "File size cannot exceed 10MB" });
                }

                using var memoryStream = new MemoryStream();

                await file.CopyToAsync(memoryStream);

                fileData = memoryStream.ToArray();


                fileName = file.FileName;
                fileContentType = file.ContentType;
            }

            var now = DateTime.UtcNow;
            string status = now > assignment.Deadline ? "Late" : "Submitted";

            var newSubmission = new Submission
            {
                Id = Guid.NewGuid(),
                AssignmentId = dto.AssignmentId,
                StudentId = studentId,
                Answer = dto.Answer,
                SubmittedAt = now,
                Status = status,
                MarksObtained = null,
                Feedback = null,
                FileName = fileName,
                FileContentType = fileContentType,
                FileData = fileData
            };

            _context.Submissions.Add(newSubmission);
            await _context.SaveChangesAsync();

            var response = new SubmissionResponseDto
            {
                Id = newSubmission.Id,
                AssignmentId = newSubmission.AssignmentId,
                AssignmentTitle = assignment.Title,
                StudentId = studentId,
                StudentName = student.Fullname,
                Answer = newSubmission.Answer,
                SubmittedAt = newSubmission.SubmittedAt,
                MarksObtained = newSubmission.MarksObtained,
                Feedback = newSubmission.Feedback,
                Status = newSubmission.Status,
                FileName = newSubmission.FileName,
                HasFile = newSubmission.FileData != null
            };

            return CreatedAtAction(nameof(GetSubmissionById), new { id = newSubmission.Id }, response);
        }


        [HttpGet("{id}/file")]
        public async Task<IActionResult> DownloadFile(Guid id)
        {
            var submission = await _context.Submissions
                .Include(s => s.Assignment)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (submission == null || submission.FileData == null)
            {
                return NotFound(new { message = "File not found" });
            }


            var role = GetLoggedInUserRole();
            var userId = GetLoggedInUserId();

            if (role == "Student" && submission.StudentId != userId)
            {
                return Forbid();
            }
            if (role == "Teacher" && submission.Assignment!.TeacherId != userId)
            {
                return Forbid();
            }

            return File(submission.FileData, submission.FileContentType ?? "application/octet-stream", submission.FileName);

        }

        // ==================== UPDATE ====================
        [HttpPut("{id}")]
        [Authorize(Roles = "Student")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(MaxFileSize + 1_000_000)]
        public async Task<ActionResult<SubmissionResponseDto>> UpdateSubmission(Guid id, [FromForm] CreateSubmissionDto dto, IFormFile? file)
        {
            var submission = await _context.Submissions
                .Include(s => s.Assignment)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (submission == null)
            {
                return NotFound(new { message = "Submission not found" });
            }

            var studentId = GetLoggedInUserId();
            if (submission.StudentId != studentId)
            {
                return Forbid();
            }

            if (DateTime.UtcNow > submission.Assignment!.Deadline)
            {
                return BadRequest(new { message = "Cannot update submission after deadline" });
            }

            if (submission.Status == "Graded")
            {
                return BadRequest(new { message = "Cannot update a graded submission" });
            }

            submission.Answer = dto.Answer;
            submission.SubmittedAt = DateTime.UtcNow;

            if (file != null)
            {
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!AllowedExtensions.Contains(extension))
                {
                    return BadRequest(new { message = $"File type not allowed. Allowed: {string.Join(", ", AllowedExtensions)}" });
                }
                if (file.Length > MaxFileSize)
                {
                    return BadRequest(new { message = "File size cannot exceed 10MB" });
                }

                using var memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream);
                submission.FileData = memoryStream.ToArray();
                submission.FileName = file.FileName;
                submission.FileContentType = file.ContentType;
            }

            await _context.SaveChangesAsync();

            var student = await _context.Users.FirstOrDefaultAsync(u => u.Id == studentId);

            return Ok(new SubmissionResponseDto
            {
                Id = submission.Id,
                AssignmentId = submission.AssignmentId,
                AssignmentTitle = submission.Assignment.Title,
                StudentId = studentId,
                StudentName = student!.Fullname,
                Answer = submission.Answer,
                SubmittedAt = submission.SubmittedAt,
                MarksObtained = submission.MarksObtained,
                Feedback = submission.Feedback,
                Status = submission.Status,
                FileName = submission.FileName,
                HasFile = submission.FileData != null
            });
        }

        // ==================== GRADE ====================
        [HttpPut("{id}/grade")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<SubmissionResponseDto>> GradeSubmission(Guid id, [FromBody] GradeSubmissionDto dto)
        {
            var submission = await _context.Submissions
                .Include(s => s.Assignment)!.ThenInclude(a => a!.Teacher)
                .Include(s => s.Student)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (submission == null)
            {
                return NotFound(new { message = "Submission not found" });
            }

            var teacherId = GetLoggedInUserId();
            if (submission.Assignment!.TeacherId != teacherId)
            {
                return Forbid();
            }

            if (dto.MarksObtained > submission.Assignment.MaxMarks)
            {
                return BadRequest(new { message = $"Marks cannot exceed {submission.Assignment.MaxMarks}" });
            }

            submission.MarksObtained = dto.MarksObtained;
            submission.Feedback = dto.Feedback;
            submission.Status = "Graded";

            await _context.SaveChangesAsync();

            return Ok(new SubmissionResponseDto
            {
                Id = submission.Id,
                AssignmentId = submission.AssignmentId,
                AssignmentTitle = submission.Assignment.Title,
                StudentId = submission.StudentId,
                StudentName = submission.Student!.Fullname,
                Answer = submission.Answer,
                SubmittedAt = submission.SubmittedAt,
                MarksObtained = submission.MarksObtained,
                Feedback = submission.Feedback,
                Status = submission.Status,
                FileName = submission.FileName,
                HasFile = submission.FileData != null,
                GradedByTeacherName = submission.Assignment.Teacher?.Fullname
            });
        }

        [HttpGet]
        public async Task<ActionResult<List<SubmissionResponseDto>>> GetAllSubmissions()
        {
            var role = GetLoggedInUserRole();
            var userId = GetLoggedInUserId();

            IQueryable<Submission> query = _context.Submissions
                .Include(s => s.Assignment)!.ThenInclude(a => a!.Teacher)
                .Include(s => s.Student);

            if (role == "Student")
            {
                query = query.Where(s => s.StudentId == userId);
            }
            else if (role == "Teacher")
            {
                query = query.Where(s => s.Assignment!.TeacherId == userId);
            }

            var submissions = await query
                .Select(s => new SubmissionResponseDto
                {
                    Id = s.Id,
                    AssignmentId = s.AssignmentId,
                    AssignmentTitle = s.Assignment!.Title,
                    StudentId = s.StudentId,
                    StudentName = s.Student!.Fullname,
                    Answer = s.Answer,
                    SubmittedAt = s.SubmittedAt,
                    MarksObtained = s.MarksObtained,
                    Feedback = s.Feedback,
                    Status = s.Status,
                    FileName = s.FileName,
                    HasFile = s.FileData != null,
                    GradedByTeacherName = s.Status == "Graded" ? s.Assignment!.Teacher!.Fullname : null
                })
                .ToListAsync();

            return Ok(submissions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SubmissionResponseDto>> GetSubmissionById(Guid id)
        {
            var submission = await _context.Submissions
                .Include(s => s.Assignment)!.ThenInclude(a => a!.Teacher)
                .Include(s => s.Student)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (submission == null)
            {
                return NotFound(new { message = "Submission not found" });
            }

            var role = GetLoggedInUserRole();
            var userId = GetLoggedInUserId();

            if (role == "Student" && submission.StudentId != userId)
            {
                return Forbid();
            }
            if (role == "Teacher" && submission.Assignment!.TeacherId != userId)
            {
                return Forbid();
            }

            return Ok(new SubmissionResponseDto
            {
                Id = submission.Id,
                AssignmentId = submission.AssignmentId,
                AssignmentTitle = submission.Assignment!.Title,
                StudentId = submission.StudentId,
                StudentName = submission.Student!.Fullname,
                Answer = submission.Answer,
                SubmittedAt = submission.SubmittedAt,
                MarksObtained = submission.MarksObtained,
                Feedback = submission.Feedback,
                Status = submission.Status,
                FileName = submission.FileName,
                HasFile = submission.FileData != null,
                GradedByTeacherName = submission.Status == "Graded" ? submission.Assignment.Teacher?.Fullname : null
            });
        }
    }
}