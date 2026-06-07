using AutoMapper;
using ECommerce.Data;
using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AddressResponse>>> GetAddresses()
        {
            var entities = await _context.Addresses.ToListAsync();
            var responseDtos = _mapper.Map<List<AddressResponse>>(entities);
            return Ok(responseDtos);
        }

        [HttpPost]
        public async Task<ActionResult<AddressResponse>> CreateAddress(CreateAddressRequest request)
        {
            if (request == null)
            {
                return BadRequest("Address data is required.");
            }

            var entity = _mapper.Map<Model.Entity.Address>(request);
            _context.Addresses.Add(entity);
            await _context.SaveChangesAsync();

            var responseDto = _mapper.Map<AddressResponse>(entity);
            return Ok(responseDto);
        }

        [HttpPut("{id}")]
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
