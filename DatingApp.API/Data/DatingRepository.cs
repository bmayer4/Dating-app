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

        // public async void SetMainPhoto(int userId, int id)  //my way
        // {
        //     var mainPhoto = await _context.Photos.Where(p => p.UserId == userId && p.IsMain == true).FirstOrDefaultAsync();
        //     if (mainPhoto  != null) {
        //         mainPhoto.IsMain = false;
        //     }

        //     var photoToSet = await _context.Photos.Where(p => p.UserId == userId && p.Id == id).FirstOrDefaultAsync();
        //     if (photoToSet != null) {
        //         photoToSet.IsMain = true;
        //     }
        // }

        public async Task<Photo> GetMainPhotoForUser(int userId)
        {
            return await _context.Photos.Where(p => p.UserId == userId && p.IsMain == true).FirstOrDefaultAsync();
        }

        public async Task<bool> SaveAll()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}