# 🪷 Lotus Video Streaming Platform - Frontend

This is the frontend for my final year university project - a video streaming platform built with modern web technologies.

## 🚀 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool (super fast!)
- **Tailwind CSS** - Styling (dark theme inspired by Netflix/YouTube)
- **Zustand** - State management (simpler than Redux)
- **React Router v6** - Routing
- **Axios** - HTTP client with JWT interceptors

## 📁 Project Structure

```
src/
├── api/              # Axios client with interceptors
├── components/       # Reusable UI components (VideoCard, Navbar, etc.)
├── pages/           # Page components (Home, VideoPlayer, Upload, Login)
├── services/        # API service layers (Video, Auth, Comment services)
├── stores/          # Zustand stores for state management
├── utils/           # Helper functions and mock data
└── App.jsx          # Main app with routing
```

## 🎯 Features

- ✅ Home page with video grid layout
- ✅ Video player page with comments and recommendations
- ✅ Upload page with drag-and-drop (will connect to transcoding service)
- ✅ Login/Auth system (JWT ready)
- ✅ Responsive design (mobile + desktop)
- ✅ Dark theme (Netflix/YouTube inspired)

## 🛠️ Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

### Build for Production

```bash
npm run build
```

## 📝 Notes for Development

- **Mock Data**: Currently using mock data in `src/utils/mockData.js`. Replace with actual API calls when backend is ready.
- **API Integration**: The axios interceptor is set up in `src/api/apiClient.js` for JWT token handling.
- **Backend URL**: Update `VITE_API_URL` in `.env` file when connecting to actual backend.
- **Services**: API services are ready in `src/services/` folder - just uncomment the code when backend is available.

## 🔐 Demo Login (Mock)

For testing the UI:
- Email: `demo@lotus.com`
- Password: `password123`

## 🎨 Design Choices

- Used **dark theme** heavily because streaming platforms look better in dark mode
- **Responsive sidebar** that collapses on mobile
- **Card hover effects** for that premium feel
- **Custom scrollbar** styling for consistency

## 📚 TODO

- [ ] Connect to actual Video Microservice API
- [ ] Integrate real video player (HLS.js or similar)
- [ ] Connect to Comment Microservice
- [ ] Add search functionality
- [ ] Implement video recommendations algorithm
- [ ] Add user profile page
- [ ] Add video quality selector
- [ ] Implement actual transcoding progress tracking

## 👨‍💻 Author

Built for university final year project - Lotus Video Streaming Platform

---

**Note**: This is a student project for educational purposes.
