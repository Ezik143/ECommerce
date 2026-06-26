using ECommerce.Model.Dto.Request;

namespace ECommerce.Services;

public interface IProfileService
{
    Task<object> GetCurrentUserAsync(string auth0UserId, string email, string name);
    Task<object> EnsureUserExistsAsync(string auth0UserId, string email, string name);
    Task<object> UpdateProfileDetailsAsync(string auth0UserId, CompleteProfileRequest request);
    Task<object> SetUserRoleAsync(string auth0UserId, string role);
}