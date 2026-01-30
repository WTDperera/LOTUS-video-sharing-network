import { useState, memo } from 'react';
import { FaUser } from 'react-icons/fa';

/**
 * Component: Avatar
 * Single Responsibility: Display user profile picture with consistent fallback behavior
 * Follows: Single Responsibility Principle, DRY Principle
 * 
 * This is the SINGLE source of truth for rendering user avatars across the app.
 * Handles loading states, error fallbacks, and size variations consistently.
 */

// Size configurations for different avatar sizes
const SIZE_CONFIG = {
  xs: {
    container: 'w-6 h-6',
    text: 'text-xs',
    icon: 12,
  },
  sm: {
    container: 'w-8 h-8',
    text: 'text-sm',
    icon: 14,
  },
  md: {
    container: 'w-10 h-10',
    text: 'text-base',
    icon: 16,
  },
  lg: {
    container: 'w-12 h-12',
    text: 'text-lg',
    icon: 20,
  },
  xl: {
    container: 'w-16 h-16',
    text: 'text-xl',
    icon: 24,
  },
  '2xl': {
    container: 'w-24 h-24',
    text: 'text-3xl',
    icon: 32,
  },
};

// Color palette for initials background (consistent per user)
const COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
];

/**
 * Get consistent color based on user name
 * @param {string} name - User name
 * @returns {string} Tailwind color class
 */
const getColorFromName = (name) => {
  if (!name) return 'bg-primary';
  const charCode = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
  return COLORS[charCode % COLORS.length];
};

/**
 * Get initials from user name
 * @param {string} name - User name
 * @returns {string} Initials (1-2 characters)
 */
const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Resolve avatar URL with backend base URL if needed
 * Handles: base64 data URIs, absolute URLs, relative paths
 * @param {string} avatarUrl - Avatar URL or path
 * @returns {string|null} Full URL or null
 */
const resolveAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return null;
  
  // Base64 data URI - return as is
  if (avatarUrl.startsWith('data:')) return avatarUrl;
  
  // Absolute URL - return as is
  if (avatarUrl.startsWith('http')) return avatarUrl;
  
  // Get API URL from environment
  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  
  // Relative path - prepend backend URL
  if (avatarUrl.startsWith('/')) return `${API_BASE}${avatarUrl}`;
  
  return `${API_BASE}/${avatarUrl}`;
};

/**
 * Avatar Component
 * 
 * @param {Object} props
 * @param {Object|null} props.user - User object with name and avatar properties
 * @param {string} props.user.name - User's display name
 * @param {string} props.user.avatar - User's avatar URL or path
 * @param {'xs'|'sm'|'md'|'lg'|'xl'|'2xl'} props.size - Avatar size variant
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showSkeleton - Show skeleton loader when user is null
 */
const Avatar = memo(({ 
  user = null, 
  size = 'md', 
  className = '',
  showSkeleton = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const avatarUrl = resolveAvatarUrl(user?.avatar);
  const userName = user?.name || user?.username || '';
  const initials = getInitials(userName);
  const bgColor = getColorFromName(userName);
  
  // Handle image load error - fallback to initials
  const handleError = () => {
    setImageError(true);
  };

  // Handle successful image load
  const handleLoad = () => {
    setImageLoaded(true);
  };

  // Base classes for all avatar variants
  const baseClasses = `${config.container} rounded-full flex-shrink-0 overflow-hidden ${className}`;

  // Skeleton loader for loading states
  if (showSkeleton && !user) {
    return (
      <div className={`${baseClasses} bg-dark-200 animate-pulse`} />
    );
  }

  // If no user provided, show default icon
  if (!user) {
    return (
      <div className={`${baseClasses} bg-dark-200 flex items-center justify-center`}>
        <FaUser className="text-gray-400" size={config.icon} />
      </div>
    );
  }

  // If avatar URL exists and hasn't errored, try to show image
  const shouldShowImage = avatarUrl && !imageError;

  return (
    <div className={`${baseClasses} relative`}>
      {/* Fallback: Initials or Icon (always rendered as base layer) */}
      <div 
        className={`absolute inset-0 ${bgColor} flex items-center justify-center text-white font-bold ${config.text}`}
        aria-hidden={shouldShowImage && imageLoaded}
      >
        {initials || <FaUser size={config.icon} />}
      </div>

      {/* Image layer (rendered on top when available) */}
      {shouldShowImage && (
        <img
          src={avatarUrl}
          alt={userName || 'User avatar'}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onError={handleError}
          onLoad={handleLoad}
          loading="lazy"
        />
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';

export default Avatar;
