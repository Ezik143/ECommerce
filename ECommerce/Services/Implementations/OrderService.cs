using AutoMapper;
using ECommerce.Data;
using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;
using ECommerce.Model.Entity;
using ECommerce.Model.Enum;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Services;

public class OrderService : IOrderService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public OrderService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<OrderResponse>> GetAllOrdersAsync(int? userId = null, string? role = null)
    {
        IQueryable<Order> query = _context.Orders;

        if (role == nameof(UserRole.Seller) && userId.HasValue)
        {
            var sellerProductIds = await _context.Products
                .Where(p => p.SellerId == userId.Value)
                .Select(p => p.ProductId)
                .ToListAsync();

            query = query.Where(o => _context.OrderItems
                .Any(oi => oi.OrderId == o.OrderId && sellerProductIds.Contains(oi.ProductId)));
        }
        else if (role == nameof(UserRole.Customer) && userId.HasValue)
        {
            query = query.Where(o => o.UserId == userId.Value);
        }

        var entities = await query.ToListAsync();
        return await BuildOrderResponses(entities);
    }

    public async Task<OrderResponse?> GetOrderByIdAsync(int id)
    {
        var entity = await _context.Orders.FindAsync(id);
        if (entity == null)
            return null;

        var result = await BuildOrderResponses(new[] { entity });
        return result.FirstOrDefault();
    }

    public async Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request, int userId)
    {
        var cart = await _context.Cart
            .Where(c => c.UserId == userId)
            .FirstOrDefaultAsync()
            ?? throw new InvalidOperationException("Cart is empty.");

        var cartItems = await _context.CartItem
            .Where(ci => ci.CartId == cart.CartId)
            .ToListAsync();

        if (cartItems.Count == 0)
            throw new InvalidOperationException("Cart is empty.");

        var productIds = cartItems.Select(ci => ci.ProductId).ToList();
        var products = await _context.Products
            .Where(p => productIds.Contains(p.ProductId))
            .ToDictionaryAsync(p => p.ProductId, p => p.Price);

        var entity = new Order
        {
            UserId = userId,
            ShippingAddressId = request.ShippingAddressId,
            TotalAmount = cartItems.Sum(ci =>
            {
                var price = products.GetValueOrDefault(ci.ProductId, 0);
                return price * ci.Quantity;
            }),
            Payment = System.Enum.Parse<PaymentMethod>(request.PaymentMethod),
            PaymentStatus = OrderStatus.PendingPayment,
            OrderDate = DateTime.UtcNow,
        };

        _context.Orders.Add(entity);
        await _context.SaveChangesAsync();

        var orderItems = cartItems.Select(ci => new OrderItem
        {
            OrderId = entity.OrderId,
            ProductId = ci.ProductId,
            Quantity = ci.Quantity,
            UnitPrice = products.GetValueOrDefault(ci.ProductId, 0),
            TotalPrice = products.GetValueOrDefault(ci.ProductId, 0) * ci.Quantity,
        }).ToList();

        _context.OrderItems.AddRange(orderItems);
        _context.CartItem.RemoveRange(cartItems);
        await _context.SaveChangesAsync();

        var result = await BuildOrderResponses(new[] { entity });
        return result.First()!;
    }

    public async Task<OrderResponse?> UpdateOrderStatusAsync(int id, string? status)
    {
        var entity = await _context.Orders.FindAsync(id);
        if (entity == null)
            return null;

        if (!string.IsNullOrEmpty(status))
        {
            entity.PaymentStatus = System.Enum.Parse<OrderStatus>(status);
        }

        await _context.SaveChangesAsync();

        var result = await BuildOrderResponses(new[] { entity });
        return result.FirstOrDefault();
    }

    public async Task<bool> DeleteOrderAsync(int id)
    {
        var entity = await _context.Orders.FindAsync(id);
        if (entity == null)
            return false;

        _context.Orders.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task<List<OrderResponse>> BuildOrderResponses(IEnumerable<Order> orders)
    {
        var orderList = orders.ToList();
        if (orderList.Count == 0)
            return new List<OrderResponse>();

        var orderIds = orderList.Select(o => o.OrderId).ToList();

        var orderItems = await _context.OrderItems
            .Include(oi => oi.Product)
            .Where(oi => orderIds.Contains(oi.OrderId))
            .ToListAsync();

        var addressIds = orderList.Select(o => o.ShippingAddressId).Distinct().ToList();
        var addresses = await _context.Addresses
            .Where(a => addressIds.Contains(a.AddressId))
            .ToDictionaryAsync(a => a.AddressId, a => $"{a.Street}, {a.City}, {a.State} {a.PostalCode}, {a.Country}");

        var itemsByOrderId = orderItems
            .GroupBy(oi => oi.OrderId)
            .ToDictionary(g => g.Key, g => g.ToList());

        return orderList.Select(order =>
        {
            var items = itemsByOrderId.GetValueOrDefault(order.OrderId) ?? new List<OrderItem>();

            return new OrderResponse
            {
                OrderId = order.OrderId,
                UserId = order.UserId,
                Status = order.PaymentStatus.ToString(),
                TotalAmount = order.TotalAmount,
                PaymentMethod = order.Payment.ToString(),
                ShippingAddress = addresses.GetValueOrDefault(order.ShippingAddressId) ?? string.Empty,
                CreatedAt = order.OrderDate,
                Items = _mapper.Map<List<OrderItemResponse>>(items)
            };
        }).ToList();
    }
}