-- Users table for Rhythmix backend auth and profile
CREATE TABLE [dbo].[Users]
(
    [Id] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    [Email] NVARCHAR(256) NOT NULL,
    [UserName] NVARCHAR(100) NOT NULL,
    [DisplayName] NVARCHAR(150) NOT NULL,
    [Bio] NVARCHAR(1000) NULL,
    [AvatarUrl] NVARCHAR(500) NULL,
    [PasswordHash] NVARCHAR(500) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE UNIQUE INDEX IX_Users_Email ON [dbo].[Users](Email);
CREATE UNIQUE INDEX IX_Users_UserName ON [dbo].[Users](UserName);

-- Sample seed data can be inserted after table creation.
-- INSERT INTO [dbo].[Users] (Id, Email, UserName, DisplayName, Bio, AvatarUrl, PasswordHash, CreatedAt)
-- VALUES (...);
