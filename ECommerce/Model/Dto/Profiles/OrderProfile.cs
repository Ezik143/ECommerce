using AutoMapper;
using ECommerce.Model.Dto.Request;
using ECommerce.Model.Entity;
using ECommerce.Model.Enum;

namespace ECommerce.Model.Dto.Profiles
{
    public class OrderProfile : Profile
    {
        public OrderProfile()
        {
            CreateMap<CreateOrderRequest, Order>()
                .ForMember(dest => dest.Payment, opt => opt.MapFrom(src => System.Enum.Parse<PaymentMethod>(src.PaymentMethod)))
                .ForMember(dest => dest.PaymentStatus, opt => opt.MapFrom(src => OrderStatus.PendingPayment))
                .ForMember(dest => dest.OrderDate, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<UpdateOrderRequest, Order>()
                .ForMember(dest => dest.Payment, opt => opt.MapFrom(src => System.Enum.Parse<PaymentMethod>(src.PaymentMethod!)))
                .ForMember(dest => dest.PaymentStatus, opt => opt.MapFrom(src => System.Enum.Parse<OrderStatus>(src.Status!)))
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
