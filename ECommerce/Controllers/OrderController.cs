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
        [Authorize(Policy = "OrderRead")]
        public async Task<IActionResult> GetAllOrders()
        {
            IQueryable<Order> query = _context.Orders;

            // Sellers can only see orders that contain their own products
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

                    query = query.Where(o => _context.OrderItems
                        .Any(oi => oi.OrderId == o.OrderId && sellerProductIds.Contains(oi.ProductId)));
                }
            }
            // Customers can only see their own orders
            else if (currentUserRole == nameof(UserRole.Customer))
            {
                var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                  ?? User.FindFirstValue("sub");
                var currentUser = await _context.User.FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId);
                if (currentUser != null)
                {
                    query = query.Where(o => o.UserId == currentUser.UserId);
                }
            }

            var entities = await query.ToListAsync();
            var responseDtos = _mapper.Map<List<OrderResponse>>(entities);
            return Ok(responseDtos);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "OrderRead")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var entity = await _context.Orders.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            // Ownership/access checks
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            if (currentUserRole == nameof(UserRole.Customer) || currentUserRole == nameof(UserRole.Seller))
            {
                var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                  ?? User.FindFirstValue("sub");
                var currentUser = await _context.User.FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId);
                if (currentUser == null)
                {
                    return Unauthorized();
                }

                if (currentUserRole == nameof(UserRole.Customer) && entity.UserId != currentUser.UserId)
                {
                    return Forbid();
                }

                if (currentUserRole == nameof(UserRole.Seller))
                {
                    var hasProductInOrder = await _context.OrderItems
                        .AnyAsync(oi => oi.OrderId == id && _context.Products
                            .Any(p => p.ProductId == oi.ProductId && p.SellerId == currentUser.UserId));
                    if (!hasProductInOrder)
                    {
                        return Forbid();
                    }
                }
            }

            var responseDto = _mapper.Map<OrderResponse>(entity);
            return Ok(responseDto);
        }

        [HttpPost]
        [Authorize(Policy = "CustomerSelf")]
        public async Task<IActionResult> CreateOrder(CreateOrderRequest request)
        {
            if (request == null)
            {
                return BadRequest("Order data is required.");
            }

            var entity = _mapper.Map<Order>(request);

            // Automatically assign the UserId for customers
            var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                              ?? User.FindFirstValue("sub");
            var currentUser = await _context.User.FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId);
            if (currentUser != null)
            {
                entity.UserId = currentUser.UserId;
            }

            _context.Orders.Add(entity);
            await _context.SaveChangesAsync();

            var responseDto = _mapper.Map<OrderResponse>(entity);
            return Ok(responseDto);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "OrderFulfillment")]
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
        [Authorize(Policy = "AdminOnly")]
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