using System.ComponentModel.DataAnnotations;

namespace ECommerce.Model.Dto.Request;

public class UpdateProductRequest
{
    [Required(ErrorMessage = "Category is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Please select a valid category")]
    public int CategoryId { get; set; }

    [Required(ErrorMessage = "Product name is required")]
    [StringLength(200, MinimumLength = 1, ErrorMessage = "Product name must be between 1 and 200 characters")]
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Price is required")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
    public decimal Price { get; set; }

    [Required(ErrorMessage = "Stock quantity is required")]
    [Range(0, int.MaxValue, ErrorMessage = "Stock quantity cannot be negative")]
    public int StockQuantity { get; set; }

    public string ImageUrl { get; set; } = string.Empty;
}