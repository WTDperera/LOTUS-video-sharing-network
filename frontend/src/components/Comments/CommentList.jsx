import CommentItem from './CommentItem';
import { CommentsSkeleton } from '../SkeletonLoaders';

/**
 * Component: Comment List
 * Single Responsibility: Display list of comments
 * Follows: Single Responsibility Principle, Container Component Pattern
 */
const CommentList = ({ 
  comments, 
  isLoading, 
  currentUserId, 
  onDeleteComment 
}) => {
  if (isLoading) {
    return <CommentsSkeleton count={3} />;
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment._id}
          comment={comment}
          currentUserId={currentUserId}
          onDelete={onDeleteComment}
        />
      ))}
    </div>
  );
};

export default CommentList;
