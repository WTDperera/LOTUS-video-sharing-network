// Quick reference for common tasks in the Lotus Video Frontend

/**
 * ADDING A NEW PAGE
 * 1. Create file in src/pages/YourPage.jsx
 * 2. Add route in src/App.jsx:
 *    <Route path="/your-path" element={<YourPage />} />
 * 3. Add link in Sidebar.jsx if needed
 */

/**
 * CONNECTING TO BACKEND API
 * 1. Update .env file with your API URL:
 *    VITE_API_URL=http://your-backend-url/api
 * 
 * 2. In your page/component, uncomment the API code:
 *    // Before:
 *    const videos = mockVideos;
 *    
 *    // After:
 *    const { videos, fetchVideos } = useVideoStore();
 *    useEffect(() => { fetchVideos(); }, []);
 * 
 * 3. API services are ready in src/services/
 */

/**
 * INTEGRATING VIDEO PLAYER
 * Replace the placeholder in VideoPlayer.jsx with:
 * - HLS.js for HLS streaming
 * - Video.js for general video playback
 * - Plyr for modern UI
 * 
 * Example with HLS.js:
 * npm install hls.js
 * 
 * import Hls from 'hls.js';
 * const videoUrl = videoService.getVideoStreamUrl(videoId);
 * if (Hls.isSupported()) {
 *   const hls = new Hls();
 *   hls.loadSource(videoUrl);
 *   hls.attachMedia(videoRef.current);
 * }
 */

/**
 * ADDING NEW API ENDPOINTS
 * Edit the appropriate service file:
 * - src/services/videoService.js
 * - src/services/authService.js
 * - src/services/commentService.js
 * 
 * Follow the existing pattern:
 * export const yourService = {
 *   yourMethod: async (params) => {
 *     try {
 *       const response = await apiClient.get('/your-endpoint', { params });
 *       return response.data;
 *     } catch (error) {
 *       console.error('Error:', error);
 *       throw error;
 *     }
 *   }
 * };
 */

/**
 * MANAGING STATE
 * Using Zustand - super simple:
 * 
 * In your store (e.g., src/stores/yourStore.js):
 * import { create } from 'zustand';
 * 
 * const useYourStore = create((set) => ({
 *   data: null,
 *   setData: (newData) => set({ data: newData }),
 * }));
 * 
 * In your component:
 * const { data, setData } = useYourStore();
 */

/**
 * STYLING TIPS
 * - Use Tailwind classes directly in JSX
 * - Dark theme colors:
 *   - bg-dark-500 (darkest)
 *   - bg-dark-400
 *   - bg-dark-300
 *   - bg-dark-200
 *   - bg-dark-100 (lightest)
 * - Primary color: text-primary, bg-primary
 * - Custom classes in src/index.css:
 *   - btn-primary
 *   - btn-secondary
 *   - card-hover
 */

/**
 * TESTING MOCK LOGIN
 * Since backend isn't ready, the login is simulated.
 * To actually connect it:
 * 1. Implement proper login endpoint in backend
 * 2. The authService.login() is already set up
 * 3. JWT token will be stored automatically
 * 4. Axios interceptor adds token to all requests
 */

/**
 * FILE UPLOAD TO TRANSCODING SERVICE
 * The upload form is ready in src/pages/Upload.jsx
 * To connect it:
 * 1. Uncomment the uploadVideo() code
 * 2. Backend should accept multipart/form-data
 * 3. Progress tracking is already implemented
 * 4. FormData includes: video file, title, description
 */

/**
 * DEBUGGING TIPS
 * - Check browser console for errors
 * - Zustand state: Use React DevTools
 * - API calls: Check Network tab in DevTools
 * - Mock data is in src/utils/mockData.js
 */

export default {};
