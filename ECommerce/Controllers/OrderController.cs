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
    public class OrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public OrderController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            var entities = await _context.Orders.ToListAsync();
            var responseDtos = _mapper.Map<List<OrderResponse>>(entities);
            return Ok(responseDtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var entity = await _context.Orders.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            var responseDto = _mapper.Map<OrderResponse>(entity);
            return Ok(responseDto);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder(CreateOrderRequest request)
        {
            if (request == null)
            {
                return BadRequest("Order data is required.");
            }

            var entity = _mapper.Map<Order>(request);
            _context.Orders.Add(entity);
            await _context.SaveChangesAsync();

            var responseDto = _mapper.Map<OrderResponse>(entity);
            return Ok(responseDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, UpdateOrderRequest request)
        {
            if (request == null)
            {
                return BadRequest("Order data is required.");
            }

            var entity = await _context.Orders.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            _mapper.Map(request, entity);
            await _context.SaveChangesAsync();

            var responseDto = _mapper.Map<OrderResponse>(entity);
            return Ok(responseDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var entity = await _context.Orders.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            _context.Orders.Remove(entity);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
