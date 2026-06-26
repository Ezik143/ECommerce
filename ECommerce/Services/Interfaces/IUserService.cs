using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;

namespace ECommerce.Services;

public interface IUserService
{
    Task<IEnumerable<UserResponse>> GetAllUsersAsync();
    Task<UserResponse?> GetUserByIdAsync(int id);
    Task<UserResponse> CreateUserAsync(CreateUserRequest request);
    Task<UserResponse?> UpdateUserAsync(int id, UpdateUserRequest request);
    Task<bool> DeleteUserAsync(int id);
    Task<Model.Entity.User?> GetUserByAuth0IdAsync(string auth0UserId);
    Task<int?> GetUserIdByAuth0IdAsync(string auth0UserId);
}