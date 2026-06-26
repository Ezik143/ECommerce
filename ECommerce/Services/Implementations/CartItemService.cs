using AutoMapper;
using ECommerce.Data;
using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;
using ECommerce.Model.Entity;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Services;

public class CartItemService : ICartItemService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CartItemService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<CartItemResponse>> GetCartItemsByCartIdAsync(int cartId)
    {
        var entity = await _context.CartItem
            .Include(ci => ci.Product)
            .Where(ci => ci.CartId == cartId)
            .ToListAsync();

        return _mapper.Map<List<CartItemResponse>>(entity);
    }

    public async Task<CartItemResponse?> AddCartItemAsync(AddCartItemRequest request)
    {
        var existing = await _context.CartItem
            .FirstOrDefaultAsync(c => c.CartId == request.CartId && c.ProductId == request.ProductId);

        if (existing != null)
        {
            existing.Quantity += request.Quantity;
            await _context.SaveChangesAsync();
            return null;
        }

        var entity = _mapper.Map<CartItem>(request);
        _context.CartItem.Add(entity);
        await _context.SaveChangesAsync();

        return _mapper.Map<CartItemResponse>(entity);
    }

    public async Task<CartItemResponse?> UpdateCartItemAsync(int id, UpdateCartItemRequest request)
    {
        var entity = await _context.CartItem
            .Include(ci => ci.Product)
            .FirstOrDefaultAsync(ci => ci.CartItemId == id);

        if (entity == null)
            return null;

        entity.Quantity = request.Quantity;
        await _context.SaveChangesAsync();

        var cart = await _context.Cart.FindAsync(entity.CartId);
        if (cart != null)
        {
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return _mapper.Map<CartItemResponse>(entity);
    }

    public async Task<bool> DeleteCartItemAsync(int id)
    {
        var entity = await _context.CartItem.FindAsync(id);
        if (entity == null)
            return false;

        _context.CartItem.Remove(entity);
        await _context.SaveChangesAsync();

        var cart = await _context.Cart.FindAsync(entity.CartId);
        if (cart != null)
        {
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return true;
    }
}