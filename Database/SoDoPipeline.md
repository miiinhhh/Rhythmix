# Rhythmix - 10 Chuc Nang Va So Do Pipeline

Tai lieu nay doi chieu 10 chuc nang bat buoc trong `Database/input.md` voi cac thanh phan dang co trong project Rhythmix. Du an su dung React + TypeScript o frontend, ASP.NET Core Web API, MediatR, Dapper va SQL Server o backend.

## 1. Danh sach 10 chuc nang

| # | Chuc nang theo de bai | Hien thuc trong Rhythmix | API / Use case tieu bieu | Man hinh React |
|---|---|---|---|---|
| 1 | Xac thuc | Dang ky, dang nhap, dang xuat, OTP dang ky, JWT | `AuthController`, `RegisterCommand`, `LoginQuery`, `LogoutCommand` | `AuthModal` |
| 2 | Ho so nguoi dung | Xem/sua profile, avatar, bio | `ProfileController`, `UpdateProfileCommand` | `ProfilePage` |
| 3 | Thu vien media | Upload audio/video, metadata, anh bia, xoa audio cua chu so huu | `MediaController`, `UploadMediaCommand`, `DeleteMediaCommand` | `LibraryPage`, `UploadMediaModal` |
| 4 | Audio player | Stream audio, play/pause/seek, queue, lich su nghe | `GET /api/media/{id}/stream`, `RecordPlayHistoryCommand` | `PlayerBar`, `QueueSidebar` |
| 5 | Video player | Stream video, poster, modal phat video, seek va volume dung chung player | `GET /api/media/{id}/stream?type=video` | `VideoPlayerModal` |
| 6 | Playlist | CRUD playlist, them/xoa track, sap xep, public/private | `PlaylistsController`, `CreatePlaylistCommand`, `AddTrackToPlaylistCommand` | `PlaylistDetailPage`, `CreatePlaylistModal` |
| 7 | Tim kiem va kham pha | Tim media, artist, album, playlist; playlist theo the loai; AI recommendation | `SearchController`, `SearchQuery`, `AIController` | `SearchPage`, `HomePage` |
| 8 | Chia se media | Chia se song/video/playlist, inbox va outbox | `SharesController`, `CreateShareCommand` | `ShareModal`, `ShareInboxPage` |
| 9 | Thong bao | Luu notification, danh sach, danh dau da doc, SignalR real-time | `NotificationsController`, `INotificationHub` | `NotificationsPage`, `NotificationContext` |
| 10 | Tuong tac va lich su | Like/favorite va lich su nghe gan day | `InteractionsController`, `ToggleFavoriteCommand`, `RecordPlayHistoryCommand` | `LikedSongsPage`, `PlayerBar` |

## 2. Pipeline chung

```mermaid
flowchart LR
    UI[React UI] --> API[ASP.NET Core Controller]
    API --> AUTH{JWT / Ownership}
    AUTH -->|Hop le| MED[MediatR Command or Query]
    AUTH -->|Khong hop le| ERR[401 / 403 / Validation error]
    MED --> HANDLER[Application Handler]
    HANDLER --> REPO[Domain Repository Interface]
    REPO --> DAPPER[Dapper Infrastructure]
    DAPPER --> SQL[(SQL Server)]
    HANDLER --> SIDE[File storage / SignalR / Notification]
    HANDLER --> DTO[Response DTO]
    DTO --> API
    API --> UI
```

Pipeline ap dung cho moi use case: validation request, xac thuc/kiem tra quyen, handler xu ly nghiep vu, repository Dapper truy van SQL, side effect neu can, sau do map ve DTO.

## 3. Pipeline chi tiet - Auth

