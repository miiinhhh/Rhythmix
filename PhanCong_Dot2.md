# Phân công công việc đợt 2

## Mục tiêu đợt 2

Hoàn thiện các phần tài liệu, báo cáo, AI, triển khai cloud và video demo cho project theo yêu cầu bài tập lớn.

## Phân công nhân sự

## Chi tiết công việc Frontend

### 1. Thanh Tuấn: Vẽ sơ đồ ERD

- Dựa theo file `Database/schema.sql`.
- Thể hiện đầy đủ các bảng chính:
  - `AspNetUsers`
  - `UserProfiles`
  - `Albums`
  - `MediaItems`
  - `Playlists`
  - `PlayListTrack`
  - `MediaShares`
  - `Notifications`
  - `Favorites`
  - `PlayHistories`
  - `Follows`
- Xuất file ERD dạng PDF hoặc PNG để đưa vào báo cáo.

### 2. Khoa: Hỗ trợ báo cáo phần frontend

## Video demo

Thời lượng: 5-8 phút.

Nội dung đề xuất:

1. Giới thiệu nhanh kiến trúc project.
2. Demo đăng ký, đăng nhập.
3. Demo upload/phát audio hoặc video.
4. Demo playlist.
5. Demo favorite và lịch sử nghe.
6. Demo chia sẻ media hoặc playlist.
7. Demo notification real-time bằng SignalR.
8. Demo AI Recommendation.
9. Demo cloud URL nếu đã deploy.

## Chi tiết công việc Backend

### 1. AI Gợi ý bài hát thông minh

Phụ trách bởi 2 backend.

Nhiệm vụ:

- Xây dựng use case AI Recommendation theo Clean Architecture.
- Dữ liệu đầu vào lấy từ:
  - `PlayHistories`
  - `Favorites`
  - `MediaItems`
- Gợi ý endpoint:
  - `GET /api/ai/recommendations`
- Tầng Application:
  - `GetRecommendationsQuery`
  - `GetRecommendationsHandler`
  - interface gọi AI service
- Tầng Infrastructure:
  - service gọi API AI
  - cấu hình API key trong `appsettings.Development.json` hoặc user secrets
- Không hardcode API key trong source code.

### 2. Tích hợp lên cloud

Phụ trách bởi cùng 2 backend làm AI.

Nhiệm vụ:

- Deploy backend lên cloud hoặc môi trường hosting phù hợp.
- Cấu hình connection string, CORS, JWT settings.
- Chuẩn bị hướng dẫn deploy trong README hoặc báo cáo.
- Nếu deploy frontend riêng, ghi rõ URL frontend và backend.

### 3. Báo cáo LaTeX

Phụ trách bởi 1 backend.

Báo cáo ngắn 5-10 trang PDF, viết bằng LaTeX, gồm:

- Kiến trúc hệ thống.
- Lý do chọn Dapper thay vì EF Core.
- Mô tả 10 chức năng chính:
  1. Xác thực.
  2. Hồ sơ người dùng.
  3. Thư viện media.
  4. Audio player.
  5. Video player.
  6. Playlist.
  7. Tìm kiếm và khám phá.
  8. Chia sẻ media.
  9. Thông báo real-time.
  10. Tương tác và lịch sử nghe.
- Khó khăn gặp phải.
- Hướng xử lý.
- Hướng dẫn chạy project local.
- Tài khoản seed dùng để demo.

## Sơ đồ pipeline

Cần chuẩn bị sơ đồ pipeline cho ít nhất 3 chức năng tiêu biểu:

1. Auth: register/login, tạo JWT.
2. Share Media: kiểm tra receiver, tạo share record, tạo notification.
3. Notifications: lưu thông báo, push SignalR, mark as read.

Pipeline nên thể hiện các bước:

```text
Request DTO
-> Validation
-> Authorization
-> MediatR Command/Query Handler
-> Dapper Repository/SQL
-> Side Effects
-> Response DTO
```

## ---------------------------------------------------------------------

## Checklist kiểm tra nội dung đã hoàn thành

- Source code backend và frontend.
- File `schema.sql` và seed data.
- ERD PDF/PNG.
- Sơ đồ pipeline.
- Báo cáo PDF từ LaTeX.
- Swagger/Postman collection hoặc screenshot test API.
- Video demo 5-8 phút.
- README hướng dẫn chạy local và deploy.
