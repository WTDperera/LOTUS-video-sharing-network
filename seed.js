// Database seeder - adds demo videos if database is empty
// Run this script to populate your database with sample data

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/lotus_video')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// Video Schema (same as in index.js)
const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  size: { type: Number, required: true },
  duration: { type: String, default: '0:00' },
  views: { type: Number, default: 0 },
  uploadedAt: { type: Date, default: Date.now },
  uploader: { type: String, default: 'Anonymous' },
  uploaderAvatar: { type: String, default: 'https://via.placeholder.com/40/E50914/ffffff?text=U' }
});

const Video = mongoose.model('Video', VideoSchema);

// Demo videos data
const demoVideos = [
  {
    title: 'Welcome to Lotus Video Platform',
    description: 'This is a demo video showcasing the platform capabilities. Upload your own videos to get started!',
    filename: 'demo-welcome.mp4',
    filepath: 'uploads/demo-welcome.mp4',
    size: 5242880, // 5MB
    duration: '2:30',
    views: 1250,
    uploader: 'Lotus Team',
    uploaderAvatar: 'https://via.placeholder.com/40/E50914/ffffff?text=LT',
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    title: 'Getting Started with Video Upload',
    description: 'Learn how to upload your first video to the platform. Simple drag-and-drop interface makes it easy!',
    filename: 'demo-tutorial.mp4',
    filepath: 'uploads/demo-tutorial.mp4',
    size: 8388608, // 8MB
    duration: '5:45',
    views: 850,
    uploader: 'Tutorial Master',
    uploaderAvatar: 'https://via.placeholder.com/40/E50914/ffffff?text=TM',
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  },
  {
    title: 'Platform Features Overview',
    description: 'Explore all the amazing features available on Lotus Video Platform including streaming, comments, and more.',
    filename: 'demo-features.mp4',
    filepath: 'uploads/demo-features.mp4',
    size: 10485760, // 10MB
    duration: '8:15',
    views: 2340,
    uploader: 'Feature Guide',
    uploaderAvatar: 'https://via.placeholder.com/40/E50914/ffffff?text=FG',
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
  }
];

async function seedDatabase() {
  try {
    // Check if database already has videos
    const existingVideos = await Video.countDocuments();
    
    if (existingVideos > 0) {
      console.log(`ℹ️  Database already has ${existingVideos} video(s)`);
      console.log('Skipping seed. Delete existing videos first if you want to reseed.');
      process.exit(0);
    }

    // Insert demo videos
    console.log('🌱 Seeding database with demo videos...');
    await Video.insertMany(demoVideos);
    
    console.log(`✅ Successfully added ${demoVideos.length} demo videos!`);
    console.log('Note: These are placeholder entries. Actual video files need to be uploaded separately.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeder
seedDatabase();
