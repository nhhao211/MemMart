# MarkFlow AI - Kế hoạch Triển khai Dự án

Dựa trên yêu cầu trong `requirement.md` và cấu trúc trong `structure-project.md`, đây là lộ trình triển khai chi tiết chia theo từng giai đoạn (Phase). Mục tiêu là xây dựng sản phẩm theo hướng Agile: làm đến đâu chạy được đến đó.

---

## Phase 1: Khởi tạo Project & Cơ sở Hạ tầng (Infrastructure)

**Mục tiêu:** Thiết lập khung dự án, cấu trúc thư mục và kết nối cơ sở dữ liệu.

### 1.1. Setup Workspace
- [ ] Tạo cấu trúc thư mục gốc `markflow-ai/` chứa `client` và `server`.
- [ ] Khởi tạo Git repository.
- [ ] Thiết lập file `.gitignore` chung.

### 1.2. Backend Setup (`/server`)
- [ ] Khởi tạo Node.js project (`package.json`).
- [ ] Cài đặt Express, Prisma, dotenv, cors, nodemon.
- [ ] Cấu hình **PostgreSQL** và kết nối qua Prisma.
- [ ] Định nghĩa Schema cơ bản: `User`, `Document` trong `schema.prisma`.
- [ ] Chạy migration khởi tạo DB.

### 1.3. Frontend Setup (`/client`)
- [ ] Khởi tạo Next.js 16 App Router.
- [ ] Cài đặt Tailwind CSS và **Shadcn/UI** (init).
- [ ] Cài đặt thư viện: `axios`, `zustand`, `@monaco-editor/react`, `lucide-react`.
- [ ] Setup cấu trúc thư mục Client (`components`, `services`, `store`).

---

## Phase 2: Core Editor & UI Framework (MVP Frontend)

**Mục tiêu:** Người dùng có thể viết Markdown và xem Preview ngay lập tức (chưa cần lưu DB).

### 2.1. Layout & UI Base
- [ ] Implement `ThemeProvider` (Dark/Light mode).
- [ ] Xây dựng Layout cơ bản: Sidebar, Header (Shell component).
- [ ] Tạo trang Dashboard trống (`/dashboard/page.tsx`).

### 2.2. Markdown Editor Module
- [ ] Xây dựng component `MarkdownEditor` dùng Monaco Editor.
- [ ] Xây dựng component `PreviewPane` dùng `react-markdown`.
- [ ] Tạo trang Editor (`/editor/[id]`) tích hợp Split View (50% code - 50% preview).
- [ ] Implement logic đồng bộ state giữa Editor và Preview (dùng Zustand `useDocStore`).

### 2.3. Rule-based Formatting (Local)
- [ ] Tạo hàm utility format text cơ bản ở Client (trim space, chuẩn hóa list).
- [ ] Gắn nút "Format" trên Toolbar để gọi hàm này.

---

## Phase 3: Backend Services & Authentication

**Mục tiêu:** Xây dựng API và bảo mật người dùng.

### 3.1. Authentication (Firebase + Server)
- [ ] Setup Firebase Project (Enable Auth Google).
- [ ] Client: Implement Login page & `AuthProvider` để lấy Token.
- [ ] Server: Setup `firebase-admin` sdk.
- [ ] Server: Viết `authMiddleware` để verify Token từ Client request.
- [ ] API: Tạo endpoint `POST /api/v1/auth/login` để sync user từ Firebase vào Postgres.

### 3.2. Document CRUD API
- [ ] API: `POST /docs` (Tạo doc mới).
- [ ] API: `GET /docs` (Lấy danh sách docs của user).
- [ ] API: `GET /docs/:id` (Lấy chi tiết doc).
- [ ] API: `PUT /docs/:id` (Lưu nội dung doc).
- [ ] API: `DELETE /docs/:id` (Xóa doc).

---

## Phase 4: Tích hợp Client-Server & Document Management

**Mục tiêu:** Người dùng có thể lưu bài viết, mở lại bài cũ và quản lý danh sách.

### 4.1. Kết nối Frontend - Backend
- [x] Setup Axios instance với Interceptor (tự động đính kèm Token vào header).
- [x] Viết `authService` và `docService` ở Client.

### 4.2. Dashboard & Editor Logic
- [x] Implement Dashboard: Hiển thị danh sách Document (Grid/List view).
- [x] Implement Create: Nút "New Document" -> Gọi API -> Chuyển trang Editor.
- [x] Implement Save:
    - [x] Nút "Save" thủ công.
    - [x] Hook `useAutoSave`: Tự động gọi API save sau 2s ngừng gõ.

---

## Phase 5: The "Magic" - AI & Smart Formatting

**Mục tiêu:** Tính năng "Killer Feature" - Dùng AI để làm đẹp bài viết.

### 5.1. Backend AI Service
- [x] Cấu hình API Key (OpenAI) trong `.env`.
- [x] Setup OpenAI SDK.
- [x] Viết prompt format Markdown trong service.
- [x] API: `POST /api/v1/ai/refine` nhận text thô -> trả về text đẹp.

### 5.2. Frontend Integration
- [x] Thêm nút "Magic Format" trên Toolbar Editor.
- [x] Xử lý UI Loading khi đang gọi AI (spinner trạng thái).
- [x] Nhận kết quả từ AI -> Update vào Editor content.

---

## Phase 6: Advanced Features & Polish

**Mục tiêu:** Hoàn thiện các tính năng phụ trợ và xuất bản.

### 6.1. Export & Image
- [ ] Backend: Logic convert Markdown -> DOCX (dùng thư viện `docx`).
- [ ] API: `GET /api/v1/docs/:id/export/docx`.
- [ ] Client: Handle Paste Image -> Upload lên Firebase Storage -> Chèn URL vào Editor.

### 6.2. Polish UX
- [ ] Thêm Toast Notification (Success/Error).
- [ ] Cải thiện Editor config (Line number, Minimap, Font settings).
- [ ] Review và fix bugs.

---

## Tổng kết Checklist theo Tech Stack

| Component | Technology | Phase |
|-----------|------------|-------|
| **Frontend** | Next.js, Zustand, Shadcn/UI | 1, 2, 4 |
| **Editor** | Monaco Editor, React-Markdown | 2 |
| **Backend** | Express, Node.js | 1, 3 |
| **Database** | PostgreSQL, Prisma | 1, 3 |
| **Auth** | Firebase Auth | 3 |
| **AI** | OpenAI/Gemini, LangChain | 5 |
| **Storage** | Firebase Storage | 6 |
