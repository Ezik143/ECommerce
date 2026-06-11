using AutoMapper;
using ECommerce.Data;
using ECommerce.Model.Dto.Request;
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
    public class OrderItemController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public OrderItemController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        [Authorize(Policy = "OrderRead")]
        public async Task<IActionResult> GetAllOrderItems()
        {
            IQueryable<OrderItem> query = _context.OrderItems;

            // Sellers can only see order items containing their own products
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            if (currentUserRole == nameof(UserRole.Seller))
            {
                var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                  ?? User.FindFirstValue("sub");
                var currentUser = await _context.User.FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId);
                if (currentUser != null)
                {
                    var sellerProductIds = await _context.Products
                        .Where(p => p.SellerId == currentUser.UserId)
                        .Select(p => p.ProductId)
                        .ToListAsync();

                    query = query.Where(oi => sellerProductIds.Contains(oi.ProductId));
                }
            }

            var entities = await query.ToListAsync();
            var responseDtos = _mapper.Map<List<OrderItemResponse>>(entities);
            return Ok(responseDtos);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "OrderRead")]
        public async Task<IActionResult> GetOrderItem(int id)
        {
            var entity = await _context.OrderItems.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            var responseDto = _mapper.Map<OrderItemResponse>(entity);
            return Ok(responseDto);
        }

        [HttpGet("order/{orderId}")]
        [Authorize(Policy = "OrderRead")]
        public async Task<IActionResult> GetOrderItemsByOrderId(int orderId)
        {
            var entities = await _context.OrderItems
                .Where(oi => oi.OrderId == orderId)
                .ToListAsync();

            var responseDtos = _mapper.Map<List<OrderItemResponse>>(entities);
            return Ok(responseDtos);
        }

        [HttpPost]
        [Authorize(Policy = "CustomerSelf")]
        public async Task<IActionResult> CreateOrderItem(CreateOrderItemRequest request)
        {
            if (request == null)
            {
                return BadRequest("OrderItem data is required.");
            }

            var entity = _mapper.Map<OrderItem>(request);
            entity.TotalPrice = entity.Quantity * entity.UnitPrice;

            _context.OrderItems.Add(entity);
            await _context.SaveChangesAsync();

            var responseDto = _mapper.Map<OrderItemResponse>(entity);
            return Ok(responseDto);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "OrderFulfillment")]
        public async Task<IActionResult> UpdateOrderItem(int id, UpdateOrderItemRequest request)
        {
            if (request == null)
            {
                return BadRequest("OrderItem data is required.");
            }

            var entity = await _context.OrderItems.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            _mapper.Map(request, entity);
            entity.TotalPrice = entity.Quantity * entity.UnitPrice;
            await _context.SaveChangesAsync();

            var responseDto = _mapper.Map<OrderItemResponse>(entity);
            return Ok(responseDto);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeleteOrderItem(int id)
        {
            var entity = await _context.OrderItems.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            _context.OrderItems.Remove(entity);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}