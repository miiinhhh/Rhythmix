namespace Rhythmix.Application.DTOs.History;

public class AddPlayHistoryRequest
{
    public Guid MediaId { get; set; }
}

public class PlayHistoryDto
{
    public Guid MediaId { get; set; }
    public DateTime PlayedAt { get; set; }
}