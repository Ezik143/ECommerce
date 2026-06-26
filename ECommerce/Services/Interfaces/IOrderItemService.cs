using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;

namespace ECommerce.Services;

public interface IOrderItemService
{
    Task<IEnumerable<OrderItemResponse>> GetAllOrderItemsAsync(int? sellerUserId = null);
    Task<OrderItemResponse?> GetOrderItemByIdAsync(int id);
    Task<IEnumerable<OrderItemResponse>> GetOrderItemsByOrderIdAsync(int orderId);
    Task<OrderItemResponse> CreateOrderItemAsync(CreateOrderItemRequest request);
    Task<OrderItemResponse?> UpdateOrderItemAsync(int id, UpdateOrderItemRequest request);
    Task<bool> DeleteOrderItemAsync(int id);
}