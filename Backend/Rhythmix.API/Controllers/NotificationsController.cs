using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Rhythmix.Application.Common.Models;
using Rhythmix.Application.Notifications.Commands;
using Rhythmix.Application.Notifications.Queries;

namespace Rhythmix.API.Controllers
{
    [Authorize] // Bắt buộc đăng nhập (JWT) mới được gọi API
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public NotificationsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // Helper lấy UserId từ Claims của JWT Token
        private string CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;

        /// <summary>
        /// Lấy danh sách thông báo của người dùng hiện tại
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var result = await _mediator.Send(new GetNotificationsQuery(CurrentUserId));
            return Ok(ApiResponse<object>.ToSuccess(result));
        }

        /// <summary>
        /// Đánh dấu một thông báo là đã đọc
        /// </summary>
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var success = await _mediator.Send(new MarkNotificationAsReadCommand(id, CurrentUserId));
            
            if (!success)
            {
                return BadRequest(ApiResponse<object>.ToFailure(new List<string> { "Không tìm thấy thông báo hoặc bạn không có quyền." }));
            }
            
            return Ok(ApiResponse<object>.ToSuccess(new { Message = "Đã đánh dấu đọc thông báo thành công." }));
        }
    }
}
