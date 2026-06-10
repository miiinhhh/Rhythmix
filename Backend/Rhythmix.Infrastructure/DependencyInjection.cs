using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Rhythmix.Application.Common.Interfaces;
using Rhythmix.Application.Interfaces;
using Rhythmix.Domain.Interfaces;
using Rhythmix.Infrastructure.Dapper;
using Rhythmix.Infrastructure.Data;
using Rhythmix.Infrastructure.Services;

namespace Rhythmix.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection is not configured.");

        services.AddScoped<IUserRepository>(provider => new DapperUserRepository(connectionString));
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IDbConnectionFactory, DbConnectionFactory>();
        services.AddScoped<IDbConnection>(_ => new SqlConnection(connectionString));

        return services;
    }
}
