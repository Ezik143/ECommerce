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
    public class CartController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public CartController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCart()
        {
            var entities = await _context.Cart.ToListAsync();

            var responseDtos = _mapper.Map<List<CartResponse>>(entities);
            return Ok(responseDtos);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCart(CreateCartRequest request)
        {
            if (request == null)
            {
                return BadRequest("Cart data is required.");
            }

            var entity = _mapper.Map<Cart>(request);

            _context.Cart.Add(entity);

            await _context.SaveChangesAsync();

            var responseDto = _mapper.Map<CartResponse>(entity);
            return Ok(responseDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCart(int id, UpdateCartRequest request)
        {
            if (request == null)
            {
                return BadRequest("Cart data is required.");
            }

            var entity = await _context.Cart.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            _mapper.Map(request, entity);
            await _context.SaveChangesAsync();

            var responseDto = _mapper.Map<CartResponse>(entity);
            return Ok(responseDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCart(int id)
        {
            var entity = await _context.Cart.FindAsync();
            if (entity == null)
            {
                return NotFound();
            }

            _context.Cart.Remove(entity);
            _context.SaveChanges();
            return NoContent();
        }
    }

}
