# 📂 Lotus Video Frontend - Complete File Structure

## Full Directory Tree

```
frontend/
│
├── 📄 package.json                    # Dependencies and scripts
├── 📄 vite.config.js                  # Vite configuration
├── 📄 tailwind.config.js              # Tailwind CSS config (dark theme)
├── 📄 postcss.config.js               # PostCSS for Tailwind
├── 📄 index.html                      # Entry HTML file
├── 📄 .eslintrc.cjs                   # ESLint configuration
├── 📄 .gitignore                      # Git ignore rules
├── 📄 .env.example                    # Environment variables template
├── 📄 README.md                       # How to start the project
├── 📄 PROJECT_SUMMARY.md              # Complete project overview
├── 📄 DEVELOPER_GUIDE.js              # Quick reference guide
│
├── 📁 src/
│   │
│   ├── 📄 main.jsx                    # React entry point
│   ├── 📄 App.jsx                     # Main app with routing
│   ├── 📄 index.css                   # Global styles + Tailwind
│   │
│   ├── 📁 api/
│   │   └── 📄 apiClient.js            # Axios instance with JWT interceptors
│   │
│   ├── 📁 components/                 # Reusable UI components
│   │   ├── 📄 Navbar.jsx              # Top navigation bar (search, logo, user menu)
│   │   ├── 📄 Sidebar.jsx             # Left sidebar navigation (collapsible)
│   │   ├── 📄 VideoCard.jsx           # Video thumbnail card with metadata
│   │   ├── 📄 LoadingSpinner.jsx      # Loading spinner component
│   │   └── 📄 ErrorMessage.jsx        # Error display component
│   │
│   ├── 📁 pages/                      # Page components
│   │   ├── 📄 Home.jsx                # Home page with video grid
│   │   ├── 📄 VideoPlayer.jsx         # Video player page with comments
│   │   ├── 📄 Upload.jsx              # Video upload page (drag & drop)
│   │   └── 📄 Login.jsx               # Login/authentication page
│   │
│   ├── 📁 services/                   # API service layers (ready for microservices)
│   │   ├── 📄 videoService.js         # Video Service API calls
│   │   ├── 📄 authService.js          # Auth/User Service API calls
│   │   └── 📄 commentService.js       # Comment Service API calls
│   │
│   ├── 📁 stores/                     # Zustand state management
│   │   ├── 📄 authStore.js            # Authentication state
│   │   └── 📄 videoStore.js           # Video state (list, current, upload)
│   │
│   └── 📁 utils/                      # Helper functions
│       ├── 📄 auth.js                 # JWT token management helpers
│       └── 📄 mockData.js             # Mock videos and comments
│
└── 📁 node_modules/                   # Dependencies (auto-generated)
```

## 🎯 Component Relationships

```
App.jsx (Router)
│
├── Navbar (always visible)
│   ├── Search bar
│   ├── Upload button
│   └── User menu
│
├── Sidebar (collapsible)
│   └── Navigation links
│
└── Routes
    ├── Home
    │   └── VideoCard (multiple)
    │
    ├── VideoPlayer
    │   ├── Video player
    │   ├── Comments section
    │   └── Recommended videos
    │
    ├── Upload
    │   └── Drag-drop zone
    │
    └── Login
        └── Auth form
```

## 🔄 Data Flow

```
User Action
    ↓
Component
    ↓
Zustand Store (authStore / videoStore)
    ↓
Service Layer (videoService / authService / commentService)
    ↓
API Client (with JWT interceptor)
    ↓
Backend API (microservices)
    ↓
Response flows back up
```

## 📦 Service Architecture

```
Frontend Services
├── videoService.js
│   ├── getAllVideos()
│   ├── getVideoById()
│   ├── uploadVideo()
│   └── incrementViews()
│
├── authService.js
│   ├── login()
│   ├── register()
│   ├── logout()
│   ├── getCurrentUser()
│   └── updateProfile()
│
└── commentService.js
    ├── getCommentsByVideoId()
    ├── postComment()
    ├── deleteComment()
    └── likeComment()

These map to your backend microservices:
├── Video Service
├── User/Auth Service
└── Comment Service
```

## 🎨 Styling System

```
Tailwind CSS Configuration
├── Dark theme colors
│   ├── dark-500 (background)
│   ├── dark-400 (cards)
│   ├── dark-300 (inputs)
│   ├── dark-200 (borders)
│   └── dark-100 (hover)
│
├── Primary colors
│   ├── primary (Netflix red)
│   └── primary-dark
│
└── Custom classes (in index.css)
    ├── btn-primary
    ├── btn-secondary
    └── card-hover
```

## 🔐 Authentication Flow

```
1. User enters credentials → Login.jsx
2. Form submits → authStore.login()
3. Store calls → authService.login()
4. Service sends → apiClient.post('/auth/login')
5. Response contains JWT → stored in localStorage
6. Axios interceptor adds token to all future requests
7. User state updated → isAuthenticated = true
8. Protected routes now accessible
```

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

Sidebar auto-collapses on mobile, stays open on desktop.

---

**Everything is organized, scalable, and ready for your microservices architecture!** 🚀
