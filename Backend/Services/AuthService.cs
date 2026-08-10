using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Backend.Settings;

namespace Backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly JwtSettings _jwtSettings;
        private readonly ILogger<AuthService> _logger;
        // *** NOTUN: Logger inject korলাম - important action gula LOG korার জন্য ***

        public AuthService(AppDbContext context, IOptions<JwtSettings> jwtSettings, ILogger<AuthService> logger)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;
            _logger = logger;
        }

        // *** NOTUN METHOD: LoginId auto-generate kরা ("STU-26-0001" style) ***
        private async Task<string> GenerateLoginIdAsync(string role)
        {
            string prefix = role switch
            {
                "Admin" => "ADM",
                "Teacher" => "TCH",
                "Student" => "STU",
                _ => "USR"
            };
            // "switch expression" - C# 8+ feature, if-else chain er SHORT-FORM

            string year = DateTime.UtcNow.ToString("yy"); // "26" (2026 er SHESH 2 digit)

            var existingCount = await _context.Users
                .CountAsync(u => u.Role == role && u.LoginId != null && u.LoginId.StartsWith($"{prefix}-{year}-"));
            // "CountAsync" - koto জন EI Role + EI Year এর USER AGE THEKE ache seta COUNT kরা
            // "StartsWith" - LoginId ta EI prefix DIYE SHURU HOY kিনা check kরা

            int nextNumber = existingCount + 1;

            return $"{prefix}-{year}-{nextNumber:D4}";
            // "D4" format specifier - number ke 4-digit e PAD kরে (1 → "0001", 23 → "0023")
        }

        public async Task<AuthResponseDto> RegisterAsync(CreateUserDto dto)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (existingUser != null)
            {
                throw new Exception("Email already exists");
            }

            // *** NOTUN VALIDATION: Student HOLE ClassId MANDATORY + Class EXIST korতে হবে ***
            if (dto.Role == "Student")
            {
                if (dto.ClassId == null)
                {
                    throw new Exception("Class selection is required for Student registration");
                }

                var classExists = await _context.Classes.AnyAsync(c => c.Id == dto.ClassId);
                if (!classExists)
                {
                    throw new Exception("Selected class does not exist");
                }
            }

            var loginId = await GenerateLoginIdAsync(dto.Role); // *** NOTUN ***

            var user = new User
            {
                Id = Guid.NewGuid(),
                LoginId = loginId,
                Fullname = dto.FullName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role,
                ClassId = dto.Role == "Student" ? dto.ClassId : null,
                // Teacher/Admin er ClassId shব somoy NULL, jদিো client kিছু pathায়ও
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation("New user created: {LoginId} with Role {Role}", loginId, dto.Role);
            // *** NOTUN: Logging - "who created" info CONSOLE/FILE e LOG hবে ***

            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Token = token,
                Id = user.Id,
                LoginId = user.LoginId,
                FullName = user.Fullname,
                Email = user.Email,
                Role = user.Role
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.LoginId == dto.LoginId);
            

            if (user == null)
            {
                _logger.LogWarning("Failed login attempt for LoginId: {LoginId}", dto.LoginId);
                
                throw new Exception("Invalid login ID or password");
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
            if (!isPasswordValid)
            {
                _logger.LogWarning("Failed login attempt for LoginId: {LoginId}", dto.LoginId);
                throw new Exception("Invalid login ID or password");
            }

            _logger.LogInformation("User logged in: {LoginId}", dto.LoginId); 

            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Token = token,
                Id = user.Id,
                LoginId = user.LoginId ?? string.Empty,
                FullName = user.Fullname,
                Email = user.Email,
                Role = user.Role
            };
        }

       
        public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            bool isCurrentPasswordValid = BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash);
            if (!isCurrentPasswordValid)
            {
                throw new Exception("Current password is incorrect");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
          

            await _context.SaveChangesAsync();

            _logger.LogInformation("Password changed for user: {UserId}", userId);
        }

        private string GenerateJwtToken(User user)
        {
            var claim = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Fullname),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("LoginId", user.LoginId ?? string.Empty) 
                
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claim,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
                signingCredentials: credentials
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}