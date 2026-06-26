using System.ComponentModel.DataAnnotations;

namespace ECommerce.Model.Dto.Request;

public class CreateAddressRequest
{
    [Required(ErrorMessage = "Street is required")]
    public string Street { get; set; } = string.Empty;

    [Required(ErrorMessage = "City is required")]
    public string City { get; set; } = string.Empty;

    [Required(ErrorMessage = "State is required")]
    public string State { get; set; } = string.Empty;

    [Required(ErrorMessage = "Postal code is required")]
    public string PostalCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "Country is required")]
    public string Country { get; set; } = string.Empty;

    public bool IsDefault { get; set; }
}