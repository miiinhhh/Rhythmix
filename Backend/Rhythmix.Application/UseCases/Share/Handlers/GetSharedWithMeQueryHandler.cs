using MediatR;
using Rhythmix.Application.DTOs.Share;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Share.Handlers;

public sealed class GetSharedWithMeQueryHandler : IRequestHandler<GetSharedWithMeQuery, IEnumerable<ShareItemDto>>
{
    private readonly IShareRepository _shareRepository;
    private readonly IUserRepository _userRepository;

    public GetSharedWithMeQueryHandler(IShareRepository shareRepository, IUserRepository userRepository)
    {
        _shareRepository = shareRepository;
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<ShareItemDto>> Handle(GetSharedWithMeQuery request, CancellationToken cancellationToken)
    {
        var shares = await _shareRepository.GetSharedWithMeAsync(request.UserId);

        var result = new List<ShareItemDto>();
        foreach (var share in shares)
        {
            var sender = await _userRepository.GetByIdAsync(share.SenderId);

            result.Add(new ShareItemDto
            {
                Id = share.Id,
                SenderId = share.SenderId,
                SenderName = sender?.DisplayName ?? sender?.UserName ?? "Unknown",
                ReceiverId = share.ReceiverId,
                MediaId = share.MediaId,
                PlaylistId = share.PlaylistId,
                Message = share.Message,
                SharedAt = share.SharedAt
            });
        }

        return result;
    }
}
