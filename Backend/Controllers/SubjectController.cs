using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;


namespace Backend.Controllers
{

    [ApiController]
    [Route("api/subjects")]
    [Authorize]

    public class SubjectController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SubjectController(AppDbContext context)
        {
            _context = context;
        }
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SubjectResponseDto>> CreateSubject([FromBody] CreateSubjectDto dto)
        {
            var classExists = await _context.Classes.AnyAsync(c => c.Id == dto.ClassId);
            if (!classExists)
            {
                return BadRequest(new { message = "Class not found" });
            }

            var teacher = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == dto.TeacherId && u.Role == "Teacher");
            if (teacher == null)
            {
                return BadRequest(new { message = "Teacher not found or user is not a Teacher" });
            }

            var newSubject = new Subject
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                ClassId = dto.ClassId,
                TeacherId = dto.TeacherId
            };

            _context.Subjects.Add(newSubject);
            await _context.SaveChangesAsync();

            var classEntity = await _context.Classes.FirstOrDefaultAsync(c => c.Id == dto.ClassId);
            var responseDto = new SubjectResponseDto
            {
                Id = newSubject.Id,
                Name = newSubject.Name,
                ClassId = newSubject.ClassId,
                ClassName = classEntity!.Name,
                TeacherId = newSubject.TeacherId,
                TeacherName = teacher.Fullname
            };

            return CreatedAtAction(nameof(GetSubjectById), new { id = newSubject.Id }, responseDto);
        }


        [HttpGet]
        public async Task<ActionResult<List<SubjectResponseDto>>> GetAllSubjects()
        {
            var subjects = await _context.Subjects
                .Include(s => s.Class)
                .Include(s => s.Teacher)
                .Select(s => new SubjectResponseDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    ClassId = s.ClassId,
                    ClassName = s.Class!.Name,
                    TeacherId = s.TeacherId,
                    TeacherName = s.Teacher!.Fullname
                })
                .ToListAsync();
            return Ok(subjects);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SubjectResponseDto>> GetSubjectById(Guid Id)
        {
            var Subject = await _context.Subjects
                .Include(s => s.Class)
                .Include(t => t.Teacher)
                .FirstOrDefaultAsync(s => s.Id == Id);
            if (Subject == null)
            {
                return NotFound(new { message = "Subject not found" });
            }

            var responseDto = new SubjectResponseDto
            {
                Id = Subject.Id,
                Name = Subject.Name,
                ClassId = Subject.ClassId,
                ClassName = Subject.Class!.Name,
                TeacherId = Subject.TeacherId,
                TeacherName = Subject.Teacher!.Fullname
            };

            return Ok(responseDto);
        }


        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SubjectResponseDto>> UpdateSubject(Guid id, [FromBody] CreateSubjectDto dto)
        {
            var subject = await _context.Subjects.FindAsync(id);
            if (subject == null)
            {
                return NotFound(new { message = "Subject not found" });
            }
            var classExists = await _context.Classes.AnyAsync(c => c.Id == dto.ClassId);
            if (!classExists)
            {
                return BadRequest(new { message = "Class not found" });
            }
            var teacher = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == dto.TeacherId && u.Role == "Teacher");
            if (teacher == null)
            {
                return BadRequest(new { message = "Teacher not found or user is not a Teacher" });
            }
            subject.Name = dto.Name;
            subject.ClassId = dto.ClassId;
            subject.TeacherId = dto.TeacherId;
            await _context.SaveChangesAsync();
            var classEntity = await _context.Classes.FirstOrDefaultAsync(c => c.Id == dto.ClassId);
            return Ok(new SubjectResponseDto
            {
                Id = subject.Id,
                Name = subject.Name,
                ClassId = subject.ClassId,
                ClassName = classEntity!.Name,
                TeacherId = subject.TeacherId,
                TeacherName = teacher.Fullname
            });
        }
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSubject(Guid id)
        {
            var subject = await _context.Subjects.FirstOrDefaultAsync(s => s.Id == id);

            if (subject == null)
            {
                return NotFound(new { message = "Subject not found" });
            }

            _context.Subjects.Remove(subject);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}