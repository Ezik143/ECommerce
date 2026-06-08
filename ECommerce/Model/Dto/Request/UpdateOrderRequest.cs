using ECommerce.Model.Enum;

namespace ECommerce.Model.Dto.Request;

public class UpdateOrderRequest
{
    public int UserId { get; set; }
    public int ShippingAddressId { get; set; }
    public decimal TotalAmount { get; set; }
    public PaymentMethod Payment { get; set; }
    public OrderStatus PaymentStatus { get; set; }
}
