namespace DatingApp.API.Models
{
    public class Like
    {
        public int LikerId { get; set; }  //user id
        public int LikeeId { get; set; }  //user id
        public User Liker { get; set; }
        public User Likee { get; set; }
    }
}