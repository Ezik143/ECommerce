using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;

namespace ECommerce.Services;

public interface IAddressService
{
    Task<IEnumerable<AddressResponse>> GetMyAddressesAsync(int userId);
    Task<AddressResponse> CreateAddressAsync(CreateAddressRequest request, int? userId);
    Task<AddressResponse?> UpdateAddressAsync(int id, UpdateAddressRequest request);
    Task<bool> DeleteAddressAsync(int id);
}