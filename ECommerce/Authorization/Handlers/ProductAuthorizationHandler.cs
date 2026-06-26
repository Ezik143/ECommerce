using ECommerce.Authorization.Requirements;
using ECommerce.Data;
using ECommerce.Model.Enum;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ECommerce.Authorization.Handlers;

public class ProductAuthorizationHandler : AuthorizationHandler<ProductOwnerRequirement>
{
    private readonly ApplicationDbContext _context;

    public ProductAuthorizationHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ProductOwnerRequirement requirement)
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

        // Admin can access any product
        if (user.Role == UserRole.Admin)
        {
            context.Succeed(requirement);
            return;
        }

        // Get the product ID from route parameters
        var resource = context.Resource as AuthorizationFilterContext;
        var productIdStr = resource?.RouteData?.Values?["id"]?.ToString();

        if (string.IsNullOrEmpty(productIdStr))
        {
            return; // No product ID in route
        }

        if (!int.TryParse(productIdStr, out var productId))
        {
            return; // Invalid product ID
        }

        // Look up the product
        var product = await _context.Products.FindAsync(productId);
        if (product == null)
        {
            return; // Product not found, let it fall through to 404
        }

        // Seller can only modify their own products
        if (user.Role == UserRole.Seller && product.SellerId == user.UserId)
        {
            context.Succeed(requirement);
            return;
        }
    }
}