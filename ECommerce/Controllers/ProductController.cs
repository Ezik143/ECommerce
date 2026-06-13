using AutoMapper;
using ECommerce.Data;
using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;
using ECommerce.Model.Entity;
using ECommerce.Model.Enum;
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

        public ProductController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllProducts()
        {
            var entities = await _context.Products.ToListAsync();
            var responseDtos = _mapper.Map<List<ProductResponse>>(entities);
            return Ok(responseDtos);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetProduct(int id)
        {
            var entity = await _context.Products.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            var responseDto = _mapper.Map<ProductResponse>(entity);
            return Ok(responseDto);
        }

        [HttpPost]
        [Authorize(Policy = "SellerOnly")]
        public async Task<IActionResult> CreateProduct(CreateProductRequest request)
        {
            if (request == null)
            {
                return BadRequest("Product data is required.");
            }

            var entity = _mapper.Map<Product>(request);

            // If the user is a Seller, automatically assign SellerId via Auth0 ID lookup
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            if (currentUserRole == nameof(UserRole.Seller))
            {
                var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
                var currentUser = auth0UserId != null
                    ? await _context.User.FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId)
                    : null;
                if (currentUser != null)
                {
                    entity.SellerId = currentUser.UserId;
                }
            }

            _context.Products.Add(entity);
            await _context.SaveChangesAsync();

            var responseDto = _mapper.Map<ProductResponse>(entity);
            return Ok(responseDto);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "ProductOwner")]
        public async Task<IActionResult> UpdateProduct(int id, UpdateProductRequest request)
        {
            if (request == null)
            {
                return BadRequest("Product data is required.");
            }

            var entity = await _context.Products.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            // Ownership check: Sellers can only update their own products
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            if (currentUserRole == nameof(UserRole.Seller))
            {
                var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
                var currentUser = auth0UserId != null
                    ? await _context.User.FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId)
                    : null;
                if (currentUser == null || entity.SellerId != currentUser.UserId)
                {
                    return Forbid();
                }
            }

            _mapper.Map(request, entity);
            await _context.SaveChangesAsync();

            var responseDto = _mapper.Map<ProductResponse>(entity);
            return Ok(responseDto);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "SellerOrAdmin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var entity = await _context.Products.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            _context.Products.Remove(entity);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}