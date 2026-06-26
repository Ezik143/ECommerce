using AutoMapper;
using ECommerce.Data;
using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;
using ECommerce.Model.Entity;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UserService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<UserResponse>> GetAllUsersAsync()
    {
        var entities = await _context.User.ToListAsync();
        return _mapper.Map<List<UserResponse>>(entities);
    }

    public async Task<UserResponse?> GetUserByIdAsync(int id)
    {
        var entity = await _context.User.FindAsync(id);
        if (entity == null)
            return null;
        return _mapper.Map<UserResponse>(entity);
    }

    public async Task<UserResponse> CreateUserAsync(CreateUserRequest request)
    {
        var entity = _mapper.Map<User>(request);
        _context.User.Add(entity);
        await _context.SaveChangesAsync();
        return _mapper.Map<UserResponse>(entity);
    }

    public async Task<UserResponse?> UpdateUserAsync(int id, UpdateUserRequest request)
    {
        var entity = await _context.User.FindAsync(id);
        if (entity == null)
            return null;

        _mapper.Map(request, entity);
        await _context.SaveChangesAsync();
        return _mapper.Map<UserResponse>(entity);
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        var entity = await _context.User.FindAsync(id);
        if (entity == null)
            return false;

        _context.User.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<User?> GetUserByAuth0IdAsync(string auth0UserId)
    {
        return await _context.User.FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId);
    }

    public async Task<int?> GetUserIdByAuth0IdAsync(string auth0UserId)
    {
        var user = await _context.User.FirstOrDefaultAsync(u => u.Auth0Id == auth0UserId);
        return user?.UserId;
    }
}