# Website STEM TOWN

Mã nguồn website STEM TOWN, dựng bằng **Eleventy (11ty)** — toàn bộ nội dung (chữ, ảnh, các trang) đều chỉnh sửa được qua trang quản trị **Decap CMS** tại `/admin`, đăng nhập bằng GitHub OAuth ("Decap Bridge") chạy trên **Netlify Functions**.

## Cấu trúc dự án

```
stemtown-website/
├── admin/                  → Trang quản trị Decap CMS
│   ├── index.html
│   └── config.yml          → Khai báo toàn bộ mục nội dung có thể chỉnh sửa
├── netlify/functions/      → 2 hàm xử lý đăng nhập GitHub OAuth (Decap Bridge)
│   ├── auth.js
│   └── callback.js
├── src/
│   ├── _data/site.json     → Thông tin chung: logo, liên hệ, mạng xã hội, menu
│   ├── _includes/          → Layout, header, footer dùng chung
│   ├── content/
│   │   ├── home.json       → Nội dung trang chủ
│   │   ├── about.json      → Nội dung trang Giới thiệu
│   │   ├── contact.json    → Nội dung trang Liên hệ
│   │   ├── team/*.json     → Đội ngũ chuyên gia (mỗi người 1 file)
│   │   ├── courses/*.json  → Các khóa học (mỗi khóa 1 file)
│   │   ├── testimonials/*.json → Đánh giá học viên
│   │   ├── partners/*.json → Đối tác
│   │   └── policies/*.md   → Các trang chính sách (Markdown)
│   ├── images/uploads/     → Nơi lưu ảnh tải lên từ CMS
│   ├── css/styles.css
│   ├── js/main.js
│   ├── index.njk, about-us.njk, khoa-hoc.njk, lien-he.njk, chinh-sach.njk
├── .eleventy.js             → Cấu hình Eleventy
├── netlify.toml              → Cấu hình build & redirect cho Netlify
└── package.json
```

> **Lưu ý về hình ảnh:** repo này có sẵn ảnh placeholder (màu nền + chữ) để bạn xem trước bố cục. Hãy vào trang quản trị và **thay toàn bộ ảnh bằng ảnh thật** của STEM TOWN (logo, ảnh không gian, ảnh đội ngũ...).

---

## BƯỚC 1 — Đưa code lên GitHub

```bash
cd stemtown-website
git init
git add .
git commit -m "Khởi tạo website STEM TOWN"
git branch -M main
git remote add origin https://github.com/<GITHUB_USERNAME>/<TEN_REPO>.git
git push -u origin main
```

Repo có thể để **Private** — Decap CMS vẫn hoạt động bình thường qua OAuth.

---

## BƯỚC 2 — Tạo site trên Netlify

1. Vào [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project** → chọn repo GitHub vừa tạo.
2. Cấu hình build (thường Netlify tự đọc từ `netlify.toml`, chỉ cần xác nhận):
   - **Build command:** `npm run build`
   - **Publish directory:** `_site`
3. Bấm **Deploy site**. Sau khi deploy xong bạn sẽ có một domain dạng `https://ten-site-ngau-nhien.netlify.app` (đổi tên site trong *Site settings → General → Site details → Change site name* nếu muốn URL đẹp hơn, hoặc gắn domain riêng `stemtown.edu.vn` tại **Domain settings**).

---

## BƯỚC 3 — Tạo GitHub OAuth App (để đăng nhập trang quản trị)

Đây là phần **"Decap Bridge"** — dùng OAuth App của GitHub thay vì Netlify Identity.

1. Vào GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Điền:
   - **Application name:** `STEM TOWN CMS`
   - **Homepage URL:** `https://ten-site-cua-ban.netlify.app`
   - **Authorization callback URL:** `https://ten-site-cua-ban.netlify.app/api/callback`
3. Bấm **Register application**, sau đó **Generate a new client secret**.
4. Lưu lại **Client ID** và **Client secret**.

### Khai báo biến môi trường trên Netlify

Vào Netlify → site vừa tạo → **Site configuration → Environment variables**, thêm:

| Key | Value |
|---|---|
| `OAUTH_GITHUB_CLIENT_ID` | Client ID vừa tạo |
| `OAUTH_GITHUB_CLIENT_SECRET` | Client secret vừa tạo |

Sau khi thêm biến môi trường, vào **Deploys → Trigger deploy → Deploy site** để build lại với biến mới.

---

## BƯỚC 4 — Cập nhật `admin/config.yml`

Mở `admin/config.yml`, sửa 2 dòng đầu cho đúng với repo/site thật của bạn:

```yaml
backend:
  name: github
  repo: <GITHUB_USERNAME>/<TEN_REPO>          # ví dụ: stemtown/stemtown-website
  branch: main
  base_url: https://ten-site-cua-ban.netlify.app
  auth_endpoint: api/auth
```

Commit & push lại thay đổi này lên GitHub — Netlify sẽ tự build lại.

---

## BƯỚC 5 — Đăng nhập trang quản trị

1. Truy cập `https://ten-site-cua-ban.netlify.app/admin`
2. Bấm **Login with GitHub**, cho phép ứng dụng truy cập.
3. Bạn cần có quyền **write** trên repo GitHub đó (là chủ repo, hoặc được mời làm collaborator) để đăng nhập/chỉnh sửa thành công.
4. Sau khi đăng nhập, bạn sẽ thấy các mục:
   - **Cài đặt chung** — logo, thông tin liên hệ, mạng xã hội, menu
   - **Trang chủ** — banner, giới thiệu STEM, câu chuyện thương hiệu, không gian, khối khóa học
   - **Trang Giới thiệu / Trang Liên hệ**
   - **Đội ngũ chuyên gia**, **Khóa học**, **Đánh giá học viên**, **Đối tác** — thêm/sửa/xóa từng mục
   - **Trang Chính sách** — soạn thảo Markdown cho các trang chính sách

Mỗi lần bấm **Publish**, Decap CMS sẽ tự commit thay đổi vào GitHub → Netlify tự động build & deploy lại (thường mất 1–2 phút).

> Chế độ `publish_mode: editorial_workflow` trong `config.yml` cho phép lưu nháp trước khi publish chính thức — nếu muốn xuất bản ngay lập tức không qua nháp, đổi thành `publish_mode: simple` hoặc xóa dòng đó.

---

## Chạy thử trên máy local (tuỳ chọn)

```bash
npm install
npm run start
```

Mở `http://localhost:8080`. (Trang `/admin` cần chạy qua Netlify để OAuth hoạt động — dùng lệnh `npx netlify-cli dev` nếu muốn test cả CMS ở local.)

---

## Form liên hệ

Trang `/lien-he/` đã dùng **Netlify Forms** (`data-netlify="true"`), tự động nhận submit — xem kết quả tại Netlify → site → **Forms**, không cần backend riêng.

---

## Các trang hiện có

| Trang | Đường dẫn |
|---|---|
| Trang chủ | `/` |
| Giới thiệu | `/about-us/` |
| Khóa học | `/khoa-hoc/` |
| Liên hệ | `/lien-he/` |
| Chính sách (tự sinh từ mỗi file trong `src/content/policies/`) | `/chinh-sach/<slug>/` |
| Quản trị | `/admin` |

Muốn thêm trang mới: tạo file `.njk` mới trong `src/`, hoặc nhân bản mẫu `folder collection` như `courses`/`team` nếu là danh sách lặp lại.
