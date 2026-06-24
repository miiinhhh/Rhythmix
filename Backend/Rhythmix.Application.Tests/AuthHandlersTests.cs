using System.Data;
using System.ComponentModel.DataAnnotations;
using Rhythmix.Application.DTOs.Auth;
using Rhythmix.Application.Helpers;
using Rhythmix.Application.Interfaces;
using Rhythmix.Application.UseCases.Auth;
using Rhythmix.Application.UseCases.Auth.Handlers;
using Rhythmix.Domain.Entities;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.Tests;

public sealed class AuthHandlersTests
{
    [Fact]
    public async Task Register_CreatesUserAndReturnsAuthResponse_WhenEmailIsNew()
    {
        var repository = new FakeUserRepository();
        var tokenGenerator = new FakeJwtTokenGenerator();
        var handler = new RegisterCommandHandler(repository, tokenGenerator);

        var result = await handler.Handle(new RegisterCommand
        {
            Email = "newuser@gmail.com",
            UserName = "newuser",
            Password = "12345678",
            DisplayName = "New User",
            Bio = "Music lover",
            AvatarUrl = "/uploads/avatar.png"
        }, CancellationToken.None);

        var savedUser = await repository.GetByEmailAsync("newuser@gmail.com");

        Assert.NotNull(savedUser);
        Assert.Equal(result.Id, savedUser.Id);
        Assert.Equal("newuser@gmail.com", result.Email);
        Assert.Equal("newuser", result.UserName);
        Assert.Equal("New User", result.DisplayName);
        Assert.Equal("Music lover", result.Bio);
        Assert.Equal("/uploads/avatar.png", result.AvatarUrl);
        Assert.Equal($"test-token-{savedUser.Id}", result.Token);
        Assert.NotEqual("12345678", savedUser.PasswordHash);
        Assert.True(PasswordHasher.Verify("12345678", savedUser.PasswordHash));
    }

    [Fact]
    public async Task Register_ThrowsInvalidOperationException_WhenEmailAlreadyExists()
    {
        var repository = new FakeUserRepository(new User
        {
            Id = Guid.NewGuid(),
            Email = "taken@gmail.com",
            UserName = "taken",
            DisplayName = "Taken",
            PasswordHash = PasswordHasher.Hash("12345678"),
            CreatedAt = DateTime.UtcNow
        });
        var handler = new RegisterCommandHandler(repository, new FakeJwtTokenGenerator());

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(new RegisterCommand
        {
            Email = "taken@gmail.com",
            UserName = "another",
            Password = "12345678"
        }, CancellationToken.None));

