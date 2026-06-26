using AutoMapper;
using ECommerce.Data;
using ECommerce.Model.Dto.Response;
using ECommerce.Model.Entity;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Services;

public class CartService : ICartService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CartService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<CartResponse?> GetMyCartAsync(int userId)
    {
        var cart = await _context.Cart
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            _context.Cart.Add(cart);
            await _context.SaveChangesAsync();
        }

        var items = await _context.CartItem
            .Include(ci => ci.Product)
            .Where(ci => ci.CartId == cart.CartId)
            .ToListAsync();

        var responseDto = _mapper.Map<List<CartItemResponse>>(items);

        return new CartResponse
        {
            CartId = cart.CartId,
            UserId = cart.UserId,
            Items = responseDto,
            TotalAmount = responseDto.Sum(i => i.Product?.Price ?? 0 * i.Quantity),
            CreatedAt = cart.CreatedAt,
            UpdatedAt = cart.UpdatedAt,
        };
    }

    public async Task<bool> DeleteCartAsync(int cartId, int userId)
    {
        var cart = await _context.Cart.FindAsync(cartId);
        if (cart == null)
            return false;

        if (cart.UserId != userId)
            return false;

        var items = await _context.CartItem.Where(ci => ci.CartId == cartId).ToListAsync();
        _context.CartItem.RemoveRange(items);
        _context.Cart.Remove(cart);
        await _context.SaveChangesAsync();
        return true;
    }
}