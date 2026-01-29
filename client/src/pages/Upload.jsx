import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt, FaCheckCircle } from 'react-icons/fa';
import useVideoStore from '../stores/videoStore';

// Upload page - drag-and-drop video upload
// Now connected to real backend API!

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const { uploadVideo, isLoading, uploadProgress, error } = useVideoStore();

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const videoFile = acceptedFiles[0];
      setFile(videoFile);
      // Auto-fill title from filename
      if (!title) {
        setTitle(videoFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm']
    },
    multiple: false,
    maxSize: 500 * 1024 * 1024, // 500MB max
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file || !title) {
      alert('Please select a file and enter a title');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', title);
      formData.append('description', description);
      
      await uploadVideo(formData);
      
      alert('Video uploaded successfully!');
      navigate('/');
    } catch (error) {
      alert('Upload failed: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Upload Video</h1>

      <form onSubmit={handleUpload} className="space-y-6">
        {/* Drag and drop zone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-all
            ${isDragActive 
              ? 'border-primary bg-primary bg-opacity-10' 
              : 'border-dark-200 hover:border-primary hover:bg-dark-300'
            }
            ${file ? 'border-green-500 bg-green-500 bg-opacity-10' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {file ? (
            <div className="flex flex-col items-center">
              <FaCheckCircle className="text-6xl text-green-500 mb-4" />
              <p className="text-lg font-semibold mb-2">{file.name}</p>
              <p className="text-sm text-gray-400">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Choose different file
              </button>
            </div>
          ) : (
            <div>
              <FaCloudUploadAlt className="text-6xl mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold mb-2">
                {isDragActive ? 'Drop the video here' : 'Drag & drop a video file'}
              </p>
              <p className="text-sm text-gray-400">
                or click to browse (MP4, MOV, AVI, MKV, WebM)
              </p>
              <p className="text-xs text-gray-500 mt-2">Max size: 500MB</p>
            </div>
          )}
        </div>

        {/* Video details */}
        {file && (
          <>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Title <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                className="w-full bg-dark-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers about your video"
                className="w-full bg-dark-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary resize-none"
                rows="4"
              />
            </div>

            {/* Upload progress */}
            {isLoading && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-dark-300 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {/* Submit button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Uploading...' : 'Upload Video'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-secondary px-8"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </form>

      {/* Info section */}
      <div className="mt-8 p-4 bg-dark-300 rounded-lg">
        <h3 className="font-semibold mb-2">📝 Note</h3>
        <p className="text-sm text-gray-400">
          Your video will be processed and transcoded to multiple qualities (1080p, 720p, 480p) 
          after upload. This may take a few minutes depending on the video length.
        </p>
      </div>
    </div>
  );
};

export default Upload;
