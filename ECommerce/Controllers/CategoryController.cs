using AutoMapper;
using ECommerce.Data;
using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;
using ECommerce.Model.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public CategoryController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCategories([FromQuery] int? parentId)
        {
            var query = _context.Categories.AsQueryable();

            if (parentId.HasValue)
                query = query.Where(c => c.ParentCategoryId == parentId.Value);
            else
                query = query.Where(c => c.ParentCategoryId == null);

            var entities = await query.OrderBy(c => c.SortOrder).ToListAsync();
            var responseDtos = _mapper.Map<List<CategoryResponse>>(entities);
            return Ok(responseDtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategory(int id)
        {
            var entity = await _context.Categories.FindAsync(id);
            if (entity == null)
                return NotFound();

            var responseDto = _mapper.Map<CategoryResponse>(entity);
            return Ok(responseDto);
        }

        [HttpGet("tree")]
        public async Task<IActionResult> GetCategoryTree()
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

            return Ok(roots);
        }

        [HttpGet("{id}/children")]
        public async Task<IActionResult> GetChildren(int id)
        {
            var entities = await _context.Categories
                .Where(c => c.ParentCategoryId == id)
                .OrderBy(c => c.SortOrder)
                .ToListAsync();

            var responseDtos = _mapper.Map<List<CategoryResponse>>(entities);
            return Ok(responseDtos);
        }

        [HttpGet("{id}/ancestors")]
        public async Task<IActionResult> GetAncestors(int id)
        {
            var ancestors = new List<CategoryResponse>();
            var current = await _context.Categories.FindAsync(id);
            if (current == null)
                return NotFound();

            while (current?.ParentCategoryId != null)
            {
                current = await _context.Categories.FindAsync(current.ParentCategoryId.Value);
                if (current != null)
                    ancestors.Insert(0, _mapper.Map<CategoryResponse>(current));
            }

            return Ok(ancestors);
        }

        [HttpGet("{id}/products")]
        public async Task<IActionResult> GetProductsByCategory(int id, [FromQuery] bool includeSubcategories = false)
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

            var responseDtos = _mapper.Map<List<ProductResponse>>(products);
            return Ok(responseDtos);
        }

        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> AddCategory(CreateCategoryRequest request)
        {
            if (request == null)
                return BadRequest("Category data is required.");

            var entity = _mapper.Map<Category>(request);
            _context.Categories.Add(entity);
            await _context.SaveChangesAsync();

            var responseDto = _mapper.Map<CategoryResponse>(entity);
            return Ok(responseDto);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateCategory(int id, UpdateCategoryRequest request)
        {
            if (request == null)
                return BadRequest("Category data is required.");

            var entity = await _context.Categories.FindAsync(id);
            if (entity == null)
                return NotFound();

            _mapper.Map(request, entity);
            await _context.SaveChangesAsync();

            var responseDto = _mapper.Map<CategoryResponse>(entity);
            return Ok(responseDto);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var entity = await _context.Categories.FindAsync(id);
            if (entity == null)
                return NotFound();

            _context.Categories.Remove(entity);
            await _context.SaveChangesAsync();
            return NoContent();
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
}
