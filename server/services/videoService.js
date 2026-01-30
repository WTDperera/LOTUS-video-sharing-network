const Video = require('../models/Video');

const VIEWS_IN_MILLION = 1000000;
const VIEWS_IN_THOUSAND = 1000;
const MIN_VIEWS_FOR_FORMATTING = 1000;

/**
 * Video Service - Business Logic Layer
 * Handles all video-related operations and data transformations
 */
class VideoService {
  /**
   * Retrieve all videos with optional search filtering
   * @param {string} searchQuery - Optional search term for title/description/uploader
   * @returns {Promise<Array>} Array of video documents
   */
  async getAllVideos(searchQuery = '') {
    // Guard: Return all videos if no search query
    if (!searchQuery) {
      return await Video.find({}).sort({ uploadedAt: -1 });
    }

    const searchFilter = {
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { uploader: { $regex: searchQuery, $options: 'i' } },
      ],
    };

    return await Video.find(searchFilter).sort({ uploadedAt: -1 });
  }

  /**
   * Retrieve single video by ID
   * @param {string} videoId - MongoDB ObjectId
   * @returns {Promise<Object>} Video document
   * @throws {Error} If video not found
   */
  async getVideoById(videoId) {
    const videoDocument = await Video.findById(videoId);

    // Guard: Throw if video doesn't exist
    if (!videoDocument) {
      throw new Error('Video not found');
    }

    return videoDocument;
  }

  /**
   * Create new video document
   * @param {Object} videoData - Video metadata and file info
   * @returns {Promise<Object>} Saved video document
   */
  async createVideo(videoData) {
    const newVideo = new Video(videoData);
    return await newVideo.save();
  }

  /**
   * Increment view count for video
   * @param {string} videoId - MongoDB ObjectId
   * @returns {Promise<number>} Updated view count
   * @throws {Error} If video not found
   */
  async incrementViews(videoId) {
    const videoDocument = await Video.findById(videoId);

    // Guard: Throw if video doesn't exist
    if (!videoDocument) {
      throw new Error('Video not found');
    }

    videoDocument.views += 1;
    await videoDocument.save();
    return videoDocument.views;
  }

  /**
   * Update video metadata
   * @param {string} videoId - MongoDB ObjectId
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated video document
   * @throws {Error} If video not found
   */
  async updateVideo(videoId, updateData) {
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      updateData,
      { new: true, runValidators: true }
    );

    // Guard: Throw if video doesn't exist
    if (!updatedVideo) {
      throw new Error('Video not found');
    }

    return updatedVideo;
  }

  /**
   * Delete video by ID
   * @param {string} videoId - MongoDB ObjectId
   * @returns {Promise<Object>} Deleted video document
   * @throws {Error} If video not found
   */
  async deleteVideo(videoId) {
    const deletedVideo = await Video.findByIdAndDelete(videoId);

    // Guard: Throw if video doesn't exist
    if (!deletedVideo) {
      throw new Error('Video not found');
    }

    return deletedVideo;
  }

  /**
   * Toggle like on a video
   * @param {string} videoId - MongoDB ObjectId
   * @param {string} userId - User's MongoDB ObjectId
   * @returns {Promise<Object>} Updated like/dislike counts and user's action
   */
  async toggleLike(videoId, userId) {
    const video = await Video.findById(videoId);
    
    if (!video) {
      throw new Error('Video not found');
    }

    const likeIndex = video.likes.indexOf(userId);
    const dislikeIndex = video.dislikes.indexOf(userId);

    // Remove from dislikes if present
    if (dislikeIndex !== -1) {
      video.dislikes.splice(dislikeIndex, 1);
    }

    // Toggle like
    if (likeIndex !== -1) {
      video.likes.splice(likeIndex, 1); // Unlike
    } else {
      video.likes.push(userId); // Like
    }

    await video.save();

    return {
      likes: video.likes.length,
      dislikes: video.dislikes.length,
      userLiked: likeIndex === -1, // true if just liked, false if unliked
      userDisliked: false
    };
  }

  /**
   * Toggle dislike on a video
   * @param {string} videoId - MongoDB ObjectId
   * @param {string} userId - User's MongoDB ObjectId
   * @returns {Promise<Object>} Updated like/dislike counts and user's action
   */
  async toggleDislike(videoId, userId) {
    const video = await Video.findById(videoId);
    
    if (!video) {
      throw new Error('Video not found');
    }

    const likeIndex = video.likes.indexOf(userId);
    const dislikeIndex = video.dislikes.indexOf(userId);

    // Remove from likes if present
    if (likeIndex !== -1) {
      video.likes.splice(likeIndex, 1);
    }

    // Toggle dislike
    if (dislikeIndex !== -1) {
      video.dislikes.splice(dislikeIndex, 1); // Remove dislike
    } else {
      video.dislikes.push(userId); // Dislike
    }

    await video.save();

    return {
      likes: video.likes.length,
      dislikes: video.dislikes.length,
      userLiked: false,
      userDisliked: dislikeIndex === -1 // true if just disliked, false if removed
    };
  }

  /**
   * Get like status for a video
   * @param {string} videoId - MongoDB ObjectId
   * @param {string} userId - User's MongoDB ObjectId (optional)
   * @returns {Promise<Object>} Like/dislike counts and user's status
   */
  async getLikeStatus(videoId, userId = null) {
    const video = await Video.findById(videoId);
    
    if (!video) {
      throw new Error('Video not found');
    }

    return {
      likes: video.likes.length,
      dislikes: video.dislikes.length,
      userLiked: userId ? video.likes.includes(userId) : false,
      userDisliked: userId ? video.dislikes.includes(userId) : false
    };
  }

  /**
   * Format video document for API response
   * @param {Object} videoDocument - Mongoose video document
   * @param {number} serverPort - Server port for URL construction
   * @param {string} userId - Current user's ID (optional)
   * @returns {Object} Formatted video object
   */
  formatVideoForResponse(videoDocument, serverPort, userId = null) {
    // Use environment variable for base URL or default to localhost (for development)
    const baseUrl = process.env.BASE_URL || `http://localhost:${serverPort}`;
    
    // Use actual thumbnail if available, otherwise use placeholder
    const thumbnailUrl = videoDocument.thumbnail 
      ? `${baseUrl}${videoDocument.thumbnail}`
      : `${baseUrl}/api/videos/${videoDocument._id}/thumbnail`;

    return {
      id: videoDocument._id,
      title: videoDocument.title,
      description: videoDocument.description,
      thumbnail: thumbnailUrl,
      duration: videoDocument.duration || '0:00',
      views: this.formatViewsCount(videoDocument.views),
      likes: videoDocument.likes ? videoDocument.likes.length : 0,
      dislikes: videoDocument.dislikes ? videoDocument.dislikes.length : 0,
      userLiked: userId && videoDocument.likes ? videoDocument.likes.map(id => id.toString()).includes(userId) : false,
      userDisliked: userId && videoDocument.dislikes ? videoDocument.dislikes.map(id => id.toString()).includes(userId) : false,
      uploadedAt: this.calculateTimeAgo(videoDocument.uploadedAt),
      uploader: videoDocument.uploader,
      uploaderAvatar: videoDocument.uploaderAvatar,
      userId: videoDocument.userId,
      size: videoDocument.size,
      streamUrl: `${baseUrl}/video/${videoDocument._id}`,
    };
  }

  /**
   * Format view count with K/M suffixes
   * @param {number} viewCount - Raw view count
   * @returns {string} Formatted view count (e.g., "1.5M", "500K")
   */
  formatViewsCount(viewCount) {
    // Guard: Return early for small numbers
    if (viewCount < MIN_VIEWS_FOR_FORMATTING) {
      return viewCount.toString();
    }

    if (viewCount >= VIEWS_IN_MILLION) {
      const millionViews = (viewCount / VIEWS_IN_MILLION).toFixed(1);
      return `${millionViews}M`;
    }

    const thousandViews = (viewCount / VIEWS_IN_THOUSAND).toFixed(1);
    return `${thousandViews}K`;
  }

  /**
   * Calculate human-readable time difference
   * @param {Date} pastDate - Date to calculate from
   * @returns {string} Formatted time ago string
   */
  calculateTimeAgo(pastDate) {
    const currentDate = new Date();
    const elapsedSeconds = Math.floor((currentDate - pastDate) / 1000);

    // Early return for recent uploads
    if (elapsedSeconds < 60) {
      return 'just now';
    }

    const timeUnits = [
      { divisor: 31536000, label: 'year' },
      { divisor: 2592000, label: 'month' },
      { divisor: 86400, label: 'day' },
      { divisor: 3600, label: 'hour' },
      { divisor: 60, label: 'minute' },
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
}

module.exports = new VideoService();

