# 🔌 Backend Integration Checklist

When your backend microservices are ready, use this checklist to connect everything.

## ⚙️ Step 1: Environment Configuration

- [ ] Create `.env` file (copy from `.env.example`)
- [ ] Update `VITE_API_URL` with your API Gateway URL
  ```
  VITE_API_URL=http://your-backend-url:port/api
  ```
- [ ] Restart the dev server after changing `.env`

## 🎬 Step 2: Video Service Integration

File: `src/services/videoService.js`

- [ ] Test the `/videos` endpoint (get all videos)
- [ ] Test the `/videos/:id` endpoint (get single video)
- [ ] Test the `/videos/upload` endpoint (file upload)
- [ ] Test the `/videos/:id/view` endpoint (increment views)
- [ ] Verify video stream URLs work (HLS/DASH)

In pages:
- [ ] `src/pages/Home.jsx` - Uncomment the `useVideoStore` code (lines 6-12)
- [ ] `src/pages/VideoPlayer.jsx` - Uncomment the store code (lines 10-18)

## 🔐 Step 3: Auth Service Integration

File: `src/services/authService.js`

- [ ] Test `/auth/login` endpoint
- [ ] Test `/auth/register` endpoint
- [ ] Test `/users/me` endpoint (get current user)
- [ ] Verify JWT token is returned
- [ ] Test token refresh logic (if implemented)

In pages:
- [ ] `src/pages/Login.jsx` - Should work automatically
- [ ] Test the mock credentials no longer work
- [ ] Verify token is stored in localStorage
- [ ] Check that protected routes work (Upload page)

## 💬 Step 4: Comment Service Integration

File: `src/services/commentService.js`

- [ ] Test `/videos/:id/comments` endpoint (get comments)
- [ ] Test POST `/videos/:id/comments` (add comment)
- [ ] Test DELETE `/comments/:id` (delete comment)
- [ ] Test `/comments/:id/like` (like comment)

In pages:
- [ ] `src/pages/VideoPlayer.jsx` - Connect comment fetching
- [ ] Verify comment submission works
- [ ] Test real-time comment updates (if using WebSocket)

## 📤 Step 5: Upload/Transcoding Integration

File: `src/pages/Upload.jsx`

- [ ] Uncomment lines 35-41 (actual upload code)
- [ ] Test file upload with progress tracking
- [ ] Verify backend returns transcoding job ID
- [ ] Implement transcoding status polling (optional)
- [ ] Test different video formats (MP4, MOV, etc.)
- [ ] Verify file size limits work

## 🎥 Step 6: Video Player Integration

File: `src/pages/VideoPlayer.jsx`

### Option A: HLS.js (Recommended)
```bash
npm install hls.js
```

Replace the placeholder video player (lines 46-59) with:
```javascript
import Hls from 'hls.js';

const videoRef = useRef(null);

useEffect(() => {
  const videoUrl = videoService.getVideoStreamUrl(videoId);
  
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(videoUrl);
    hls.attachMedia(videoRef.current);
  }
}, [videoId]);

// In JSX:
<video ref={videoRef} controls className="w-full h-full" />
```

### Option B: Video.js
```bash
npm install video.js
```

### Option C: Plyr
```bash
npm install plyr-react
```

- [ ] Install video player library
- [ ] Replace placeholder with actual player
- [ ] Test video playback
- [ ] Add quality selector (1080p, 720p, 480p)
- [ ] Verify adaptive bitrate switching works

## 🔍 Step 7: Search Functionality

File: `src/components/Navbar.jsx`

- [ ] Implement search endpoint in backend
- [ ] Update `handleSearch` function (line 12)
- [ ] Create search results page (optional)
- [ ] Add search filters (category, date, etc.)

## 📊 Step 8: Testing Checklist

- [ ] Test all pages load without errors
- [ ] Test authentication flow (login → protected route)
- [ ] Test video playback on different browsers
- [ ] Test file upload with various file sizes
- [ ] Test responsive design on mobile
- [ ] Test error handling (network errors, 404s, etc.)
- [ ] Test loading states appear correctly
- [ ] Check console for any warnings/errors

## 🐛 Common Issues & Solutions

### Issue: CORS errors
**Solution**: Enable CORS in your backend
```javascript
// Express.js example
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Issue: JWT not sent in requests
**Solution**: Check that token is in localStorage
```javascript
localStorage.getItem('token') // Should return your JWT
```

### Issue: 401 Unauthorized after login
**Solution**: Verify the token format in axios interceptor
```javascript
// Should be: Authorization: Bearer <token>
config.headers.Authorization = `Bearer ${token}`;
```

### Issue: Video upload fails
**Solution**: 
- Check backend accepts `multipart/form-data`
- Verify file size limits
- Check network tab for actual error

### Issue: Environment variables not working
**Solution**: 
- Vite requires `VITE_` prefix
- Restart dev server after changes
- Access via `import.meta.env.VITE_API_URL`

## 🚀 Performance Optimization (Future)

- [ ] Implement video thumbnail lazy loading
- [ ] Add infinite scroll for video list
- [ ] Cache API responses with React Query
- [ ] Optimize bundle size (code splitting)
- [ ] Add service worker for offline support
- [ ] Implement WebSocket for live comments

## 📝 Documentation Updates

- [ ] Update README with actual API endpoints
- [ ] Document environment variables
- [ ] Add API response examples
- [ ] Create troubleshooting guide
- [ ] Update PROJECT_SUMMARY.md

---

## ✅ Quick Test Commands

```bash
# Check if backend is running
curl http://localhost:5000/api/videos

# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'

# Test with JWT token
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

**Remember**: The frontend is already fully built and working with mock data. You just need to flip the switches (uncomment code) when backend is ready! 🎉
