import { useEffect, useCallback } from 'react';
import useVideoStore from '../stores/videoStore';
import useCommentStore from '../stores/commentStore';

/**
 * Custom Hook: Video Player Data Management
 * Single Responsibility: Orchestrate data fetching for video player
 * Follows: Single Responsibility Principle, Interface Segregation
 */
export const useVideoPlayer = (videoId) => {
  const { 
    currentVideo, 
    videos, 
    isLoading, 
    fetchVideoById, 
    fetchVideos, 
    incrementViews 
  } = useVideoStore();
  
  const { 
    comments, 
    isLoading: commentsLoading, 
    fetchComments 
  } = useCommentStore();

  // Fetch all required data on mount
  useEffect(() => {
    if (!videoId) return;

    fetchVideoById(videoId);
    fetchVideos();
    fetchComments(videoId);
    
    // Increment views after 3 seconds
    const viewTimer = setTimeout(() => {
      incrementViews(videoId);
    }, 3000);
    
    return () => clearTimeout(viewTimer);
  }, [videoId, fetchVideoById, fetchVideos, fetchComments, incrementViews]);

  return {
    currentVideo,
    isLoading,
    comments,
    commentsLoading,
  };
};
