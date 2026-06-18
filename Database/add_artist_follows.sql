IF OBJECT_ID('ArtistFollows', 'U') IS NULL
BEGIN
    CREATE TABLE ArtistFollows
    (
        UserId UNIQUEIDENTIFIER NOT NULL,
        ArtistId UNIQUEIDENTIFIER NOT NULL,
        FollowedAt DATETIME2 DEFAULT GETDATE(),

        PRIMARY KEY(UserId, ArtistId),
        FOREIGN KEY(UserId)
            REFERENCES AspNetUsers(Id),
        FOREIGN KEY(ArtistId)
            REFERENCES Artists(ArtistId)
    );
END
