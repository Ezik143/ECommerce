using ECommerce.Model.Dto.Response;

namespace ECommerce.Services;

public interface ICartService
{
    Task<CartResponse?> GetMyCartAsync(int userId);
    Task<bool> DeleteCartAsync(int cartId, int userId);
}