# NBH Helmet - Hướng Dẫn Phát Triển Dự Án

Tài liệu này cung cấp các lệnh, tiêu chuẩn thiết kế, phong cách lập trình và cấu trúc thư mục cho dự án website doanh nghiệp bán mũ bảo hiểm **NBH**. Website hướng tới phong cách tối giản, hiện đại, và chuyên nghiệp.

---

## 🛠️ Lệnh Phát Triển & Xây Dựng

Dự án sử dụng **Vite** với cấu hình HTML, CSS và JavaScript thuần (Vanilla JS) để tối ưu hiệu năng và độ linh hoạt cao nhất.

### Cài Đặt & Chạy Môi Trường Phát Triển
*   Cài đặt dependencies: `npm install`
*   Chạy dev server: `npm run dev` (chạy local server tại `http://localhost:5173`)
*   Xây dựng bản production: `npm run build`
*   Xem trước bản build: `npm run preview`

---

## 📐 Kiến Trúc & Cấu Trúc Thư Mục

Cấu trúc thư mục tối giản, rõ ràng và dễ bảo trì:

```text
nbh/
├── index.html            # Trang chủ chính
├── package.json          # Cấu hình dự án & dependencies
├── vite.config.js        # Cấu hình Vite
├── CLAUDE.md             # File hướng dẫn này (tài liệu này)
├── public/               # Tài nguyên tĩnh (Logo NBH, ảnh sản phẩm)
│   └── assets/           # Font, icon, favicon
└── src/                  # Mã nguồn chính
    ├── css/
    │   ├── main.css      # CSS chính, chứa Design System (Biến HSL, Reset, Typography)
    │   └── components.css # CSS cho các component (Navbar, Product Card, Modal, Footer)
    └── js/
        ├── main.js       # Logic khởi tạo & điều phối chính
        ├── products.js   # Dữ liệu sản phẩm & bộ lọc danh mục
        └── theme.js      # Logic chuyển đổi Dark/Light mode
```

---

## 🎨 Tiêu Chuẩn Thiết Kế & Giao Diện (Design System)

Phong cách: **Tối giản (Minimalist), Hiện đại (Modern), và Chuyên nghiệp (Professional)**. Lấy cảm hứng từ website mẫu của đối tác, tập trung vào hình ảnh sản phẩm chất lượng cao, khoảng trắng hợp lý và hiệu ứng chuyển động tinh tế.

### 1. Bảng Màu (Color Palette - HSL)
*   **Chủ đạo (Primary):** `hsl(220, 90%, 56%)` (Xanh hiện đại, chuyên nghiệp)
*   **Phụ trợ (Secondary):** `hsl(260, 80%, 48%)` (Tím ánh kim tạo điểm nhấn công nghệ/cao cấp)
*   **Nền (Background):**
    *   *Light Mode:* `hsl(210, 20%, 98%)` (Trắng xám nhẹ, dịu mắt)
    *   *Dark Mode:* `hsl(220, 30%, 6%)` (Đen sâu/Xanh đen huyền bí)
*   **Bề mặt (Surface/Card):**
    *   *Light Mode:* `hsl(0, 0%, 100%)` với viền siêu mỏng `hsla(0, 0%, 0%, 0.05)`
    *   *Dark Mode:* `hsl(220, 25%, 10%)` với hiệu ứng kính mờ (Glassmorphism): `hsla(220, 25%, 10%, 0.7)` cùng `backdrop-filter: blur(12px)`
*   **Trạng thái (Status):**
    *   *Thành công (Success):* `hsl(140, 70%, 45%)` (Xanh lá pastel)
    *   *Cảnh báo (Warning):* `hsl(40, 90%, 55%)` (Vàng cam ấm)

