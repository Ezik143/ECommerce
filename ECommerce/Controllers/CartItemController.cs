using AutoMapper;
using ECommerce.Data;
using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;
using ECommerce.Model.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CartItemController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public CartItemController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet("cart/{cartId}")]
        public async Task<IActionResult> GetCartItemsByCartId(int cartId)
        {
            var entity = await _context.CartItem
                .Include(ci => ci.Product)
                .Where(ci => ci.CartId == cartId)
                .ToListAsync();

            var dto = _mapper.Map<List<CartItemResponse>>(entity);
            return Ok(dto);
        }

        [HttpPost]
        public async Task<IActionResult> AddCartItem(AddCartItemRequest request)
        {
            if (request == null)
                return BadRequest(new { message = "CartItem data is required." });

            var existing = await _context.CartItem
                                        .FirstOrDefaultAsync(c => c.CartId == request.CartId && c.ProductId == request.ProductId);

            if (existing != null)
            {
                existing.Quantity += request.Quantity;
                await _context.SaveChangesAsync();
                return NoContent();
            }
            else
            {
                var entity = _mapper.Map<CartItem>(request);
                _context.CartItem.Add(entity);

                await _context.SaveChangesAsync();

                var dto = _mapper.Map<CartItemResponse>(entity);
                return Ok(dto);
            }


            // var existing = await _context.CartItem
            //     .FirstOrDefaultAsync(ci => ci.CartId == request.CartId && ci.ProductId == request.ProductId);

            // if (existing != null)
            // {
            //     existing.Quantity += request.Quantity;
            //     await _context.SaveChangesAsync();

            //     var cart = await _context.Cart.FindAsync(existing.CartId);
            //     if (cart != null)
            //     {
            //         cart.UpdatedAt = DateTime.UtcNow;
            //         await _context.SaveChangesAsync();  
            //     }

            //     var product = await _context.Products.FindAsync(existing.ProductId);
            //     var dto = new CartItemResponse
            //     {
            //         CartItemId = existing.CartItemId,
            //         CartId = existing.CartId,
            //         ProductId = existing.ProductId,
            //         ProductName = product?.Name ?? "Unknown",
            //         Price = product?.Price ?? 0,
            //         ImageUrl = product?.ImageUrl,
            //         Quantity = existing.Quantity,
            //     };
            //     return Ok(dto);
            // }

            // var entity = new CartItem
            // {
            //     CartId = request.CartId,
            //     ProductId = request.ProductId,
            //     Quantity = request.Quantity,
            // };

            // _context.CartItem.Add(entity);
            // await _context.SaveChangesAsync();

            // var cartEntity = await _context.Cart.FindAsync(entity.CartId);
            // if (cartEntity != null)
            // {
            //     cartEntity.UpdatedAt = DateTime.UtcNow;
            //     await _context.SaveChangesAsync();
            // }

            // var newProduct = await _context.Products.FindAsync(entity.ProductId);
            // var responseDto = new CartItemResponse
            // {
            //     CartItemId = entity.CartItemId,
            //     CartId = entity.CartId,
            //     ProductId = entity.ProductId,
            //     ProductName = newProduct?.Name ?? "Unknown",
            //     Price = newProduct?.Price ?? 0,
            //     ImageUrl = newProduct?.ImageUrl,
            //     Quantity = entity.Quantity,
            // };
            // return Ok(responseDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCartItem(int id, UpdateCartItemRequest request)
        {
            if (request == null)
                return BadRequest();

            var entity = await _context.CartItem
                            .Include(ci => ci.Product)
                            .FirstOrDefaultAsync(ci => ci.CartItemId == id);

            if (entity == null)
            {
                return NotFound();
            }

            entity.Quantity = request.Quantity;
            await _context.SaveChangesAsync();

            var cart = await _context.Cart.FindAsync(entity.CartId);
            if (cart != null)
            {
                cart.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            var dto = _mapper.Map<CartItemResponse>(entity);
            return Ok(dto);

            //STUPID AI
            // if (request == null)
            //     return BadRequest(new { message = "CartItem data is required." });

            // var entity = await _context.CartItem.FindAsync(id);
            // if (entity == null)
            //     return NotFound();

            // entity.Quantity = request.Quantity;
            // await _context.SaveChangesAsync();

            // var cart = await _context.Cart.FindAsync(entity.CartId);
            // if (cart != null)
            // {
            //     cart.UpdatedAt = DateTime.UtcNow;
            //     await _context.SaveChangesAsync();
            // }

            // var product = await _context.Products.FindAsync(entity.ProductId);
            // var dto = new CartItemResponse
            // {
            //     CartItemId = entity.CartItemId,
            //     CartId = entity.CartId,
            //     ProductId = entity.ProductId,
            //     ProductName = product?.Name ?? "Unknown",
            //     Price = product?.Price ?? 0,
            //     ImageUrl = product?.ImageUrl,
            //     Quantity = entity.Quantity,
            // };
            // return Ok(dto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCartItem(int id)
        {
            var entity = await _context.CartItem.FindAsync(id);
            if (entity == null)
                return NotFound();

            _context.CartItem.Remove(entity);
            await _context.SaveChangesAsync();

            var cart = await _context.Cart.FindAsync(entity.CartId);
            if (cart != null)
            {
                cart.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }
        // NEVER VIBECODE AGAIN
        // private async Task<List<CartItemResponse>> EnrichItems(List<CartItem> items)
        // {
        //     var dtos = new List<CartItemResponse>();
        //     foreach (var item in items)
        //     {
        //         var product = await _context.Products.FindAsync(item.ProductId);
        //         dtos.Add(new CartItemResponse
        //         {
        //             CartItemId = item.CartItemId,
        //             CartId = item.CartId,
        //             ProductId = item.ProductId,
        //             ProductName = product?.Name ?? "Unknown",
        //             Price = product?.Price ?? 0,
        //             ImageUrl = product?.ImageUrl,
        //             Quantity = item.Quantity,
        //         });
        //     }
        //     return dtos;
        // }
    }
}
