using ECommerce.Authorization.Requirements;
using ECommerce.Data;
using ECommerce.Model.Enum;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ECommerce.Authorization.Handlers;

public class AddressAuthorizationHandler : AuthorizationHandler<AddressOwnerRequirement>
{
    private readonly ApplicationDbContext _context;

    public AddressAuthorizationHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        AddressOwnerRequirement requirement)
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

        // Admin and CustomerSupport can access any address
        if (user.Role == UserRole.Admin || user.Role == UserRole.CustomerSupport)
        {
            context.Succeed(requirement);
            return;
        }

        // Get the address ID from route parameters
        var resource = context.Resource as AuthorizationFilterContext;
        var addressId = resource?.RouteData?.Values?["id"]?.ToString();

        if (string.IsNullOrEmpty(addressId))
        {
            return; // No address ID in route
        }

        if (!int.TryParse(addressId, out var id))
        {
            return; // Invalid address ID
        }

        // Look up the address
        var address = await _context.Addresses.FindAsync(id);
        if (address == null)
        {
            return; // Address not found, let it fall through to 404
        }

        // Customer can only access their own addresses
        if (user.Role == UserRole.Customer && address.UserId == user.UserId)
        {
            context.Succeed(requirement);
            return;
        }

        // Other roles (e.g., OrderManager) can view addresses but not modify
        // This is handled at the controller/policy level
    }
}