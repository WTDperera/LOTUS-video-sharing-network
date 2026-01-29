import { useEffect, useRef } from 'react';
import shaka from 'shaka-player/dist/shaka-player.ui';
import 'shaka-player/dist/controls.css';
import { getStreamingUrl } from '../../utils/formatters';

/**
 * Component: Video Player with Shaka Player
 * Single Responsibility: Display video player with adaptive streaming
 * Follows: Single Responsibility Principle, Presentation Component Pattern
 */
const VideoPlayer = ({ videoId, thumbnail, title }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    // Check if browser supports Shaka Player
    if (!shaka.Player.isBrowserSupported()) {
      console.error('Browser not supported!');
      return;
    }

    const video = videoRef.current;
    const container = containerRef.current;
    
    // Initialize Shaka Player
    const player = new shaka.Player(video);
    playerRef.current = player;

    // Initialize UI
    const ui = new shaka.ui.Overlay(player, container, video);
    const controls = ui.getControls();

    // Configure player
    player.configure({
      streaming: {
        bufferingGoal: 30,
        rebufferingGoal: 2,
        bufferBehind: 30,
      },
    });

    // Error handling
    player.addEventListener('error', (event) => {
      console.error('Shaka Player Error:', event.detail);
    });

    // Load video source
    const videoUrl = getStreamingUrl(videoId);
    
    player.load(videoUrl).then(() => {
      console.log('Video loaded successfully!');
    }).catch((error) => {
      console.error('Error loading video:', error);
      // Fallback to native video player
      video.src = videoUrl;
    });

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  return (
    <div 
      ref={containerRef}
      className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4"
      data-shaka-player-container
    >
      <video 
        ref={videoRef}
        className="w-full h-full"
        poster={thumbnail}
        data-shaka-player
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
