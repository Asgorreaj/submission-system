using Backend.DTOs;

namespace Backend.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(CreateUserDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto);
        Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto); 
    }
}