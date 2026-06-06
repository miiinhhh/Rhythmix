# Hướng dẫn chạy dự án TuneVault

## 1. Yêu cầu trước khi chạy
- .NET 10 SDK
- Node.js + npm
- SQL Server LocalDB hoặc SQL Server tương thích

## 2. Database hiện tại
Hiện tại backend đang dùng connection string trong `Backend/Rhythmix.API/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "localhost\\SQLEXPRESS02;Database=RhythmixDb;Trusted_Connection=True;MultipleActiveResultSets=true"
}
```

Vậy dự án mặc định dùng SQL Server và database tên `RhythmixDb`.

Nếu muốn đổi database, hãy sửa lại connection string trong `Backend/Rhythmix.API/appsettings.json`.

## 3. Chạy backend
1. Mở terminal ở thư mục gốc của dự án:
2. Chạy restore và build solution:
   ```powershell
   dotnet restore Backend\Rhythmix.sln
   dotnet build Backend\Rhythmix.sln
   ```
3. Chạy API:
  cd tới thư mục Backend
  rồi cd tới thư mục Rhythmix.API
  rồi chạy
   ```powershell
   dotnet run
   ```
   hoặc đứng ở thư mục ngoài Backend và chạy
   ```powershell
   dotnet run --project Backend\Rhythmix.API\Rhythmix.API.csproj
   ```

Sau khi chạy, API sẽ khởi động và hiển thị URL (thường là `https://localhost:5001` hoặc `http://localhost:5000`).

## 4. Chạy frontend
1. Vào thư mục frontend:
   ```powershell
   cd tune-vault-frontend
   ```
2. Cài đặt dependencies:
   ```powershell
   npm install
   ```
3. Chạy frontend dev server:
   ```powershell
   npm run dev
   ```

Frontend sẽ chạy mặc định trên `http://localhost:5173`.

## 5. Kiểm tra và truy cập
- Mở ứng dụng frontend trên trình duyệt tại: `http://localhost:5173`
- Backend Swagger (nếu API chạy): `https://localhost:5001/swagger` hoặc `http://localhost:5000/swagger`

## 6. Các lệnh hữu ích khác
- Build frontend production:
  ```powershell
  npm run build
  ```
- Xem frontend preview sau build:
  ```powershell
  npm run preview
  ```
- Chạy lại backend nếu thay đổi code:
  ```powershell
  dotnet run --project Backend\Rhythmix.API\Rhythmix.API.csproj
  ```

## 7. Lưu ý
- Nếu chưa có database `RhythmixDb`, LocalDB sẽ tạo khi bạn kết nối và chạy các truy vấn.
- Nếu muốn làm với SQL Server đầy đủ, sửa `DefaultConnection` sang instance của bạn.
- Backend sử dụng Dapper, các bảng cần tạo bằng script SQL trước khi chạy chức năng auth/profile nếu chưa có schema.
