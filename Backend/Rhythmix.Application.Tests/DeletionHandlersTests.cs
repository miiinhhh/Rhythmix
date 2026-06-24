using System.Data;
using Rhythmix.Application.UseCases.Album;
using Rhythmix.Application.UseCases.Media;
using Rhythmix.Application.UseCases.Media.Handlers;
using Rhythmix.Domain.Entities;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.Tests;

public sealed class DeletionHandlersTests
{
    [Fact]
    public async Task DeleteMedia_ReturnsFalse_WhenMediaDoesNotExist()
    {
        var repository = new FakeMediaRepository();
        var storage = new FakeFileStorage(() => repository.WasDeleted);
        var handler = new DeleteMediaCommandHandler(repository, storage);

        var result = await handler.Handle(new DeleteMediaCommand
        {
            MediaId = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        }, CancellationToken.None);

        Assert.False(result);
        Assert.False(repository.WasDeleted);
        Assert.Empty(storage.DeletedPaths);
    }

    [Fact]
    public async Task DeleteMedia_ReturnsFalse_WhenUserDoesNotOwnMedia()
    {
        var media = CreateMedia(Guid.NewGuid());
        var repository = new FakeMediaRepository(media);
        var storage = new FakeFileStorage(() => repository.WasDeleted);
        var handler = new DeleteMediaCommandHandler(repository, storage);

        var result = await handler.Handle(new DeleteMediaCommand
        {
            MediaId = media.MediaId,
            UserId = Guid.NewGuid()
        }, CancellationToken.None);

        Assert.False(result);
        Assert.False(repository.WasDeleted);
        Assert.Empty(storage.DeletedPaths);
    }

    [Fact]
    public async Task DeleteMedia_DeletesDatabaseRecordBeforeMediaFile_WhenUserOwnsMedia()
    {
        var ownerId = Guid.NewGuid();
        var media = CreateMedia(ownerId);
        var repository = new FakeMediaRepository(media);
        var storage = new FakeFileStorage(() => repository.WasDeleted);
        var handler = new DeleteMediaCommandHandler(repository, storage);

        var result = await handler.Handle(new DeleteMediaCommand
        {
            MediaId = media.MediaId,
            UserId = ownerId
        }, CancellationToken.None);

        Assert.True(result);
        Assert.True(repository.WasDeleted);
        Assert.Equal(media.MediaId, repository.DeletedMediaId);
        Assert.Equal(new[] { media.FilePath }, storage.DeletedPaths);
    }

    [Fact]
    public async Task DeleteAlbum_ReturnsFalse_WhenAlbumDoesNotExist()
    {
        var repository = new FakeAlbumRepository();
        var handler = new DeleteAlbumCommandHandler(repository);

        var result = await handler.Handle(new DeleteAlbumCommand
        {
            AlbumId = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        }, CancellationToken.None);

        Assert.False(result);
        Assert.False(repository.WasDeleted);
    }

    [Fact]
    public async Task DeleteAlbum_Throws_WhenUserDoesNotOwnAlbum()
    {
        var album = new Album { AlbumId = Guid.NewGuid(), OwnerId = Guid.NewGuid(), Title = "Private album" };
        var repository = new FakeAlbumRepository(album);
        var handler = new DeleteAlbumCommandHandler(repository);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(new DeleteAlbumCommand
        {
            AlbumId = album.AlbumId,
            UserId = Guid.NewGuid()
        }, CancellationToken.None));

