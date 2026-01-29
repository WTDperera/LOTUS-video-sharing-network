const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Thumbnail Service - Generates thumbnails from videos
class ThumbnailService {
  constructor() {
    this.thumbnailDir = path.join(__dirname, '../uploads/thumbnails');
    this.ffmpegAvailable = null; // null = not checked yet, true/false = checked
    this.ffmpegCheckPromise = null;
    this.ensureThumbnailDir();
  }

  /**
   * Check if FFmpeg is available on the system
   * @returns {Promise<boolean>}
   */
  async checkFfmpeg() {
    // Return cached result if already checked
    if (this.ffmpegAvailable !== null) {
      return this.ffmpegAvailable;
    }

    // If check is in progress, wait for it
    if (this.ffmpegCheckPromise) {
      return this.ffmpegCheckPromise;
    }

    // Start the check
    this.ffmpegCheckPromise = new Promise((resolve) => {
      ffmpeg.getAvailableFormats((err) => {
        if (err) {
          console.warn('⚠️ FFmpeg not found. Thumbnail generation disabled.');
          console.warn('   Install FFmpeg: https://ffmpeg.org/download.html');
          console.warn('   Windows: winget install FFmpeg');
          this.ffmpegAvailable = false;
        } else {
          console.log('✅ FFmpeg detected - Thumbnail generation enabled');
          this.ffmpegAvailable = true;
        }
        resolve(this.ffmpegAvailable);
      });
    });

    return this.ffmpegCheckPromise;
  }

  /**
   * Ensure thumbnail directory exists
   */
  ensureThumbnailDir() {
    if (!fs.existsSync(this.thumbnailDir)) {
      fs.mkdirSync(this.thumbnailDir, { recursive: true });
      console.log('📁 Created thumbnails directory');
    }
  }

  /**
   * Generate thumbnail from video file
   * @param {string} videoPath - Path to the video file
   * @param {string} videoId - Video ID for naming the thumbnail
   * @param {number} timestamp - Time in seconds to capture (default: 1 second)
   * @returns {Promise<string>} Path to generated thumbnail
   */
  async generateThumbnail(videoPath, videoId, timestamp = 1) {
    // Check FFmpeg availability first
    const ffmpegReady = await this.checkFfmpeg();
    
    if (!ffmpegReady) {
      console.log('⏭️ Skipping thumbnail generation (FFmpeg not available)');
      return null;
    }

    return new Promise((resolve, reject) => {
      const thumbnailFilename = `${videoId}.jpg`;

      // Check if video file exists
      if (!fs.existsSync(videoPath)) {
        console.error('❌ Video file not found:', videoPath);
        return resolve(null);
      }

      console.log(`🎬 Generating thumbnail for: ${videoPath}`);

      ffmpeg(videoPath)
        .on('end', () => {
          console.log(`✅ Thumbnail generated: ${thumbnailFilename}`);
          resolve(`/uploads/thumbnails/${thumbnailFilename}`);
        })
        .on('error', (err) => {
          console.error('❌ Thumbnail generation error:', err.message);
          // Return null instead of rejecting - thumbnail is optional
          resolve(null);
        })
        .screenshots({
          count: 1,
          folder: this.thumbnailDir,
          filename: thumbnailFilename,
          size: '320x180',
          timemarks: [timestamp]
        });
    });
  }

  /**
   * Generate multiple thumbnails at different timestamps
   * @param {string} videoPath - Path to the video file
   * @param {string} videoId - Video ID for naming
   * @param {number} count - Number of thumbnails to generate
   * @returns {Promise<string[]>} Array of thumbnail paths
   */
  async generateMultipleThumbnails(videoPath, videoId, count = 3) {
    const ffmpegReady = await this.checkFfmpeg();
    if (!ffmpegReady) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const thumbnails = [];

      if (!fs.existsSync(videoPath)) {
        return resolve([]);
      }

      ffmpeg(videoPath)
        .on('filenames', (filenames) => {
          filenames.forEach((name) => {
            thumbnails.push(`/uploads/thumbnails/${name}`);
          });
        })
        .on('end', () => {
          console.log(`✅ Generated ${count} thumbnails for video ${videoId}`);
          resolve(thumbnails);
        })
        .on('error', (err) => {
          console.error('❌ Thumbnail generation error:', err.message);
          resolve([]);
        })
        .screenshots({
          count: count,
          folder: this.thumbnailDir,
          filename: `${videoId}-%i.jpg`,
          size: '320x180'
        });
    });
  }

  /**
   * Get video duration in seconds
   * @param {string} videoPath - Path to video file
   * @returns {Promise<number>} Duration in seconds
   */
  async getVideoDuration(videoPath) {
    const ffmpegReady = await this.checkFfmpeg();
    if (!ffmpegReady) {
      return 0;
    }

    return new Promise((resolve) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          console.error('❌ Error getting video duration:', err.message);
          resolve(0);
          return;
        }
        const duration = metadata.format.duration || 0;
        console.log(`📏 Video duration: ${Math.floor(duration)} seconds`);
        resolve(Math.floor(duration));
      });
    });
  }

  /**
   * Format duration to MM:SS or HH:MM:SS
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration
   */
  formatDuration(seconds) {
    if (!seconds || seconds <= 0) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Delete thumbnail file
   * @param {string} thumbnailPath - Path to thumbnail
   */
  deleteThumbnail(thumbnailPath) {
    if (!thumbnailPath) return;

    const fullPath = path.join(__dirname, '..', thumbnailPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`🗑️ Deleted thumbnail: ${thumbnailPath}`);
    }
  }
}

module.exports = new ThumbnailService();
