using ECommerce.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ECommerce.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;
        private readonly IUserService _userService;

        public CartController(ICartService cartService, IUserService userService)
        {
            _cartService = cartService;
            _userService = userService;
        }

        [HttpGet("mine")]
        public async Task<IActionResult> GetMyCart()
        {
            var userId = await GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "User not found" });

            var result = await _cartService.GetMyCartAsync(userId.Value);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCart(int id)
        {
            var userId = await GetCurrentUserId();
            if (userId == null)
                return Unauthorized(new { message = "User not found" });

            var deleted = await _cartService.DeleteCartAsync(id, userId.Value);
            if (!deleted)
                return NotFound();
            return NoContent();
        }

        private async Task<int?> GetCurrentUserId()
        {
            var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (auth0UserId == null) return null;
            return await _userService.GetUserIdByAuth0IdAsync(auth0UserId);
        }
    }
}