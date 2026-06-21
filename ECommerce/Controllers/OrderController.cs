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
        [Authorize]
        public async Task<IActionResult> GetAllOrders()
        {
            IQueryable<Order> query = _context.Orders;

            var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var currentUser = auth0UserId != null
                ? await _context.User.FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId)
                : null;

            if (currentUser != null)
            {
                var currentUserRole = User.FindFirstValue(ClaimTypes.Role);

                if (currentUserRole == nameof(UserRole.Seller))
                {
                    var sellerProductIds = await _context.Products
                        .Where(p => p.SellerId == currentUser.UserId)
                        .Select(p => p.ProductId)
                        .ToListAsync();

                    query = query.Where(o => _context.OrderItems
                        .Any(oi => oi.OrderId == o.OrderId && sellerProductIds.Contains(oi.ProductId)));
                }
                else if (currentUserRole == nameof(UserRole.Customer))
                {
                    query = query.Where(o => o.UserId == currentUser.UserId);
                }
            }

            var entities = await query.ToListAsync();
            var result = await BuildOrderResponses(entities);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "OrderOwner")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var entity = await _context.Orders.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            var result = (await BuildOrderResponses(new[] { entity })).FirstOrDefault();
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<IActionResult> CreateOrder(CreateOrderRequest request)
        {
            if (request == null)
            {
                return BadRequest("Order data is required.");
            }

            var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var currentUser = auth0UserId != null
                ? await _context.User.FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId)
                : null;
            if (currentUser == null)
            {
                return Unauthorized("User not found.");
            }

            var cart = await _context.Cart
                .Where(c => c.UserId == currentUser.UserId)
                .FirstOrDefaultAsync();

            if (cart == null)
            {
                return BadRequest("Cart is empty.");
            }

            var cartItems = await _context.CartItem
                .Where(ci => ci.CartId == cart.CartId)
                .ToListAsync();

            if (cartItems.Count == 0)
            {
                return BadRequest("Cart is empty.");
            }

            var productIds = cartItems.Select(ci => ci.ProductId).ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.ProductId))
                .ToDictionaryAsync(p => p.ProductId, p => p.Price);

            var entity = new Order
            {
                UserId = currentUser.UserId,
                ShippingAddressId = request.ShippingAddressId,
                TotalAmount = cartItems.Sum(ci =>
                {
                    var price = products.GetValueOrDefault(ci.ProductId, 0);
                    return price * ci.Quantity;
                }),
                Payment = System.Enum.Parse<PaymentMethod>(request.PaymentMethod),
                PaymentStatus = OrderStatus.PendingPayment,
                OrderDate = DateTime.UtcNow,
            };

            _context.Orders.Add(entity);
            await _context.SaveChangesAsync();

            var orderItems = cartItems.Select(ci => new OrderItem
            {
                OrderId = entity.OrderId,
                ProductId = ci.ProductId,
                Quantity = ci.Quantity,
                UnitPrice = products.GetValueOrDefault(ci.ProductId, 0),
                TotalPrice = products.GetValueOrDefault(ci.ProductId, 0) * ci.Quantity,
            }).ToList();

            _context.OrderItems.AddRange(orderItems);
            _context.CartItem.RemoveRange(cartItems);
            await _context.SaveChangesAsync();

            var result = (await BuildOrderResponses(new[] { entity })).FirstOrDefault();
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "SellerOrOrderManagerOrAdmin")]
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

            if (!string.IsNullOrEmpty(request.Status))
            {
                entity.PaymentStatus = System.Enum.Parse<OrderStatus>(request.Status);
            }

            await _context.SaveChangesAsync();

            var result = (await BuildOrderResponses(new[] { entity })).FirstOrDefault();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "OrderManagerOrAdmin")]
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

        private async Task<List<OrderResponse>> BuildOrderResponses(IEnumerable<Order> orders)
        {
            var orderList = orders.ToList();
            if (orderList.Count == 0)
                return new List<OrderResponse>();

            var orderIds = orderList.Select(o => o.OrderId).ToList();

            var orderItems = await _context.OrderItems
                .Where(oi => orderIds.Contains(oi.OrderId))
                .ToListAsync();

            var productIds = orderItems.Select(oi => oi.ProductId).Distinct().ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.ProductId))
                .ToDictionaryAsync(p => p.ProductId, p => p.Name);

            var addressIds = orderList.Select(o => o.ShippingAddressId).Distinct().ToList();
            var addresses = await _context.Addresses
                .Where(a => addressIds.Contains(a.AddressId))
                .ToDictionaryAsync(a => a.AddressId, a => $"{a.Street}, {a.City}, {a.State} {a.PostalCode}, {a.Country}");

            var itemsByOrderId = orderItems
                .GroupBy(oi => oi.OrderId)
                .ToDictionary(g => g.Key, g => g.ToList());

            return orderList.Select(order =>
            {
                var items = itemsByOrderId.GetValueOrDefault(order.OrderId) ?? new List<OrderItem>();

                return new OrderResponse
                {
                    OrderId = order.OrderId,
                    UserId = order.UserId,
                    Status = order.PaymentStatus.ToString(),
                    TotalAmount = order.TotalAmount,
                    PaymentMethod = order.Payment.ToString(),
                    ShippingAddress = addresses.GetValueOrDefault(order.ShippingAddressId) ?? string.Empty,
                    CreatedAt = order.OrderDate,
                    Items = items.Select(oi => new OrderItemResponse
                    {
                        OrderItemId = oi.OrderItemId,
                        ProductId = oi.ProductId,
                        ProductName = products.GetValueOrDefault(oi.ProductId) ?? "Unknown",
                        Price = oi.UnitPrice,
                        Quantity = oi.Quantity,
                    }).ToList()
                };
            }).ToList();
        }
    }
}
