using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc; 

namespace Rhythmix.API.DTOs;

public class UpdatePlaylistFormRequest
{
    [FromForm(Name = "name")]
    public string Name { get; set; } = string.Empty;

    [FromForm(Name = "description")]
    public string? Description { get; set; }

    [FromForm(Name = "coverImage")]
    public IFormFile? CoverImage { get; set; }
}