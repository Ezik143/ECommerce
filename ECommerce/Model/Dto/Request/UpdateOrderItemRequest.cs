namespace ECommerce.Model.Dto.Request;

public class UpdateOrderItemRequest
{
    public int OrderItemId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
