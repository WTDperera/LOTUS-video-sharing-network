/**
 * Utility Module: Data Formatters
 * Single Responsibility: Format data for display
 * Follows: DRY Principle, Pure Functions
 */

/**
 * Generate avatar URL for user
 * @param {Object} user - User object with name and optional avatar
 * @returns {string} Avatar URL
 */
export const getAvatarUrl = (user) => {
  if (!user) return 'https://ui-avatars.com/api/?name=Unknown&background=random';
  
  if (user.avatar) {
    // If avatar is a full URL, return as is
    if (user.avatar.startsWith('http')) {
      return user.avatar;
    }
    // If avatar is a path, prepend backend URL
    const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${API_BASE}${user.avatar}`;
  }
  
  const name = user.name || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
};

/**
 * Format date to localized string
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} Formatted date
 */
export const formatDate = (date, locale = 'en-US') => {
  if (!date) return 'Unknown date';
  
  try {
    return new Date(date).toLocaleDateString(locale);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format relative time (e.g., "2 days ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'Unknown time';
  
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(date);
};

/**
 * Format view count with abbreviations (e.g., 1.2K, 1.5M)
 * @param {number} views - Number of views
 * @returns {string} Formatted view count
 */
export const formatViewCount = (views) => {
  if (!views || views < 1000) return `${views || 0}`;
  if (views < 1000000) return `${(views / 1000).toFixed(1)}K`;
  return `${(views / 1000000).toFixed(1)}M`;
};

/**
 * Generate streaming URL for video
 * @param {string} videoId - Video ID
 * @param {string} baseUrl - Base API URL (optional, defaults to env variable or localhost)
 * @returns {string} Streaming URL
 */
export const getStreamingUrl = (videoId, baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000') => {
  if (!videoId) return '';
  return `${baseUrl}/video/${videoId}`;
};
