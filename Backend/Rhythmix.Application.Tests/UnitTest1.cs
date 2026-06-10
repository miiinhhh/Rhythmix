using System.Data;
using Rhythmix.Application.UseCases.Auth;
using Rhythmix.Application.UseCases.Auth.Handlers;
using Rhythmix.Domain.Entities;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.Tests;

public class LogoutCommandHandlerTests
{
    [Fact]
    public async Task Handle_ReturnsTrue_WhenUserExists()
    {
        var userId = Guid.NewGuid();
        var repository = new FakeUserRepository(new User
        {
            Id = userId,
            Email = "user@example.com",
            UserName = "user",
            PasswordHash = "hash",
            CreatedAt = DateTime.UtcNow
        });

        var handler = new LogoutCommandHandler(repository);

        var result = await handler.Handle(new LogoutCommand { UserId = userId }, CancellationToken.None);

        Assert.True(result);
    }

    [Fact]
    public async Task Handle_ReturnsFalse_WhenUserDoesNotExist()
    {
        var repository = new FakeUserRepository();
        var handler = new LogoutCommandHandler(repository);

        var result = await handler.Handle(new LogoutCommand { UserId = Guid.NewGuid() }, CancellationToken.None);

        Assert.False(result);
    }

    private sealed class FakeUserRepository : IUserRepository
    {
        private readonly Dictionary<Guid, User> _users = new();

        public FakeUserRepository(params User[] users)
        {
            foreach (var user in users)
            {
                _users[user.Id] = user;
            }
        }

        public Task<User?> GetByIdAsync(Guid id, IDbTransaction? transaction = null)
        {
            _users.TryGetValue(id, out var user);
            return Task.FromResult(user);
        }

        public Task<IEnumerable<User>> GetAllAsync(IDbTransaction? transaction = null) => Task.FromResult<IEnumerable<User>>(_users.Values.ToList());
        public Task<Guid> CreateAsync(User entity, IDbTransaction? transaction = null) => throw new NotSupportedException();
        public Task UpdateAsync(User entity, IDbTransaction? transaction = null) => throw new NotSupportedException();
        public Task DeleteAsync(Guid id, IDbTransaction? transaction = null) => throw new NotSupportedException();
        public Task<User?> GetByEmailAsync(string email, IDbTransaction? transaction = null) => throw new NotSupportedException();
        public Task<bool> ExistsByEmailAsync(string email, IDbTransaction? transaction = null) => throw new NotSupportedException();
    }
}