```mermaid
sequenceDiagram
    participant U as User / AuthModal
    participant A as AuthController
    participant M as MediatR
    participant H as RegisterCommandHandler or LoginQueryHandler
    participant R as IUserRepository (Dapper)
    participant DB as SQL Server
    participant J as IJwtTokenGenerator

    U->>A: POST /api/auth/register or /login
    A->>A: DataAnnotations validation
    alt Request khong hop le
        A-->>U: 400 + errors
    else Request hop le
        A->>M: Send RegisterCommand / LoginQuery
        M->>H: Handle request
        H->>R: Check email / load user
        R->>DB: Parameterized SQL
        DB-->>R: User data
        alt Dang ky
            H->>H: Hash password
            H->>R: Create user
            R->>DB: INSERT user + profile
        end
        H->>J: Generate JWT
        J-->>H: Access token
        H-->>A: AuthResponse DTO
        A-->>U: 200 + user + token
    end
```

## 4. Pipeline chi tiet - Upload va Streaming Media

```mermaid
flowchart TD
    U[LibraryPage / UploadMediaModal] --> C[POST /api/media/upload]
    C --> V{Validate JWT, file size, extension, MIME}
    V -->|Invalid| E[400 Validation error]
    V -->|Valid| CMD[UploadMediaCommand]
    CMD --> H[UploadMediaCommandHandler]
    H --> FS[IFileStorageService]
    FS --> DISK[wwwroot/uploads]
    H --> ART[Find or create Artist]
    H --> REP[IMediaRepository]
    REP --> SQL[(MediaItems, MediaItemGenres)]
    SQL --> DTO[MediaDto]
    DTO --> UI[Library refresh]

    P[PlayerBar / VideoPlayerModal] --> S[GET /api/media/{id}/stream]
    S --> AUTH[Authorize]
    AUTH --> FILE[Read stored media file]
    FILE --> HTML5[HTML5 audio or video player]
```

## 5. Pipeline chi tiet - Share Media va Notification

```mermaid
sequenceDiagram
    participant S as Sender / ShareModal
    participant C as SharesController
    participant H as CreateShareCommandHandler
    participant DB as SQL Server
    participant N as Notification Hub / SignalR
    participant R as Receiver UI

    S->>C: POST /api/shares (receiverId, mediaId or playlistId)
    C->>C: JWT + request validation
    C->>H: CreateShareCommand
    H->>DB: Validate receiver and shared resource
    H->>DB: INSERT MediaShares
    H->>DB: INSERT Notifications
    H->>N: Push real-time notification
    N-->>R: SignalR event
    H-->>C: ShareItemDto
    C-->>S: success response
    R->>DB: GET notification / shared inbox when opened
```

## 6. Pipeline chuc nang 1 - Xac thuc

```mermaid
flowchart LR
    UI[AuthModal] --> API[AuthController Register or Login]
    API --> VAL[DataAnnotations validation]
    VAL --> CMD[RegisterCommand or LoginQuery]
    CMD --> H[Auth Handler]
    H --> REP[IUserRepository]
    REP --> DB[(AspNetUsers and UserProfiles)]
    H --> JWT[IJwtTokenGenerator]
    JWT --> DTO[AuthResponse]
    DTO --> UI
```

## 7. Pipeline chuc nang 2 - Ho so nguoi dung

```mermaid
flowchart LR
    UI[ProfilePage] --> API[ProfileController]
    API --> AUTH[JWT and current user claim]
    AUTH --> CMD[UpdateProfileCommand or GetProfileQuery]
    CMD --> H[Profile Handler]
    H --> REP[IUserRepository]
    REP --> DB[(UserProfiles)]
    H --> DTO[ProfileDto]
    DTO --> UI
```

## 8. Pipeline chuc nang 3 - Thu vien media

```mermaid
flowchart LR
    UI[LibraryPage and UploadMediaModal] --> API[MediaController Upload or Delete]
    API --> AUTH[JWT and ownership check]
    AUTH --> CMD[UploadMediaCommand or DeleteMediaCommand]
    CMD --> H[Media Handler]
    H --> FS[IFileStorageService]
    FS --> DISK[(wwwroot uploads)]
    H --> REP[IMediaRepository]
    REP --> DB[(MediaItems and MediaItemGenres)]
    H --> DTO[MediaDto or success response]
    DTO --> UI
```

## 9. Pipeline chuc nang 4 - Audio player

