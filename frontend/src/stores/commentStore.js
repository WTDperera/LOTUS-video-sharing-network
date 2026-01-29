import { create } from 'zustand';
import { commentService } from '../services/commentService';

// Comment store - manages comments state
const useCommentStore = create((set, get) => ({
  comments: [],
  isLoading: false,
  error: null,

  // Fetch comments for a video
  fetchComments: async (videoId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await commentService.getCommentsByVideoId(videoId);
      set({ 
        comments: response.comments || response, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to load comments', 
        isLoading: false,
        comments: [] 
      });
    }
  },

  // Add new comment
  addComment: async (videoId, text) => {
    try {
      const response = await commentService.postComment(videoId, text);
      const newComment = response.comment || response;
      
      // Add to existing comments
      set((state) => ({
        comments: [newComment, ...state.comments]
      }));
      
      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Delete comment
  deleteComment: async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      
      // Remove from state
      set((state) => ({
        comments: state.comments.filter(c => c.id !== commentId)
      }));
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  // Clear comments
  clearComments: () => set({ comments: [], error: null }),
}));

export default useCommentStore;
