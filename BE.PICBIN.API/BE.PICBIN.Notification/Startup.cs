using BE.PICBIN.Notification.Hubs;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BE.PICBIN.Notification
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
            //var appNameSpace = Configuration.GetSection("AppURL").Value;
            //var mainName = Configuration.GetSection("MainURL").Value;
            var appUrls = Configuration.GetSection("WebAppUrls").Value;
            List<string> urls = appUrls.Split(';').ToList();
            services.AddSignalR();
            services.AddCors(options => options.AddPolicy("ApiCorsPolicy", builder =>
            {
                builder.WithOrigins("https://www.picappv1.xyz")
                .AllowAnyHeader()
                .WithMethods("GET", "POST")
                .AllowCredentials();
                //builder.WithOrigins(appNameSpace).AllowAnyMethod().AllowAnyHeader().AllowCredentials();
                //builder.WithOrigins(mainName).AllowAnyMethod().AllowAnyHeader().AllowCredentials();
            }));

            services.AddControllers();
            services.AddSingleton<IConfiguration>(Configuration);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();

            app.UseCors("ApiCorsPolicy");

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<HubNotification>("/hubs/notification");
            });
        }
    }
}