```mermaid
flowchart LR
    UI[PlayerBar] --> API[GET media id stream]
    API --> AUTH[Authorize]
    AUTH --> FS[IFileStorageService]
    FS --> AUDIO[HTML5 audio element]
    AUDIO --> UISTATE[Play pause seek queue state]
    AUDIO --> HIST[POST interactions play-history]
    HIST --> H[RecordPlayHistoryCommandHandler]
    H --> DB[(PlayHistories)]
```

## 10. Pipeline chuc nang 5 - Video player

```mermaid
flowchart LR
    UI[VideoPlayerModal] --> API[GET media id stream type video]
    API --> AUTH[Authorize]
    AUTH --> FS[IFileStorageService]
    FS --> VIDEO[HTML5 video element]
    VIDEO --> STATE[Shared play seek and volume state]
    STATE --> UI[VideoPlayerModal and PlayerBar]
```

## 11. Pipeline chuc nang 6 - Playlist

```mermaid
flowchart LR
    UI[LibraryPage or PlaylistDetailPage] --> API[PlaylistsController]
    API --> AUTH[JWT and playlist owner check]
    AUTH --> CMD[Create Update Delete Playlist or Add Remove Track Command]
    CMD --> H[Playlist Handler]
    H --> PREP[IPlaylistRepository]
    H --> TREP[IPlaylistTrackRepository]
    PREP --> DB[(Playlists)]
    TREP --> DB2[(PlayListTrack)]
    H --> DTO[PlaylistDto or PlaylistTrackDto]
    DTO --> UI
```

## 12. Pipeline chuc nang 7 - Tim kiem va kham pha

```mermaid
flowchart LR
    UI[SearchPage or HomePage] --> API[SearchController or AIController]
    API --> Q[SearchQuery or GetRecommendationsQuery]
    Q --> H[Search or Recommendation Handler]
    H --> REP[ISearchRepository or IMediaRepository]
    REP --> DB[(Media Artist Album Playlist Genre)]
    H --> DTO[SearchResponse or RecommendationResult]
    DTO --> UI
```

## 13. Pipeline chuc nang 8 - Chia se media

```mermaid
flowchart LR
    UI[ShareModal] --> API[SharesController POST]
    API --> AUTH[JWT and sender validation]
    AUTH --> CMD[CreateShareCommand]
    CMD --> H[CreateShareCommandHandler]
    H --> CHECK[Validate receiver and media or playlist]
    CHECK --> REP[IShareRepository]
    REP --> DB[(MediaShares)]
    H --> N[Create notification]
    N --> DTO[ShareItemDto]
    DTO --> UI
```

## 14. Pipeline chuc nang 9 - Thong bao

```mermaid
flowchart LR
    SHARE[Share or follow side effect] --> DB[(Notifications)]
    DB --> HUB[INotificationHub and SignalR]
    HUB --> UICTX[NotificationContext]
    UICTX --> UI[NotificationsPage and unread badge]
    UI --> API[NotificationsController get or mark read]
    API --> REP[Notification repository]
    REP --> DB
```

## 15. Pipeline chuc nang 10 - Tuong tac va lich su

```mermaid
flowchart LR
    UI[PlayerBar or LikedSongsPage] --> API[InteractionsController]
    API --> AUTH[JWT and current user]
    AUTH --> CMD[ToggleFavoriteCommand or RecordPlayHistoryCommand]
    CMD --> H[Interaction Handler]
    H --> DB[(Favorites and PlayHistories)]
    H --> DTO[Favorite or history response]
    DTO --> UI[Updated liked state and recent history]
```

## 16. Luu y khi dua vao bao cao

- Du an chon Dapper, do do cac handler chi phu thuoc repository interface; SQL nam trong `Rhythmix.Infrastructure/Dapper`.
- Controller chi nhan request, lay JWT claim va goi MediatR; logic nghiep vu nam trong Application handler.
- Chuc nang 8 va 9 lien ket voi nhau: share thanh cong tao record chia se, luu notification va push SignalR.
- AI Recommendation la chuc nang bo sung: `AIController` goi query recommendation, doc history/favorite/catalog, sau do tra lai media ton tai trong CSDL.
