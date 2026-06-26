using AutoMapper;
using ECommerce.Data;
using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;
using ECommerce.Model.Entity;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Services;

public class CategoryService : ICategoryService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CategoryService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<CategoryResponse>> GetAllCategoriesAsync(int? parentId = null)
    {
        var query = _context.Categories.AsQueryable();

        if (parentId.HasValue)
            query = query.Where(c => c.ParentCategoryId == parentId.Value);
        else
            query = query.Where(c => c.ParentCategoryId == null);

        var entities = await query.OrderBy(c => c.SortOrder).ToListAsync();
        return _mapper.Map<List<CategoryResponse>>(entities);
    }

    public async Task<CategoryResponse?> GetCategoryByIdAsync(int id)
    {
        var entity = await _context.Categories.FindAsync(id);
        if (entity == null)
            return null;
        return _mapper.Map<CategoryResponse>(entity);
    }

    public async Task<IEnumerable<CategoryResponse>> GetCategoryTreeAsync()
    {
        var allCategories = await _context.Categories
            .OrderBy(c => c.SortOrder)
            .ToListAsync();

        var mapped = _mapper.Map<List<CategoryResponse>>(allCategories);
        var lookup = mapped.ToDictionary(c => c.CategoryId);
        var roots = new List<CategoryResponse>();

        foreach (var cat in mapped)
        {
            if (cat.ParentCategoryId.HasValue && lookup.TryGetValue(cat.ParentCategoryId.Value, out var parent))
                parent.Children.Add(cat);
            else
                roots.Add(cat);
        }

        return roots;
    }

    public async Task<IEnumerable<CategoryResponse>> GetChildrenAsync(int id)
    {
        var entities = await _context.Categories
            .Where(c => c.ParentCategoryId == id)
            .OrderBy(c => c.SortOrder)
            .ToListAsync();

        return _mapper.Map<List<CategoryResponse>>(entities);
    }

    public async Task<IEnumerable<CategoryResponse>> GetAncestorsAsync(int id)
    {
        var ancestors = new List<CategoryResponse>();
        var current = await _context.Categories.FindAsync(id);

        while (current?.ParentCategoryId != null)
        {
            current = await _context.Categories.FindAsync(current.ParentCategoryId.Value);
            if (current != null)
                ancestors.Insert(0, _mapper.Map<CategoryResponse>(current));
        }

        return ancestors;
    }

    public async Task<IEnumerable<ProductResponse>> GetProductsByCategoryAsync(int id, bool includeSubcategories = false)
    {
        List<int> categoryIds = new() { id };

        if (includeSubcategories)
        {
            var allCategories = await _context.Categories.ToListAsync();
            var childIds = GetDescendantIds(allCategories, id);
            categoryIds.AddRange(childIds);
        }

        var products = await _context.Products
            .Where(p => categoryIds.Contains(p.CategoryId))
            .ToListAsync();

        return _mapper.Map<List<ProductResponse>>(products);
    }

    public async Task<CategoryResponse> CreateCategoryAsync(CreateCategoryRequest request)
    {
        var entity = _mapper.Map<Category>(request);
        _context.Categories.Add(entity);
        await _context.SaveChangesAsync();
        return _mapper.Map<CategoryResponse>(entity);
    }

    public async Task<CategoryResponse?> UpdateCategoryAsync(int id, UpdateCategoryRequest request)
    {
        var entity = await _context.Categories.FindAsync(id);
        if (entity == null)
            return null;

        _mapper.Map(request, entity);
        await _context.SaveChangesAsync();
        return _mapper.Map<CategoryResponse>(entity);
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var entity = await _context.Categories.FindAsync(id);
        if (entity == null)
            return false;

        _context.Categories.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    private static List<int> GetDescendantIds(List<Category> allCategories, int parentId)
    {
        var ids = new List<int>();
        var children = allCategories.Where(c => c.ParentCategoryId == parentId).ToList();
        foreach (var child in children)
        {
            ids.Add(child.CategoryId);
            ids.AddRange(GetDescendantIds(allCategories, child.CategoryId));
        }
        return ids;
    }
}