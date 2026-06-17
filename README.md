# Rhythmix - README (Local Setup)

Tài liệu này hướng dẫn chạy dự án local (backend), cấu hình connection string và thông tin tài khoản seed để đăng nhập.

---

## 1) Yêu cầu
- **.NET SDK** (để chạy ASP.NET Core)
- **SQL Server** (instance local)
- **Công cụ chạy SQL**: SQL Server Management Studio (SSMS) hoặc tương đương

---

## 2) Cấu hình database (schema + seed)

### 2.1. Kiểm tra/đặt connection string
Mở file:
- `Backend/Rhythmix.API/appsettings.json`

Trong mục:
- `ConnectionStrings` → `DefaultConnection`

Giá trị hiện tại (trong dự án):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost\\SQLEXPRESS02;Database=RhythmixDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
  }
}
```

> Nếu máy bạn **không dùng** instance `SQLEXPRESS02`, hãy đổi phần `Server=...` cho đúng.

### 2.2. Tạo database
- Tạo database tên: **`RhythmixDb`** (hoặc tạo đúng tên database theo connection string).

### 2.3. Chạy schema.sql
Chạy file:
- `Database/schema.sql`

### 2.4. Chạy seedData.sql
Chạy file:
- `Database/seedData.sql`

Sau bước này, các bảng sẽ có sẵn dữ liệu mẫu (bao gồm tài khoản để login).

---

## 3) Chạy backend local

### 3.1. Chạy bằng Visual Studio / dotnet
Từ thư mục gốc dự án, có thể chạy theo 1 trong 2 cách:

**Cách A (chạy theo solution):**
```bash
dotnet run --project Backend/Rhythmix.sln
```

**Cách B (khuyến nghị): chạy trực tiếp API project):**
```bash
dotnet run --project Backend/Rhythmix.API/Rhythmix.API.csproj
```

### 3.2. Swagger / API UI
Dựa trên `Backend/Rhythmix.API/Properties/launchSettings.json`, API sẽ chạy local tại:
- `http://localhost:5269` (http)
- `https://localhost:7193` (https)

Khi chạy ở môi trường Development, Swagger sẽ có trên:
- `http://localhost:5269/swagger`

---

## 4) Tài khoản seed (đăng nhập)
Dữ liệu seed nằm trong `Database/seedData.sql` (bảng `AspNetUsers`).

### Tài khoản 1
- **Email:** `jane@rhythmix.com`
- **Password:** `Jane123!`

### Tài khoản 2
- **Email:** `john@rhythmix.com`
- **Password:** `John123!`

---

## 5) Lưu ý về JWT
- API đăng nhập tại endpoint: `POST /api/Auth/login`
- Thành công sẽ trả về **token** (JWT). Token cần được gửi lại cho các request có `[Authorize]`.

---

## 6) Anthropic (AI)
Trong `Backend/Rhythmix.API/appsettings.json`, mục:
- `Anthropic.ApiKey` đang để trống.

Nếu bạn gọi các chức năng AI liên quan, hãy bổ sung API key trong cấu hình.

