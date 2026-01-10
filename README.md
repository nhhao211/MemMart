# MemMart - AI-Powered Markdown Editor

> Markdown editor với AI formatting và Google authentication

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Express](https://img.shields.io/badge/Express-5-green)
![Firebase](https://img.shields.io/badge/Firebase-Auth-orange)
![Prisma](https://img.shields.io/badge/Prisma-ORM-blue)

---

## 🚀 Features

- ✅ **Google Sign-In** - One-click authentication với Google account
- ✅ **Rich Markdown Editor** - Monaco Editor với syntax highlighting
- ✅ **Real-time Preview** - Live preview với custom styling
- ✅ **Auto-save** - Tự động lưu sau 2s ngừng gõ
- ✅ **Smart Formatting** - Rule-based Markdown formatting
- 🔜 **AI Magic Format** - AI-powered content improvements (Phase 5)
- ✅ **Protected Routes** - Secure authentication flow
- ✅ **Dark/Light Mode** - Theme toggle với next-themes

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework với App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Shadcn/UI** - Component library
- **Monaco Editor** - Code editor
- **React Markdown** - Markdown renderer
- **Zustand** - State management
- **Firebase Auth** - Google Sign-In

### Backend
- **Express.js** - Node.js framework
- **Prisma ORM** - Database toolkit
- **SQLite** - Local database (dev)
- **Firebase Admin SDK** - Token verification

---

## 📁 Project Structure

```
MemMart/
├── client/                 # Frontend (Next.js)
│   ├── app/               # App Router pages
│   │   ├── (dashboard)/   # Protected routes
│   │   │   ├── dashboard/ # Dashboard page
│   │   │   └── editor/    # Editor page
│   │   ├── login/         # Google Sign-In page
│   │   └── page.tsx       # Landing page
│   ├── components/        # React components
│   │   ├── common/        # Header, Sidebar, etc.
│   │   ├── editor/        # Editor components
│   │   ├── providers/     # Context providers
│   │   └── ui/           # Shadcn components
│   ├── lib/              # Utilities
│   ├── services/         # API services
│   ├── store/            # Zustand store
│   └── hooks/            # Custom hooks
│
└── server/               # Backend (Express)
    ├── src/
    │   ├── config/       # Firebase, Database
    │   ├── controllers/  # Route handlers
    │   ├── middlewares/  # Auth middleware
    │   └── routes/       # API routes
    └── prisma/           # Database schema
```

---

## 🔥 Quick Start

### Prerequisites
- Node.js 18+
- npm/yarn
- Firebase project với Google Sign-In enabled

### 1. Clone & Install
```bash
git clone <repo-url>
cd MemMart

# Install dependencies
cd client && npm install
cd ../server && npm install
```

### 2. Setup Firebase (Required)

Xem chi tiết: [GOOGLE_SIGNIN_SETUP.md](GOOGLE_SIGNIN_SETUP.md)

**Quick version:**
1. Firebase Console → Enable Google Sign-In
2. Download service account JSON
3. Update `server/.env` và `client/.env.local`

### 3. Setup Database
```bash
cd server
npx prisma migrate dev
```

### 4. Run Development Servers
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

### 5. Open Browser
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## 🔑 Authentication Flow

1. User clicks **"Continue with Google"**
2. Google OAuth popup opens
3. User selects account
4. Firebase verifies & returns token
5. Backend syncs user to database
6. Redirect to Dashboard

**No passwords, no forms, just Google.**

---

## 📚 Documentation

- [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) - Full auth flow guide
- [GOOGLE_SIGNIN_SETUP.md](GOOGLE_SIGNIN_SETUP.md) - Quick setup guide
- [SETUP_FIREBASE.md](SETUP_FIREBASE.md) - Detailed Firebase setup
- [project-plan.md](project-plan.md) - Project roadmap
- [structure-project.md](structure-project.md) - Architecture details

---

## 🎯 Project Phases

- ✅ **Phase 1:** Infrastructure Setup
- ✅ **Phase 2:** Core Editor & UI
- ✅ **Phase 3:** Backend Services & Auth
- ✅ **Phase 4:** Client-Server Integration (Google Sign-In)
- 🔜 **Phase 5:** The Magic (AI Formatting)
- 🔜 **Phase 6:** Production Polish

---

## 🔒 Environment Variables

### Server (.env)
```env
DATABASE_URL="file:./dev.db"
PORT=5000
NODE_ENV=development

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

OPENAI_API_KEY=your-openai-key
CLIENT_URL=http://localhost:3000
```

### Client (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api

NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Sync user after Firebase auth
- `GET /api/v1/auth/profile` - Get current user

### Documents
- `GET /api/v1/docs` - List user's documents
- `POST /api/v1/docs` - Create document
- `GET /api/v1/docs/:id` - Get document
- `PUT /api/v1/docs/:id` - Update document
- `DELETE /api/v1/docs/:id` - Delete document

All endpoints require Firebase ID token in Authorization header.

---

## 🎨 Design System

- **Font:** Poppins (headings), Open Sans (body), JetBrains Mono (code)
- **Colors:** Trust Blue primary, OLED Dark background
- **Theme:** Dark mode by default, light mode available
- **Components:** Glassmorphism effects, smooth animations

---

## 🧪 Testing

```bash
# Backend tests (coming soon)
cd server
npm test

# Frontend tests (coming soon)
cd client
npm test
```

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd client
vercel deploy
```

### Backend (Railway/Render)
```bash
cd server
# Follow platform-specific deployment guide
```

**Remember:** Update environment variables in production!

---

## 🤝 Contributing

Currently in active development. Contributions welcome after Phase 6.

---

## 📝 License

MIT License - See LICENSE file

---

## 👤 Author

**MemMart Team**

---

## 🎯 Roadmap

### Current: Phase 4 ✅
- [x] Google Sign-In integration
- [x] Protected routes
- [x] Auto-save functionality
- [x] Full CRUD operations

### Next: Phase 5 🔜
- [ ] OpenAI API integration
- [ ] Magic Format button
- [ ] AI-powered suggestions
- [ ] Content improvements

### Future: Phase 6
- [ ] Production deployment
- [ ] Performance optimization
- [ ] Advanced features
- [ ] Testing suite

---

**Built with ❤️ using Next.js, Express, Firebase, and AI**
