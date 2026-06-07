using ECommerce.Model.Enum;

namespace ECommerce.Model.Dto.Request;

public class CreateOrderRequest
{
    public int UserId { get; set; }
    public int ShippingAddressId { get; set; }
    public decimal TotalAmount { get; set; }
    public PaymentMethod Payment { get; set; }
}
