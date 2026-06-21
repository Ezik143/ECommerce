using ECommerce.Model.Enum;

namespace ECommerce.Model.Entity;

public class User
{
    public int UserId { get; set; }
    public string? Auth0Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? MiddleName { get; set; }
    public string? LastName { get; set; }
    public string? PhoneNumber { get; set; }
    public UserRole Role { get; set; } = UserRole.Customer;
    public DateTime CreatedAt { get; set; }
    public bool HasChosenRole { get; set; } = false;
    public bool HasCompletedProfile { get; set; } = false;
}
