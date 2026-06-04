using Rhythmix.Domain.Entities;

namespace Rhythmix.Application.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
