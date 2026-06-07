namespace ECommerce.Model.Entity;

public class Cart
{
    public int CartId { get; set; }
    public int UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
