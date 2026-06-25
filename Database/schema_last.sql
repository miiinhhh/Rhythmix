-- ============================================
-- SCRIPT TẠO DATABASE RHYTHMIX CHO RDS
-- ============================================

-- 1. Tạo database (nếu chưa tồn tại)
USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'RhythmixDb')
BEGIN
    CREATE DATABASE RhythmixDb;
END
GO

-- 2. Chuyển sang database mới
USE RhythmixDb;
GO

-- ============================================
-- DROP TABLES IF EXISTS (để chạy lại không bị lỗi)
-- ============================================
DROP TABLE IF EXISTS PlayListTrack;
DROP TABLE IF EXISTS MediaItemGenres;
DROP TABLE IF EXISTS Favorites;
DROP TABLE IF EXISTS ArtistFollows;
DROP TABLE IF EXISTS Follows;
DROP TABLE IF EXISTS PlayHistories;
DROP TABLE IF EXISTS MediaShares;
DROP TABLE IF EXISTS Notifications;
DROP TABLE IF EXISTS UserProfiles;
DROP TABLE IF EXISTS MediaItems;
DROP TABLE IF EXISTS Playlists;
DROP TABLE IF EXISTS Albums;
DROP TABLE IF EXISTS Artists;
DROP TABLE IF EXISTS Genres;
DROP TABLE IF EXISTS AspNetUsers;
GO

-- ============================================
-- TẠO CÁC BẢNG
-- ============================================

