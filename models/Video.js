const mongoose = require('mongoose');

// Video Model - Data Access Layer
const VideoSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Video title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: { 
    type: String, 
    default: '',
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  filename: { 
    type: String, 
    required: true 
  },
  filepath: { 
    type: String, 
    required: true 
  },
  thumbnail: {
    type: String,
    default: null
  },
  size: { 
    type: Number, 
    required: true 
  },
  duration: { 
    type: String, 
    default: '0:00' 
  },
  views: { 
    type: Number, 
    default: 0 
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  },
  uploader: { 
    type: String, 
    default: 'Anonymous' 
  },
  uploaderAvatar: { 
    type: String, 
    default: 'https://via.placeholder.com/40/E50914/ffffff?text=U' 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, {
  timestamps: true
});

// Indexes for better query performance
VideoSchema.index({ uploadedAt: -1 });
VideoSchema.index({ userId: 1 });
VideoSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Video', VideoSchema);
