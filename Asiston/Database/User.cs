using Microsoft.AspNetCore.Identity;

namespace Asiston.Database
{
    public class User : IdentityUser
    {
        public string? Initials { get; set; }
    }
}
