namespace ECommerce.Model.Dto.Request;

public class CreateOrderRequest
{
    public int ShippingAddressId { get; set; }
    public string PaymentMethod { get; set; } = "CreditCard";
}