-- Bảng AspNetUsers
CREATE TABLE AspNetUsers (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    UserName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Bảng Artists
CREATE TABLE Artists (
    ArtistId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    AvatarUrl NVARCHAR(500) NULL,
    CoverImageUrl NVARCHAR(500) NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Bảng Albums
CREATE TABLE Albums (
    AlbumId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    OwnerId UNIQUEIDENTIFIER NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    CoverImageUrl NVARCHAR(500) NULL,
    ReleaseDate DATE NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Bảng Genres
CREATE TABLE Genres (
    GenreId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Bảng MediaItems
CREATE TABLE MediaItems (
    MediaId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    MediaType VARCHAR(20) NOT NULL,
    Duration INT NOT NULL,
    FilePath NVARCHAR(500) NOT NULL,
    ThumbnailUrl NVARCHAR(500) NULL,
    MimeType NVARCHAR(100) NULL,
    FileSize BIGINT NULL,
    ArtistId UNIQUEIDENTIFIER NULL,
    AlbumId UNIQUEIDENTIFIER NULL,
    GenreId UNIQUEIDENTIFIER NULL,
    OwnerId UNIQUEIDENTIFIER NOT NULL,
    IsPublic BIT DEFAULT 1,
    ViewCount INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    VideoFilePath NVARCHAR(500) NULL,
    VideoMimeType NVARCHAR(100) NULL,
    VideoFileSize BIGINT NULL
);
GO

-- Bảng Playlists
CREATE TABLE Playlists (
    PlaylistId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    CoverImageUrl NVARCHAR(500) NULL,
    IsPublic BIT DEFAULT 1,
    OwnerId UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Bảng PlayListTrack
CREATE TABLE PlayListTrack (
    PlaylistId UNIQUEIDENTIFIER NOT NULL,
    MediaId UNIQUEIDENTIFIER NOT NULL,
    SortOrder INT DEFAULT 0,
    PRIMARY KEY (PlaylistId, MediaId)
);
GO

-- Bảng Favorites
CREATE TABLE Favorites (
    UserId UNIQUEIDENTIFIER NOT NULL,
    MediaId UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    PRIMARY KEY (UserId, MediaId)
);
GO

-- Bảng ArtistFollows
CREATE TABLE ArtistFollows (
    UserId UNIQUEIDENTIFIER NOT NULL,
    ArtistId UNIQUEIDENTIFIER NOT NULL,
    FollowedAt DATETIME2 DEFAULT GETDATE(),
    PRIMARY KEY (UserId, ArtistId)
);
GO

-- Bảng Follows
CREATE TABLE Follows (
    FollowerId UNIQUEIDENTIFIER NOT NULL,
    FollowingId UNIQUEIDENTIFIER NOT NULL,
    FollowedAt DATETIME2 DEFAULT GETDATE(),
    PRIMARY KEY (FollowerId, FollowingId)
);
GO

-- Bảng PlayHistories
CREATE TABLE PlayHistories (
    HistoryId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    UserId UNIQUEIDENTIFIER NOT NULL,
    MediaId UNIQUEIDENTIFIER NOT NULL,
    PlayedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Bảng MediaShares
CREATE TABLE MediaShares (
    ShareId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    SenderId UNIQUEIDENTIFIER NOT NULL,
    ReceiverId UNIQUEIDENTIFIER NOT NULL,
    MediaId UNIQUEIDENTIFIER NULL,
    PlaylistId UNIQUEIDENTIFIER NULL,
    Message NVARCHAR(500) NULL,
    SharedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Bảng Notifications
CREATE TABLE Notifications (
    NotificationId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    UserId UNIQUEIDENTIFIER NOT NULL,
    Type VARCHAR(50) NOT NULL,
    Payload NVARCHAR(MAX) NULL,
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Bảng UserProfiles
CREATE TABLE UserProfiles (
    UserId UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    AvatarUrl NVARCHAR(500) NULL,
    Bio NVARCHAR(500) NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
GO

-- Bảng MediaItemGenres
CREATE TABLE MediaItemGenres (
    MediaId UNIQUEIDENTIFIER NOT NULL,
    GenreId UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    PRIMARY KEY (MediaId, GenreId)
);
GO

-- ============================================
-- THÊM CÁC FOREIGN KEY
-- ============================================

-- Albums
ALTER TABLE Albums ADD CONSTRAINT FK_Albums_AspNetUsers 
    FOREIGN KEY (OwnerId) REFERENCES AspNetUsers(Id);
GO

-- ArtistFollows
ALTER TABLE ArtistFollows ADD CONSTRAINT FK_ArtistFollows_AspNetUsers 
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id);
GO

ALTER TABLE ArtistFollows ADD CONSTRAINT FK_ArtistFollows_Artists 
    FOREIGN KEY (ArtistId) REFERENCES Artists(ArtistId);
GO

-- Favorites
ALTER TABLE Favorites ADD CONSTRAINT FK_Favorites_AspNetUsers 
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id);
GO

ALTER TABLE Favorites ADD CONSTRAINT FK_Favorites_MediaItems 
    FOREIGN KEY (MediaId) REFERENCES MediaItems(MediaId);
GO

-- Follows
ALTER TABLE Follows ADD CONSTRAINT FK_Follows_Follower 
    FOREIGN KEY (FollowerId) REFERENCES AspNetUsers(Id);
GO

ALTER TABLE Follows ADD CONSTRAINT FK_Follows_Following 
    FOREIGN KEY (FollowingId) REFERENCES AspNetUsers(Id);
GO

-- MediaItemGenres
ALTER TABLE MediaItemGenres ADD CONSTRAINT FK_MediaItemGenres_MediaItems 
    FOREIGN KEY (MediaId) REFERENCES MediaItems(MediaId) ON DELETE CASCADE;
GO

ALTER TABLE MediaItemGenres ADD CONSTRAINT FK_MediaItemGenres_Genres 
    FOREIGN KEY (GenreId) REFERENCES Genres(GenreId);
GO

-- MediaItems
ALTER TABLE MediaItems ADD CONSTRAINT FK_MediaItems_Artists 
    FOREIGN KEY (ArtistId) REFERENCES Artists(ArtistId);
GO

ALTER TABLE MediaItems ADD CONSTRAINT FK_MediaItems_Albums 
    FOREIGN KEY (AlbumId) REFERENCES Albums(AlbumId);
GO

ALTER TABLE MediaItems ADD CONSTRAINT FK_MediaItems_Genres 
    FOREIGN KEY (GenreId) REFERENCES Genres(GenreId) ON DELETE SET NULL;
GO

ALTER TABLE MediaItems ADD CONSTRAINT FK_MediaItems_AspNetUsers 
    FOREIGN KEY (OwnerId) REFERENCES AspNetUsers(Id);
GO

-- MediaShares
ALTER TABLE MediaShares ADD CONSTRAINT FK_MediaShares_Sender 
    FOREIGN KEY (SenderId) REFERENCES AspNetUsers(Id);
GO

ALTER TABLE MediaShares ADD CONSTRAINT FK_MediaShares_Receiver 
    FOREIGN KEY (ReceiverId) REFERENCES AspNetUsers(Id);
GO

ALTER TABLE MediaShares ADD CONSTRAINT FK_MediaShares_MediaItems 
    FOREIGN KEY (MediaId) REFERENCES MediaItems(MediaId);
GO

ALTER TABLE MediaShares ADD CONSTRAINT FK_MediaShares_Playlists 
    FOREIGN KEY (PlaylistId) REFERENCES Playlists(PlaylistId);
GO

-- Notifications
ALTER TABLE Notifications ADD CONSTRAINT FK_Notifications_AspNetUsers 
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id);
GO

-- PlayHistories
ALTER TABLE PlayHistories ADD CONSTRAINT FK_PlayHistories_AspNetUsers 
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id);
GO

ALTER TABLE PlayHistories ADD CONSTRAINT FK_PlayHistories_MediaItems 
    FOREIGN KEY (MediaId) REFERENCES MediaItems(MediaId);
GO

-- Playlists
ALTER TABLE Playlists ADD CONSTRAINT FK_Playlists_AspNetUsers 
    FOREIGN KEY (OwnerId) REFERENCES AspNetUsers(Id);
GO

-- PlayListTrack
ALTER TABLE PlayListTrack ADD CONSTRAINT FK_PlayListTrack_Playlists 
    FOREIGN KEY (PlaylistId) REFERENCES Playlists(PlaylistId) ON DELETE CASCADE;
GO

ALTER TABLE PlayListTrack ADD CONSTRAINT FK_PlayListTrack_MediaItems 
    FOREIGN KEY (MediaId) REFERENCES MediaItems(MediaId) ON DELETE CASCADE;
GO

-- UserProfiles
ALTER TABLE UserProfiles ADD CONSTRAINT FK_UserProfiles_AspNetUsers 
    FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id);
GO

-- ============================================
-- KIỂM TRA KẾT QUẢ
-- ============================================
-- Xem danh sách các bảng đã tạo
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO