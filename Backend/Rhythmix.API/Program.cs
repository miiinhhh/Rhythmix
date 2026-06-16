using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Rhythmix.Application;
using Rhythmix.Infrastructure;
using Rhythmix.Infrastructure.Hubs;
using Scalar.AspNetCore;

namespace Rhythmix.API;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddControllers();
        builder.Services.AddApplication();
        builder.Services.AddInfrastructure(builder.Configuration);
        builder.Services.AddSignalR();
        builder.Services.AddSwaggerGen();

        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.WithOrigins("http://localhost:5173")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        var jwtSettings = builder.Configuration.GetSection("JwtSettings");
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.GetValue<string>("Key")!));

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer          = true,
                    ValidateAudience        = true,
                    ValidateIssuerSigningKey  = true,
                    ValidIssuer             = jwtSettings.GetValue<string>("Issuer"),
                    ValidAudience           = jwtSettings.GetValue<string>("Audience"),
                    IssuerSigningKey        = signingKey,
                    ClockSkew               = TimeSpan.FromMinutes(1)
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hub"))
                        {
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            });

        builder.Services.AddAuthorization();

        // Bật OpenAPI + XML comment cho Swagger
        builder.Services.AddOpenApi(options =>
        {
            options.AddDocumentTransformer((document, context, ct) =>
            {
                document.Info.Title   = "Rhythmix API";
                document.Info.Version = "v1";
                document.Info.Description = "API cho hệ thống phát nhạc Rhythmix";
                return Task.CompletedTask;
            });
        });

        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
            app.MapOpenApi();                     // endpoint: /openapi/v1.json
            app.MapScalarApiReference(options => // UI tại: /scalar/v1
            {
                options.Title              = "Rhythmix API";
                options.DefaultHttpClient  = new(ScalarTarget.JavaScript, ScalarClient.Fetch);
            });
        }

        app.UseHttpsRedirection();
        app.UseStaticFiles();
        app.UseCors();
        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();
        app.MapHub<NotificationHub>("/hub/notifications");

        app.Run();
    }
}