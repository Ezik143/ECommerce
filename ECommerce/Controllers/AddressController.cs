using AutoMapper;
using ECommerce.Data;
using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;
using ECommerce.Model.Enum;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ECommerce.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AddressController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public AddressController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet("MyAddresses")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<AddressResponse>>> GetMyAddresses()
        {
            var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(auth0UserId))
            {
                return Unauthorized();
            }

            var currentUser = _context.User.FirstOrDefault(u => u.Auth0Id == auth0UserId);
            if (currentUser == null)
            {
                return NotFound("User profile not found.");
            }
            var addresses = await _context.Addresses
                                              .Where(a => a.UserId == currentUser.UserId)
                                              .ToListAsync();

            var responseDtos = _mapper.Map<List<AddressResponse>>(addresses);
            return Ok(responseDtos);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<AddressResponse>> CreateAddress(CreateAddressRequest request)
        {
            if (request == null)
            {
                return BadRequest("Address data is required.");
            }

            var entity = _mapper.Map<Model.Entity.Address>(request);


            // Automatically assign the UserId for customers
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            if (currentUserRole == nameof(UserRole.Customer))
            {
                var auth0UserId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                  ?? User.FindFirstValue("sub");
                var currentUser = await _context.User.FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId);
                if (currentUser != null)
                {
                    entity.UserId = currentUser.UserId;
                }
            }

            _context.Addresses.Add(entity);
            await _context.SaveChangesAsync();

            var responseDto = _mapper.Map<AddressResponse>(entity);
            return Ok(responseDto);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "AddressOwner")]
        public async Task<IActionResult> UpdateAddress(int id, UpdateAddressRequest request)
        {
            if (request == null)
            {
                return BadRequest("Address data is required.");
            }

            var entity = await _context.Addresses.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            _mapper.Map(request, entity);
            await _context.SaveChangesAsync();

            var responseDto = _mapper.Map<AddressResponse>(entity);
            return Ok(responseDto);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AddressOwner")]
        public async Task<IActionResult> DeleteAddress(int id)
        {
            var entity = await _context.Addresses.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            _context.Addresses.Remove(entity);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}