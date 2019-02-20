using System;
using DatingApp.API.Models;

namespace DatingApp.API.Dtos
{
    public class MessageToReturnDto
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public string SenderUsername { get; set; }  //automapper will see Sender and pick up Username from User Property (because SenderId relates to UserId)..(well turned out it didnt know for SenderPhotoUrl or RecipientPhotoUrl but did for Usernames of those)
        public string SenderPhotoUrl { get; set; }  //automapper will see Sender and pick up Username from User Property
        public int RecipientId { get; set; }
        public string RecipientUsername { get; set; }  //automapper will see Sender and pick up Username from User Property
        public string RecipientPhotoUrl { get; set; }  //automapper will see Sender and pick up Username from User Property
        public string Content { get; set; }
        public bool IsRead { get; set; }
        public DateTime? DateRead { get; set; }
        public DateTime MessageSent { get; set; }
    }
}