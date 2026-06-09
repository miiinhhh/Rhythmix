using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Rhythmix.Application.Common.Models;
using Rhythmix.Application.Interactions.Commands;
using Rhythmix.Application.Interactions.Queries;

namespace Rhythmix.API.Controllers
{
    [Authorize] // Bắt buộc đăng nhập (JWT)
    [ApiController]
    [Route("api/[controller]")]
    public class InteractionsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public InteractionsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // Helper lấy UserId từ Claims của JWT Token
        private string CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;

        /// <summary>
        /// Bật/Tắt trạng thái yêu thích của một bài hát/video (Thêm nếu chưa có, Xóa nếu đã có)
        /// </summary>
        [HttpPost("favorite/{mediaItemId}")]
        public async Task<IActionResult> ToggleFavorite(Guid mediaItemId)
        {
            var message = await _mediator.Send(new ToggleFavoriteCommand(CurrentUserId, mediaItemId));
            return Ok(ApiResponse<object>.ToSuccess(new { Message = message }));
        }

        /// <summary>
        /// Ghi lại lịch sử khi người dùng ấn phát (play) một bài hát/video
        /// </summary>
        [HttpPost("play-history/{mediaItemId}")]
        public async Task<IActionResult> RecordPlay(Guid mediaItemId)
        {
            var success = await _mediator.Send(new RecordPlayHistoryCommand(CurrentUserId, mediaItemId));
            
            if (!success)
            {
                return BadRequest(ApiResponse<object>.ToFailure(new() { "Không thể ghi nhận lịch sử phát nhạc." }));
            }
            
            return Ok(ApiResponse<object>.ToSuccess(new { Message = "Lịch sử phát nhạc đã được lưu." }));
        }

        /// <summary>
        /// Lấy danh sách 10 bài hát/video được phát gần đây nhất
        /// </summary>
        [HttpGet("recent-history")]
        public async Task<IActionResult> GetRecentHistory()
        {
            var result = await _mediator.Send(new GetRecentPlayHistoryQuery(CurrentUserId));
            return Ok(ApiResponse<object>.ToSuccess(result));
        }
    }
}
