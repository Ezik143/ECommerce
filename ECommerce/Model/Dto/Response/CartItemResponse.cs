using ECommerce.Model.Entity;

namespace ECommerce.Model.Dto.Response;

public class CartItemResponse
{
    public int CartItemId { get; set; }
    public int CartId { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    public int Quantity { get; set; }
}
