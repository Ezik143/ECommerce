namespace ECommerce.Model.Dto.Request;

public class CreateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int? ParentCategoryId { get; set; }
    public int SortOrder { get; set; }
}
