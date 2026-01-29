import { useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import useAuthStore from '../stores/authStore';

// Custom Hooks (Business Logic Layer)
import { useVideoPlayer } from '../hooks/useVideoPlayer';
import { useCommentActions } from '../hooks/useCommentActions';

// Components (Presentation Layer)
import VideoPlayer from '../components/VideoPlayer/VideoPlayer';
import VideoInfo from '../components/VideoPlayer/VideoInfo';
import CommentsSection from '../components/Comments/CommentsSection';

/**
 * Page Component: Video Player Container
 * Single Responsibility: Orchestrate video player page layout
 * Follows: 
 * - Single Responsibility Principle (only orchestrates, no business logic)
 * - Dependency Injection (injects dependencies via props/hooks)
 * - Open/Closed Principle (extensible through component composition)
 * 
 * Architecture Pattern: Container/Presenter Pattern
 * - This is the Container: manages state and data flow
 * - Child components are Presenters: only handle display
 */
const VideoPlayerPage = () => {
  const { videoId } = useParams();
  const { user } = useAuthStore();

  // Data Management Layer (Custom Hook - Dependency Injection)
  const { 
    currentVideo, 
    isLoading, 
    comments, 
    commentsLoading
  } = useVideoPlayer(videoId);

  // Comment Actions Layer (Custom Hook - Dependency Injection)
  const {
    commentText,
    setCommentText,
    showCommentForm,
    openForm,
    closeForm,
    handleSubmit,
    handleDelete,
  } = useCommentActions(videoId);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error State
  if (!currentVideo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Video not found</h2>
          <p className="text-gray-400">The video you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Main Layout (Composition Pattern - SOLID)
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Main Content Area */}
      <div className="w-full">
        <VideoPlayer 
          videoId={videoId}
          thumbnail={currentVideo.thumbnail}
          title={currentVideo.title}
        />
        
        <VideoInfo video={currentVideo} />

        <CommentsSection
          comments={comments}
          isLoading={commentsLoading}
          user={user}
          commentText={commentText}
          showForm={showCommentForm}
          onCommentChange={setCommentText}
          onCommentSubmit={handleSubmit}
          onFormOpen={openForm}
          onFormCancel={closeForm}
          onDeleteComment={handleDelete}
        />
      </div>
    </div>
  );
};

export default VideoPlayerPage;
