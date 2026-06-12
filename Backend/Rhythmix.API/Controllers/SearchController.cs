using MediatR;
using Microsoft.AspNetCore.Mvc;
using Rhythmix.Application.DTOs.Search;
using Rhythmix.Application.UseCases.Search;

namespace Rhythmix.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class SearchController : ControllerBase
{
    private readonly IMediator _mediator;

    public SearchController(IMediator mediator)
    {
        _mediator = mediator;
    }

     /// <summary>
    /// Tìm kiếm bài hát và playlist theo từ khóa.
    /// </summary>
    /// <param name="query">
    /// Từ khóa tìm kiếm theo tên bài hát, tên playlist hoặc nghệ sĩ.
    /// </param>
    /// <param name="type">
    /// Loại tìm kiếm:
    /// 0 - Tất cả,
    /// 1 - Bài hát,
    /// 2 - Playlist.
    /// </param>
    /// <param name="page">
    /// Số trang cần lấy (mặc định: 1).
    /// </param>
    /// <param name="pageSize">
    /// Số lượng kết quả trên mỗi trang (mặc định: 10, tối đa: 100).
    /// </param>
    /// <returns>
    /// Danh sách kết quả tìm kiếm.
    /// </returns>
    [HttpGet]
    public async Task<IActionResult> Search(
        [FromQuery] string query = "",
        [FromQuery] SearchType type = SearchType.All,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);


        try
        {
            var searchQuery = new SearchQuery
            {
                QueryText = query,
                SearchType = type,
                Page = page,
                PageSize = pageSize
            };

            var result = await _mediator.Send(searchQuery);
            return Ok(new 
            { 
                success = true, 
                data = result 
            });
        }

        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}
