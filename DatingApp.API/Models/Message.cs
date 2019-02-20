using System;

namespace DatingApp.API.Models
{
    public class Message
    {
        public int Id { get; set; }
        public int SenderId { get; set; }   //user id
        public User Sender { get; set; }
        public int RecipientId { get; set; }   //user id
        public User Recipient { get; set; }
        public int MyProperty { get; set; }  //have to remove database to delete this
        public string Content { get; set; }
        public bool IsRead { get; set; }
        public DateTime? DateRead { get; set; }
        public DateTime MessageSent { get; set; }
        public bool SenderDeleted { get; set; }
        public bool RecipientDeleted { get; set; }
    }
}