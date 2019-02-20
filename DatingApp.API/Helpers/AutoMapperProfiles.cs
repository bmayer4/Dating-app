using System.Linq;
using AutoMapper;
using DatingApp.API.Dtos;
using DatingApp.API.Models;

namespace DatingApp.API.Helpers
{
    public class AutoMapperProfiles: Profile
    {
        public AutoMapperProfiles() 
        {
            CreateMap<User, UserForListDto>()  //source to dest
             .ForMember(dest => dest.PhotoUrl, opt => {
                    opt.MapFrom(src => src.Photos.FirstOrDefault(p => p.IsMain).Url);
                })
             .ForMember(dest => dest.Age, opt => {
                    opt.ResolveUsing(src => src.DateOfBirth.CalculateAge());
               });  
            CreateMap<User, UserForDetailDto>()
             .ForMember(dest => dest.PhotoUrl, opt => {
                    opt.MapFrom(src => src.Photos.FirstOrDefault(p => p.IsMain).Url);
                })
             .ForMember(dest => dest.Age, opt => {
                    opt.ResolveUsing(src => src.DateOfBirth.CalculateAge());
               });  
            CreateMap<Photo, PhotoForDetailDto>();
            CreateMap<UserForUpdateDto, User>();
            CreateMap<Photo, PhotoForReturnDto>();
            CreateMap<PhotoForCreationDto, Photo>();
            CreateMap<UserForRegisterDto, User>();
            CreateMap<MessageForCreationDto, Message>().ReverseMap();  //sending back message as MessageForCreationDto, it works fine for this app
            CreateMap<Message, MessageToReturnDto>()
             .ForMember(dest => dest.SenderPhotoUrl, opt => {
                    opt.MapFrom(src => src.Sender.Photos.FirstOrDefault(p => p.IsMain).Url);
                })
            .ForMember(dest => dest.RecipientPhotoUrl, opt => {
                    opt.MapFrom(src => src.Recipient.Photos.FirstOrDefault(p => p.IsMain).Url);
                });
        }
    }
}