using MediatR;
using Rhythmix.Application.DTOs.Share;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Share.Handlers;

public sealed class GetSharedByMeQueryHandler : IRequestHandler<GetSharedByMeQuery, IEnumerable<ShareItemDto>>
{
    private readonly IShareRepository _shareRepository;
    private readonly IUserRepository _userRepository;

    public GetSharedByMeQueryHandler(IShareRepository shareRepository, IUserRepository userRepository)
    {
        _shareRepository = shareRepository;
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<ShareItemDto>> Handle(GetSharedByMeQuery request, CancellationToken cancellationToken)
    {
        var shares = await _shareRepository.GetSharedByMeAsync(request.UserId);

        var result = new List<ShareItemDto>();
        foreach (var share in shares)
        {
            var receiver = await _userRepository.GetByIdAsync(share.ReceiverId);

            result.Add(new ShareItemDto
            {
                Id = share.Id,
                SenderId = share.SenderId,
                ReceiverId = share.ReceiverId,
                SenderName = receiver?.DisplayName ?? receiver?.UserName ?? "Unknown",
                MediaId = share.MediaId,
                PlaylistId = share.PlaylistId,
                Message = share.Message,
                SharedAt = share.SharedAt,
            });
        }

        return result;
    }
}