        Assert.Equal("Email is already registered.", exception.Message);
        Assert.Single(await repository.GetAllAsync());
    }

    [Fact]
    public void RegisterRequest_IsInvalid_WhenEmailFormatIsInvalid()
    {
        var request = CreateValidRegisterRequest();
        request.Email = "not-an-email";

        var results = Validate(request);

        Assert.Contains(results, result => result.MemberNames.Contains(nameof(RegisterRequest.Email)));
    }

    [Fact]
    public void RegisterRequest_IsInvalid_WhenEmailIsNotGmail()
    {
        var request = CreateValidRegisterRequest();
        request.Email = "user@yahoo.com";

        var results = Validate(request);

        Assert.Contains(results, result => result.MemberNames.Contains(nameof(RegisterRequest.Email)));
    }

    [Fact]
    public void RegisterRequest_IsInvalid_WhenUserNameIsTooShort()
    {
        var request = CreateValidRegisterRequest();
        request.UserName = "abc";

        var results = Validate(request);

        Assert.Contains(results, result => result.MemberNames.Contains(nameof(RegisterRequest.UserName)));
    }

    [Fact]
    public void RegisterRequest_IsInvalid_WhenPasswordIsTooShort()
    {
        var request = CreateValidRegisterRequest();
        request.Password = "A1short";

        var results = Validate(request);

        Assert.Contains(results, result => result.MemberNames.Contains(nameof(RegisterRequest.Password)));
    }

    [Fact]
    public void RegisterRequest_IsInvalid_WhenPasswordIsTooLong()
    {
        var request = CreateValidRegisterRequest();
        request.Password = $"A1{new string('x', 63)}";

        var results = Validate(request);

        Assert.Contains(results, result => result.MemberNames.Contains(nameof(RegisterRequest.Password)));
    }

    [Theory]
    [InlineData("password1")]
    [InlineData("PASSWORD")]
    public void RegisterRequest_IsInvalid_WhenPasswordDoesNotContainUppercaseAndNumber(string password)
    {
        var request = CreateValidRegisterRequest();
        request.Password = password;

        var results = Validate(request);

        Assert.Contains(results, result => result.MemberNames.Contains(nameof(RegisterRequest.Password)));
    }

    [Fact]
    public void RegisterRequest_IsValid_WhenAllRegistrationRulesAreMet()
    {
        var results = Validate(CreateValidRegisterRequest());

        Assert.Empty(results);
    }

    [Fact]
    public async Task Login_ReturnsAuthResponse_WhenCredentialsAreValid()
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "user@example.com",
            UserName = "user",
            DisplayName = "User Name",
            Bio = "Bio",
            AvatarUrl = "/uploads/user.png",
            PasswordHash = PasswordHasher.Hash("correct-password"),
            CreatedAt = DateTime.UtcNow
        };
        var repository = new FakeUserRepository(user);
        var handler = new LoginQueryHandler(repository, new FakeJwtTokenGenerator());

        var result = await handler.Handle(new LoginQuery
        {
            Email = "user@example.com",
            Password = "correct-password"
        }, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(user.Id, result.Id);
        Assert.Equal(user.Email, result.Email);
        Assert.Equal(user.UserName, result.UserName);
        Assert.Equal(user.DisplayName, result.DisplayName);
        Assert.Equal(user.Bio, result.Bio);
        Assert.Equal(user.AvatarUrl, result.AvatarUrl);
        Assert.Equal($"test-token-{user.Id}", result.Token);
    }

    [Fact]
    public async Task Login_ReturnsNull_WhenEmailDoesNotExist()
    {
        var repository = new FakeUserRepository();
        var handler = new LoginQueryHandler(repository, new FakeJwtTokenGenerator());

        var result = await handler.Handle(new LoginQuery
        {
            Email = "missing@example.com",
            Password = "12345678"
        }, CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Login_ReturnsNull_WhenPasswordIsIncorrect()
    {
        var repository = new FakeUserRepository(new User
        {
            Id = Guid.NewGuid(),
            Email = "user@example.com",
            UserName = "user",
            DisplayName = "User",
            PasswordHash = PasswordHasher.Hash("correct-password"),
            CreatedAt = DateTime.UtcNow
        });
        var handler = new LoginQueryHandler(repository, new FakeJwtTokenGenerator());

        var result = await handler.Handle(new LoginQuery
        {
            Email = "user@example.com",
            Password = "wrong-password"
        }, CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public void LoginRequest_IsInvalid_WhenEmailFormatIsInvalid()
    {
        var request = CreateValidLoginRequest();
        request.Email = "invalid-email";

        var results = Validate(request);

        Assert.Contains(results, result => result.MemberNames.Contains(nameof(LoginRequest.Email)));
    }

    [Fact]
    public void LoginRequest_IsInvalid_WhenPasswordIsTooShort()
    {
        var request = CreateValidLoginRequest();
        request.Password = "12345";

        var results = Validate(request);

        Assert.Contains(results, result => result.MemberNames.Contains(nameof(LoginRequest.Password)));
    }

    [Fact]
    public void LoginRequest_IsValid_WhenEmailAndPasswordMeetValidationRules()
    {
        var results = Validate(CreateValidLoginRequest());

        Assert.Empty(results);
    }

    private sealed class FakeJwtTokenGenerator : IJwtTokenGenerator
    {
        public string GenerateToken(User user) => $"test-token-{user.Id}";
    }

    private static RegisterRequest CreateValidRegisterRequest()
    {
        return new RegisterRequest
        {
            Email = "user@gmail.com",
            UserName = "user",
            Password = "Password1"
        };
    }

    private static LoginRequest CreateValidLoginRequest()
    {
        return new LoginRequest
        {
            Email = "user@gmail.com",
            Password = "123456"
        };
    }

    private static List<ValidationResult> Validate(RegisterRequest request)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(request, new ValidationContext(request), results, validateAllProperties: true);
        return results;
    }

    private static List<ValidationResult> Validate(LoginRequest request)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(request, new ValidationContext(request), results, validateAllProperties: true);
        return results;
    }

    private sealed class FakeUserRepository : IUserRepository
    {
        private readonly Dictionary<Guid, User> _usersById = new();
        private readonly Dictionary<string, User> _usersByEmail = new(StringComparer.OrdinalIgnoreCase);

        public FakeUserRepository(params User[] users)
        {
            foreach (var user in users)
            {
                AddUser(user);
            }
        }

        public Task<User?> GetByIdAsync(Guid id, IDbTransaction? transaction = null)
        {
            _usersById.TryGetValue(id, out var user);
            return Task.FromResult(user);
        }

        public Task<IEnumerable<User>> GetAllAsync(IDbTransaction? transaction = null)
        {
            return Task.FromResult<IEnumerable<User>>(_usersById.Values.ToList());
        }

        public Task<Guid> CreateAsync(User entity, IDbTransaction? transaction = null)
        {
            AddUser(entity);
            return Task.FromResult(entity.Id);
        }

        public Task UpdateAsync(User entity, IDbTransaction? transaction = null)
        {
            AddUser(entity);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Guid id, IDbTransaction? transaction = null)
        {
            if (_usersById.Remove(id, out var user))
            {
                _usersByEmail.Remove(user.Email);
            }

            return Task.CompletedTask;
        }

        public Task<User?> GetByEmailAsync(string email, IDbTransaction? transaction = null)
        {
            _usersByEmail.TryGetValue(email, out var user);
            return Task.FromResult(user);
        }

        public Task<bool> ExistsByEmailAsync(string email, IDbTransaction? transaction = null)
        {
            return Task.FromResult(_usersByEmail.ContainsKey(email));
        }

        private void AddUser(User user)
        {
            _usersById[user.Id] = user;
            _usersByEmail[user.Email] = user;
        }
    }
}
