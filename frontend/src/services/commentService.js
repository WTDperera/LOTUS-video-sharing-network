import apiClient from './apiClient';

export const commentService = {
  getCommentsByVideoId: async (videoId) => {
    try {
      const response = await apiClient.get(`/videos/${videoId}/comments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  postComment: async (videoId, commentText) => {
    try {
      const response = await apiClient.post(`/videos/${videoId}/comments`, {
        text: commentText,
      });
      return response.data;
    } catch (error) {
      console.error('Error posting comment:', error);
      throw error;
    }
  },

  deleteComment: async (commentId) => {
    try {
      const response = await apiClient.delete(`/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },
};
