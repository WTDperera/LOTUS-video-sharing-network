import Avatar from '../Avatar';

/**
 * Component: Comment Form
 * Single Responsibility: Handle comment input and submission
 * Follows: Single Responsibility Principle, Controlled Component Pattern
 */
const CommentForm = ({ 
  user, 
  comment, 
  onChange, 
  onSubmit, 
  onCancel, 
  isExpanded,
  onFormOpen
}) => {
  if (!user) {
    return (
      <div className="mb-6 p-4 bg-dark-200 rounded-lg text-center">
        <p className="text-gray-400">
          <a href="/login" className="text-primary hover:underline">Sign in</a> to leave a comment
        </p>
      </div>
    );
  }

  if (!isExpanded) {
    return (
      <div 
        onClick={onFormOpen}
        className="flex gap-3 mb-6 cursor-pointer"
      >
        <Avatar user={user} size="md" />
        <input
          type="text"
          placeholder="Add a comment..."
          className="flex-1 bg-dark-300 rounded-full px-4 py-2 outline-none cursor-pointer"
          readOnly
        />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mb-6">
      <div className="flex gap-3">
        <Avatar user={user} size="md" />
        <div className="flex-1">
          <textarea
            value={comment}
            onChange={onChange}
            placeholder="Add a comment..."
            className="w-full bg-dark-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary resize-none"
            rows="3"
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <button 
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn-primary"
              disabled={!comment.trim()}
            >
              Comment
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
