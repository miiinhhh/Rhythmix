using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Rhythmix.Application.Common.Interfaces;
using Rhythmix.Application.Interfaces;
using Rhythmix.Domain.Interfaces;
using Rhythmix.Infrastructure.Dapper;
using Rhythmix.Infrastructure.Data;
using Rhythmix.Infrastructure.Hubs;
using Rhythmix.Infrastructure.Services;
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection is not configured.");

        services.AddScoped<IUserRepository>(provider => new DapperUserRepository(connectionString));
        services.AddScoped<IArtistRepository>(provider => new DapperArtistRepository(connectionString));
        services.AddScoped<IMediaRepository>(provider => new DapperMediaRepository(connectionString));
        services.AddScoped<IAlbumRepository>(provider => new DapperAlbumRepository(connectionString));
        services.AddScoped<IGenreRepository>(provider => new DapperGenreRepository(connectionString));
        services.AddScoped<IPlaylistRepository>(provider => new DapperPlaylistRepository(connectionString));
        services.AddScoped<IPlaylistTrackRepository>(provider => new DapperPlaylistTrackRepository(connectionString));
        services.AddScoped<ISearchRepository>(provider => new DapperSearchRepository(connectionString));
        services.AddScoped<IShareRepository>(provider => new DapperShareRepository(connectionString));
        services.AddScoped<IAlbumRepository>(provider => new DapperAlbumRepository(connectionString));
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IDbConnection>(_ => new SqlConnection(connectionString));
        services.AddScoped<IFileStorageService, FileStorageService>();

        // Đăng ký DbConnectionFactory để các Handler inject được IDbConnectionFactory
        services.AddScoped<IDbConnectionFactory, DbConnectionFactory>();

        // Đăng ký NotificationService để inject INotificationHub qua SignalR
        services.AddScoped<INotificationHub, NotificationService>();

        // Register OpenRouter recommendation service.
        var openRouterOptions = new OpenRouterOptions();
        configuration.GetSection("OpenRouter").Bind(openRouterOptions);
        services.AddSingleton(openRouterOptions);
        services.AddHttpClient<IOpenRouterRecommendationService, OpenRouterRecommendationService>(client =>
        {
            client.BaseAddress = new Uri("https://openrouter.ai/api/v1/");
        });

        return services;
    }
}
