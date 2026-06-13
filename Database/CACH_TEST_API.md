"""# HƯỚNG DẪN SỬ DỤNG POSTMAN ĐỂ TEST RHYTHMIX API
> **Thay thế cho Swagger UI trên .NET 10 (Native OpenAPI)**
> Hướng dẫn dành cho các thành viên trong nhóm phát triển dự án Rhythmix.

Do dự án dùng **.NET 10** và chuyển sang sử dụng **Native OpenAPI** (`Microsoft.OpenApi` v2.x) thay cho thư viện Swashbuckle Swagger cũ, hệ thống sẽ sinh ra đặc tả API thô tại `/openapi/v1.json`. Tức là Swagger không sử dụng ổn định trên .NET10.

Để việc kiểm thử (test) API diễn ra đồng bộ, mượt mà và chuyên nghiệp, toàn bộ thành viên sẽ chuyển sang sử dụng **Postman** theo các bước chuẩn hóa dưới đây.
Bắt buộc phải tải POSTMAN về rồi sử dụng giao diện trên web.
---

## BƯỚC 1: CẤU HÌNH BAN ĐẦU TRÊN POSTMAN (BẮT BUỘC)
Vì chúng ta đang chạy API ở môi trường Localhost với chứng chỉ bảo mật tự ký (hoặc chạy qua HTTP thông thường), Postman mặc định sẽ chặn kết nối. Hãy tắt tính năng này trước khi test:

1. Mở **Postman**, nhìn lên góc trên cùng bên phải và chọn biểu tượng **Bánh răng (Settings)** ➔ Chọn **Settings**.
2. Tại tab **General**, tìm dòng **SSL certificate verification**.
3. Chuyển trạng thái từ **ON** sang **OFF**.
4. Đóng bảng cài đặt.

---

## BƯỚC 2: IMPORT ĐẶC TẢ API VÀO POSTMAN
1. Bấm **F5** (hoặc chạy lệnh `dotnet run`) để khởi động dự án `Rhythmix.API`.
2. Xác định cổng Port và giao thức đang chạy (Ví dụ: `http://localhost:5269`).
3. Truy cập đường link đặc tả API thô trên trình duyệt:  
   `http://localhost:5269/openapi/v1.json` *(Thay đúng Port thực tế của bạn)*.
4. Trên giao diện Postman:
   * Bấm nút **Import** ở góc trên bên trái (hoặc nhấn `Ctrl + O`).
   * **Cách A (Nhanh):** Dán trực tiếp đường link `v1.json` ở trên vào ô nhập dữ liệu của Postman.
   * **Cách B (Ổn định nhất):** Nếu link localhost bị lỗi, hãy `Ctrl + A` ➔ `Ctrl + C` toàn bộ nội dung chữ hiển thị trên trình duyệt, sau đó dán thẳng văn bản thô (Raw Text) vào ô Import của Postman.
5. Nhấn **Import**. Lúc này, một thư mục (Collection) tên là **Rhythmix.API** sẽ xuất hiện ở cột bên trái.

---

## BƯỚC 3: CẤU HÌNH BIẾN MÔI TRƯỜNG TOÀN CỤC (`{{baseUrl}}`)
Để không phải sửa thủ công số Port ở từng API con mỗi khi .NET đổi cổng chạy, chúng ta sẽ đưa số Port về một biến dùng chung.

1. Nhấp chuột vào **tên thư mục gốc (Rhythmix.API)** ở cột bên trái.
2. Chọn tab **Variables** ở màn hình chính giữa.
3. Tại dòng có tên biến là `baseUrl`, di chuyển sang cột **Current Value**, điền địa chỉ gốc đang chạy dưới máy bạn.  
   * *Ví dụ:* `http://localhost:5269`
4. Nhấn **Ctrl + S** để lưu lại.
5. **Cách áp dụng:** Tại tất cả các API con (Login, Register, Logout...), hãy chỉnh sửa thanh địa chỉ URL theo cấu trúc tự động:  
   👉 `{{baseUrl}}/api/Auth/login`  
   👉 `{{baseUrl}}/api/Auth/logout`  
   *(Khi gõ đúng cú pháp, chữ `{{baseUrl}}` sẽ chuyển sang màu cam/xanh lá).*
6. Tương tự cho các chức năng khác cần gửi API.
---

## 🔑 BƯỚC 4: QUY TRÌNH LOGIN & CẤU HÌNH TOKEN DÙNG CHUNG

### 1. Gọi API Đăng nhập để lấy Token
1. Tìm đến API `POST /api/Auth/login` trong Collection.
2. Đảm bảo URL đã đổi thành: `{{baseUrl}}/api/Auth/login`
3. Vào tab **Body** ➔ Tích chọn **raw** ➔ Đổi mũi tên bên cạnh thành định dạng **JSON**.
4. Điền tài khoản test có sẵn trong Database:markdown_content = ""
5. Nhấn Send. Dưới phần kết quả trả về (Response), copy chuỗi mã mã hóa JWT dài ngoằng nằm trong trường data (không copy dấu ngoặc kép "").