using Microsoft.AspNetCore.Identity;

namespace DatingApp.API.Models
{
    public class UserRole: IdentityUserRole<int>   //like a junction table
    {       
        public User User { get; set; }
        public Role Role { get; set; }
    }
}