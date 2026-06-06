# Phân công công việc - Dự án TuneVault

## Tổng quan
Nhóm 6 người: 2 frontend, 4 backend.
Dự án sử dụng Dapper cho backend, AI & Cloud làm sau.

---

## Frontend

### THANH TUẤN: UI / Layout / Media Player
- Xây dựng layout chính:
  - Sidebar trái: Home, Search, Library.
  - Vùng nội dung, player bar cố định phía dưới.
- Thiết kế giao diện dark theme giống Spotify.
- Tạo các màn hình:
  - Login / Register
  - Home
  - Search
  - Library
  - Playlist Detail
  - Share Inbox
  - Notifications
  - Profile
- Xây dựng audio player và video player:
  - Play / pause / seek
  - Hiển thị track đang phát
  - Queue đơn giản
  - Video player full-page hoặc modal

### KHOA: API / State / SignalR
- Xây dựng lớp service API với Axios/Fetch.
- Quản lý JWT, protected routes, redirect khi hết phiên.
- Tích hợp các chức năng:
  - Upload media
  - Playlist CRUD
  - Search / discovery
  - Share media
  - Notifications
  - Favorite / play history
- Kết nối SignalR để nhận badge thông báo chưa đọc.
- Hiển thị loading/error state cho upload và playback.
- Định nghĩa TypeScript interface khớp DTO backend.

---

## Backend

###  MINH: Foundation & Authentication (Viết code dapper tương ứng)
- Thiết lập solution theo Clean Architecture 4 layer:
  - Domain
  - Application
  - Infrastructure
  - API
- Thiết kế repository pattern dùng Dapper:
  - Interface repository
  - Parameterized queries
  - Transaction khi cần
- Xây dựng authentication + user profile:
  - Register / Login
  - JWT issuance
  - Protected endpoints
  - Profile view/update
- Chuẩn bị SQL script tạo bảng và seed data mẫu.

### QUỐC TUẤN: Upload và Streaming Media (Viết code dapper tương ứng)
- Xây dựng feature upload media:
  - Multipart file upload
  - Validate extension/MIME audio và video
  - Lưu file lên disk
  - Lưu metadata vào SQL
- Xây dựng streaming endpoint:
  - Playback audio
  - Streaming video
  - Hỗ trợ Range header cho video
- Tạo service lưu trữ file và repository Dapper cho `MediaItem`.

### THÁI: Playlist / Search / Share (Viết code dapper tương ứng)
- Xây dựng playlist CRUD:
  - Create playlist
  - Thêm/xóa track
  - Playlist public/private
- Xây dựng search/discovery:
  - Tìm theo tên bài, nghệ sĩ, playlist
  - Phân trang
- Xây dựng chia sẻ media:
  - Share track/playlist/video cho user khác
  - "Shared with me" / "Shared by me"
  - Validate receiver tồn tại, tránh share trùng nếu cần.

### KHÔI: Notifications / History / API Docs (Viết code dapper tương ứng)
- Xây dựng Notification + SignalR Hub:
  - Thông báo khi media được chia sẻ
  - Thông báo follow hoặc playlist share
  - Mark as read
- Xây dựng favorite / play history:
  - Toggle favorite
  - Record play history
  - Lấy 10 item gần nhất
- Hoàn tất API:
  - Swagger/OpenAPI
  - Response format chuẩn
  - CORS cho frontend React

---

## Gợi ý phân chia theo chức năng chính
1. Authentication + Profile
2. Media upload + Streaming
3. Playlist + Search
4. Share + Notifications
5. Favorite + History
6. UI Layout + API integration

---

## Lưu ý
- Backend phải dùng Dapper nhất quán toàn dự án.
- AI generative và Cloud là phần bonus xử lý sau khi hoàn thành chức năng chính.

### DEADLINE HẾT NGÀY 13/6/2026