using MediatR;
using Microsoft.AspNetCore.Mvc;
using Rhythmix.Application.UseCases.Genre;

namespace Rhythmix.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class GenresController : ControllerBase
{
    private readonly IMediator _mediator;

    public GenresController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetGenres()
    {
        var result = await _mediator.Send(new GetGenresQuery());
        return Ok(new { success = true, data = result });
    }
}
