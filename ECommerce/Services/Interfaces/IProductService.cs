using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;

namespace ECommerce.Services;

public interface IProductService
{
    Task<IEnumerable<ProductResponse>> GetAllProductsAsync(int? categoryId = null);
    Task<ProductResponse?> GetProductByIdAsync(int id);
    Task<ProductResponse> CreateProductAsync(CreateProductRequest request, int sellerId);
    Task<ProductResponse?> UpdateProductAsync(int id, UpdateProductRequest request);
    Task<bool> DeleteProductAsync(int id);
    Task<bool> ProductExistsAsync(int id);
    Task<bool> IsProductOwnerAsync(int productId, int userId);
}