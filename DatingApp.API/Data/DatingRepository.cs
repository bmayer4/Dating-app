using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Data
{
    public class DatingRepository : IDatingRepository
    {
        private readonly DataContext _context;

        public DatingRepository(DataContext context)
        {
            _context = context;
        }
        public void Add<T>(T entity) where T : class
        {
            _context.Add(entity);  //adding in memory until we save to db, no async because were not querying or doing anything on db
        }

        public void Delete<T>(T entity) where T : class
        {
            _context.Remove(entity);
        }

        public async Task<User> GetUser(int id)
        {
           return await _context.Users.Include(u => u.Photos).FirstOrDefaultAsync(u => u.Id == id);
        }

         public async Task<PagedList<User>> GetUsers(UserParams userParams)
        {
            //var users = await _context.Users.Include(u => u.Photos).ToListAsync();  //toList executes statement, goes to database and gets users
            var users = _context.Users.Include(u => u.Photos).OrderByDescending(u => u.LastActive).AsQueryable();  //AsQueryable lets you use where clause on it (woould have been IIncludableQuery)
            users = users.Where(u => u.Id != userParams.UserId);
            users = users.Where(u => u.Gender == userParams.Gender);

            if (userParams.Likers)
            {
               var userLikers = await GetUserLikes(userParams.UserId, userParams.Likers);
               users = users.Where(u => userLikers.Contains(u.Id));
            }

             if (userParams.Likees)
            {
               var userLikees = await GetUserLikes(userParams.UserId, userParams.Likers);
               users = users.Where(u => userLikees.Contains(u.Id));
            }

            if (userParams.MinAge != 18 || userParams.MaxAge != 99)
            {
                var minDob = DateTime.Today.AddYears(-userParams.MaxAge - 1); //since a person is the same age for 364 days, we  use -1
                var maxDob = DateTime.Today.AddYears(-userParams.MinAge);

                users = users.Where(u => u.DateOfBirth >= minDob && u.DateOfBirth <= maxDob);
            }

            if (!string.IsNullOrEmpty(userParams.OrderBy))
            {
                switch (userParams.OrderBy)
                {
                    case "created":
                     users = users.OrderByDescending(u => u.Created);
                     break;
                     default: 
                     users = users.OrderByDescending(u => u.LastActive);
                     break;
                }
            }

            return await PagedList<User>.CreateAsync(users, userParams.PageNumber, userParams.PageSize);

            //microsoft says any is typically used in the predicate of a where clause
            ///could help w travel app date query
            //return _context.Users.Where(u => u.Photos.Any(p => p.Description.Contains("a")));
        }

        public async Task<Photo> GetPhoto(int userId, int id)
        {
            return await _context.Photos.FirstOrDefaultAsync(p => p.UserId == userId && p.Id == id);
        }

        public async Task<Photo> GetMainPhotoForUser(int userId)
        {
            return await _context.Photos.Where(p => p.UserId == userId && p.IsMain == true).FirstOrDefaultAsync();
        }

        public async Task<Like> GetLike(int userId, int recipientId)  //query same as above using Where
        {   //user would only being liking another person, so userid would always be likerid
            return await _context.Likes.FirstOrDefaultAsync(l => l.LikerId == userId && l.LikeeId == recipientId);
        }

        private async Task<IEnumerable<int>> GetUserLikes(int id, bool likers)
        {
            var user = await _context.Users.Include(u => u.Likers).Include(u => u.Likees).FirstOrDefaultAsync(u => u.Id == id);

            //return users who like me or users I've liked
            return likers ? user.Likers.Select(i => i.LikerId) : user.Likees.Select(i => i.LikeeId);
        }

        public async Task<bool> SaveAll()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<Message> GetMessage(int id)
        {
            return await _context.Messages.FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<PagedList<Message>> GetMessagesForUser(MessageParams messageParams)
        {
            var messages = _context.Messages.Include(m => m.Sender).ThenInclude(u => u.Photos)
            .Include(u => u.Recipient).ThenInclude(u => u.Photos)
            .AsQueryable();

            switch (messageParams.MessageContainer)
            {
                case "Inbox":
                    messages = messages.Where(m => m.RecipientId == messageParams.UserId && m.RecipientDeleted == false);
                    break;
                case "Outbox":
                    messages = messages.Where(m => m.SenderId == messageParams.UserId && m.SenderDeleted == false);
                    break;
                default: 
                    messages = messages.Where(m => m.RecipientId == messageParams.UserId && m.RecipientDeleted == false && m.IsRead == false);  // "Unread"
                    break;
            }

            messages = messages.OrderByDescending(m => m.MessageSent);

            return await PagedList<Message>.CreateAsync(messages, messageParams.PageNumber, messageParams.PageSize);

        }

        // returns convo between two users
        public async Task<IEnumerable<Message>> GetMessageThread(int userId, int recipientId)
        {  
            var messages = await _context.Messages.Include(m => m.Sender).ThenInclude(u => u.Photos)
            .Include(u => u.Recipient).ThenInclude(u => u.Photos)
            .Where(m => m.RecipientId == userId && m.RecipientDeleted == false && m.SenderId == recipientId || m.RecipientId == recipientId && m.SenderId == userId && m.SenderDeleted == false )
                   .OrderBy(m => m.MessageSent).ToListAsync();

            return messages;
        }
    }
}