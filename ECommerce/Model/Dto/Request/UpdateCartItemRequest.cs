namespace ECommerce.Model.Dto.Request;

public class UpdateCartItemRequest
{
    public int CartItemId { get; set; }
    public int Quantity { get; set; }
}