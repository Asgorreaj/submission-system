using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize(Roles = "Admin")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<UserResponseDto>>> GetAllUsers([FromQuery] string? role)
        {
            var query = _context.Users.Include(u => u.Class).AsQueryable();

            if (!string.IsNullOrWhiteSpace(role))
                query = query.Where(u => u.Role == role);

            var users = await query
                .Select(u => new UserResponseDto
                {
                    Id = u.Id,
                    LoginId = u.LoginId ?? string.Empty,
                    FullName = u.Fullname,
                    Email = u.Email,
                    Role = u.Role,
                    ClassId = u.ClassId,
                    ClassName = u.Class != null ? u.Class.Name : null,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponseDto>> GetUserById(Guid id)
        {
            var user = await _context.Users.Include(u => u.Class)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(new UserResponseDto
            {
                Id = user.Id,
                LoginId = user.LoginId ?? string.Empty,
                FullName = user.Fullname,
                Email = user.Email,
                Role = user.Role,
                ClassId = user.ClassId,
                ClassName = user.Class?.Name,
                CreatedAt = user.CreatedAt
            });
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<UserResponseDto>> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var emailTaken = await _context.Users.AnyAsync(u => u.Email == dto.Email && u.Id != id);
            if (emailTaken)
                return BadRequest(new { message = "Email already in use" });

            if (dto.Role == "Student")
            {
                if (dto.ClassId == null)
                    return BadRequest(new { message = "Class selection is required for Student role" });

                var classExists = await _context.Classes.AnyAsync(c => c.Id == dto.ClassId);
                if (!classExists)
                    return BadRequest(new { message = "Selected class does not exist" });
            }

            user.Fullname = dto.FullName;
            user.Email = dto.Email;
            user.Role = dto.Role;
            user.ClassId = dto.Role == "Student" ? dto.ClassId : null;

            await _context.SaveChangesAsync();

            var classEntity = user.ClassId != null
                ? await _context.Classes.FirstOrDefaultAsync(c => c.Id == user.ClassId)
                : null;

            return Ok(new UserResponseDto
            {
                Id = user.Id,
                LoginId = user.LoginId ?? string.Empty,
                FullName = user.Fullname,
                Email = user.Email,
                Role = user.Role,
                ClassId = user.ClassId,
                ClassName = classEntity?.Name,
                CreatedAt = user.CreatedAt
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            if (user.Role == "Admin")
            {
                var adminCount = await _context.Users.CountAsync(u => u.Role == "Admin");
                if (adminCount <= 1)
                    return BadRequest(new { message = "Cannot delete the last remaining Admin" });
            }

            // Teacher-owned Subjects/Assignments will violate FK if deleted with data present —
            // decide per your EF delete-behavior. Simplest safe route: block delete if owner of records.
            var ownsSubjects = await _context.Subjects.AnyAsync(s => s.TeacherId == id);
            if (ownsSubjects)
                return BadRequest(new { message = "Cannot delete a teacher assigned to subjects. Reassign first." });

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}