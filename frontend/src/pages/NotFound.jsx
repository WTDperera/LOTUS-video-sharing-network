import { Link } from 'react-router-dom';
import { FaHome, FaSearch, FaVideo } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Large 404 */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
          <div className="text-6xl mb-4">🎬</div>
        </div>

        {/* Error message */}
        <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary flex items-center justify-center gap-2">
            <FaHome /> Go Home
          </Link>
          <Link to="/" className="btn-secondary flex items-center justify-center gap-2">
            <FaSearch /> Browse Videos
          </Link>
          <Link to="/upload" className="btn-secondary flex items-center justify-center gap-2">
            <FaVideo /> Upload Video
          </Link>
        </div>

        {/* Additional help */}
        <div className="mt-12 p-6 bg-dark-300 rounded-lg">
          <p className="text-sm text-gray-400 mb-3">Looking for something specific?</p>
          <div className="flex flex-wrap gap-2 justify-center text-xs">
            <Link to="/" className="text-primary hover:underline">Home</Link>
            <span className="text-gray-600">•</span>
            <Link to="/upload" className="text-primary hover:underline">Upload</Link>
            <span className="text-gray-600">•</span>
            <Link to="/profile" className="text-primary hover:underline">Profile</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
