using AutoMapper;
using ECommerce.Model.Dto.Request;
using ECommerce.Model.Dto.Response;
using ECommerce.Model.Entity;
using ECommerce.Model.Enum;

namespace ECommerce.Model.Dto.Profiles
{
    public class OrderProfile : Profile
    {
        public OrderProfile()
        {
            CreateMap<Order, OrderResponse>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.PaymentStatus));

            CreateMap<CreateOrderRequest, Order>()
                .ForMember(dest => dest.PaymentStatus, opt => opt.MapFrom(src => OrderStatus.PendingPayment))
                .ForMember(dest => dest.OrderDate, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<UpdateOrderRequest, Order>();
        }
    }
}
