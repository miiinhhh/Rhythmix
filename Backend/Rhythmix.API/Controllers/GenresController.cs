using Dapper;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Rhythmix.Application.Common.Interfaces;
using Rhythmix.Application.Common.Models;
using Rhythmix.Application.UseCases.Genre;

namespace Rhythmix.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class GenresController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IDbConnectionFactory _connectionFactory;

    public GenresController(IMediator mediator, IDbConnectionFactory connectionFactory)
    {
        _mediator = mediator;
        _connectionFactory = connectionFactory;
    }

    [HttpGet]
    public async Task<IActionResult> GetGenres()
    {
        var result = await _mediator.Send(new GetGenresQuery());
        return Ok(new { success = true, data = result });
    }

    [HttpPost]
    public async Task<IActionResult> CreateGenre([FromBody] CreateGenreRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(ApiResponse<object>.ToFailure("Genre name is required."));
        }

        var name = request.Name.Trim();
        using var connection = _connectionFactory.CreateConnection();

        var existing = await connection.QuerySingleOrDefaultAsync<GenreItem>(
            "SELECT GenreId, Name, Description, CreatedAt FROM Genres WHERE LOWER(Name) = LOWER(@Name)",
            new { Name = name });

        if (existing != null)
        {
            return Conflict(ApiResponse<object>.ToFailure("Genre name already exists."));
        }

        var genre = new GenreItem
        {
            GenreId = Guid.NewGuid(),
            Name = name,
            Description = request.Description?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        await connection.ExecuteAsync(
            "INSERT INTO Genres (GenreId, Name, Description, CreatedAt) VALUES (@GenreId, @Name, @Description, @CreatedAt)",
            genre);

        return Ok(ApiResponse<object>.ToSuccess(genre));
    }

    public sealed class CreateGenreRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    private sealed class GenreItem
    {
        public Guid GenreId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
