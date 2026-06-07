using ECommerce.Model.Enum;

namespace ECommerce.Model.Entity;

public class Order
{
    public int OrderId { get; set; }
    public int UserId { get; set; }
    public int ShippingAddressId { get; set; }
    public decimal TotalAmount { get; set; }
    public PaymentMethod Payment { get; set; }
    public OrderStatus PaymentStatus { get; set; }
    public DateTime OrderDate { get; set; }
}
