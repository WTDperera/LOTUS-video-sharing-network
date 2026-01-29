const videoService = require('../services/videoService');
const thumbnailService = require('../services/thumbnailService');
const fs = require('fs');

// Helper function: Process video metadata (thumbnail + duration) in background
async function processVideoMetadata(videoId, videoPath) {
  try {
    console.log(`🎬 Processing metadata for video: ${videoId}`);
    console.log(`📂 Video path: ${videoPath}`);

    // Generate thumbnail at 1 second mark
    const thumbnailPath = await thumbnailService.generateThumbnail(
      videoPath, 
      videoId.toString(),
      1
    );

    // Get video duration
    const durationSeconds = await thumbnailService.getVideoDuration(videoPath);
    const formattedDuration = thumbnailService.formatDuration(durationSeconds);

    // Update video with thumbnail and duration
    if (thumbnailPath || formattedDuration !== '0:00') {
      await videoService.updateVideo(videoId, {
        thumbnail: thumbnailPath,
        duration: formattedDuration
      });
      console.log(`✅ Video metadata processed: thumbnail=${thumbnailPath}, duration=${formattedDuration}`);
    } else {
      console.log('⚠️ No metadata to update');
    }
  } catch (error) {
    console.error('❌ Error processing video metadata:', error.message);
    console.error(error.stack);
  }
}

// Video Controller - Presentation Layer
class VideoController {

