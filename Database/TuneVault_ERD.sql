CREATE TABLE [AspNetUsers] (
  [Id] nvarchar PRIMARY KEY
)
GO

CREATE TABLE [UserProfiles] (
  [Id] uniqueidentifier PRIMARY KEY,
  [UserId] nvarchar,
  [FullName] nvarchar,
  [AvatarUrl] nvarchar,
  [Bio] nvarchar,
  [Country] nvarchar,
  [CreatedAt] datetime,
  [UpdatedAt] datetime
)
GO

CREATE TABLE [MediaItems] (
  [Id] uniqueidentifier PRIMARY KEY,
  [UploaderId] nvarchar,
  [Title] nvarchar,
  [Description] nvarchar,
  [MediaType] int,
  [FileUrl] nvarchar,
  [ThumbnailUrl] nvarchar,
  [Duration] int,
  [ViewCount] bigint,
  [CreatedAt] datetime,
  [UpdatedAt] datetime
)
GO

CREATE TABLE [Playlists] (
  [Id] uniqueidentifier PRIMARY KEY,
  [OwnerId] nvarchar,
  [Name] nvarchar,
  [Description] nvarchar,
  [CoverImage] nvarchar,
  [CreatedAt] datetime,
  [UpdatedAt] datetime
)
GO

CREATE TABLE [PlaylistTracks] (
  [Id] uniqueidentifier PRIMARY KEY,
  [PlaylistId] uniqueidentifier,
  [MediaItemId] uniqueidentifier,
  [OrderIndex] int,
  [AddedAt] datetime
)
GO

CREATE TABLE [Favorites] (
  [Id] uniqueidentifier PRIMARY KEY,
  [UserId] nvarchar,
  [MediaItemId] uniqueidentifier,
  [CreatedAt] datetime
)
GO

CREATE TABLE [PlayHistories] (
  [Id] uniqueidentifier PRIMARY KEY,
  [UserId] nvarchar,
  [MediaItemId] uniqueidentifier,
  [PlayedAt] datetime,
  [PlaybackDuration] int
)
GO

CREATE TABLE [MediaShares] (
  [Id] uniqueidentifier PRIMARY KEY,
  [MediaItemId] uniqueidentifier,
  [SenderId] nvarchar,
  [ReceiverId] nvarchar,
  [Message] nvarchar,
  [SharedAt] datetime
)
GO

CREATE TABLE [Notifications] (
  [Id] uniqueidentifier PRIMARY KEY,
  [UserId] nvarchar,
  [Title] nvarchar,
  [Content] nvarchar,
  [IsRead] bit,
  [CreatedAt] datetime
)
GO

ALTER TABLE [UserProfiles] ADD FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id])
GO

ALTER TABLE [MediaItems] ADD FOREIGN KEY ([UploaderId]) REFERENCES [AspNetUsers] ([Id])
GO

ALTER TABLE [Playlists] ADD FOREIGN KEY ([OwnerId]) REFERENCES [AspNetUsers] ([Id])
GO

ALTER TABLE [PlaylistTracks] ADD FOREIGN KEY ([PlaylistId]) REFERENCES [Playlists] ([Id])
GO

ALTER TABLE [PlaylistTracks] ADD FOREIGN KEY ([MediaItemId]) REFERENCES [MediaItems] ([Id])
GO

ALTER TABLE [Favorites] ADD FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id])
GO

ALTER TABLE [Favorites] ADD FOREIGN KEY ([MediaItemId]) REFERENCES [MediaItems] ([Id])
GO

ALTER TABLE [PlayHistories] ADD FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id])
GO

ALTER TABLE [PlayHistories] ADD FOREIGN KEY ([MediaItemId]) REFERENCES [MediaItems] ([Id])
GO

ALTER TABLE [MediaShares] ADD FOREIGN KEY ([MediaItemId]) REFERENCES [MediaItems] ([Id])
GO

ALTER TABLE [MediaShares] ADD FOREIGN KEY ([SenderId]) REFERENCES [AspNetUsers] ([Id])
GO

ALTER TABLE [MediaShares] ADD FOREIGN KEY ([ReceiverId]) REFERENCES [AspNetUsers] ([Id])
GO

ALTER TABLE [Notifications] ADD FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id])
GO
