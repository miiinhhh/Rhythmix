using MediatR;
using Rhythmix.Application.DTOs.Share;
using Rhythmix.Domain.Entities;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Share.Handlers;

public sealed class CreateShareCommandHandler : IRequestHandler<CreateShareCommand, ShareItemDto>
{
    private readonly IShareRepository _shareRepository;

    public CreateShareCommandHandler(IShareRepository shareRepository)
    {
        _shareRepository = shareRepository;
    }

    public async Task<ShareItemDto> Handle(CreateShareCommand request, CancellationToken cancellationToken)
    {
        // Validate receiver exists
        if (!await _shareRepository.ReceiverExistsAsync(request.ReceiverId))
        {
            throw new InvalidOperationException("Receiver does not exist.");
        }

        // Validate either MediaId or PlaylistId is provided
        if (request.MediaId == null && request.PlaylistId == null)
        {
            throw new InvalidOperationException("Either MediaId or PlaylistId must be provided.");
        }

        // Check for duplicate share
        if (await _shareRepository.ExistsDuplicateAsync(request.SenderId, request.ReceiverId, request.MediaId, request.PlaylistId))
        {
            throw new InvalidOperationException("You have already shared this item with this user.");
        }

        var share = new MediaShare
        {
            Id = Guid.NewGuid(),
            SenderId = request.SenderId,
            ReceiverId = request.ReceiverId,
            MediaId = request.MediaId,
            PlaylistId = request.PlaylistId,
            Message = request.Message,
            SharedAt = DateTime.UtcNow
        };

        await _shareRepository.CreateShareAsync(share);

        var createdShare = await _shareRepository.GetByIdAsync(share.Id) ?? share;

        return new ShareItemDto
        {
            Id = createdShare.Id,
            SenderId = createdShare.SenderId,
            SenderName = createdShare.SenderName,
            ReceiverId = createdShare.ReceiverId,
            ReceiverName = createdShare.ReceiverName,
            MediaId = createdShare.MediaId,
            MediaTitle = createdShare.MediaTitle,
            MediaType = createdShare.MediaType,
            PlaylistId = createdShare.PlaylistId,
            PlaylistName = createdShare.PlaylistName,
            Message = createdShare.Message,
            SharedAt = createdShare.SharedAt
        };
    }
}
