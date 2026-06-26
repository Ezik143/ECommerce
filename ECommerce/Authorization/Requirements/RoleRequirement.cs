using ECommerce.Model.Enum;
using Microsoft.AspNetCore.Authorization;

namespace ECommerce.Authorization.Requirements;

public class RoleRequirement : IAuthorizationRequirement
{
    public UserRole[] Roles { get; }

    public RoleRequirement(params UserRole[] roles)
    {
        Roles = roles;
    }
}