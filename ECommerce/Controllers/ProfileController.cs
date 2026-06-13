using ECommerce.Data;
using ECommerce.Model.Entity;
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

            // 2. Look up user in local database
            var user = await _context.User
                .FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId);

            return Ok(new
            {
                Auth0UserId = auth0UserId,
                Email = User.FindFirstValue(ClaimTypes.Email),
                Name = User.FindFirstValue(ClaimTypes.Name),
                LocalUserId = user?.UserId,
                LocalFullName = user?.FullName,
                Role = user?.Role.ToString() ?? "Customer",
                Message = "Successfully authenticated via Auth0!"
            });
        }



        // TODO: Auth0 Post-Login Action Setup
        // Once frontend is ready, configure this in Auth0 Dashboard:
        // 1. Go to Auth0 Dashboard → Actions → Flows → Login
        // 2. Add a new Post-Login Action with this JavaScript:
        //
        //    exports.onExecutePostLogin = async (event, api) => {
        //        const apiUrl = "https://your-api-domain.com/api/Profile/ensure";
        //        try {
        //            const response = await fetch(apiUrl, {
        //                method: 'POST',
        //                headers: {
        //                    'Content-Type': 'application/json',
        //                    'Authorization': `Bearer ${event.authorization?.access_token}`
        //                }
        //            });
        //            if (!response.ok) {
        //                console.error('Failed to ensure user:', await response.text());
        //            }
        //        } catch (error) {
        //            console.error('Auth0 Action error:', error.message);
        //        }
        //    };
        //
        [HttpPost("Ensure")]
        public async Task<IActionResult> EnsureUserExist()
        {
            var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(auth0UserId))
            {
                return Unauthorized("Auth0 ID not found");
            }

            var existingUser = await _context.User.FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId);

            if (existingUser != null)
            {
                return Ok(new { user = existingUser, isNew = false });
            }

            var email = User.FindFirstValue(ClaimTypes.Email) ?? "";
            var fullName = User.FindFirstValue(ClaimTypes.Name) ?? "";


            var newUser = new User
            {
                Auth0Id = auth0UserId,
                Email = email,
                FullName = fullName,
                Role = Model.Enum.UserRole.Customer,
                CreatedAt = DateTime.UtcNow
            };

            _context.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}