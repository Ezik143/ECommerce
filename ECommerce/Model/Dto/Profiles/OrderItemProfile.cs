using AutoMapper;
using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;
using ECommerce.Model.Entity;

namespace ECommerce.Model.Dto.Profiles
{
    public class OrderItemProfile : Profile
    {
        public OrderItemProfile()
        {
            CreateMap<OrderItem, OrderItemResponse>();
            CreateMap<CreateOrderItemRequest, OrderItem>();
            CreateMap<UpdateOrderItemRequest, OrderItem>();
        }
    }
}
