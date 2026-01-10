Đây là cấu trúc thư mục tối ưu cho dự án **"MarkFlow AI"** theo mô hình **Client-Server** tách biệt. Cấu trúc này giúp bạn dễ dàng quản lý code, đặc biệt khi dùng Next.js (Frontend) và Express (Backend) cùng lúc.

Tôi đề xuất bạn tạo một folder gốc là `markflow-ai`, bên trong chứa 2 folder chính: `client` và `server`.

### 1. Tổng quan cấu trúc (Root)

```plaintext
markflow-ai/
├── client/          # Next.js 14/15 App Router (Frontend)
├── server/          # Express.js + Prisma (Backend)
├── README.md        # Document dự án
└── .gitignore       # Git ignore chung

```

---

### 2. Chi tiết Frontend (`/client`)

Dùng **Next.js App Router**, tối ưu cho việc sử dụng **Shadcn/UI** và **Zustand**.

```plaintext
client/
├── public/                 # Assets tĩnh (logo, images)
├── src/
│   ├── app/                # App Router (Pages & Layouts)
│   │   ├── (auth)/         # Route group cho Auth (Login/Register) - không ảnh hưởng URL
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/    # Route group cho App chính (để dùng chung DashboardLayout)
│   │   │   ├── layout.tsx  # Sidebar, Header nằm ở đây
│   │   │   ├── page.tsx    # Dashboard Home (List documents)
│   │   │   └── editor/
│   │   │       └── [id]/   # Trang viết bài: /editor/123
│   │   ├── api/            # Next.js API Routes (nếu cần proxy nhẹ, còn lại gọi sang server Express)
│   │   ├── globals.css     # Tailwind imports
│   │   ├── layout.tsx      # Root Layout
│   │   └── page.tsx        # Landing page (Marketing page)
│   │
│   ├── components/
│   │   ├── ui/             # Các atomic component của Shadcn (Button, Input, Dialog...)
│   │   ├── editor/         # Các component liên quan Editor
│   │   │   ├── MarkdownEditor.tsx
│   │   │   ├── PreviewPane.tsx
│   │   │   └── Toolbar.tsx
│   │   ├── common/         # Sidebar, Header, Footer
│   │   └── providers/      # ThemeProvider, AuthProvider
│   │
│   ├── hooks/              # Custom Hooks (useAutoSave, useKeyboardShortcuts)
│   ├── lib/                # Cấu hình library
│   │   ├── firebase.ts     # Firebase Client SDK config
│   │   ├── utils.ts        # Hàm tiện ích (clsx, tailwind-merge)
│   │   └── axios.ts        # Axios instance đã config base URL + Interceptors
│   │
│   ├── services/           # Gọi API xuống Backend (Clean Architecture)
│   │   ├── authService.ts
│   │   ├── docService.ts
│   │   └── aiService.ts
│   │
│   ├── store/              # State Management (Zustand)
│   │   └── useDocStore.ts  # Quản lý state của document đang viết
│   │
│   └── types/              # TypeScript interfaces (User, Document, APIResponse)
│
├── .env.local              # Biến môi trường Frontend
├── next.config.mjs
├── tailwind.config.ts
└── package.json

```

---

### 3. Chi tiết Backend (`/server`)

Dùng **Express.js** mô hình Controller-Service, kết hợp **Prisma ORM** và **LangChain** (cho AI).

```plaintext
server/
├── prisma/
│   ├── schema.prisma       # Định nghĩa Database Schema
│   └── migrations/         # Lịch sử thay đổi DB
│
├── src/
│   ├── config/             # Cấu hình hệ thống
│   │   ├── firebase.js     # Firebase Admin SDK (để verify token từ client)
│   │   ├── db.js           # Prisma Client instance
│   │   └── openai.js       # Config OpenAI/Gemini API Key
│   │
│   ├── controllers/        # Xử lý Request/Response (Validate input, gọi Service)
│   │   ├── authController.js
│   │   ├── docController.js
│   │   └── aiController.js # Xử lý các request liên quan đến AI format
│   │
│   ├── services/           # Chứa Business Logic & AI Logic (Nơi "Vibe Coding" chính)
│   │   ├── docService.js   # CRUD document
│   │   ├── exportService.js# Logic xuất file .docx
│   │   └── aiAgent/        # Module AI Agent
│   │       ├── prompts.js  # Lưu các câu prompt mẫu (System prompts)
│   │       └── formatter.js# Logic dùng LangChain xử lý text
│   │
│   ├── middlewares/        # Middleware
│   │   ├── authMiddleware.js # Check Firebase Token
│   │   └── errorMiddleware.js# Xử lý lỗi tập trung
│   │
│   ├── routes/             # Định nghĩa API Endpoint
│   │   ├── v1/
│   │   │   ├── authRoutes.js
│   │   │   ├── docRoutes.js
│   │   │   └── index.js
│   │
│   ├── utils/              # Hàm hỗ trợ (Logger, Helper)
│   └── app.js              # Entry point của Express App
│
├── .env                    # Biến môi trường Backend (Database URL, API Keys)
├── server.js               # File chạy server
└── package.json

```

---

### 4. Tại sao cấu trúc này phù hợp để "Vibe Coding"?

1. **Separation of Concerns (Tách biệt mối quan tâm):**
* Bạn không bị rối giữa code giao diện (React) và code xử lý AI (NodeJS).
* Khi muốn chỉnh prompt cho AI, bạn chỉ cần vào `server/src/services/aiAgent`, không sợ làm hỏng giao diện.


2. **Module hóa Components:**
* Thư mục `components/ui` tách biệt giúp bạn copy-paste component của Shadcn vào rất nhanh mà không cần suy nghĩ nhiều.
* `components/editor` gom nhóm logic phức tạp nhất lại một chỗ.


3. **Scalability (Khả năng mở rộng):**
* Sau này bạn muốn thêm tính năng "Share Public Link", bạn chỉ cần thêm route mới trong `server` và page mới trong `client` mà không cần đập đi xây lại.


4. **Zustand Store:**
* Để ở `client/src/store` giúp bạn quản lý trạng thái văn bản (đang gõ, đang loading AI, kết quả preview) cực gọn nhẹ, không cồng kềnh như Redux.



### Next Step cho bạn:

Bạn có muốn tôi cung cấp nội dung file **`package.json`** cho cả 2 folder để bạn chạy lệnh `npm install` một lần là có đủ các thư viện cần thiết không?