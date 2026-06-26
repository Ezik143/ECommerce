using AutoMapper;
using ECommerce.Data;
using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;
using ECommerce.Model.Entity;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Services;

public class ProductService : IProductService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ProductService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ProductResponse>> GetAllProductsAsync(int? categoryId = null)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Seller)
            .AsQueryable();

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        var entities = await query.ToListAsync();
        return _mapper.Map<List<ProductResponse>>(entities);
    }

    public async Task<ProductResponse?> GetProductByIdAsync(int id)
    {
        var entity = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Seller)
            .FirstOrDefaultAsync(p => p.ProductId == id);

        if (entity == null)
            return null;

        return _mapper.Map<ProductResponse>(entity);
    }

    public async Task<ProductResponse> CreateProductAsync(CreateProductRequest request, int sellerId)
    {
        var entity = _mapper.Map<Product>(request);
        entity.SellerId = sellerId;

        await _context.Products.AddAsync(entity);
        await _context.SaveChangesAsync();

        return _mapper.Map<ProductResponse>(entity);
    }

    public async Task<ProductResponse?> UpdateProductAsync(int id, UpdateProductRequest request)
    {
        var entity = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Seller)
            .FirstOrDefaultAsync(p => p.ProductId == id);

        if (entity == null)
            return null;

        _mapper.Map(request, entity);
        await _context.SaveChangesAsync();

        return _mapper.Map<ProductResponse>(entity);
    }

    public async Task<bool> DeleteProductAsync(int id)
    {
        var entity = await _context.Products.FindAsync(id);
        if (entity == null)
            return false;

        _context.Products.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ProductExistsAsync(int id)
    {
        return await _context.Products.AnyAsync(p => p.ProductId == id);
    }

    public async Task<bool> IsProductOwnerAsync(int productId, int userId)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductId == productId);
        return product?.SellerId == userId;
    }
}