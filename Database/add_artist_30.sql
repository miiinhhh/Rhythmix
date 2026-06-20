INSERT INTO Artists (ArtistId, Name)
VALUES
(NEWID(), N'Chillies'),
(NEWID(), N'Cá Hồi Hoang'),
(NEWID(), N'Da LAB'),
(NEWID(), N'Raditori'),
(NEWID(), N'The Cassette'),
(NEWID(), N'The Flob'),
(NEWID(), N'Ngũ Cung'),
(NEWID(), N'Hoàng Dũng'),
(NEWID(), N'Phan Mạnh Quỳnh'),
(NEWID(), N'Hà Anh Tuấn'),
(NEWID(), N'Vũ Cát Tường'),
(NEWID(), N'Mỹ Tâm'),
(NEWID(), N'Trúc Nhân'),
(NEWID(), N'ERIK'),
(NEWID(), N'MONO'),
(NEWID(), N'MIN'),
(NEWID(), N'AMEE'),
(NEWID(), N'GREY D'),
(NEWID(), N'Wren Evans'),
(NEWID(), N'Đen'),
(NEWID(), N'JustaTee'),
(NEWID(), N'Karik'),
(NEWID(), N'Binz'),
(NEWID(), N'Wowy');

UPDATE Artists
SET Name = N'Vũ Đinh Trọng Thắng'
WHERE Name = N'Vũ.';

UPDATE Artists SET AvatarUrl = '/uploads/images/Amee.jpg' WHERE Name = N'AMEE';
UPDATE Artists SET AvatarUrl = '/uploads/images/DaLab.jpg' WHERE Name = N'Da LAB';
UPDATE Artists SET AvatarUrl = '/uploads/images/HaAnhTuan.jpg' WHERE Name = N'Hà Anh Tuấn';
UPDATE Artists SET AvatarUrl = '/uploads/images/Min.jpg' WHERE Name = N'MIN';
UPDATE Artists SET AvatarUrl = '/uploads/images/PhanManhQuynh.jpg' WHERE Name = N'Phan Mạnh Quỳnh';
UPDATE Artists SET AvatarUrl = '/uploads/images/TrucNhan.jpg' WHERE Name = N'Trúc Nhân';

UPDATE Artists SET AvatarUrl = '/uploads/images/Binz.jpg' WHERE Name = N'Binz';
UPDATE Artists SET AvatarUrl = '/uploads/images/Den.jpg' WHERE Name = N'Đen';
UPDATE Artists SET AvatarUrl = '/uploads/images/HoangDung.jpg' WHERE Name = N'Hoàng Dũng';
UPDATE Artists SET AvatarUrl = '/uploads/images/MONO.jpg' WHERE Name = N'MONO';
UPDATE Artists SET AvatarUrl = '/uploads/images/Raditori.jpg' WHERE Name = N'Raditori';
UPDATE Artists SET AvatarUrl = '/uploads/images/VuCatTuong.jpg' WHERE Name = N'Vũ Cát Tường';

UPDATE Artists SET AvatarUrl = '/uploads/images/CaHoiHoang.jpg' WHERE Name = N'Cá Hồi Hoang';
UPDATE Artists SET AvatarUrl = '/uploads/images/ERIK.jpg' WHERE Name = N'ERIK';
UPDATE Artists SET AvatarUrl = '/uploads/images/JustaTee.jpg' WHERE Name = N'JustaTee';
UPDATE Artists SET AvatarUrl = '/uploads/images/MyTam.jpg' WHERE Name = N'Mỹ Tâm';
UPDATE Artists SET AvatarUrl = '/uploads/images/TheCassette.jpg' WHERE Name = N'The Cassette';
UPDATE Artists SET AvatarUrl = '/uploads/images/Wowy.jpg' WHERE Name = N'Wowy';

UPDATE Artists SET AvatarUrl = '/uploads/images/Chillies.jpg' WHERE Name = N'Chillies';
UPDATE Artists SET AvatarUrl = '/uploads/images/GreyD.jpg' WHERE Name = N'GREY D';
UPDATE Artists SET AvatarUrl = '/uploads/images/Karik.jpg' WHERE Name = N'Karik';
UPDATE Artists SET AvatarUrl = '/uploads/images/NguCung.jpg' WHERE Name = N'Ngũ Cung';
UPDATE Artists SET AvatarUrl = '/uploads/images/TheFlob.jpg' WHERE Name = N'The Flob';
UPDATE Artists SET AvatarUrl = '/uploads/images/WrenEvans.jpg' WHERE Name = N'Wren Evans';

INSERT INTO Artists
(
    ArtistId,
    Name,
    AvatarUrl
)
VALUES
(
    NEWID(),
    N'Tuấn Ngọc',
    N'/uploads/images/TuanNgoc.jpg'
);