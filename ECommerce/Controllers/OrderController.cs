using ECommerce.Model.Dto.Request;
using ECommerce.Model.Enum;
using ECommerce.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ECommerce.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly IUserService _userService;

        public OrderController(IOrderService orderService, IUserService userService)
        {
            _orderService = orderService;
            _userService = userService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllOrders()
        {
            var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var currentUser = auth0UserId != null ? await _userService.GetUserByAuth0IdAsync(auth0UserId) : null;

            int? userId = currentUser?.UserId;
            var role = User.FindFirstValue(ClaimTypes.Role);

            var result = await _orderService.GetAllOrdersAsync(userId, role);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "OrderOwner")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var result = await _orderService.GetOrderByIdAsync(id);
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<IActionResult> CreateOrder(CreateOrderRequest request)
        {
            if (request == null)
                return BadRequest("Order data is required.");

            var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var currentUser = auth0UserId != null ? await _userService.GetUserByAuth0IdAsync(auth0UserId) : null;
            if (currentUser == null)
                return Unauthorized("User not found.");

            try
            {
                var result = await _orderService.CreateOrderAsync(request, currentUser.UserId);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "SellerOrOrderManagerOrAdmin")]
        public async Task<IActionResult> UpdateOrder(int id, UpdateOrderRequest request)
        {
            if (request == null)
                return BadRequest("Order data is required.");

            var result = await _orderService.UpdateOrderStatusAsync(id, request.Status);
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "OrderManagerOrAdmin")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var deleted = await _orderService.DeleteOrderAsync(id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
    }
}