using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DatingApp.API.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Net;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using DatingApp.API.Helpers;

namespace DatingApp.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            var cs = Configuration.GetConnectionString("DefaultConnection");
            services.AddDbContext<DataContext>(o => o.UseSqlite(cs));

            //in the middle of singleton and transient
            services.AddScoped<IAuthRepository, AuthRepository>();

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(opts => {
                    opts.TokenValidationParameters = new TokenValidationParameters
                     {
                         ValidateIssuerSigningKey = true,
                         IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(Configuration.GetSection("AppSettings:Token").Value)),
                         ValidateIssuer = false,
                         ValidateAudience = false
                     };
                });

            services.AddCors();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();  //no way to add cors header to this, cant handle it on angular front end (during dev)
            }
            else
            {
                app.UseExceptionHandler(builder => {
                    builder.Run(async context => {
                        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

                        var error = context.Features.Get<IExceptionHandlerFeature>();
                        if (error != null) 
                        {
                            context.Response.AddApplicationError(error.Error.Message); //below adds it to body, but we needed to added cors to response so client wouldnt get error, in addition to body (below) we ALSO displayed message in a header called "Application-Error"
                            await context.Response.WriteAsync(error.Error.Message);  //adds to body, but no cors headers applied to message were sending back so we need to write extension method above to display it in header (above)
                        }
                    });
                });
                //app.UseHsts();
            }

            //app.UseHttpsRedirection();
            app.UseCors(opts => opts.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
            app.UseAuthentication();
            app.UseMvc();
        }
    }
}
