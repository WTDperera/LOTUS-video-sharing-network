const Comment = require('../models/Comment');
const Video = require('../models/Video');

const COMMENT_LIMIT = 50;
const SECONDS_PER_YEAR = 31536000;
const SECONDS_PER_MONTH = 2592000;
const SECONDS_PER_DAY = 86400;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;

/**
 * Calculate human-readable time difference
 * @param {Date} pastDate - Date to calculate from
 * @returns {string} Formatted time ago string
 */
function calculateTimeAgo(pastDate) {
  const currentDate = new Date();
  const elapsedSeconds = Math.floor((currentDate - pastDate) / 1000);

  // Early return for recent comments
  if (elapsedSeconds < SECONDS_PER_MINUTE) {
    return 'just now';
  }

  const timeUnits = [
    { divisor: SECONDS_PER_YEAR, label: 'year' },
    { divisor: SECONDS_PER_MONTH, label: 'month' },
    { divisor: SECONDS_PER_DAY, label: 'day' },
    { divisor: SECONDS_PER_HOUR, label: 'hour' },
    { divisor: SECONDS_PER_MINUTE, label: 'minute' },
  ];

  for (const { divisor, label } of timeUnits) {
    const intervalValue = Math.floor(elapsedSeconds / divisor);
    if (intervalValue >= 1) {
      const plural = intervalValue > 1 ? 's' : '';
      return `${intervalValue} ${label}${plural} ago`;
    }
  }

  return 'just now';
}

/**
 * Format comment data for API response
 * @param {Object} commentDoc - Mongoose comment document
 * @returns {Object} Formatted comment object
 */
const formatCommentResponse = (commentDoc) => ({
  id: commentDoc._id,
  text: commentDoc.text,
  user: {
    id: commentDoc.userId._id,
    name: commentDoc.userId.name,
    avatar: commentDoc.userId.avatar,
  },
  createdAt: commentDoc.createdAt,
  timeAgo: calculateTimeAgo(commentDoc.createdAt),
});

/**
 * Verify if user is authorized to delete comment
 * @param {Object} commentDoc - Comment document
 * @param {Object} currentUser - Authenticated user
 * @returns {boolean} True if authorized
 */
const isAuthorizedToDeleteComment = (commentDoc, currentUser) => {
  const isCommentOwner = commentDoc.userId.toString() === currentUser.id;
  const isAdmin = currentUser.role === 'admin';
  return isCommentOwner || isAdmin;
};

// @desc    Get comments for a video
// @route   GET /api/videos/:videoId/comments
// @access  Public
exports.getComments = async (req, res) => {
  try {
    const commentDocuments = await Comment.find({ videoId: req.params.videoId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(COMMENT_LIMIT);

    const formattedComments = commentDocuments.map(formatCommentResponse);

    res.json({
      success: true,
      count: formattedComments.length,
      comments: formattedComments,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
    });
  }
};

// @desc    Add comment to video
// @route   POST /api/videos/:videoId/comments
// @access  Private (requires authentication)
exports.addComment = async (req, res) => {
  try {
    const { text: commentText } = req.body;
    const { videoId } = req.params;

    // Guard: Validate comment text
    if (!commentText || commentText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required',
      });
    }

    // Guard: Verify video exists
    const videoExists = await Video.findById(videoId);
    if (!videoExists) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    const sanitizedCommentText = commentText.trim();
    const newComment = await Comment.create({
      videoId,
      userId: req.user.id,
      text: sanitizedCommentText,
    });

    await newComment.populate('userId', 'name avatar');

    res.status(201).json({
      success: true,
      comment: formatCommentResponse(newComment),
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (user can only delete their own comments)
exports.deleteComment = async (req, res) => {
  try {
    const { id: commentId } = req.params;

    // Guard: Check if comment exists
    const commentToDelete = await Comment.findById(commentId);
    if (!commentToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Guard: Check authorization
    if (!isAuthorizedToDeleteComment(commentToDelete, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }

    await commentToDelete.deleteOne();

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
    });
  }
};
