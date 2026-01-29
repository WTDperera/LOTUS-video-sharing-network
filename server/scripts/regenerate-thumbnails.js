// Script to regenerate thumbnails for existing videos
require('dotenv').config();
const mongoose = require('mongoose');
const Video = require('../models/Video');
const thumbnailService = require('../services/thumbnailService');
const fs = require('fs');
const path = require('path');

async function regenerateThumbnails() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lotus_video');
    console.log('✅ Connected to MongoDB');

    // Check FFmpeg availability
    const ffmpegReady = await thumbnailService.checkFfmpeg();
    if (!ffmpegReady) {
      console.error('❌ FFmpeg is not available. Cannot generate thumbnails.');
      process.exit(1);
    }

    // Find all videos without thumbnails
    const videosWithoutThumbnails = await Video.find({
      $or: [
        { thumbnail: null },
        { thumbnail: '' },
        { thumbnail: { $exists: false } }
      ]
    });

    console.log(`\n📊 Found ${videosWithoutThumbnails.length} videos without thumbnails\n`);

    if (videosWithoutThumbnails.length === 0) {
      console.log('✨ All videos already have thumbnails!');
      process.exit(0);
    }

    // Process each video
    let processed = 0;
    let failed = 0;

    for (const video of videosWithoutThumbnails) {
      try {
        console.log(`\n🎬 Processing: ${video.title}`);
        console.log(`   ID: ${video._id}`);
        console.log(`   File: ${video.filepath}`);

        // Check if video file exists
        if (!fs.existsSync(video.filepath)) {
          console.log(`   ⚠️  Video file not found, skipping...`);
          failed++;
          continue;
        }

        // Generate thumbnail
        const thumbnailPath = await thumbnailService.generateThumbnail(
          video.filepath,
          video._id.toString(),
          1 // 1 second timestamp
        );

        // Get video duration
        const durationSeconds = await thumbnailService.getVideoDuration(video.filepath);
        const formattedDuration = thumbnailService.formatDuration(durationSeconds);

        // Update video document
        if (thumbnailPath || formattedDuration !== '0:00') {
          video.thumbnail = thumbnailPath;
          video.duration = formattedDuration;
          await video.save();
          
          console.log(`   ✅ Thumbnail: ${thumbnailPath}`);
          console.log(`   ✅ Duration: ${formattedDuration}`);
          processed++;
        } else {
          console.log(`   ⚠️  Could not generate thumbnail or extract duration`);
          failed++;
        }

      } catch (error) {
        console.error(`   ❌ Error processing video: ${error.message}`);
        failed++;
      }
    }

    // Summary
    console.log('\n===========================================');
    console.log('📊 REGENERATION SUMMARY');
    console.log('===========================================');
    console.log(`✅ Successfully processed: ${processed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${videosWithoutThumbnails.length}`);
    console.log('===========================================\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
console.log('🚀 Starting thumbnail regeneration...\n');
regenerateThumbnails();
