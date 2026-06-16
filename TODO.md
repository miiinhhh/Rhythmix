# TODO - TuneVault auth & profile improvements

- [ ] Fix AuthModal: đăng ký gọi backend, hiển thị thông báo thành công, chuyển về login và yêu cầu login lại
- [ ] Fix AuthModal: login gọi backend, lưu token/currentUserId/currentUserName
- [ ] Bổ sung authService.register nếu chưa có
- [ ] ProfilePage: load profile bằng userService.getCurrentProfileMe() khi là user hiện tại
- [ ] ProfilePage: updateProfile và uploadAvatar khi bấm Lưu thay đổi (gọi API thật)
- [ ] Ensure Profile hiển thị đúng tên vừa đăng ký
- [ ] Test UI luồng Register/Login/Profile-edit

