import { FaThumbsUp, FaThumbsDown, FaShare, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import useVideoStore from '../../stores/videoStore';
import useAuthStore from '../../stores/authStore';
import Avatar from '../Avatar';

/**
 * Component: Video Information
 * Single Responsibility: Display video metadata and actions
 * Follows: Single Responsibility Principle
 */
const VideoInfo = ({ video }) => {
  const navigate = useNavigate();
  const { deleteVideo, likeVideo, dislikeVideo } = useVideoStore();
  const { user, isAuthenticated } = useAuthStore();

  if (!video) return null;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      await deleteVideo(video.id);
      alert('Video deleted successfully!');
      navigate('/');
    } catch (error) {
      alert('Failed to delete video: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Please login to like videos');
      navigate('/login');
      return;
    }

    try {
      await likeVideo(video.id);
    } catch (error) {
      alert('Failed to like video: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDislike = async () => {
    if (!isAuthenticated) {
      alert('Please login to dislike videos');
      navigate('/login');
      return;
    }

    try {
      await dislikeVideo(video.id);
    } catch (error) {
      alert('Failed to dislike video: ' + (error.response?.data?.message || error.message));
    }
  };

  // Check if current user can delete this video
  const canDelete = isAuthenticated && user && (
    user.role === 'admin' || 
    (video.userId && user.id === video.userId)
  );

  return (
    <>
      <h1 className="text-2xl font-bold mb-3">{video.title}</h1>
      
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-dark-200">
        <div className="flex items-center gap-4">
          <Avatar 
            user={{ name: video.uploader, avatar: video.uploaderAvatar }} 
            size="lg" 
          />
          <div>
            <p className="font-semibold">{video.uploader}</p>
            <p className="text-sm text-gray-400">
              {video.views} views • {video.uploadedAt}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              video.userLiked 
                ? 'bg-primary text-white' 
                : 'bg-dark-200 hover:bg-dark-100'
            }`}
            aria-label="Like video"
          >
            <FaThumbsUp /> {video.likes || 0}
          </button>
          <button 
            onClick={handleDislike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              video.userDisliked 
                ? 'bg-red-600 text-white' 
                : 'bg-dark-200 hover:bg-dark-100'
            }`}
            aria-label="Dislike video"
          >
            <FaThumbsDown /> {video.dislikes || 0}
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-dark-200 hover:bg-dark-100 rounded-full transition-colors"
            aria-label="Share video"
          >
            <FaShare /> Share
          </button>
          {canDelete && (
            <button 
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
              aria-label="Delete video"
            >
              <FaTrash /> Delete
            </button>
          )}
        </div>
      </div>

      {video.description && (
        <div className="mb-6 p-4 bg-dark-200 rounded-lg">
          <p className="text-sm whitespace-pre-wrap">{video.description}</p>
        </div>
      )}
    </>
  );
};

export default VideoInfo;
