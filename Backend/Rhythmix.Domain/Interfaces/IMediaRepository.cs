using Rhythmix.Domain.Entities;
public interface IMediaRepository
{
    Task<MediaItem?> GetByIdAsync(Guid mediaId);
    Task<IEnumerable<MediaItem>> GetByIdsAsync(IEnumerable<Guid> mediaIds);
    Task<Guid> AddAsync(MediaItem media); 
    Task UpdateAsync(MediaItem media);
    Task DeleteAsync(Guid mediaId);
}