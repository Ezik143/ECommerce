using ECommerce.Model.Dto.Request;
using ECommerce.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "AdminOnly")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [Authorize(Policy = "AdminOrCustomerSupport")]
        public async Task<IActionResult> GetAllUsers()
        {
            var result = await _userService.GetAllUsersAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = "AdminOrCustomerSupport")]
        public async Task<IActionResult> GetUser(int id)
        {
            var result = await _userService.GetUserByIdAsync(id);
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Policy = "AdminOrCustomerSupport")]
        public async Task<IActionResult> CreateUser(CreateUserRequest request)
        {
            if (request == null)
                return BadRequest("User data is required.");

            var result = await _userService.CreateUserAsync(request);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "AdminOrCustomerSupport")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserRequest request)
        {
            if (request == null)
                return BadRequest("User data is required.");

            var result = await _userService.UpdateUserAsync(id, request);
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var deleted = await _userService.DeleteUserAsync(id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
    }
}