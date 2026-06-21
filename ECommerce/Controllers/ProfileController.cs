using ECommerce.Data;
using ECommerce.Model.Dto.Request;
using ECommerce.Model.Entity;
using ECommerce.Model.Enum;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
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
                FirstName = user?.FirstName,
                MiddleName = user?.MiddleName,
                LastName = user?.LastName,
                PhoneNumber = user?.PhoneNumber,
                Role = user?.Role.ToString() ?? "Customer",
                HasChosenRole = user?.HasChosenRole ?? false,
                HasCompletedProfile = user?.HasCompletedProfile ?? false,
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
                Role = UserRole.Customer,
                HasChosenRole = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Add(newUser);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is PostgresException pgEx && pgEx.SqlState == "23505")
            {
                var existing = await _context.User.FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId);
                if (existing != null)
                {
                    return Ok(new { user = existing, isNew = false });
                }
                throw;
            }

            return Ok(new { user = newUser, isNew = true });
        }

        [HttpPut("me/details")]
        public async Task<IActionResult> UpdateProfileDetails([FromBody] CompleteProfileRequest request)
        {
            var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(auth0UserId))
            {
                return Unauthorized("Auth0 ID not found");
            }

            var user = await _context.User.FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId);

            if (user == null)
            {
                return NotFound("User not found");
            }

            user.FirstName = request.FirstName;
            user.MiddleName = request.MiddleName;
            user.LastName = request.LastName;
            user.PhoneNumber = request.PhoneNumber;
            user.FullName = $"{request.FirstName} {request.MiddleName + " "}{request.LastName}".Trim();
            user.HasCompletedProfile = true;

            if (!string.IsNullOrEmpty(request.Street) ||
                !string.IsNullOrEmpty(request.City) ||
                !string.IsNullOrEmpty(request.State) ||
                !string.IsNullOrEmpty(request.PostalCode) ||
                !string.IsNullOrEmpty(request.Country))
            {
                var address = new Address
                {
                    UserId = user.UserId,
                    Street = request.Street ?? "",
                    City = request.City ?? "",
                    State = request.State ?? "",
                    PostalCode = request.PostalCode ?? "",
                    Country = request.Country ?? "",
                    IsDefault = true
                };
                _context.Add(address);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile completed successfully", user.HasCompletedProfile });
        }

        [HttpPut("me/role")]
        public async Task<IActionResult> SetMyRole([FromBody] SetRoleRequest request)
        {
            var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(auth0UserId))
            {
                return Unauthorized("Auth0 ID not found");
            }

            var user = await _context.User.FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId);

            if (user == null)
            {
                return NotFound("User not found");
            }

            if (user.HasChosenRole)
            {
                return BadRequest("Role has already been chosen");
            }

            if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
            {
                return BadRequest("Invalid role. Use 'Customer' or 'Seller'");
            }

            if (role != UserRole.Customer && role != UserRole.Seller)
            {
                return BadRequest("Only Customer or Seller roles are allowed");
            }

            user.Role = role;
            user.HasChosenRole = true;
            await _context.SaveChangesAsync();

            return Ok(new { user.Role, user.HasChosenRole });
        }
    }

    public record SetRoleRequest(string Role);
}