### 2. Phông Chữ (Typography)
*   Font chữ chính: **Outfit** hoặc **Inter** (từ Google Fonts) để mang lại cảm giác công nghệ, sạch sẽ, dễ đọc.
*   **Tiêu đề (Headings):** Font-weight `700` hoặc `800`, chữ in hoa nhẹ hoặc khoảng cách ký tự (`letter-spacing: -0.02em`) để tạo sự cá tính.
*   **Nội dung (Body):** Font-weight `400` hoặc `500`, chiều cao dòng thoáng (`line-height: 1.6`), màu chữ xám đậm/xám nhạt tùy chế độ để đảm bảo tỷ lệ tương phản cao (WCAG AA).

### 3. Hiệu Ứng Chuyển Động (Micro-animations)
*   **Hover hiệu ứng thẻ (Card Hover):** Phóng to nhẹ (`transform: translateY(-4px) scale(1.02)`), tăng bóng mờ mềm mại (`box-shadow`), đổi màu viền sang màu chủ đạo.
*   **Chuyển đổi theme:** Chuyển đổi mượt mà giữa Light/Dark mode sử dụng hiệu ứng transition kéo dài `0.3s ease-in-out` trên thuộc tính `background-color`, `color`, `border-color`.
*   **Hiệu ứng tải trang:** Fade-in các nhóm sản phẩm bằng CSS Intersection Observer API khi cuộn màn hình.

---

## 🔒 Quy Tắc Lập Trình An Toàn (Secure Coding Rules)

Áp dụng nghiêm ngặt các quy tắc an toàn bảo mật để bảo vệ người dùng và dữ liệu doanh nghiệp:

1.  **Chống tấn công XSS (Cross-Site Scripting):**
    *   **TUYỆT ĐỐI KHÔNG** sử dụng `element.innerHTML` khi hiển thị dữ liệu sản phẩm, thông tin người dùng, hoặc phản hồi từ form.
    *   **LUÔN LUÔN** sử dụng `element.textContent` hoặc `element.innerText` để gán chuỗi văn bản.
    *   Nếu cần tạo cấu trúc HTML động, hãy sử dụng `document.createElement()` hoặc hàm helper render an toàn có lọc ký tự đặc biệt (Sanitization).
2.  **Xác thực Form phía Client & Server:**
    *   Form liên hệ/đặt mua sản phẩm phải được validate định dạng (Email, Số điện thoại, Tên) bằng Regex nghiêm ngặt trước khi gửi.
    *   Sử dụng thuộc tính `autocomplete`, `required` và `pattern` chuẩn của HTML5.
3.  **Tối ưu SEO & Khả năng truy cập (Accessibility):**
    *   Mỗi trang bắt buộc có duy nhất 1 thẻ `<h1>`.
    *   Các thẻ `<img>` sản phẩm bắt buộc phải có thuộc tính `alt` mô tả trực quan và ý nghĩa để tối ưu tìm kiếm của Google và hỗ trợ trình đọc màn hình.
    *   Tất cả các phần tử tương tác (Nút, Liên kết, Form) phải có `id` hoặc `class` duy nhất để thuận tiện cho việc kiểm thử tự động.

---

## 📋 Danh Sách Tính Năng Cần Hiện Thực

1.  **Trang Chủ (Hero Section):** Slide banner hoành tráng giới thiệu thương hiệu NBH với slogan ấn tượng và nút CTA (Call to Action) thu hút.
2.  **Danh Mục Sản Phẩm (Products Grid):**
    *   Bộ lọc thông minh (Mũ Fullface, Mũ 3/4, Mũ Nửa Đầu, Mũ Trẻ Em).
    *   Sắp xếp theo giá hoặc độ phổ biến.
    *   Xem nhanh chi tiết sản phẩm (Quick View) qua cửa sổ Popup/Modal hiện đại.
3.  **Về Chúng Tôi (About Us):** Câu chuyện thương hiệu NBH, cam kết chất lượng chuẩn an toàn quốc tế, quy trình sản xuất.
4.  **Liên Hệ & Tư Vấn (Contact Form):** Form gửi yêu cầu tư vấn kích cỡ mũ, đặt hàng doanh nghiệp số lượng lớn.
5.  **Chuyển Đổi Dark/Light Mode:** Nút chuyển đổi nhanh ở góc trên cùng của thanh điều hướng (Navbar).
