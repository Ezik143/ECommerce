using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;

namespace ECommerce.Services;

public interface IOrderService
{
    Task<IEnumerable<OrderResponse>> GetAllOrdersAsync(int? userId = null, string? role = null);
    Task<OrderResponse?> GetOrderByIdAsync(int id);
    Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request, int userId);
    Task<OrderResponse?> UpdateOrderStatusAsync(int id, string? status);
    Task<bool> DeleteOrderAsync(int id);
}