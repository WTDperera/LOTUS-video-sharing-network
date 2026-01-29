import CommentForm from './CommentForm';
import CommentList from './CommentList';

/**
 * Component: Comments Section
 * Single Responsibility: Orchestrate comment form and list
 * Follows: Composition Pattern, Dependency Injection
 */
const CommentsSection = ({
  comments,
  isLoading,
  user,
  commentText,
  showForm,
  onCommentChange,
  onCommentSubmit,
  onFormOpen,
  onFormCancel,
  onDeleteComment,
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-4">{comments.length} Comments</h3>

      <CommentForm
        user={user}
        comment={commentText}
        onChange={(e) => onCommentChange(e.target.value)}
        onSubmit={onCommentSubmit}
        onCancel={onFormCancel}
        isExpanded={showForm}
        onFormOpen={onFormOpen}
      />

      <CommentList
        comments={comments}
        isLoading={isLoading}
        currentUserId={user?._id}
        onDeleteComment={onDeleteComment}
      />
    </div>
  );
};

export default CommentsSection;
