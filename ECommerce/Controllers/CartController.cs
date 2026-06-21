using AutoMapper;
using ECommerce.Data;
using ECommerce.Model.Dto.Response;
using ECommerce.Model.Entity;
using ECommerce.Model.Enum;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ECommerce.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public CartController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet("mine")]
        public async Task<IActionResult> GetMyCart()
        {
            var userId = await GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "User not found" });

            var cart = await _context.Cart
                .FirstOrDefaultAsync(c => c.UserId == userId.Value);

            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId.Value,
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

            // var itemDtos = new List<CartItemResponse>();
            // foreach (var item in items)
            // {
            //     var product = await _context.Products.FindAsync(item.ProductId);
            //     itemDtos.Add(new CartItemResponse
            //     {
            //         CartItemId = item.CartItemId,
            //         CartId = item.CartId,
            //         ProductId = item.ProductId,
            //         ProductName = product?.Name ?? "Unknown",
            //         Price = product?.Price ?? 0,
            //         ImageUrl = product?.ImageUrl,
            //         Quantity = item.Quantity,
            //     });
            // }

            var dto = new CartResponse
            {
                CartId = cart.CartId,
                UserId = cart.UserId,
                Items = responseDto,
                TotalAmount = responseDto.Sum(i => i.Product?.Price ?? 0 * i.Quantity),
                CreatedAt = cart.CreatedAt,
                UpdatedAt = cart.UpdatedAt,
            };

            return Ok(dto);

        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCart(int id)
        {
            var cart = await _context.Cart.FindAsync(id);
            if (cart == null)
                return NotFound();

            var userId = await GetCurrentUserId();
            if (cart.UserId != userId)
                return Forbid();

            var items = await _context.CartItem.Where(ci => ci.CartId == id).ToListAsync();
            _context.CartItem.RemoveRange(items);
            _context.Cart.Remove(cart);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private async Task<int?> GetCurrentUserId()
        {
            var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (auth0UserId == null) return null;

            var user = await _context.User.FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId);
            return user?.UserId;
        }
    }
}
