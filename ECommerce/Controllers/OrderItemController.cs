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
    public class OrderItemController : ControllerBase
    {
        private readonly IOrderItemService _orderItemService;
        private readonly IUserService _userService;

        public OrderItemController(IOrderItemService orderItemService, IUserService userService)
        {
            _orderItemService = orderItemService;
            _userService = userService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllOrderItems()
        {
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            if (currentUserRole != nameof(UserRole.Seller))
                return BadRequest();

            var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var currentUser = await _userService.GetUserByAuth0IdAsync(auth0UserId);
            if (currentUser == null)
                return BadRequest();

            var result = await _orderItemService.GetAllOrderItemsAsync(currentUser.UserId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetOrderItem(int id)
        {
            var result = await _orderItemService.GetOrderItemByIdAsync(id);
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        [HttpGet("order/{orderId}")]
        [Authorize]
        public async Task<IActionResult> GetOrderItemsByOrderId(int orderId)
        {
            var result = await _orderItemService.GetOrderItemsByOrderIdAsync(orderId);
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = "OrderManagerOrAdmin")]
        public async Task<IActionResult> CreateOrderItem(CreateOrderItemRequest request)
        {
            if (request == null)
                return BadRequest("OrderItem data is required.");

            var result = await _orderItemService.CreateOrderItemAsync(request);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "OrderManagerOrAdmin")]
        public async Task<IActionResult> UpdateOrderItem(int id, UpdateOrderItemRequest request)
        {
            if (request == null)
                return BadRequest("OrderItem data is required.");

            var result = await _orderItemService.UpdateOrderItemAsync(id, request);
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "OrderManagerOrAdmin")]
        public async Task<IActionResult> DeleteOrderItem(int id)
        {
            var deleted = await _orderItemService.DeleteOrderItemAsync(id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
    }
}