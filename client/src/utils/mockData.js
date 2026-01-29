// Mock video data - will be replaced with actual API calls later
export const mockVideos = [
  {
    id: '1',
    title: 'Introduction to Microservices Architecture',
    thumbnail: 'https://via.placeholder.com/320x180/141414/E50914?text=Video+1',
    duration: '12:45',
    views: '125K',
    uploadedAt: '2 days ago',
    uploader: 'Tech Guru',
    uploaderAvatar: 'https://via.placeholder.com/40/E50914/ffffff?text=TG',
  },
  {
    id: '2',
    title: 'Building Scalable Video Streaming Platforms',
    thumbnail: 'https://via.placeholder.com/320x180/141414/E50914?text=Video+2',
    duration: '18:30',
    views: '89K',
    uploadedAt: '5 days ago',
    uploader: 'CodeMaster',
    uploaderAvatar: 'https://via.placeholder.com/40/E50914/ffffff?text=CM',
  },
  {
    id: '3',
    title: 'React Hooks Deep Dive - useState & useEffect',
    thumbnail: 'https://via.placeholder.com/320x180/141414/E50914?text=Video+3',
    duration: '25:12',
    views: '234K',
    uploadedAt: '1 week ago',
    uploader: 'React Pro',
    uploaderAvatar: 'https://via.placeholder.com/40/E50914/ffffff?text=RP',
  },
  {
    id: '4',
    title: 'Docker & Kubernetes for Beginners',
    thumbnail: 'https://via.placeholder.com/320x180/141414/E50914?text=Video+4',
    duration: '31:08',
    views: '456K',
    uploadedAt: '2 weeks ago',
    uploader: 'DevOps Daily',
    uploaderAvatar: 'https://via.placeholder.com/40/E50914/ffffff?text=DD',
  },
  {
    id: '5',
    title: 'Understanding JWT Authentication',
    thumbnail: 'https://via.placeholder.com/320x180/141414/E50914?text=Video+5',
    duration: '15:22',
    views: '178K',
    uploadedAt: '3 weeks ago',
    uploader: 'Security First',
    uploaderAvatar: 'https://via.placeholder.com/40/E50914/ffffff?text=SF',
  },
  {
    id: '6',
    title: 'Node.js Best Practices 2024',
    thumbnail: 'https://via.placeholder.com/320x180/141414/E50914?text=Video+6',
    duration: '22:45',
    views: '312K',
    uploadedAt: '1 month ago',
    uploader: 'Backend Boss',
    uploaderAvatar: 'https://via.placeholder.com/40/E50914/ffffff?text=BB',
  },
  {
    id: '7',
    title: 'Tailwind CSS Advanced Techniques',
    thumbnail: 'https://via.placeholder.com/320x180/141414/E50914?text=Video+7',
    duration: '19:33',
    views: '267K',
    uploadedAt: '1 month ago',
    uploader: 'CSS Wizard',
    uploaderAvatar: 'https://via.placeholder.com/40/E50914/ffffff?text=CW',
  },
  {
    id: '8',
    title: 'MongoDB vs PostgreSQL: Which to Choose?',
    thumbnail: 'https://via.placeholder.com/320x180/141414/E50914?text=Video+8',
    duration: '27:56',
    views: '523K',
    uploadedAt: '2 months ago',
    uploader: 'Database Dan',
    uploaderAvatar: 'https://via.placeholder.com/40/E50914/ffffff?text=DB',
  },
];

export const mockComments = [
  {
    id: '1',
    user: 'John Doe',
    avatar: 'https://via.placeholder.com/40/E50914/ffffff?text=JD',
    text: 'Great explanation! This helped me understand microservices better.',
    likes: 45,
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    user: 'Sarah Smith',
    avatar: 'https://via.placeholder.com/40/E50914/ffffff?text=SS',
    text: 'Could you make a follow-up video on service discovery?',
    likes: 23,
    timestamp: '5 hours ago',
  },
  {
    id: '3',
    user: 'Mike Johnson',
    avatar: 'https://via.placeholder.com/40/E50914/ffffff?text=MJ',
    text: 'The best tutorial I\'ve found on this topic. Thanks!',
    likes: 67,
    timestamp: '1 day ago',
  },
];

// Helper function to format time durations
export const formatDuration = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Helper function to format view counts
export const formatViews = (count) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};
