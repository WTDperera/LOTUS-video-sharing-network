// --- 1. අවශ්‍ය Tools (Libraries) ගෙන්වා ගැනීම ---
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// --- 2. App එක සහ Port එක සකසා ගැනීම ---
const app = express();
const port = 3000;

// --- 3. Database සම්බන්ධතාවය (MongoDB Connection) ---
// Local MongoDB එකට 'lotus_video' නමින් කනෙක්ට් වෙනවා
mongoose.connect('mongodb://127.0.0.1:27017/lotus_video')
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- 4. Database Schema සහ Model (දත්ත ආකෘතිය) ---
const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true }, // වීඩියෝ එකේ නම
  filename: { type: String, required: true }, // ෆයිල් එකේ නම
  filepath: { type: String, required: true }, // හාඩ් ඩිස්ක් එකේ තියෙන තැන
  size: { type: Number, required: true },     // ෆයිල් සයිස් එක
  uploadedAt: { type: Date, default: Date.now } // අප්ලෝඩ් කළ වෙලාව
});

const Video = mongoose.model('Video', VideoSchema);

// --- 5. File Upload Configuration (Multer) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // වීඩියෝ සේව් වෙන්නේ 'uploads' ෆෝල්ඩර් එකට
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // නම ගැටෙන්නේ නැති වෙන්න වෙලාව (timestamp) එකතු කරනවා
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

// --- 6. Routes (පාරවල්) ---

// A. Home Page Route (Frontend එක පෙන්වීම)
app.get('/', async (req, res) => {
  try {
    // Database එකේ තියෙන ඔක්කොම වීඩියෝ ටික ඉල්ලගන්නවා
    const videos = await Video.find().sort({ uploadedAt: -1 }); // අලුත් ඒවා උඩින්

    // වීඩියෝ ලිස්ට් එක HTML බවට හරවනවා
    let videoListHtml = videos.map(vid => {
      return `
        <div style="margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #fff;">
          <h3>🎬 ${vid.title}</h3>
          <p style="font-size: 12px; color: #666;">ID: ${vid._id} | Size: ${(vid.size / (1024 * 1024)).toFixed(2)} MB</p>
          
          <video width="600" controls preload="metadata">
            <source src="/video/${vid._id}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
      `;
    }).join('');

    // සම්පූර්ණ පිටුව යවනවා
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lotus Video Platform v1.0</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
          .upload-box { background: #e3f2fd; padding: 20px; border-radius: 8px; border: 1px solid #2196f3; }
          h1 { color: #333; }
          button { padding: 10px 20px; background: #2196f3; color: white; border: none; cursor: pointer; border-radius: 4px; }
          button:hover { background: #1976d2; }
          input[type="text"] { padding: 8px; width: 60%; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <h1>🪷 Lotus Video Platform (Dev Log)</h1>
        
        <div class="upload-box">
          <h2>📤 Upload New Video</h2>
          <form action="/upload" method="post" enctype="multipart/form-data">
            <label>Video Title:</label><br>
            <input type="text" name="videoTitle" placeholder="Enter a cool title..." required /><br>
            <input type="file" name="myVideo" accept="video/*" required /><br><br>
            <button type="submit">Upload Video</button>
          </form>
        </div>

        <hr style="margin: 30px 0;">

        <h2>📺 Recent Videos</h2>
        ${videos.length > 0 ? videoListHtml : '<p>No videos uploaded yet.</p>'}
      </body>
      </html>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// B. Upload Route (වීඩියෝ එක සේව් කිරීම)
app.post('/upload', upload.single('myVideo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('Please upload a file');
    }

    // Database එකට විස්තර දානවා
    const newVideo = new Video({
      title: req.body.videoTitle,
      filename: req.file.filename,
      filepath: req.file.path,
      size: req.file.size
    });

    await newVideo.save(); // Async වැඩක්
    console.log(`✅ Video Saved: ${newVideo.title}`);
    
    // ආපහු මුල් පිටුවටම යවනවා (Refresh)
    res.redirect('/');

  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading video');
  }
});

// C. Streaming Route (වීඩියෝ එක කෑලි වශයෙන් යැවීම)
app.get('/video/:id', async (req, res) => {
  try {
    // 1. ID එකෙන් වීඩියෝ එක හොයනවා
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).send('Video not found');

    const videoPath = video.filepath;
    const videoSize = fs.statSync(videoPath).size;

    // 2. Range Header එක බලනවා
    const range = req.headers.range;

    if (range) {
      // --- Streaming Logic ---
      
      // Range එකෙන් පටන් ගන්න තැන (Start) ගන්නවා (Example: "bytes=32324-")
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      
      // ඉවර වෙන තැන (End) ගණනය කරනවා (Chunk Size = 1MB)
      const chunk_size = 10 ** 6; // 1MB
      const end = Math.min(start + chunk_size, videoSize - 1);

      // යවන කොටසේ සයිස් එක
      const contentLength = end - start + 1;
      
      const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
      };

      // 206 Partial Content යවනවා
      res.writeHead(206, headers);
      
      // Stream එක හදලා Pipe කරනවා
      const file = fs.createReadStream(videoPath, { start, end });
      file.pipe(res);

    } else {
      // Range එකක් ඉල්ලලා නැත්නම් මුළු ෆයිල් එකම යවනවා (පොඩි වීඩියෝ වලට)
      const headers = {
        "Content-Length": videoSize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(200, headers);
      fs.createReadStream(videoPath).pipe(res);
    }

  } catch (error) {
    console.error(error);
    res.status(500).send('Stream Error');
  }
});

// --- 7. Server Start ---
app.listen(port, () => {
  console.log(`🚀 Lotus Server is running on http://localhost:${port}`);
  console.log('Ensure MongoDB is running and "uploads" folder exists!');
});