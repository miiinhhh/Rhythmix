using MediatR;
using Rhythmix.Application.DTOs.Share;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Share.Handlers;

public sealed class GetSharedWithMeQueryHandler : IRequestHandler<GetSharedWithMeQuery, IEnumerable<ShareItemDto>>
{
    private readonly IShareRepository _shareRepository;

    public GetSharedWithMeQueryHandler(IShareRepository shareRepository)
    {
        _shareRepository = shareRepository;
    }

    public async Task<IEnumerable<ShareItemDto>> Handle(GetSharedWithMeQuery request, CancellationToken cancellationToken)
    {
        var shares = await _shareRepository.GetSharedWithMeAsync(request.UserId);

        var result = new List<ShareItemDto>();
        foreach (var share in shares)
        {
            result.Add(new ShareItemDto
            {
                Id = share.Id,
                SenderId = share.SenderId,
                SenderName = share.SenderName,
                ReceiverId = share.ReceiverId,
                ReceiverName = share.ReceiverName,
                MediaId = share.MediaId,
                MediaTitle = share.MediaTitle,
                MediaType = share.MediaType,
                PlaylistId = share.PlaylistId,
                PlaylistName = share.PlaylistName,
                Message = share.Message,
                SharedAt = share.SharedAt
            });
        }

        return result;
    }
}
