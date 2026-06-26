using ECommerce.Authorization.Requirements;
using ECommerce.Data;
using ECommerce.Model.Enum;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ECommerce.Authorization.Handlers;

public class OrderAuthorizationHandler : AuthorizationHandler<OrderOwnerRequirement>
{
    private readonly ApplicationDbContext _context;

    public OrderAuthorizationHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        OrderOwnerRequirement requirement)
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

        // Admin, OrderManager, and CustomerSupport can access any order
        if (user.Role == UserRole.Admin
            || user.Role == UserRole.OrderManager
            || user.Role == UserRole.CustomerSupport)
        {
            context.Succeed(requirement);
            return;
        }

        // Get the order ID from route parameters
        var resource = context.Resource as AuthorizationFilterContext;
        var orderIdStr = resource?.RouteData?.Values?["id"]?.ToString();

        if (string.IsNullOrEmpty(orderIdStr))
        {
            return; // No order ID in route
        }

        if (!int.TryParse(orderIdStr, out var orderId))
        {
            return; // Invalid order ID
        }

        // Look up the order
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null)
        {
            return; // Order not found, let it fall through to 404
        }

        // Customer can only access their own orders
        if (user.Role == UserRole.Customer && order.UserId == user.UserId)
        {
            context.Succeed(requirement);
            return;
        }

        // Seller can only access orders that contain their products
        if (user.Role == UserRole.Seller)
        {
            var hasProductInOrder = await _context.OrderItems
                .AnyAsync(oi => oi.OrderId == orderId && _context.Products
                    .Any(p => p.ProductId == oi.ProductId && p.SellerId == user.UserId));

            if (hasProductInOrder)
            {
                context.Succeed(requirement);
                return;
            }
        }
    }
}