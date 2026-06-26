using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;

namespace ECommerce.Services;

public interface ICategoryService
{
    Task<IEnumerable<CategoryResponse>> GetAllCategoriesAsync(int? parentId = null);
    Task<CategoryResponse?> GetCategoryByIdAsync(int id);
    Task<IEnumerable<CategoryResponse>> GetCategoryTreeAsync();
    Task<IEnumerable<CategoryResponse>> GetChildrenAsync(int id);
    Task<IEnumerable<CategoryResponse>> GetAncestorsAsync(int id);
    Task<IEnumerable<ProductResponse>> GetProductsByCategoryAsync(int id, bool includeSubcategories = false);
    Task<CategoryResponse> CreateCategoryAsync(CreateCategoryRequest request);
    Task<CategoryResponse?> UpdateCategoryAsync(int id, UpdateCategoryRequest request);
    Task<bool> DeleteCategoryAsync(int id);
}