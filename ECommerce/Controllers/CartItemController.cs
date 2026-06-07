using AutoMapper;
using ECommerce.Data;
using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;
using ECommerce.Model.Entity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartItemController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public CartItemController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCartItems()
        {
            var entities = await _context.CartItem.ToListAsync();

            var responseDtos = _mapper.Map<List<CartItemResponse>>(entities);
            return Ok(responseDtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCartItem(int id)
        {
            var entity = await _context.CartItem.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            var responseDto = _mapper.Map<CartItemResponse>(entity);
            return Ok(responseDto);
        }

        [HttpGet("cart/{cartId}")]
        public async Task<IActionResult> GetCartItemsByCartId(int cartId)
        {
            var entities = await _context.CartItem
                .Where(ci => ci.CartId == cartId)
                .ToListAsync();

            var responseDtos = _mapper.Map<List<CartItemResponse>>(entities);
            return Ok(responseDtos);
        }

        [HttpPost]
        public async Task<IActionResult> AddCartItem(AddCartItemRequest request)
        {
            if (request == null)
            {
                return BadRequest("CartItem data is required.");
            }

            var entity = _mapper.Map<CartItem>(request);

            _context.CartItem.Add(entity);

            await _context.SaveChangesAsync();

            var responseDto = _mapper.Map<CartItemResponse>(entity);
            return Ok(responseDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCartItem(int id, UpdateCartItemRequest request)
        {
            if (request == null)
            {
                return BadRequest("CartItem data is required.");
            }

            var entity = await _context.CartItem.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            _mapper.Map(request, entity);
            await _context.SaveChangesAsync();

            var responseDto = _mapper.Map<CartItemResponse>(entity);
            return Ok(responseDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCartItem(int id)
        {
            var entity = await _context.CartItem.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            _context.CartItem.Remove(entity);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
