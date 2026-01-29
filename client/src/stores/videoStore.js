import { create } from 'zustand';
import { videoService } from '../services/videoService';

// Video store - manages video listing and playback state
// Keeping this separate from auth to follow single responsibility principle

const useVideoStore = create((set, get) => ({
  videos: [],
  currentVideo: null,
  isLoading: false,
  error: null,
  uploadProgress: 0,

  // Fetch all videos
  fetchVideos: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const videos = await videoService.getAllVideos(filters);
      set({ videos, isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to load videos', 
        isLoading: false 
      });
    }
  },

  // Fetch single video
  fetchVideoById: async (videoId) => {
    set({ isLoading: true, error: null });
    try {
      const video = await videoService.getVideoById(videoId);
      set({ currentVideo: video, isLoading: false });
      // Increment view count in background
      videoService.incrementViews(videoId).catch(console.error);
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to load video', 
        isLoading: false 
      });
    }
  },

  // Upload video
  uploadVideo: async (formData) => {
    set({ isLoading: true, error: null, uploadProgress: 0 });
    try {
      const result = await videoService.uploadVideo(formData, (progress) => {
        set({ uploadProgress: progress });
      });
      set({ isLoading: false, uploadProgress: 100 });
      return result;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to upload video', 
        isLoading: false,
        uploadProgress: 0
      });
      throw error;
    }
  },

  // Increment views (standalone method)
  incrementViews: async (videoId) => {
    try {
      await videoService.incrementViews(videoId);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  },

  // Like a video
  likeVideo: async (videoId) => {
    try {
      const result = await videoService.likeVideo(videoId);
      // Update current video state
      const currentVideo = get().currentVideo;
      if (currentVideo && currentVideo.id === videoId) {
        set({
          currentVideo: {
            ...currentVideo,
            likes: result.likes,
            dislikes: result.dislikes,
            userLiked: result.userLiked,
            userDisliked: result.userDisliked,
          }
        });
      }
      return result;
    } catch (error) {
      console.error('Error liking video:', error);
      throw error;
    }
  },

  // Dislike a video
  dislikeVideo: async (videoId) => {
    try {
      const result = await videoService.dislikeVideo(videoId);
      // Update current video state
      const currentVideo = get().currentVideo;
      if (currentVideo && currentVideo.id === videoId) {
        set({
          currentVideo: {
            ...currentVideo,
            likes: result.likes,
            dislikes: result.dislikes,
            userLiked: result.userLiked,
            userDisliked: result.userDisliked,
          }
        });
      }
      return result;
    } catch (error) {
      console.error('Error disliking video:', error);
      throw error;
    }
  },

  // Delete video
  deleteVideo: async (videoId) => {
    set({ isLoading: true, error: null });
    try {
      await videoService.deleteVideo(videoId);
      // Remove from videos list
      const updatedVideos = get().videos.filter(v => v.id !== videoId);
      set({ videos: updatedVideos, isLoading: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete video', 
        isLoading: false 
      });
      throw error;
    }
  },

  // Clear current video
  clearCurrentVideo: () => set({ currentVideo: null }),

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useVideoStore;
