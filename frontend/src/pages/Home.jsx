import { useEffect } from 'react';
import VideoCard from '../components/VideoCard';
import { VideoGridSkeleton } from '../components/SkeletonLoaders';
import ErrorMessage from '../components/ErrorMessage';
import useVideoStore from '../stores/videoStore';

const Home = () => {
  const { videos, isLoading, error, fetchVideos } = useVideoStore();

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">All Videos</h1>
        <p className="text-gray-400">Browse all uploaded videos</p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage 
            message={error}
            onRetry={fetchVideos}
          />
        </div>
      )}

      {isLoading ? (
        <VideoGridSkeleton count={8} />
      ) : videos.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📹</div>
          <h2 className="text-2xl font-bold mb-2">No videos found</h2>
          <p className="text-gray-400 mb-6">Be the first to upload a video!</p>
          <a href="/upload" className="btn-primary inline-block">
            Upload Video
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
