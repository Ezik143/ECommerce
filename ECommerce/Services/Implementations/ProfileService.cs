using ECommerce.Data;
using ECommerce.Model.Dto.Request;
using ECommerce.Model.Entity;
using ECommerce.Model.Enum;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace ECommerce.Services;

public class ProfileService : IProfileService
{
    private readonly ApplicationDbContext _context;

    public ProfileService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<object> GetCurrentUserAsync(string auth0UserId, string email, string name)
    {
        var user = await _context.User
            .FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId);

        return new
        {
            Auth0UserId = auth0UserId,
            Email = email,
            Name = name,
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
        };
    }

    public async Task<object> EnsureUserExistsAsync(string auth0UserId, string email, string name)
    {
        var existingUser = await _context.User.FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId);

        if (existingUser != null)
            return new { user = existingUser, isNew = false };

        var newUser = new User
        {
            Auth0Id = auth0UserId,
            Email = email,
            FullName = name,
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
                return new { user = existing, isNew = false };
            throw;
        }

        return new { user = newUser, isNew = true };
    }

    public async Task<object> UpdateProfileDetailsAsync(string auth0UserId, CompleteProfileRequest request)
    {
        var user = await _context.User.FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId)
            ?? throw new InvalidOperationException("User not found");

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

        return new { message = "Profile completed successfully", user.HasCompletedProfile };
    }

    public async Task<object> SetUserRoleAsync(string auth0UserId, string role)
    {
        var user = await _context.User.FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId)
            ?? throw new InvalidOperationException("User not found");

        if (user.HasChosenRole)
            throw new InvalidOperationException("Role has already been chosen");

        if (!Enum.TryParse<UserRole>(role, true, out var parsedRole))
            throw new InvalidOperationException("Invalid role. Use 'Customer' or 'Seller'");

        if (parsedRole != UserRole.Customer && parsedRole != UserRole.Seller)
            throw new InvalidOperationException("Only Customer or Seller roles are allowed");

        user.Role = parsedRole;
        user.HasChosenRole = true;
        await _context.SaveChangesAsync();

        return new { user.Role, user.HasChosenRole };
    }
}