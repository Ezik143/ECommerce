using AutoMapper;
using ECommerce.Data;
using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;
using ECommerce.Model.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ECommerce.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<ProductController> _logger;

        public ProductController(ApplicationDbContext context, IMapper mapper, ILogger<ProductController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllProducts([FromQuery] int? categoryId)
        {
            try
            {
                var query = _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.Seller)
                    .AsQueryable();

                if (categoryId.HasValue)
                    query = query.Where(p => p.CategoryId == categoryId.Value);

                var entities = await query.ToListAsync();

                var dto = _mapper.Map<List<ProductResponse>>(entities);

                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching products");
                return StatusCode(500, new { message = "Failed to load products" });
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetProduct(int id)
        {
            try
            {
                var entity = await _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.Seller)
                    .FirstOrDefaultAsync(p => p.ProductId == id);

                if (entity == null)
                    return NotFound();

                var dto = _mapper.Map<ProductResponse>(entity);

                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching product {ProductId}", id);
                return StatusCode(500, new { message = "Failed to load product" });
            }
        }

        [HttpPost]
        [Authorize(Policy = "SellerOnly")]
        public async Task<IActionResult> CreateProduct(CreateProductRequest request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { message = "Product data is required." });

                var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
                var currentUser = auth0UserId != null
                    ? await _context.User.FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId)
                    : null;
                if (currentUser == null)
                    return Unauthorized(new { message = "Seller account not found." });

                var entity = _mapper.Map<Product>(request);
                entity.SellerId = currentUser.UserId;

                await _context.Products.AddAsync(entity);
                await _context.SaveChangesAsync();

                var dto = _mapper.Map<ProductResponse>(entity);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product");
                return StatusCode(500, new { message = ex.InnerException?.Message ?? ex.Message });
            }
        }



        [HttpPut("{id}")]
        [Authorize(Policy = "ProductOwner")]
        public async Task<IActionResult> UpdateProduct(int id, UpdateProductRequest request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { message = "Product data is required." });

                var entity = await _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.Seller)
                    .FirstOrDefaultAsync(p => p.ProductId == id);

                if (entity == null)
                    return NotFound();

                _mapper.Map(request, entity);
                await _context.SaveChangesAsync();

                var dto = _mapper.Map<ProductResponse>(entity);
                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product {ProductId}", id);
                return StatusCode(500, new { message = ex.InnerException?.Message ?? ex.Message });
            }
        }



        [HttpDelete("{id}")]
        [Authorize(Policy = "SellerOrAdmin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var entity = await _context.Products.FindAsync(id);
                if (entity == null)
                    return NotFound();

                _context.Products.Remove(entity);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting product {ProductId}", id);
                return StatusCode(500, new { message = "Failed to delete product" });
            }
        }
    }
}
