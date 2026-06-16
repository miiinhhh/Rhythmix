CREATE TABLE AspNetUsers
(
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    UserName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE UserProfiles
(
    UserId UNIQUEIDENTIFIER PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    AvatarUrl NVARCHAR(500),
    Bio NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_UserProfiles_User
        FOREIGN KEY(UserId)
        REFERENCES AspNetUsers(Id)
);

-- CREATE TABLE Artists
-- (
--     ArtistId UNIQUEIDENTIFIER PRIMARY KEY,
--     Name NVARCHAR(200) NOT NULL,
--     Description NVARCHAR(MAX),
--     AvatarUrl NVARCHAR(500),
--     CreatedAt DATETIME2 DEFAULT GETDATE()
-- )

CREATE TABLE Albums
(
    AlbumId UNIQUEIDENTIFIER PRIMARY KEY,
    OwnerId UNIQUEIDENTIFIER NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    CoverImageUrl NVARCHAR(500),
    ReleaseDate DATE,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (OwnerId)
        REFERENCES AspNetUsers(Id)
)

CREATE TABLE Genres
(
    GenreId UNIQUEIDENTIFIER PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE()
)

CREATE TABLE MediaItems
(
    MediaId UNIQUEIDENTIFIER PRIMARY KEY,
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    MediaType VARCHAR(20) NOT NULL,
    Duration INT NOT NULL,
    FilePath NVARCHAR(500) NOT NULL,
    ThumbnailUrl NVARCHAR(500),
    MimeType NVARCHAR(100),
    FileSize BIGINT,
    AlbumId UNIQUEIDENTIFIER NULL,
    GenreId UNIQUEIDENTIFIER NULL,
    OwnerId UNIQUEIDENTIFIER NOT NULL,
    --IsPublic BIT DEFAULT 1,       -- tui không nghĩ cần, public/private chỉ ns về playlist (ThanhTuan said) chuẩn đấy em (Minh said)
    ViewCount INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),

    FOREIGN KEY (AlbumId)
        REFERENCES Albums(AlbumId),

    FOREIGN KEY (GenreId)
        REFERENCES Genres(GenreId)
        ON DELETE SET NULL,

    FOREIGN KEY (OwnerId)
        REFERENCES AspNetUsers(Id)
)


CREATE TABLE Playlists
(
    PlaylistId UNIQUEIDENTIFIER PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    IsPublic BIT DEFAULT 1,
    OwnerId UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_Playlists_User
        FOREIGN KEY(OwnerId)
        REFERENCES AspNetUsers(Id)
);
CREATE TABLE PlayListTrack
(
    PlaylistId UNIQUEIDENTIFIER NOT NULL,
    MediaId UNIQUEIDENTIFIER NOT NULL,
    SortOrder INT DEFAULT 0,    -- Cột thêm vào: Giúp kéo thả, sắp xếp thứ tự bài hát
    
    PRIMARY KEY (PlaylistId, MediaId), 

    CONSTRAINT FK_PlaylistItems_Playlists
        FOREIGN KEY (PlaylistId) REFERENCES Playlists(PlaylistId) 
        ON DELETE CASCADE, -- Nếu xóa playlist thì tự động xóa các liên kết bên trong

    -- Khóa ngoại liên kết tới bảng MediaItems (Track)
    CONSTRAINT FK_PlaylistItems_MediaItems
        FOREIGN KEY (MediaId) REFERENCES MediaItems(MediaId)
        ON DELETE CASCADE -- Nếu bài hát bị xóa khỏi hệ thống thì tự động biến mất khỏi playlist
);
CREATE TABLE MediaShares
(
    ShareId UNIQUEIDENTIFIER PRIMARY KEY,
    SenderId UNIQUEIDENTIFIER NOT NULL,
    ReceiverId UNIQUEIDENTIFIER NOT NULL,
    MediaId UNIQUEIDENTIFIER NULL,
    PlaylistId UNIQUEIDENTIFIER NULL,

    Message NVARCHAR(500),

    SharedAt DATETIME2 DEFAULT GETDATE(),

    FOREIGN KEY(SenderId)
        REFERENCES AspNetUsers(Id),

    FOREIGN KEY(ReceiverId)
        REFERENCES AspNetUsers(Id),

    FOREIGN KEY(MediaId)
        REFERENCES MediaItems(MediaId),

    FOREIGN KEY(PlaylistId)
        REFERENCES Playlists(PlaylistId)
);

CREATE TABLE Notifications
(
    NotificationId UNIQUEIDENTIFIER PRIMARY KEY,
    UserId UNIQUEIDENTIFIER NOT NULL,
    Type VARCHAR(50) NOT NULL,
    Payload NVARCHAR(MAX),
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY(UserId)
        REFERENCES AspNetUsers(Id)
);

CREATE TABLE Favorites
(
    UserId UNIQUEIDENTIFIER NOT NULL,
    MediaId UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    PRIMARY KEY(UserId, MediaId),
    FOREIGN KEY(UserId)
        REFERENCES AspNetUsers(Id),
    FOREIGN KEY(MediaId)
        REFERENCES MediaItems(MediaId)
);

CREATE TABLE PlayHistories
(
    HistoryId UNIQUEIDENTIFIER PRIMARY KEY,
    UserId UNIQUEIDENTIFIER NOT NULL,
    MediaId UNIQUEIDENTIFIER NOT NULL,
    PlayedAt DATETIME2 DEFAULT GETDATE(),

    FOREIGN KEY(UserId)
        REFERENCES AspNetUsers(Id),
    FOREIGN KEY(MediaId)
        REFERENCES MediaItems(MediaId)
);

CREATE TABLE Follows
(
    FollowerId UNIQUEIDENTIFIER NOT NULL,
    FollowingId UNIQUEIDENTIFIER NOT NULL,
    FollowedAt DATETIME2 DEFAULT GETDATE(),

    PRIMARY KEY(FollowerId, FollowingId),
    FOREIGN KEY(FollowerId)
        REFERENCES AspNetUsers(Id),
    FOREIGN KEY(FollowingId)
        REFERENCES AspNetUsers(Id)
);

CREATE TABLE PlayListTrack
(
    PlaylistId UNIQUEIDENTIFIER NOT NULL,
    MediaId UNIQUEIDENTIFIER NOT NULL,
    SortOrder INT DEFAULT 0,    -- Cột thêm vào: Giúp kéo thả, sắp xếp thứ tự bài hát
    
    PRIMARY KEY (PlaylistId, MediaId), 

    CONSTRAINT FK_PlaylistItems_Playlists
        FOREIGN KEY (PlaylistId) REFERENCES Playlists(PlaylistId) 
        ON DELETE CASCADE, -- Nếu xóa playlist thì tự động xóa các liên kết bên trong

    -- Khóa ngoại liên kết tới bảng MediaItems (Track)
    CONSTRAINT FK_PlaylistItems_MediaItems
        FOREIGN KEY (MediaId) REFERENCES MediaItems(MediaId)
        ON DELETE CASCADE -- Nếu bài hát bị xóa khỏi hệ thống thì tự động biến mất khỏi playlist
);
