Chào bạn, ý tưởng "vibe coding" một công cụ để tự động hóa quy trình "làm đẹp" và quản lý tài liệu Markdown từ AI là cực kỳ thiết thực. Vấn đề bạn gặp phải (formatting thủ công, copy-paste mất thời gian) là nỗi đau chung của rất nhiều developer hiện nay.

Dựa trên Tech Stack bạn chọn (NodeJS, Express, NextJS, Postgres, Firebase) và nhu cầu cụ thể, tôi xin phác thảo bản **Product Requirements Document (PRD)** rút gọn để bạn có thể bắt tay vào code ngay.

Tôi sẽ đặt tên tạm cho dự án này là **"MarkFlow AI"**.

---

### 1. Phân tích Yêu cầu & Luồng đi (Requirement Analysis)

**Vấn đề cốt lõi:**

1. **Input:** Nhận một đoạn text thô, lộn xộn từ AI (ChatGPT/Gemini/Claude) hoặc ghi chú nhanh.
2. **Process:** Cần format lại heading, code block, bold/italic, list tự động + AI viết lại cho chuyên nghiệp.
3. **Output:** File `.md` chuẩn, file `.docx` để báo cáo, hoặc lưu trữ để dùng lại (README).

**Luồng hoạt động chính (User Flow):**

1. User đăng nhập.
2. Tạo document mới -> Paste nội dung thô vào.
3. Nhấn nút "Magic Format" (Logic + AI).
4. Review lại ở chế độ Split View (Code/Preview).
5. Lưu vào thư mục (Project/Repo).
6. Export ra `.docx` hoặc copy `.md` để paste vào Github.

---

### 2. Yêu cầu Chức năng (Functional Requirements - FR)

Tôi chia làm 3 module chính để bạn dễ code theo dạng cuốn chiếu (agile).

#### Module 1: Editor & Auto-Formatter (Quan trọng nhất)

* **Markdown Editor:** Hỗ trợ syntax highlighting. (Gợi ý lib: `Monaco Editor` hoặc `CodeMirror`).
* **Live Preview:** Hiển thị kết quả render ngay lập tức bên cạnh (Split view).
* **Rule-based Formatting (Logic thường):**
* Tự động chuẩn hóa khoảng trắng (trim space).
* Tự động fix indentation cho code block.
* Chuẩn hóa list style (VD: chuyển `*` thành `-`).


* **AI Agent Processing (Logic thông minh):**
* **Tính năng:** "Refine this section".
* **Prompting ngầm:** Gửi nội dung text qua AI với prompt: *"Format lại đoạn này theo chuẩn cấu trúc technical documentation, thêm heading, sửa lỗi chính tả, giữ nguyên code block"*.
* **Tóm tắt/Generate:** Tự động tạo Table of Contents (TOC) hoặc Summary ở đầu bài.



#### Module 2: Document Management (Quản lý file)

* **CRUD Document:** Tạo, Đọc, Sửa, Xóa file Markdown.
* **Categorization:** Quản lý theo Tags hoặc Folder (VD: Folder "Learning", Folder "Project A").
* **Metadata:** Lưu ngày tạo, ngày sửa cuối, tác giả.
* **Auto-save:** Lưu nháp tự động vào LocalStorage hoặc Database để tránh mất khi reload.

#### Module 3: Export & Integration

* **Export to DOCX:** Chuyển đổi từ Markdown đã render sang file Word giữ nguyên định dạng (Heading, Bold, Code, Image).
* **Copy to Clipboard:** Copy nhanh Raw Markdown hoặc Rendered HTML.
* **Image Handling:** Nếu paste ảnh vào editor, tự động upload lên Firebase Storage và chèn link Markdown vào bài.

---

### 3. Yêu cầu Phi chức năng (Non-Functional Requirements - NFR)

* **Performance:** Tốc độ format phải dưới 2s (với Logic thường) và hiển thị trạng thái "Loading" rõ ràng khi gọi AI (vì AI sẽ chậm hơn).
* **UX/UI:** Giao diện tối giản (Minimalist), tập trung vào trải nghiệm viết (Focus mode). Dark mode là bắt buộc (cho vibe coding).
* **Security:**
* Authentication qua Firebase (Google Login).
* Bảo vệ API Key của AI (xử lý ở Backend ExpressJS, không lộ ở Client).


* **Scalability:** Thiết kế Database Schema để sau này có thể mở rộng tính năng "Share link" (public view).

---

### 4. Kiến trúc & Tech Stack Chi tiết

Bạn đã chọn stack rất ổn, đây là cách phối hợp các thư viện để "vibe coding" nhanh nhất:

* **Frontend (Next.js latest+ Tailwind):**
* **Framework:** Next.js (App Router).
* **UI Library:** **Shadcn/UI** (Highly recommend vì đẹp, code nằm trong project, dễ chỉnh sửa - đúng chất vibe coding).
* **State Management:** Zustand (gọn nhẹ hơn Redux).
* **Markdown Renderer:** `react-markdown` hoặc `markdown-to-jsx`.
* **Editor:** `@monaco-editor/react` (giống VS Code) hoặc `react-md-editor`.


* **Backend (NodeJS + ExpressJS):**
* Đóng vai trò API Gateway xử lý logic nặng và gọi AI.
* **AI SDK:** LangChainJS hoặc OpenAI SDK (để dựng AI Agent xử lý text).
* **Markdown Processor:** `remark` và `rehype` (để xử lý AST của markdown - logic format cứng).
* **Export Docx:** Thư viện `docx` (tạo file word bằng JS thuần) hoặc `pandoc` (nếu cài được trên server). Khuyên dùng `docx` npm package cho đơn giản.


* **Database (PostgreSQL + Prisma ORM):**
* Dùng **Prisma** để thao tác với Postgres cho nhanh (type-safe).
* Lưu nội dung bài viết dạng `TEXT` hoặc `JSON` (nếu muốn lưu lịch sử edit).


* **Storage & Auth (Firebase):**
* **Firebase Auth:** Quản lý user.
* **Firebase Storage:** Lưu ảnh khi user paste ảnh chụp màn hình vào bài viết.



---

### 5. Đề xuất Database Schema (PostgreSQL)

Để bạn hình dung cấu trúc dữ liệu:

```sql
-- Bảng Users (Sync uid từ Firebase)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  firebase_uid VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Documents
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  title VARCHAR(255) DEFAULT 'Untitled',
  content TEXT, -- Nội dung Markdown thô
  tags TEXT[], -- Mảng các tag
  status VARCHAR(50) DEFAULT 'draft', -- draft, archived
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

```