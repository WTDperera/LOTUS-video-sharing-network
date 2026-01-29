import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaVideo, FaEye, FaClock, FaEdit, FaSignOutAlt, FaCamera } from 'react-icons/fa';
import useAuthStore from '../stores/authStore';
import useVideoStore from '../stores/videoStore';
import LoadingSpinner from '../components/LoadingSpinner';
import Avatar from '../components/Avatar';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, uploadAvatar, updateProfile, isLoading: authLoading } = useAuthStore();
  const { videos, isLoading, fetchVideos } = useVideoStore();
  const [userVideos, setUserVideos] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchVideos();
    if (user) {
      setEditForm({ name: user.name, email: user.email });
    }
  }, [isAuthenticated, navigate, fetchVideos, user]);

  useEffect(() => {
    if (user && videos.length > 0) {
      // Filter videos uploaded by this user
      const myVideos = videos.filter(v => v.uploader === user.name);
      setUserVideos(myVideos);
    }
  }, [user, videos]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      await uploadAvatar(file);
      alert('Profile picture updated successfully!');
    } catch (error) {
      alert('Failed to upload profile picture. Please try again.');
      console.error('Avatar upload error:', error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(editForm);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-dark-300 rounded-lg p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar user={user} size="2xl" />
              <button
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 bg-primary hover:bg-primary-dark text-white rounded-full p-2 shadow-lg disabled:opacity-50"
                title="Change profile picture"
              >
                {uploadingAvatar ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaCamera size={16} />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="space-y-3">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-dark-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Name"
                    required
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-dark-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Email"
                    required
                  />
                  <div className="flex gap-2">
                    <button 
                      type="submit" 
                      disabled={authLoading}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                  <p className="text-gray-400 mb-4">{user.email}</p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <FaEdit /> Edit Profile
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="btn-secondary flex items-center gap-2 text-red-500 hover:text-red-400"
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-dark-300 rounded-lg p-6 text-center">
            <FaVideo className="text-4xl text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold">{userVideos.length}</p>
            <p className="text-gray-400">Videos Uploaded</p>
          </div>
          <div className="bg-dark-300 rounded-lg p-6 text-center">
            <FaEye className="text-4xl text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">
              {userVideos.reduce((acc, v) => acc + parseInt(v.views.replace(/[^\d]/g, '') || 0), 0)}
            </p>
            <p className="text-gray-400">Total Views</p>
          </div>
          <div className="bg-dark-300 rounded-lg p-6 text-center">
            <FaClock className="text-4xl text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </p>
            <p className="text-gray-400">Member Since</p>
          </div>
        </div>

        {/* User's Videos */}
        <div className="bg-dark-300 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">My Videos</h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : userVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userVideos.map((video) => (
                <a 
                  key={video.id}
                  href={`/video/${video.id}`}
                  className="group"
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 px-2 py-1 text-xs rounded">
                      {video.duration}
                    </div>
                  </div>
                  <h3 className="font-semibold line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-400">{video.views} views • {video.uploadedAt}</p>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaVideo className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-400 mb-4">No videos uploaded yet</p>
              <button 
                onClick={() => navigate('/upload')}
                className="btn-primary"
              >
                Upload Your First Video
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
