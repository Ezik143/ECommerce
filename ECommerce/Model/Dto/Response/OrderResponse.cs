using ECommerce.Model.Enum;

namespace ECommerce.Model.Dto.Response;

public class OrderResponse
{
    public int OrderId { get; set; }
    public int UserId { get; set; }
    public int ShippingAddressId { get; set; }
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; }
    public OrderStatus PaymentStatus { get; set; }
    public DateTime OrderDate { get; set; }
}
