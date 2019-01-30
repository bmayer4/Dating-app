namespace DatingApp.API.Helpers
{
    public class CloudinarySettings  //strongly typing our cloudinary settings (use startup class to connect them)
    {
        public string CloudName { get; set; }
        public string ApiKey { get; set; }
        public string ApiSecret { get; set; }
    }
}