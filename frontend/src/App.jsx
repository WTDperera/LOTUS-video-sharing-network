import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import VideoPlayer from './pages/VideoPlayer';
import Upload from './pages/Upload';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import useAuthStore from './stores/authStore';

// Main App component with routing and layout
// Sidebar can be toggled on mobile

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, loadUser } = useAuthStore();

  // Load user on app startup (check if token exists)
  useEffect(() => {
    loadUser();
  }, []); // Empty dependency array - only run once on mount

  return (
    <Router>
      <div className="min-h-screen bg-dark-500 text-white">
        {/* Navbar at the top */}
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Sidebar (collapsible on mobile) */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content area - with proper spacing for navbar and sidebar */}
        <main className="pt-[57px] lg:pl-64">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/video/:videoId" element={<VideoPlayer />} />
            <Route 
              path="/upload" 
              element={
                isAuthenticated ? <Upload /> : <Navigate to="/login" />
              } 
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/profile" 
              element={
                isAuthenticated ? <Profile /> : <Navigate to="/login" />
              } 
            />
            
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Simple placeholder component for unimplemented pages
function ComingSoon({ title }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🚧 {title}</h1>
        <p className="text-gray-400">This feature is coming soon!</p>
      </div>
    </div>
  );
}

export default App;

