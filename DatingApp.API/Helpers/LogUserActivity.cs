using System;
using System.Security.Claims;
using System.Threading.Tasks;
using DatingApp.API.Data;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace DatingApp.API.Helpers
{
    public class LogUserActivity : IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            // context is for doing something when action is being executed, next is after
            //resultContext will have access to http context for action being executed
            //ClaimsPrincipal User is part of class Controller (which controllers inhereit from), and part of HttpContext
            //GetService() returns null if a service does not exist, GetRequiredService() throws an exception instead
            var resultContext = await next();
            var userId = int.Parse(resultContext.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var repo = resultContext.HttpContext.RequestServices.GetService<IDatingRepository>();
            var user = await repo.GetUser(userId, false);  // does not matter if true or false
            if (user != null) {
                user.LastActive = DateTime.Now;
                await repo.SaveAll();
            }
        }
    }
}