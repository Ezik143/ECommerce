using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;

namespace ECommerce.Services;

public interface ICartItemService
{
    Task<IEnumerable<CartItemResponse>> GetCartItemsByCartIdAsync(int cartId);
    Task<CartItemResponse?> AddCartItemAsync(AddCartItemRequest request);
    Task<CartItemResponse?> UpdateCartItemAsync(int id, UpdateCartItemRequest request);
    Task<bool> DeleteCartItemAsync(int id);
}