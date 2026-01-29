import apiClient from './apiClient';

// Video Service API calls
// These will connect to the Video Microservice eventually

export const videoService = {
  // Get all videos (with optional filters)
  getAllVideos: async (params = {}) => {
    try {
      // TODO: Connect this to the actual Video Service API Gateway later
      // For now, returning mock data
      const response = await apiClient.get('/videos', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  },

  // Get single video by ID
  getVideoById: async (videoId) => {
    try {
      const response = await apiClient.get(`/videos/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching video:', error);
      throw error;
    }
  },

  // Upload a new video
  uploadVideo: async (formData, onUploadProgress) => {
    try {
      // This will connect to the Transcoding Service
      const response = await apiClient.post('/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(percentCompleted);
          }
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  },

  // Get video stream URL
  getVideoStreamUrl: (videoId, quality = '720p') => {
    // TODO: This will be replaced with actual HLS/DASH streaming URLs
    return `${apiClient.defaults.baseURL}/videos/${videoId}/stream?quality=${quality}`;
  },

  // Increment view count
  incrementViews: async (videoId) => {
    try {
      const response = await apiClient.post(`/videos/${videoId}/view`);
      return response.data;
    } catch (error) {
      console.error('Error incrementing views:', error);
      throw error;
    }
  },

  // Like a video
  likeVideo: async (videoId) => {
    try {
      const response = await apiClient.post(`/videos/${videoId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error liking video:', error);
      throw error;
    }
  },

  // Dislike a video
  dislikeVideo: async (videoId) => {
    try {
      const response = await apiClient.post(`/videos/${videoId}/dislike`);
      return response.data;
    } catch (error) {
      console.error('Error disliking video:', error);
      throw error;
    }
  },

  // Delete video
  deleteVideo: async (videoId) => {
    try {
      const response = await apiClient.delete(`/videos/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  },
};
