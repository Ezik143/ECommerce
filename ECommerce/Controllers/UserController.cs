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
    [Authorize(Policy = "AdminOnly")]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public UserController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var entities = await _context.User.ToListAsync();
            var responseDtos = _mapper.Map<List<UserResponse>>(entities);
            return Ok(responseDtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var entity = await _context.User.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            var responseDto = _mapper.Map<UserResponse>(entity);
            return Ok(responseDto);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser(CreateUserRequest request)
        {
            if (request == null)
            {
                return BadRequest("User data is required.");
            }

            var entity = _mapper.Map<User>(request);
            _context.User.Add(entity);
            await _context.SaveChangesAsync();

            var responseDto = _mapper.Map<UserResponse>(entity);
            return Ok(responseDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserRequest request)
        {
            if (request == null)
            {
                return BadRequest("User data is required.");
            }

            var entity = await _context.User.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            _mapper.Map(request, entity);
            await _context.SaveChangesAsync();

            var responseDto = _mapper.Map<UserResponse>(entity);
            return Ok(responseDto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var entity = await _context.User.FindAsync(id);
            if (entity == null)
            {
                return NotFound();
            }

            _context.User.Remove(entity);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}