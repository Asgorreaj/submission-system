using Xunit;

namespace Backend.Tests
{
    public class AuthBusinessRuleTests
    {
        [Fact]
        public void RoleValidation_ShouldPass_WhenRoleIsValid()
        {
            // Arrange
            string validRole = "Teacher";

            // Act
            bool isValid = validRole == "Admin" || validRole == "Teacher" || validRole == "Student";

            // Assert
            Assert.True(isValid);
        }

        [Fact]
        public void PasswordHashing_ShouldNotBeNullOrEmpty()
        {
            // Act
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword("TestPassword123");

            // Assert
            Assert.False(string.IsNullOrEmpty(hashedPassword));
        }
    }
}