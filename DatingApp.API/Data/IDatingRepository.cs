using System.Collections.Generic;
using System.Threading.Tasks;
using DatingApp.API.Helpers;
using DatingApp.API.Models;

namespace DatingApp.API.Data
{
    public interface IDatingRepository
    {
        void Add<T>(T entity) where T: class;
        void Delete<T>(T entity) where T: class;
        Task<bool> SaveAll();
        Task<PagedList<User>> GetUsers(UserParams userParams);
        Task<User> GetUser(int id, bool includeUnapprovedPhotos);
        Task<Photo> GetPhoto(int userId, int id);
        Task<Photo> GetPhotoForAdmin(int id);
        Task<Photo> GetMainPhotoForUser(int userId);
        Task<IEnumerable<Photo>> GetPhotosForApproval();
        Task<Like> GetLike(int userId, int recipientId);
        Task<Message> GetMessage(int id);  // only for using in createdatroute after creating message
        Task<PagedList<Message>> GetMessagesForUser(MessageParams messageParams);
        Task<IEnumerable<Message>> GetMessageThread(int userId, int recipientId);


    }
}