  // @desc    Get all videos
  // @route   GET /api/videos
  // @access  Public
  async getAllVideos(req, res) {
    try {
      const { search } = req.query;
      const videos = await videoService.getAllVideos(search);
      const userId = req.user ? req.user.id : null;
      
      const formattedVideos = videos.map(video => 
        videoService.formatVideoForResponse(video, req.app.get('port'), userId)
      );
      
      res.json(formattedVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error fetching videos', 
        error: error.message 
      });
    }
  }

  // @desc    Get single video by ID
  // @route   GET /api/videos/:id
  // @access  Public
  async getVideoById(req, res) {
    try {
      const video = await videoService.getVideoById(req.params.id);
      const userId = req.user ? req.user.id : null;
      const formattedVideo = videoService.formatVideoForResponse(
        video, 
        req.app.get('port'),
        userId
      );
      
      res.json(formattedVideo);
    } catch (error) {
      console.error('Error fetching video:', error);
      const statusCode = error.message === 'Video not found' ? 404 : 500;
      res.status(statusCode).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  // @desc    Upload video
  // @route   POST /api/videos/upload
  // @access  Private/Public
  async uploadVideo(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          message: 'Please upload a file' 
        });
      }

      const videoData = {
        title: req.body.title || req.file.originalname,
        description: req.body.description || '',
        filename: req.file.filename,
        filepath: req.file.path,
        size: req.file.size,
        uploader: req.user ? req.user.name : (req.body.uploader || 'Demo User'),
        uploaderAvatar: req.user ? req.user.avatar : 'https://via.placeholder.com/40/E50914/ffffff?text=DU',
        userId: req.user ? req.user.id : null
      };

      const newVideo = await videoService.createVideo(videoData);
      console.log(`✅ Video Saved: ${newVideo.title}`);

      // Generate thumbnail and get duration in background
      // Process metadata asynchronously without waiting
      processVideoMetadata(newVideo._id, req.file.path);
      
      res.status(201).json({
        success: true,
        message: 'Video uploaded successfully',
        video: {
          id: newVideo._id,
          title: newVideo.title,
          description: newVideo.description
        }
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error uploading video', 
        error: error.message 
      });
    }
  }

  // @desc    Increment video views
  // @route   POST /api/videos/:id/view
  // @access  Public
  async incrementViews(req, res) {
    try {
      const views = await videoService.incrementViews(req.params.id);
      res.json({ success: true, views });
    } catch (error) {
      console.error('Error incrementing views:', error);
      const statusCode = error.message === 'Video not found' ? 404 : 500;
      res.status(statusCode).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  // @desc    Delete video
  // @route   DELETE /api/videos/:id
  // @access  Private (user can only delete their own videos)
  async deleteVideo(req, res) {
    try {
      const videoId = req.params.id;
      const video = await videoService.getVideoById(videoId);

      // Check if user owns the video or is admin
      if (req.user && video.userId) {
        if (video.userId.toString() !== req.user.id && req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this video',
          });
        }
      }

      // Delete physical video file
      if (fs.existsSync(video.filepath)) {
        fs.unlinkSync(video.filepath);
      }

      // Delete thumbnail file
      if (video.thumbnail) {
        thumbnailService.deleteThumbnail(video.thumbnail);
      }

      // Delete from database
      await videoService.deleteVideo(videoId);
      console.log(`✅ Video Deleted: ${video.title}`);

      res.json({
        success: true,
        message: 'Video deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      const statusCode = error.message === 'Video not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  // @desc    Like a video
  // @route   POST /api/videos/:id/like
  // @access  Private (requires authentication)
  async likeVideo(req, res) {
    try {
      const result = await videoService.toggleLike(req.params.id, req.user.id);
      res.json({ 
        success: true, 
        ...result 
      });
    } catch (error) {
      console.error('Error liking video:', error);
      const statusCode = error.message === 'Video not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  // @desc    Dislike a video
  // @route   POST /api/videos/:id/dislike
  // @access  Private (requires authentication)
  async dislikeVideo(req, res) {
    try {
      const result = await videoService.toggleDislike(req.params.id, req.user.id);
      res.json({ 
        success: true, 
        ...result 
      });
    } catch (error) {
      console.error('Error disliking video:', error);
      const statusCode = error.message === 'Video not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  // @desc    Get video thumbnail
  // @route   GET /api/videos/:id/thumbnail
  // @access  Public
  async getThumbnail(req, res) {
    try {
      const video = await videoService.getVideoById(req.params.id);
      
      // If video has a generated thumbnail, serve it
      if (video.thumbnail) {
        const path = require('path');
        const thumbnailPath = path.join(__dirname, '..', video.thumbnail);
        
        if (fs.existsSync(thumbnailPath)) {
          return res.sendFile(thumbnailPath);
        }
      }
      
      // Fallback to placeholder
      const placeholderUrl = `https://via.placeholder.com/320x180/141414/E50914?text=${encodeURIComponent(video.title.substring(0, 20))}`;
      res.redirect(placeholderUrl);
    } catch (error) {
      const statusCode = error.message === 'Video not found' ? 404 : 500;
      res.status(statusCode).send(error.message);
    }
  }

  // @desc    Stream video
  // @route   GET /video/:id
  // @access  Public
  async streamVideo(req, res) {
    try {
      const video = await videoService.getVideoById(req.params.id);
      const videoPath = video.filepath;
      
      if (!fs.existsSync(videoPath)) {
        return res.status(404).send('Video file not found on server');
      }
      
      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      // Set CORS headers for video streaming
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Range');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
      res.setHeader('Accept-Ranges', 'bytes');

      // Handle OPTIONS request
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }

      if (range) {
        // Parse Range header
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        
        // Validate range
        if (start >= fileSize || end >= fileSize) {
          res.status(416).send('Requested range not satisfiable');
          return;
        }

        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        
        const headers = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
          'Cache-Control': 'public, max-age=3600',
        };

        res.writeHead(206, headers);
        file.pipe(res);

        file.on('error', (err) => {
          console.error('Stream error:', err);
          res.end();
        });

      } else {
        // No range requested, stream entire file
        const headers = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
          'Cache-Control': 'public, max-age=3600',
        };
        
        res.writeHead(200, headers);
        const fileStream = fs.createReadStream(videoPath);
        fileStream.pipe(res);

        fileStream.on('error', (err) => {
          console.error('Stream error:', err);
          res.end();
        });
      }

    } catch (error) {
      console.error('Streaming error:', error);
      res.status(500).send('Stream Error');
    }
  }
}

module.exports = new VideoController();
