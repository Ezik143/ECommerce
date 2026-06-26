using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;

namespace ECommerce.Services;

public interface IAuthService
{
    Task<UserResponse> RegisterAsync(RegisterRequest request);
}