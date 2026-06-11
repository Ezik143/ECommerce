using ECommerce.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ECommerce.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProfileController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            // 1. Extract the Auth0 User ID from the JWT token
            var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                              ?? User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(auth0UserId))
            {
                return Unauthorized("Invalid token: User ID not found.");
            }

            // 2. Look up this user in your local PostgreSQL database
            var localUser = await _context.User
                .FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId);

            // 3. Return the data including role
            return Ok(new
            {
                Auth0UserId = auth0UserId,
                Email = User.FindFirstValue(ClaimTypes.Email),
                Name = User.FindFirstValue(ClaimTypes.Name),
                LocalUserId = localUser?.UserId,
                LocalFullName = localUser?.FullName,
                Role = localUser?.Role.ToString() ?? "Customer",
                Message = "Successfully authenticated via Auth0!"
            });
        }
    }
}