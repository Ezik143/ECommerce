using ECommerce.Authorization.Requirements;
using ECommerce.Data;
using ECommerce.Model.Enum;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ECommerce.Authorization.Handlers;

public class RoleAuthorizationHandler : AuthorizationHandler<RoleRequirement>
{
    private readonly ApplicationDbContext _context;

    public RoleAuthorizationHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        RoleRequirement requirement)
    {
        // Get Auth0 user ID from claims
        var auth0UserId = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
                          ?? context.User.FindFirstValue("sub");

        if (string.IsNullOrEmpty(auth0UserId))
        {
            return; // Not authenticated properly
        }

        // Look up the local user
        var user = await _context.User.FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId);

        if (user == null)
        {
            return; // User not found in local DB
        }

        // Check if user's role is in the required roles
        if (requirement.Roles.Contains(user.Role))
        {
            context.Succeed(requirement);
        }
    }
}