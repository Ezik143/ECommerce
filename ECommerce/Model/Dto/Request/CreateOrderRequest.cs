namespace ECommerce.Model.Dto.Request;

public class CreateOrderRequest
{
    public int UserId { get; set; }
    public int ShippingAddressId { get; set; }
    public decimal TotalAmount { get; set; }
}