using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;



namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    [Authorize]

    public class ClassController : ControllerBase
    {
        private readonly AppDbContext _context;
        
        public ClassController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ClassResponseDto>> CreateClass([FromBody] CreateClassDto dto)
        {
            var newClass = new Class
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Section = dto.Section,
            };
            _context.Classes.Add(newClass);

            await _context.SaveChangesAsync();

            var responseDto = new ClassResponseDto
            {
                Id = newClass.Id,
                Name = newClass.Name,
                Section = newClass.Section,
                StudentCount = 0
            };

            return CreatedAtAction(nameof(GetClassById), new { id = newClass.Id }, responseDto);

        }
        [HttpGet]
        public async Task<ActionResult<List<ClassResponseDto>>> GetAllClasses()
        {
            var classes = await _context.Classes
                .Include(c => c.Students)
                .Select(c => new ClassResponseDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Section = c.Section,
                    StudentCount = c.Students.Count
                })
                .ToListAsync();
            return Ok(classes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ClassResponseDto>> GetClassById(Guid id)
        {
            var classEntity = await _context.Classes
                .Include(c => c.Students)
                .FirstOrDefaultAsync(c => c.Id == id);
            if (classEntity == null)
            {
                return NotFound();
            }
            var responseDto = new ClassResponseDto
            {
                Id = classEntity.Id,
                Name = classEntity.Name,
                Section = classEntity.Section,
                StudentCount = classEntity.Students.Count
            };
            return Ok(responseDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ClassResponseDto>> UpdateClass(Guid id, [FromBody] CreateClassDto dto)
        {
            var classEntity = await _context.Classes.FirstOrDefaultAsync(c => c.Id == id);
            if (classEntity == null)
            {
                return NotFound();
            }
            classEntity.Name = dto.Name;
            classEntity.Section = dto.Section;
            await _context.SaveChangesAsync();            
            return Ok(new ClassResponseDto
            {
                Id = classEntity.Id,
                Name = classEntity.Name,
                Section = classEntity.Section,
                StudentCount = 0
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteClass(Guid id)
        {
            var classEntity = await _context.Classes.FirstOrDefaultAsync(c => c.Id == id);
            if (classEntity == null)
            {
                return NotFound(new { Message = "Class not found" });
            }
            _context.Classes.Remove(classEntity);
            await _context.SaveChangesAsync();
            return NoContent();
        }

    }

}
