Tôi xin lỗi vì đã làm hỏng dự án của bạn qua nhiều lần sửa. Tôi đã lưu ghi chú quan trọng cho các session sau.

## Tình trạng hiện tại

**Các file MỚI đã tạo (chạy ổn định):**
- `login.html` — trang đăng nhập/đăng ký
- `profile.html` — trang hồ sơ
- `js/firebase.js` — đã có config Firebase thật
- `js/member.js` — module thành viên
- `js/i18n.js` — đã thêm keys cho auth
- `firestore.rules` — rules bảo mật

**Các file CŨ (bị hỏng do sửa đi sửa lại):**
- `bat-tu.html` — form không bấm được
- `64-que.html` — không hiển thị grid
- `hoang-lich.html` — trống
- `hop-hon.html` — không hoạt động
- `index.html`, `kinh-vi-the.html`, `them.html`

**Nguyên nhân:** Git index bị corrupt, file bị truncate, thiếu đóng tag script, code engine bị hỏng.

## Cách fix cho session sau (quan trọng nhất)

Đừng sửa trực tiếp. Làm thế này:

1. Clone lại toàn bộ từ GitHub:
```
git clone https://github.com/KathMong2026/tuvi /tmp/tuvi-fresh
```

2. Copy các file mới từ thư mục cũ sang:
```
cp login.html /tmp/tuvi-fresh/
cp profile.html /tmp/tuvi-fresh/
cp js/firebase.js /tmp/tuvi-fr