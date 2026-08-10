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
    [Route("api/[controller]")]
    [Authorize]
    public class AssignmentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AssignmentController(AppDbContext context)
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
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<AssignmentResponseDto>> CreateAssignment([FromBody] CreateAssignmentDto dto)
        {
            var teacherId = GetLoggedInUserId();
            var subject = await _context.Subjects.FirstOrDefaultAsync(s => s.Id == dto.SubjectId);

            if (subject == null)
            {
                return BadRequest(new { message = "Subject not found" });
            }

            if (subject.TeacherId != teacherId)
            {
                return Forbid();
            }

            var classExists = await _context.Classes.AnyAsync(c => c.Id == dto.ClassId);
            if (!classExists)
            {
                return BadRequest(new { message = "Class not found" });
            }

            var newAssignment = new Assignment
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Description = dto.Description,
                Deadline = dto.Deadline,
                MaxMarks = dto.MaxMarks,
                Status = "Draft",
                ClassId = dto.ClassId,
                SubjectId = dto.SubjectId,
                TeacherId = teacherId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Assignments.Add(newAssignment);
            await _context.SaveChangesAsync();

            var classEntity = await _context.Classes.FirstOrDefaultAsync(c => c.Id == dto.ClassId);
            var teacher = await _context.Users.FirstOrDefaultAsync(u => u.Id == teacherId);

            var response = new AssignmentResponseDto
            {
                Id = newAssignment.Id,
                Title = newAssignment.Title,
                Description = newAssignment.Description,
                Deadline = newAssignment.Deadline,
                MaxMarks = newAssignment.MaxMarks,
                Status = newAssignment.Status,
                ClassId = newAssignment.ClassId,
                ClassName = classEntity!.Name,
                SubjectId = newAssignment.SubjectId,
                SubjectName = subject.Name,
                TeacherId = teacherId,
                TeacherName = teacher!.Fullname
            };

            return CreatedAtAction(nameof(GetAssignmentById), new { id = newAssignment.Id }, response);
        }

        [HttpGet]
        public async Task<ActionResult<List<AssignmentResponseDto>>> GetAllAssignments()
        {
            var role = GetLoggedInUserRole();
            var userId = GetLoggedInUserId();

            IQueryable<Assignment> query = _context.Assignments
                .Include(a => a.Class)
                .Include(a => a.Subject)
                .Include(a => a.Teacher);

            if (role == "Teacher")
            {
                query = query.Where(a => a.TeacherId == userId);
            }
            else if (role == "Student")
            {
                
                var student = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                query = query.Where(a => a.Status == "Published" && a.ClassId == student!.ClassId);
                
            }

            var assignments = await query
                .Select(a => new AssignmentResponseDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Description = a.Description,
                    Deadline = a.Deadline,
                    MaxMarks = a.MaxMarks,
                    Status = a.Status,
                    ClassId = a.ClassId,
                    ClassName = a.Class!.Name,
                    SubjectId = a.SubjectId,
                    SubjectName = a.Subject!.Name,
                    TeacherId = a.TeacherId,
                    TeacherName = a.Teacher!.Fullname
                })
                .ToListAsync();

            return Ok(assignments);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AssignmentResponseDto>> GetAssignmentById(Guid id)
        {
            var assignment = await _context.Assignments
                .Include(a => a.Class)
                .Include(a => a.Subject)
                .Include(a => a.Teacher)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (assignment == null)
            {
                return NotFound(new { message = "Assignment not found" });
            }

            var role = GetLoggedInUserRole();
            var userId = GetLoggedInUserId();

            if (role == "Student")
            {
                
                var student = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (assignment.Status != "Published" || assignment.ClassId != student!.ClassId)
                {
                    return NotFound(new { message = "Assignment not found" });
                }
            }

            var response = new AssignmentResponseDto
            {
                Id = assignment.Id,
                Title = assignment.Title,
                Description = assignment.Description,
                Deadline = assignment.Deadline,
                MaxMarks = assignment.MaxMarks,
                Status = assignment.Status,
                ClassId = assignment.ClassId,
                ClassName = assignment.Class!.Name,
                SubjectId = assignment.SubjectId,
                SubjectName = assignment.Subject!.Name,
                TeacherId = assignment.TeacherId,
                TeacherName = assignment.Teacher!.Fullname
            };

            return Ok(response);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<AssignmentResponseDto>> UpdateAssignment(Guid id, [FromBody] CreateAssignmentDto dto)
        {
            var assignment = await _context.Assignments.FirstOrDefaultAsync(a => a.Id == id);
            if (assignment == null)
            {
                return NotFound(new { message = "Assignment not found" });
            }

            var teacherId = GetLoggedInUserId();
            if (assignment.TeacherId != teacherId)
            {
                return Forbid();
            }

            assignment.Title = dto.Title;
            assignment.Description = dto.Description;
            assignment.Deadline = dto.Deadline;
            assignment.MaxMarks = dto.MaxMarks;

            await _context.SaveChangesAsync();

            var classEntity = await _context.Classes.FirstOrDefaultAsync(c => c.Id == assignment.ClassId);
            var subject = await _context.Subjects.FirstOrDefaultAsync(s => s.Id == assignment.SubjectId);
            var teacher = await _context.Users.FirstOrDefaultAsync(u => u.Id == teacherId);

            return Ok(new AssignmentResponseDto
            {
                Id = assignment.Id,
                Title = assignment.Title,
                Description = assignment.Description,
                Deadline = assignment.Deadline,
                MaxMarks = assignment.MaxMarks,
                Status = assignment.Status,
                ClassId = assignment.ClassId,
                ClassName = classEntity!.Name,
                SubjectId = assignment.SubjectId,
                SubjectName = subject!.Name,
                TeacherId = teacherId,
                TeacherName = teacher!.Fullname
            });
        }

        [HttpPut("{id}/publish")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<AssignmentResponseDto>> PublishAssignment(Guid id)
        {
            var assignment = await _context.Assignments.FirstOrDefaultAsync(a => a.Id == id);
            if (assignment == null)
            {
                return NotFound(new { message = "Assignment not found" });
            }

            var teacherId = GetLoggedInUserId();
            if (assignment.TeacherId != teacherId)
            {
                return Forbid();
            }

            assignment.Status = assignment.Status == "Draft" ? "Published" : "Draft";
            await _context.SaveChangesAsync();

            var classEntity = await _context.Classes.FirstOrDefaultAsync(c => c.Id == assignment.ClassId);
            var subject = await _context.Subjects.FirstOrDefaultAsync(s => s.Id == assignment.SubjectId);
            var teacher = await _context.Users.FirstOrDefaultAsync(u => u.Id == teacherId);

            return Ok(new AssignmentResponseDto
            {
                Id = assignment.Id,
                Title = assignment.Title,
                Description = assignment.Description,
                Deadline = assignment.Deadline,
                MaxMarks = assignment.MaxMarks,
                Status = assignment.Status,
                ClassId = assignment.ClassId,
                ClassName = classEntity!.Name,
                SubjectId = assignment.SubjectId,
                SubjectName = subject!.Name,
                TeacherId = teacherId,
                TeacherName = teacher!.Fullname
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> DeleteAssignment(Guid id)
        {
            var assignment = await _context.Assignments.FirstOrDefaultAsync(a => a.Id == id);
            if (assignment == null)
            {
                return NotFound(new { message = "Assignment not found" });
            }

            var teacherId = GetLoggedInUserId();
            if (assignment.TeacherId != teacherId)
            {
                return Forbid();
            }

            _context.Assignments.Remove(assignment);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}