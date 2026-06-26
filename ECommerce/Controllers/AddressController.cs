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
    public class AddressController : ControllerBase
    {
        private readonly IAddressService _addressService;
        private readonly IUserService _userService;

        public AddressController(IAddressService addressService, IUserService userService)
        {
            _addressService = addressService;
            _userService = userService;
        }

        [HttpGet("MyAddresses")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<object>>> GetMyAddresses()
        {
            var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (string.IsNullOrEmpty(auth0UserId))
                return Unauthorized();

            var currentUser = await _userService.GetUserByAuth0IdAsync(auth0UserId);
            if (currentUser == null)
                return NotFound("User profile not found.");

            var result = await _addressService.GetMyAddressesAsync(currentUser.UserId);
            return Ok(result);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateAddress(CreateAddressRequest request)
        {
            if (request == null)
                return BadRequest("Address data is required.");

            int? userId = null;
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            if (currentUserRole == nameof(UserRole.Customer))
            {
                var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
                if (auth0UserId == null)
                {
                    return BadRequest();
                }
                var currentUser = await _userService.GetUserByAuth0IdAsync(auth0UserId);
                if (currentUser != null)
                    userId = currentUser.UserId;
            }

            var result = await _addressService.CreateAddressAsync(request, userId);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "AddressOwner")]
        public async Task<IActionResult> UpdateAddress(int id, UpdateAddressRequest request)
        {
            if (request == null)
                return BadRequest("Address data is required.");

            var result = await _addressService.UpdateAddressAsync(id, request);
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AddressOwner")]
        public async Task<IActionResult> DeleteAddress(int id)
        {
            var deleted = await _addressService.DeleteAddressAsync(id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
    }
}