using AutoMapper;
using ECommerce.Data;
using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;
using ECommerce.Model.Entity;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Services;

public class AddressService : IAddressService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public AddressService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<AddressResponse>> GetMyAddressesAsync(int userId)
    {
        var addresses = await _context.Addresses
            .Where(a => a.UserId == userId)
            .ToListAsync();

        return _mapper.Map<List<AddressResponse>>(addresses);
    }

    public async Task<AddressResponse> CreateAddressAsync(CreateAddressRequest request, int? userId)
    {
        var entity = _mapper.Map<Address>(request);

        if (userId.HasValue)
            entity.UserId = userId.Value;

        _context.Addresses.Add(entity);
        await _context.SaveChangesAsync();

        return _mapper.Map<AddressResponse>(entity);
    }

    public async Task<AddressResponse?> UpdateAddressAsync(int id, UpdateAddressRequest request)
    {
        var entity = await _context.Addresses.FindAsync(id);
        if (entity == null)
            return null;

        _mapper.Map(request, entity);
        await _context.SaveChangesAsync();

        return _mapper.Map<AddressResponse>(entity);
    }

    public async Task<bool> DeleteAddressAsync(int id)
    {
        var entity = await _context.Addresses.FindAsync(id);
        if (entity == null)
            return false;

        _context.Addresses.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }
}