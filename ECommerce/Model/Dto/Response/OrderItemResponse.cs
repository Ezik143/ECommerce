using ECommerce.Model.Entity;

namespace ECommerce.Model.Dto.Response;

public class OrderItemResponse
{
    public int OrderItemId { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    public int Quantity { get; set; }
}
