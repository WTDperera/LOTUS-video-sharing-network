import { Link } from 'react-router-dom';
import { FaPlay, FaEye, FaClock } from 'react-icons/fa';
import Avatar from './Avatar';

// VideoCard component - displays video thumbnail and metadata
// This is used in the home page grid and recommended videos section

const VideoCard = ({ video }) => {
  // Create uploader user object for Avatar component
  const uploaderUser = {
    name: video.uploader,
    avatar: video.uploaderAvatar,
  };

  return (
    <Link to={`/video/${video.id}`} className="group">
      <div className="relative rounded-lg overflow-hidden bg-dark-300 card-hover">
        {/* Thumbnail */}
        <div className="relative aspect-video">
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="w-full h-full object-cover"
          />
          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
            <FaClock size={10} />
            {video.duration}
          </div>
          {/* Play icon on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
            <FaPlay className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Video info */}
        <div className="p-3">
          <div className="flex gap-3">
            {/* Uploader avatar - Using Avatar component */}
            <Avatar user={uploaderUser} size="sm" className="mt-0.5" />
            
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                {video.title}
              </h3>
              
              {/* Uploader name */}
              <p className="text-gray-400 text-xs mb-1">
                {video.uploader}
              </p>
              
              {/* Views and date */}
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <span className="flex items-center gap-1">
                  <FaEye size={12} />
                  {video.views}
                </span>
                <span>•</span>
                <span>{video.uploadedAt}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
