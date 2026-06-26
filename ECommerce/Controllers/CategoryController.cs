using ECommerce.Model.Dto.Request;
using ECommerce.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCategories([FromQuery] int? parentId)
        {
            var result = await _categoryService.GetAllCategoriesAsync(parentId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategory(int id)
        {
            var result = await _categoryService.GetCategoryByIdAsync(id);
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        [HttpGet("tree")]
        public async Task<IActionResult> GetCategoryTree()
        {
            var result = await _categoryService.GetCategoryTreeAsync();
            return Ok(result);
        }

        [HttpGet("{id}/children")]
        public async Task<IActionResult> GetChildren(int id)
        {
            var result = await _categoryService.GetChildrenAsync(id);
            return Ok(result);
        }

        [HttpGet("{id}/ancestors")]
        public async Task<IActionResult> GetAncestors(int id)
        {
            var result = await _categoryService.GetAncestorsAsync(id);
            return Ok(result);
        }

        [HttpGet("{id}/products")]
        public async Task<IActionResult> GetProductsByCategory(int id, [FromQuery] bool includeSubcategories = false)
        {
            var result = await _categoryService.GetProductsByCategoryAsync(id, includeSubcategories);
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> AddCategory(CreateCategoryRequest request)
        {
            if (request == null)
                return BadRequest("Category data is required.");

            var result = await _categoryService.CreateCategoryAsync(request);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateCategory(int id, UpdateCategoryRequest request)
        {
            if (request == null)
                return BadRequest("Category data is required.");

            var result = await _categoryService.UpdateCategoryAsync(id, request);
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var deleted = await _categoryService.DeleteCategoryAsync(id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
    }
}