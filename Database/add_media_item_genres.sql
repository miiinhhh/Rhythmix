IF OBJECT_ID('MediaItemGenres', 'U') IS NULL
BEGIN
    CREATE TABLE MediaItemGenres
    (
        MediaId UNIQUEIDENTIFIER NOT NULL,
        GenreId UNIQUEIDENTIFIER NOT NULL,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        PRIMARY KEY (MediaId, GenreId),
        FOREIGN KEY (MediaId)
            REFERENCES MediaItems(MediaId)
            ON DELETE CASCADE,
        FOREIGN KEY (GenreId)
            REFERENCES Genres(GenreId)
    );
END
GO

INSERT INTO MediaItemGenres (MediaId, GenreId)
SELECT MediaId, GenreId
FROM MediaItems
WHERE GenreId IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM MediaItemGenres mig
      WHERE mig.MediaId = MediaItems.MediaId
        AND mig.GenreId = MediaItems.GenreId
  );
GO
