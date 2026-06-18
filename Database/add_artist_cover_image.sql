IF COL_LENGTH('Artists', 'CoverImageUrl') IS NULL
BEGIN
    ALTER TABLE Artists
    ADD CoverImageUrl NVARCHAR(500) NULL;
END

UPDATE Artists
SET AvatarUrl = '/uploads/images/7Uppercut.jpg'
WHERE Name = N'7UPPERCUTS';

UPDATE Artists
SET AvatarUrl = '/uploads/images/NgotBand.webp'
WHERE Name = N'Ngọt';

UPDATE Artists
SET AvatarUrl = '/uploads/images/Jaigon.jpg'
WHERE Name = N'Jaigon Orchestra';

UPDATE Artists
SET AvatarUrl = '/uploads/images/ThangNgot.jpg'
WHERE Name = N'Vũ.';