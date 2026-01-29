import { useState, useCallback } from 'react';
import useCommentStore from '../stores/commentStore';

/**
 * Custom Hook: Comment Actions Management
 * Single Responsibility: Handle all comment-related user actions
 * Follows: Single Responsibility Principle, Dependency Inversion
 */
export const useCommentActions = (videoId) => {
  const [commentText, setCommentText] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const { addComment, deleteComment } = useCommentStore();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;

    try {
      await addComment(videoId, commentText);
      setCommentText('');
      setShowCommentForm(false);
      return { success: true };
    } catch (error) {
      console.error('Error posting comment:', error);
      return { success: false, error };
    }
  }, [videoId, commentText, addComment]);

  const handleDelete = useCallback(async (commentId) => {
    const confirmed = window.confirm('Are you sure you want to delete this comment?');
    if (!confirmed) return { success: false, cancelled: true };

    try {
      await deleteComment(commentId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting comment:', error);
      return { success: false, error };
    }
  }, [deleteComment]);

  const openForm = useCallback(() => setShowCommentForm(true), []);
  
  const closeForm = useCallback(() => {
    setCommentText('');
    setShowCommentForm(false);
  }, []);

  return {
    commentText,
    setCommentText,
    showCommentForm,
    openForm,
    closeForm,
    handleSubmit,
    handleDelete,
  };
};
