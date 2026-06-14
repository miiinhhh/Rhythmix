// Rhythmix.Application/UseCases/Media/Handlers/DeleteMediaCommandHandler.cs
using MediatR;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.UseCases.Media.Handlers;

public sealed class DeleteMediaCommandHandler : IRequestHandler<DeleteMediaCommand, bool>
{
    private readonly IMediaRepository _mediaRepository;
    private readonly IFileStorageService _fileStorageService;

    public DeleteMediaCommandHandler(
        IMediaRepository mediaRepository,
        IFileStorageService fileStorageService)
    {
        _mediaRepository = mediaRepository;
        _fileStorageService = fileStorageService;
    }

    public async Task<bool> Handle(DeleteMediaCommand request, CancellationToken cancellationToken)
    {
        var media = await _mediaRepository.GetByIdAsync(request.MediaId);
        if (media == null || media.OwnerId != request.UserId)
        {
            return false;
        }

        // Delete file from disk
        await _fileStorageService.DeleteFileAsync(media.FilePath);

        // Delete from database
        await _mediaRepository.DeleteAsync(request.MediaId);

        return true;
    }
}