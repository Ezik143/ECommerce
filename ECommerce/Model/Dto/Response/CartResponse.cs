namespace ECommerce.Model.Dto.Response;

public class CartResponse
{
    public int CartId { get; set; }
    public int UserId { get; set; }
    public List<CartItemResponse> Items { get; set; } = new();
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
