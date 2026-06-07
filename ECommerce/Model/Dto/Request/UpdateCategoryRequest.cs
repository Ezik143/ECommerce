namespace ECommerce.Model.Dto.Request;

public class UpdateCategoryRequest
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}