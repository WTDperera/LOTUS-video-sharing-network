import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUpload, FaBars } from 'react-icons/fa';
import { useState } from 'react';
import useAuthStore from '../stores/authStore';
import useVideoStore from '../stores/videoStore';
import Avatar from './Avatar';

const Navbar = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user, logout } = useAuthStore();
  const { fetchVideos } = useVideoStore();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchVideos({ search: searchQuery });
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-400 border-b border-dark-200">
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="p-2 hover:bg-dark-200 rounded-full lg:hidden"
          >
            <FaBars className="text-xl" />
          </button>
          
          <Link to="/" className="flex items-center gap-2">
            <div className="text-primary text-2xl font-bold">
              🪷 Lotus
            </div>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <div className="flex items-center bg-dark-200 rounded-full border border-dark-100 focus-within:border-primary">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent px-6 py-2 outline-none text-sm"
            />
            <button 
              type="submit"
              className="px-6 py-2 hover:bg-dark-100 rounded-r-full"
            >
              <FaSearch />
            </button>
          </div>
        </form>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/upload"
                className="p-2 hover:bg-dark-200 rounded-full"
                title="Upload video"
              >
                <FaUpload className="text-xl" />
              </Link>

              <div className="relative group">
                <button className="flex items-center gap-2 p-1 hover:bg-dark-200 rounded-full">
                  <Avatar user={user} size="sm" />
                  <span className="hidden md:block text-sm font-medium pr-2">
                    {user?.name || 'User'}
                  </span>
                </button>
                
                <div className="absolute right-0 mt-2 w-56 bg-dark-300 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-4 border-b border-dark-200 flex items-center gap-3">
                    <Avatar user={user} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email || 'user@example.com'}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="block w-full text-left px-4 py-3 hover:bg-dark-200 text-sm"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-dark-200 text-sm text-red-400 hover:text-red-300"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="btn-primary px-6 py-2"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
