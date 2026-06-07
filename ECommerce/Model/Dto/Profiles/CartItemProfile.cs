using AutoMapper;
using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;
using ECommerce.Model.Entity;

namespace ECommerce.Model.Dto.Profiles
{
    public class CartItemProfile : Profile
    {
        public CartItemProfile()
        {
            CreateMap<CartItem, CartItemResponse>();
            CreateMap<AddCartItemRequest, CartItem>();
            CreateMap<UpdateCartItemRequest, CartItem>();
        }
    }
}
