using System.Data;
using Rhythmix.Application.UseCases.Playlist;
using Rhythmix.Application.UseCases.Playlist.Handlers;
using Rhythmix.Domain.Entities;
using Rhythmix.Domain.Interfaces;

namespace Rhythmix.Application.Tests;

public sealed class PlaylistHandlersTests
{
    [Fact]
    public async Task AddTrack_Throws_WhenPlaylistDoesNotExist()
    {
        var tracks = new FakePlaylistTrackRepository();
        var handler = CreateHandler(null, null, tracks);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(CreateCommand(), CancellationToken.None));

        Assert.Equal("Playlist not found", exception.Message);
        Assert.False(tracks.WasAdded);
    }

    [Fact]
    public async Task AddTrack_Throws_WhenUserDoesNotOwnPlaylist()
    {
        var playlist = CreatePlaylist(Guid.NewGuid());
        var tracks = new FakePlaylistTrackRepository();
        var handler = CreateHandler(playlist, CreateMedia(), tracks);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.Handle(CreateCommand(playlist.Id, Guid.NewGuid()), CancellationToken.None));

        Assert.False(tracks.WasAdded);
    }

    [Fact]
    public async Task AddTrack_Throws_WhenMediaDoesNotExist_WithoutAddingTrack()
    {
        var ownerId = Guid.NewGuid();
        var playlist = CreatePlaylist(ownerId);
        var tracks = new FakePlaylistTrackRepository();
        var handler = CreateHandler(playlist, null, tracks);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(CreateCommand(playlist.Id, ownerId), CancellationToken.None));

        Assert.Equal("Media not found", exception.Message);
        Assert.False(tracks.WasAdded);
    }

    [Fact]
    public async Task AddTrack_Throws_WhenTrackAlreadyExists()
    {
        var ownerId = Guid.NewGuid();
        var playlist = CreatePlaylist(ownerId);
        var media = CreateMedia();
        var tracks = new FakePlaylistTrackRepository { Exists = true };
        var handler = CreateHandler(playlist, media, tracks);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(CreateCommand(playlist.Id, ownerId, media.MediaId), CancellationToken.None));

        Assert.Equal("Track already exists in this playlist", exception.Message);
        Assert.False(tracks.WasAdded);
    }

    [Fact]
    public async Task AddTrack_AddsTrackAndReturnsMediaDetails_WhenRequestIsValid()
    {
        var ownerId = Guid.NewGuid();
        var playlist = CreatePlaylist(ownerId);
        var media = CreateMedia();
        var tracks = new FakePlaylistTrackRepository { NextSortOrder = 3 };
        var handler = CreateHandler(playlist, media, tracks);

        var result = await handler.Handle(CreateCommand(playlist.Id, ownerId, media.MediaId), CancellationToken.None);

        Assert.True(tracks.WasAdded);
        Assert.Equal(playlist.Id, tracks.AddedPlaylistId);
        Assert.Equal(media.MediaId, tracks.AddedMediaId);
        Assert.Equal(3, result.SortOrder);
        Assert.Equal(media.Title, result.Title);
        Assert.Equal(media.Duration, result.Duration);
    }

    private static AddTrackToPlaylistCommandHandler CreateHandler(Playlist? playlist, MediaItem? media, FakePlaylistTrackRepository tracks) =>
        new(new FakePlaylistRepository(playlist), tracks, new FakeMediaRepository(media));

    private static AddTrackToPlaylistCommand CreateCommand(Guid? playlistId = null, Guid? userId = null, Guid? mediaId = null) => new()
    {
        PlaylistId = playlistId ?? Guid.NewGuid(),
        UserId = userId ?? Guid.NewGuid(),
        MediaId = mediaId ?? Guid.NewGuid()
    };

    private static Playlist CreatePlaylist(Guid ownerId) => new() { Id = Guid.NewGuid(), OwnerId = ownerId, Name = "Test playlist" };

    private static MediaItem CreateMedia() => new()
    {
        MediaId = Guid.NewGuid(),
        Title = "Test track",
        FilePath = "/uploads/media/test.mp3",
        ThumbnailUrl = "/uploads/images/test.jpg",
        Duration = 180
    };

    private sealed class FakePlaylistRepository(Playlist? playlist) : IPlaylistRepository
    {
        public Task<Playlist?> GetByIdAsync(Guid id, IDbTransaction? transaction = null) => Task.FromResult(playlist?.Id == id ? playlist : null);
        public Task<IEnumerable<Playlist>> GetAllAsync(IDbTransaction? transaction = null) => Task.FromResult<IEnumerable<Playlist>>(playlist is null ? [] : [playlist]);
        public Task<Guid> CreateAsync(Playlist entity, IDbTransaction? transaction = null) => Task.FromResult(entity.Id);
        public Task UpdateAsync(Playlist entity, IDbTransaction? transaction = null) => Task.CompletedTask;
        public Task DeleteAsync(Guid id, IDbTransaction? transaction = null) => Task.CompletedTask;
        public Task<IEnumerable<Playlist>> GetByOwnerIdAsync(Guid ownerId, IDbTransaction? transaction = null) => Task.FromResult<IEnumerable<Playlist>>(playlist?.OwnerId == ownerId ? [playlist] : []);
        public Task<IEnumerable<Playlist>> GetPublicAsync(IDbTransaction? transaction = null) => Task.FromResult<IEnumerable<Playlist>>([]);
        public Task<bool> UpdateVisibilityAsync(Guid playlistId, bool isPublic, IDbTransaction? transaction = null) => Task.FromResult(false);
        public Task<bool> UpdateInfoAsync(Guid playlistId, string name, string? description, IDbTransaction? transaction = null) => Task.FromResult(false);
        public Task<bool> UpdateCoverImageAsync(Guid playlistId, string? coverImageUrl, IDbTransaction? transaction = null) => Task.FromResult(false);
        public Task<bool> DeletePlaylistAsync(Guid playlistId, IDbTransaction? transaction = null) => Task.FromResult(false);
    }

    private sealed class FakePlaylistTrackRepository : IPlaylistTrackRepository
    {
        public bool Exists { get; init; }
        public bool WasAdded { get; private set; }
        public Guid? AddedPlaylistId { get; private set; }
        public Guid? AddedMediaId { get; private set; }
        public int NextSortOrder { get; init; }

        public Task<int> AddTrackAsync(Guid playlistId, Guid mediaId, int sortOrder = -1, IDbTransaction? transaction = null)
        {
            WasAdded = true;
            AddedPlaylistId = playlistId;
            AddedMediaId = mediaId;
            return Task.FromResult(NextSortOrder);
        }

        public Task<bool> ExistsAsync(Guid playlistId, Guid mediaId, IDbTransaction? transaction = null) => Task.FromResult(Exists);
        public Task RemoveTrackAsync(Guid playlistId, Guid mediaId, IDbTransaction? transaction = null) => Task.CompletedTask;
        public Task<IEnumerable<PlaylistTrack>> GetTracksAsync(Guid playlistId, IDbTransaction? transaction = null) => Task.FromResult<IEnumerable<PlaylistTrack>>([]);
        public Task<PlaylistTrack?> GetTrackDetailAsync(Guid playlistId, Guid mediaId, IDbTransaction? transaction = null) => Task.FromResult<PlaylistTrack?>(null);
        public Task UpdateSortOrderAsync(Guid playlistId, Guid mediaId, int sortOrder, IDbTransaction? transaction = null) => Task.CompletedTask;
        public Task RemoveAllTracksAsync(Guid playlistId, IDbTransaction? transaction = null) => Task.CompletedTask;
    }

    private sealed class FakeMediaRepository(MediaItem? media) : IMediaRepository
    {
        public Task<MediaItem?> GetByIdAsync(Guid mediaId, IDbTransaction? transaction = null) => Task.FromResult(media?.MediaId == mediaId ? media : null);
        public Task<IEnumerable<MediaItem>> GetByIdsAsync(IEnumerable<Guid> mediaIds, IDbTransaction? transaction = null) => Task.FromResult<IEnumerable<MediaItem>>([]);
        public Task<Guid> AddAsync(MediaItem entity, IDbTransaction? transaction = null) => Task.FromResult(entity.MediaId);
        public Task SetGenresAsync(Guid mediaId, IEnumerable<Guid> genreIds, IDbTransaction? transaction = null) => Task.CompletedTask;
        public Task UpdateAsync(MediaItem entity, IDbTransaction? transaction = null) => Task.CompletedTask;
        public Task DeleteAsync(Guid mediaId, IDbTransaction? transaction = null) => Task.CompletedTask;
        public Task<bool> ExistsAsync(Guid mediaId, IDbTransaction? transaction = null) => Task.FromResult(media?.MediaId == mediaId);
        public Task<IEnumerable<MediaItem>> GetByOwnerIdAsync(Guid ownerId, int page = 1, int pageSize = 20, IDbTransaction? transaction = null) => Task.FromResult<IEnumerable<MediaItem>>([]);
        public Task<IEnumerable<MediaItem>> GetByAlbumIdAsync(Guid albumId, IDbTransaction? transaction = null) => Task.FromResult<IEnumerable<MediaItem>>([]);
        public Task<IEnumerable<MediaItem>> GetRecentAsync(int page = 1, int pageSize = 20, IDbTransaction? transaction = null) => Task.FromResult<IEnumerable<MediaItem>>([]);
        public Task IncrementViewCountAsync(Guid mediaId, IDbTransaction? transaction = null) => Task.CompletedTask;
    }
}
