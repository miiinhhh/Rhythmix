IF COL_LENGTH('MediaItems', 'VideoFilePath') IS NULL
BEGIN
    ALTER TABLE MediaItems
    ADD VideoFilePath NVARCHAR(500) NULL;
END

IF COL_LENGTH('MediaItems', 'VideoMimeType') IS NULL
BEGIN
    ALTER TABLE MediaItems
    ADD VideoMimeType NVARCHAR(100) NULL;
END

IF COL_LENGTH('MediaItems', 'VideoFileSize') IS NULL
BEGIN
    ALTER TABLE MediaItems
    ADD VideoFileSize BIGINT NULL;
END