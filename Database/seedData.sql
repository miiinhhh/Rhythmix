-- =========================================
-- USERS
-- =========================================

INSERT INTO AspNetUsers
(
    Id,
    UserName,
    Email,
    PasswordHash
)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Jane',
    'jane@rhythmix.com',
    'Jane123!'
),
(
    '22222222-2222-2222-2222-222222222222',
    'John',
    'john@rhythmix.com',
    'John123!'
);

-- =========================================
-- USER PROFILES
-- =========================================

INSERT INTO UserProfiles
(
    UserId,
    FullName,
    AvatarUrl,
    Bio
)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    N'Administrator',
    '/uploads/images/jane.jpg',
    N'Người dùng'
),
(
    '22222222-2222-2222-2222-222222222222',
    N'John Doe',
    '/uploads/images/john.jpg',
    N'Người dùng'
);
-- =========================================
-- ALBUM
-- =========================================
INSERT INTO Albums
(
    AlbumId,
    OwnerId,
    Title,
    Description,
    CoverImageUrl,
    ReleaseDate
)
VALUES
(
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    N'7UPPERCUTS Collection',
    N'Tuyển tập nhạc của 7UPPERCUTS',
    '/uploads/images/7uppercuts_album.jpg',
    '2026-06-10'
),
(
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    N'Ngọt Collection',
    N'Tuyển tập nhạc của Ngọt',
    '/uploads/images/ngot_album.jpg',
    '2026-06-10'
);
-- =========================================
-- MEDIA ITEMS
-- =========================================
INSERT INTO MediaItems
(
    MediaId,
    Title,
    Description,
    MediaType,
    Duration,
    FilePath,
    ThumbnailUrl,
    MimeType,
    FileSize,
    AlbumId,
    OwnerId
)
VALUES

-- Album 7UPPERCUTS
(
    '00000000-0000-0000-0000-000000000001',
    N'7UPPERCUTS_YÊU',
    NULL,
    'Audio',
    191,
    '/uploads/audio/7UPPERCUTS_YÊU.mp3',
    '/uploads/images/7UPPERCUTS_YÊU.jpg',
    'audio/mpeg',
    3068928,
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111'
),

(
    '00000000-0000-0000-0000-000000000002',
    N'7UPPERCUTS_DOPAMINE',
    NULL,
    'Video',
    151,
    '/uploads/video/7UPPERCUTS_DOPAMINE.mp4',
    '/uploads/images/7UPPERCUTS_DOPAMINE.jpg',
    'video/mp4',
    50463744,
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111'
),

-- Album Ngọt
(
    '00000000-0000-0000-0000-000000000003',
    N'Ngọt_CHUYẾN KÊNH',
    NULL,
    'Audio',
    309,
    '/uploads/audio/Ngọt_CHUYẾN KÊNH.mp3',
    '/uploads/images/Ngọt_CHUYẾN KÊNH.jpg',
    'audio/mpeg',
    4960256,
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111'
),

(
    '00000000-0000-0000-0000-000000000004',
    N'Ngọt_LẦN CUỐI',
    NULL,
    'Audio',
    221,
    '/uploads/audio/Ngọt_LẦN CUỐI.mp3',
    '/uploads/images/Ngọt_LẦN CUỐI.jpg',
    'audio/mpeg',
    3548160,
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111'
),

(
    '00000000-0000-0000-0000-000000000005',
    N'Ngọt_Thấy Chưa',
    NULL,
    'Audio',
    234,
    '/uploads/audio/Ngọt_Thấy Chưa.mp3',
    '/uploads/images/Ngọt_Thấy Chưa.jpg',
    'audio/mpeg',
    3755008,
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111'
),

(
    '00000000-0000-0000-0000-000000000006',
    N'Ngọt Em dạo này',
    NULL,
    'Audio',
    252,
    '/uploads/audio/Ngọt Em dạo này.mp3',
    '/uploads/images/Ngọt Em dạo này.jpg',
    'audio/mpeg',
    4046848,
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111'
),

-- Không thuộc album
(
    '00000000-0000-0000-0000-000000000007',
    N'JaigonOrchestra_Chinatown',
    NULL,
    'Video',
    243,
    '/uploads/video/JaigonOrchestra_Chinatown.mp4',
    '/uploads/images/JaigonOrchestra_Chinatown.jpg',
    'video/mp4',
    52259840,
    NULL,
    '11111111-1111-1111-1111-111111111111'
),

(
    '00000000-0000-0000-0000-000000000008',
    N'Quen Lắm',
    NULL,
    'Audio',
    247,
    '/uploads/audio/Quen Lắm.mp3',
    '/uploads/images/Quen Lắm.jpg',
    'audio/mpeg',
    3965952,
    NULL,
    '11111111-1111-1111-1111-111111111111'
),

(
    '00000000-0000-0000-0000-000000000009',
    N'Đá tan',
    NULL,
    'Audio',
    202,
    '/uploads/audio/Đá tan.mp3',
    '/uploads/images/Đá tan.jpg',
    'audio/mpeg',
    3236864,
    NULL,
    '11111111-1111-1111-1111-111111111111'
),

(
    '00000000-0000-0000-0000-000000000010',
    N'Trước Khi Em Tồn Tại',
    NULL,
    'Audio',
    194,
    '/uploads/audio/Trước Khi Em Tồn Tại.mp3',
    '/uploads/images/Trước Khi Em Tồn Tại.jpg',
    'audio/mpeg',
    3107840,
    NULL,
    '11111111-1111-1111-1111-111111111111'
);
-- =========================================
-- PLAYLISTS
-- =========================================
INSERT INTO Playlists
(
    PlaylistId,
    Name,
    Description,
    IsPublic,
    OwnerId
)
VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    N'Nhạc Chill',
    N'Những bài hát thư giãn và nhẹ nhàng',
    1,
    '11111111-1111-1111-1111-111111111111'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    N'MV Yêu Thích',
    N'Tổng hợp các video âm nhạc nổi bật',
    1,
    '22222222-2222-2222-2222-222222222222'
);
-- =========================================
-- PLAYLIST TRACKS
-- =========================================

INSERT INTO PlaylistTrack
(
    PlaylistId,
    MediaId,
    SortOrder
)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000001', 1), -- YÊU
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000003', 2), -- CHUYẾN KÊNH
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000004', 3), -- LẦN CUỐI
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000005', 4), -- Thấy Chưa
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000006', 5), -- Em dạo này
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000008', 6), -- Quen Lắm
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000009', 7), -- Đá tan
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000010', 8); -- Trước Khi Em Tồn Tại

INSERT INTO PlaylistTrack
(
    PlaylistId,
    MediaId,
    SortOrder
)
VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000002', 1), -- DOPAMINE
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000007', 2); -- Chinatown