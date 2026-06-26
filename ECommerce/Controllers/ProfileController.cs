using ECommerce.Model.Dto.Request;
using ECommerce.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ECommerce.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;

        public ProfileController(IProfileService profileService)
        {
            _profileService = profileService;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (string.IsNullOrEmpty(auth0UserId))
                return Unauthorized("Invalid token: User ID not found.");

            var email = User.FindFirstValue(ClaimTypes.Email) ?? "";
            var name = User.FindFirstValue(ClaimTypes.Name) ?? "";

            var result = await _profileService.GetCurrentUserAsync(auth0UserId, email, name);
            return Ok(result);
        }

        [HttpPost("Ensure")]
        public async Task<IActionResult> EnsureUserExist()
        {
            var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (string.IsNullOrEmpty(auth0UserId))
                return Unauthorized("Auth0 ID not found");

            var email = User.FindFirstValue(ClaimTypes.Email) ?? "";
            var name = User.FindFirstValue(ClaimTypes.Name) ?? "";

            var result = await _profileService.EnsureUserExistsAsync(auth0UserId, email, name);
            return Ok(result);
        }

        [HttpPut("me/details")]
        public async Task<IActionResult> UpdateProfileDetails([FromBody] CompleteProfileRequest request)
        {
            var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (string.IsNullOrEmpty(auth0UserId))
                return Unauthorized("Auth0 ID not found");

            try
            {
                var result = await _profileService.UpdateProfileDetailsAsync(auth0UserId, request);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPut("me/role")]
        public async Task<IActionResult> SetMyRole([FromBody] SetRoleRequest request)
        {
            var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (string.IsNullOrEmpty(auth0UserId))
                return Unauthorized("Auth0 ID not found");

            try
            {
                var result = await _profileService.SetUserRoleAsync(auth0UserId, request.Role);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }

    public record SetRoleRequest(string Role);
}