using AutoMapper;
using ECommerce.Data;
using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;
using ECommerce.Model.Entity;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Services;

public class OrderItemService : IOrderItemService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public OrderItemService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<OrderItemResponse>> GetAllOrderItemsAsync(int? sellerUserId = null)
    {
        IQueryable<OrderItem> query = _context.OrderItems.Include(oi => oi.Product);

        if (sellerUserId.HasValue)
        {
            var sellerProductIds = await _context.Products
                .Where(p => p.SellerId == sellerUserId.Value)
                .Select(p => p.ProductId)
                .ToListAsync();

            query = query.Where(oi => sellerProductIds.Contains(oi.ProductId));
        }

        var items = await query.ToListAsync();
        return _mapper.Map<List<OrderItemResponse>>(items);
    }

    public async Task<OrderItemResponse?> GetOrderItemByIdAsync(int id)
    {
        var entity = await _context.OrderItems
            .Include(oi => oi.Product)
            .FirstOrDefaultAsync(oi => oi.OrderItemId == id);

        if (entity == null)
            return null;

        return _mapper.Map<OrderItemResponse>(entity);
    }

    public async Task<IEnumerable<OrderItemResponse>> GetOrderItemsByOrderIdAsync(int orderId)
    {
        var entities = await _context.OrderItems
            .Where(oi => oi.OrderId == orderId)
            .Include(oi => oi.Product)
            .ToListAsync();

        return _mapper.Map<List<OrderItemResponse>>(entities);
    }

    public async Task<OrderItemResponse> CreateOrderItemAsync(CreateOrderItemRequest request)
    {
        var entity = _mapper.Map<OrderItem>(request);
        entity.TotalPrice = entity.Quantity * entity.UnitPrice;

        _context.OrderItems.Add(entity);
        await _context.SaveChangesAsync();

        return _mapper.Map<OrderItemResponse>(entity);
    }

    public async Task<OrderItemResponse?> UpdateOrderItemAsync(int id, UpdateOrderItemRequest request)
    {
        var entity = await _context.OrderItems
            .Include(oi => oi.Product)
            .FirstOrDefaultAsync(oi => oi.OrderItemId == id);

        if (entity == null)
            return null;

        _mapper.Map(request, entity);
        entity.TotalPrice = entity.Quantity * entity.UnitPrice;
        await _context.SaveChangesAsync();

        return _mapper.Map<OrderItemResponse>(entity);
    }

    public async Task<bool> DeleteOrderItemAsync(int id)
    {
        var entity = await _context.OrderItems.FindAsync(id);
        if (entity == null)
            return false;

        _context.OrderItems.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }
}