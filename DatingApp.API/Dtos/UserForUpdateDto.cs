namespace DatingApp.API.Dtos
{
    public class UserForUpdateDto  // not requiring these because they arent required when registering user, so can't be required only when editing profile after registering..
    {
        public string Introduction { get; set; }
        public string LookingFor { get; set; }
        public string Interests { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
    }
}