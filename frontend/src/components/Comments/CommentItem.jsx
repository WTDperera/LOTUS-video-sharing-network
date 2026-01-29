import { FaTrash } from 'react-icons/fa';
import { formatDate } from '../../utils/formatters';
import Avatar from '../Avatar';

/**
 * Component: Comment Item
 * Single Responsibility: Display a single comment
 * Follows: Single Responsibility Principle, Presentational Component Pattern
 */
const CommentItem = ({ comment, currentUserId, onDelete }) => {
  const isOwner = currentUserId && currentUserId === comment.userId;

  return (
    <div className="flex gap-3">
      <Avatar user={comment.user} size="md" showSkeleton />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">
            {comment.user?.name || 'Unknown User'}
          </span>
          <span className="text-xs text-gray-500">
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm mb-2">{comment.text}</p>
        {isOwner && (
          <button 
            onClick={() => onDelete(comment._id)}
            className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
            aria-label="Delete comment"
          >
            <FaTrash size={12} />
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