        Assert.False(repository.WasDeleted);
    }

    [Fact]
    public async Task DeleteAlbum_DeletesAlbum_WhenUserOwnsAlbum()
    {
        var ownerId = Guid.NewGuid();
        var album = new Album { AlbumId = Guid.NewGuid(), OwnerId = ownerId, Title = "Owned album" };
        var repository = new FakeAlbumRepository(album);
        var handler = new DeleteAlbumCommandHandler(repository);

        var result = await handler.Handle(new DeleteAlbumCommand
        {
            AlbumId = album.AlbumId,
            UserId = ownerId
        }, CancellationToken.None);

        Assert.True(result);
        Assert.True(repository.WasDeleted);
        Assert.Equal(album.AlbumId, repository.DeletedAlbumId);
    }

    private static MediaItem CreateMedia(Guid ownerId) => new()
    {
        MediaId = Guid.NewGuid(),
        OwnerId = ownerId,
        Title = "Test track",
        FilePath = "/uploads/media/test.mp3"
    };

    private sealed class FakeMediaRepository(params MediaItem[] mediaItems) : IMediaRepository
    {
        private readonly Dictionary<Guid, MediaItem> _media = mediaItems.ToDictionary(item => item.MediaId);

        public bool WasDeleted { get; private set; }
        public Guid? DeletedMediaId { get; private set; }

        public Task<MediaItem?> GetByIdAsync(Guid mediaId, IDbTransaction? transaction = null) =>
            Task.FromResult(_media.GetValueOrDefault(mediaId));

        public Task DeleteAsync(Guid mediaId, IDbTransaction? transaction = null)
        {
            WasDeleted = true;
            DeletedMediaId = mediaId;
            _media.Remove(mediaId);
            return Task.CompletedTask;
        }

        public Task<IEnumerable<MediaItem>> GetByIdsAsync(IEnumerable<Guid> mediaIds, IDbTransaction? transaction = null) =>
            Task.FromResult<IEnumerable<MediaItem>>(_media.Values.Where(item => mediaIds.Contains(item.MediaId)).ToList());

        public Task<Guid> AddAsync(MediaItem media, IDbTransaction? transaction = null) => Task.FromResult(media.MediaId);
        public Task SetGenresAsync(Guid mediaId, IEnumerable<Guid> genreIds, IDbTransaction? transaction = null) => Task.CompletedTask;
        public Task UpdateAsync(MediaItem media, IDbTransaction? transaction = null) => Task.CompletedTask;
        public Task<bool> ExistsAsync(Guid mediaId, IDbTransaction? transaction = null) => Task.FromResult(_media.ContainsKey(mediaId));
        public Task<IEnumerable<MediaItem>> GetByOwnerIdAsync(Guid ownerId, int page = 1, int pageSize = 20, IDbTransaction? transaction = null) => Task.FromResult<IEnumerable<MediaItem>>(_media.Values.Where(item => item.OwnerId == ownerId).ToList());
        public Task<IEnumerable<MediaItem>> GetByAlbumIdAsync(Guid albumId, IDbTransaction? transaction = null) => Task.FromResult<IEnumerable<MediaItem>>(_media.Values.Where(item => item.AlbumId == albumId).ToList());
        public Task<IEnumerable<MediaItem>> GetRecentAsync(int page = 1, int pageSize = 20, IDbTransaction? transaction = null) => Task.FromResult<IEnumerable<MediaItem>>(_media.Values.ToList());
        public Task IncrementViewCountAsync(Guid mediaId, IDbTransaction? transaction = null) => Task.CompletedTask;
    }

    private sealed class FakeFileStorage(Func<bool> mediaWasDeleted) : IFileStorageService
    {
        public List<string> DeletedPaths { get; } = [];

        public Task<bool> DeleteFileAsync(string filePath)
        {
            if (!mediaWasDeleted())
            {
                throw new InvalidOperationException("File deletion must happen after database deletion.");
            }

            DeletedPaths.Add(filePath);
            return Task.FromResult(true);
        }

        public Task<string> SaveFileAsync(Stream fileStream, string fileName, string subDirectory = "media") => Task.FromResult(string.Empty);
        public Task<Stream?> GetFileStreamAsync(string filePath) => Task.FromResult<Stream?>(null);
        public string GetContentType(string fileName) => "application/octet-stream";
        public bool IsValidMediaFile(string fileName, string contentType, out string mediaType)
        {
            mediaType = "audio";
            return true;
        }
    }

    private sealed class FakeAlbumRepository(params Album[] albums) : IAlbumRepository
    {
        private readonly Dictionary<Guid, Album> _albums = albums.ToDictionary(album => album.AlbumId);

        public bool WasDeleted { get; private set; }
        public Guid? DeletedAlbumId { get; private set; }

        public Task<Album?> GetByIdAsync(Guid albumId, IDbTransaction? transaction = null) => Task.FromResult(_albums.GetValueOrDefault(albumId));
        public Task DeleteAsync(Guid albumId, IDbTransaction? transaction = null)
        {
            WasDeleted = true;
            DeletedAlbumId = albumId;
            _albums.Remove(albumId);
            return Task.CompletedTask;
        }

        public Task<IEnumerable<Album>> GetByOwnerIdAsync(Guid ownerId, IDbTransaction? transaction = null) => Task.FromResult<IEnumerable<Album>>(_albums.Values.Where(album => album.OwnerId == ownerId).ToList());
        public Task<IEnumerable<Album>> GetPublicAlbumsAsync(int page = 1, int pageSize = 20, IDbTransaction? transaction = null) => Task.FromResult<IEnumerable<Album>>(_albums.Values.ToList());
        public Task<Guid> CreateAsync(Album album, IDbTransaction? transaction = null) => Task.FromResult(album.AlbumId);
        public Task UpdateAsync(Album album, IDbTransaction? transaction = null) => Task.CompletedTask;
        public Task<bool> ExistsAsync(Guid albumId, IDbTransaction? transaction = null) => Task.FromResult(_albums.ContainsKey(albumId));
        public Task<int> GetTrackCountAsync(Guid albumId, IDbTransaction? transaction = null) => Task.FromResult(0);
    }
}
