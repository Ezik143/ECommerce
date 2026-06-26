using ECommerce.Model.Dto.Request;
using ECommerce.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CartItemController : ControllerBase
    {
        private readonly ICartItemService _cartItemService;

        public CartItemController(ICartItemService cartItemService)
        {
            _cartItemService = cartItemService;
        }

        [HttpGet("cart/{cartId}")]
        public async Task<IActionResult> GetCartItemsByCartId(int cartId)
        {
            var result = await _cartItemService.GetCartItemsByCartIdAsync(cartId);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> AddCartItem(AddCartItemRequest request)
        {
            if (request == null)
                return BadRequest(new { message = "CartItem data is required." });

            var result = await _cartItemService.AddCartItemAsync(request);
            if (result == null)
                return NoContent();
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCartItem(int id, UpdateCartItemRequest request)
        {
            if (request == null)
                return BadRequest();

            var result = await _cartItemService.UpdateCartItemAsync(id, request);
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCartItem(int id)
        {
            var deleted = await _cartItemService.DeleteCartItemAsync(id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
    }
}