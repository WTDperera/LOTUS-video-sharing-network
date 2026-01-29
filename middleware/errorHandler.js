const multer = require('multer');

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Multer errors (file upload)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        message: 'File too large. Maximum size is 500MB' 
      });
    }
    return res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
  
  // Custom error with status code
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }
  
  // Default server error
  res.status(500).json({ 
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
  });
};

// 404 Not Found Handler
const notFound = (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
};

module.exports = { errorHandler, notFound };
