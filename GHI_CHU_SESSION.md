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
cp js/firebase.js /tmp/tuvi-fresh/js/
cp js/member.js /tmp/tuvi-fresh/js/
cp js/i18n.js /tmp/tuvi-fresh/js/
cp firestore.rules /tmp/tuvi-fresh/
cp GHI_CHU_SESSION.md /tmp/tuvi-fresh/
```

3. KHÔNG chạm vào 7 trang cũ (bat-tu, index, hop-hon, hoang-lich, 64-que, kinh-vi-the, them) — giữ nguyên từ GitHub.

4. **Cách an toàn nhất để thêm auth vào 7 trang cũ:**
   - Mỗi trang chỉ cần thêm ĐÚNG 5 dòng vào cuối `<head>` (trước `</head>`):
     ```html
     <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
     <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
     <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
     <script src="js/firebase.js"></script>
     <script src="js/member.js"></script>
     ```
   - Và thêm ĐÚNG 1 khối vào cuối `<body>` (trước `</body>`):
     ```html
     <script>
     document.addEventListener('DOMContentLoaded', function() {
       if (typeof HCD !== 'undefined' && HCD.member) {
         HCD.member.renderNavAuth('.kd-nav');
       }
     });
     </script>
     ```
   - KHÔNG sửa bất kỳ dòng nào khác trong file.

5. Push lên và test.
