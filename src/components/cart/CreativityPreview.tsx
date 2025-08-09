import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, X, 
  Download, Eye, Clock, FileImage, FileVideo 
} from 'lucide-react';

interface CreativityPreviewProps {
  file: File;
  preview: string;
  onRemove: () => void;
  momentMinute?: number;
  periodName?: string;
  className?: string;
}

export const CreativityPreview: React.FC<CreativityPreviewProps> = ({
  file,
  preview,
  onRemove,
  momentMinute,
  periodName,
  className = ""
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <>
      <div className={`relative group ${className}`}>
        {/* Preview Container */}
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
          {isImage ? (
            <img
              src={preview}
              alt="Creativity preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              src={preview}
              className="w-full h-full object-cover"
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            />
          )}

          {/* Video Controls Overlay */}
          {isVideo && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
              {/* Play/Pause Button */}
              <button
                onClick={handlePlayPause}
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="w-12 h-12 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors">
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </div>
              </button>

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Progress Bar */}
                {duration > 0 && (
                  <div 
                    className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-2"
                    onClick={handleSeek}
                  >
                    <div 
                      className="h-full bg-white rounded-full transition-all"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between text-white text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleMuteToggle}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                    {duration > 0 && (
                      <span className="text-xs">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setShowFullscreen(true)}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Remove Button */}
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>

          {/* File Type Badge */}
          <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded-full flex items-center gap-1">
            {isVideo ? (
              <FileVideo className="w-3 h-3" />
            ) : (
              <FileImage className="w-3 h-3" />
            )}
            {isVideo ? 'Video' : 'Imagen'}
          </div>
        </div>

        {/* File Info */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </span>
            <span className="text-xs text-gray-500">
              {formatFileSize(file.size)}
            </span>
          </div>

          {(momentMinute || periodName) && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock className="w-3 h-3" />
              <span>
                {periodName} {momentMinute && `- Minuto ${momentMinute}`}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFullscreen(true)}
              className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <Eye className="w-3 h-3" />
              Vista previa
            </button>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = preview;
                link.download = file.name;
                link.click();
              }}
              className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <Download className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {showFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowFullscreen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {isImage ? (
                  <img
                    src={preview}
                    alt="Creativity preview"
                    className="max-w-full max-h-[80vh] object-contain rounded-lg"
                  />
                ) : (
                  <video
                    src={preview}
                    controls
                    autoPlay
                    className="max-w-full max-h-[80vh] object-contain rounded-lg"
                  />
                )}

                <button
                  onClick={() => setShowFullscreen(false)}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 text-center text-white">
                <h3 className="font-medium">{file.name}</h3>
                <p className="text-sm text-gray-300 mt-1">
                  {formatFileSize(file.size)} • {isVideo ? 'Video' : 'Imagen'}
                  {(momentMinute || periodName) && (
                    <span> • {periodName} {momentMinute && `- Minuto ${momentMinute}`}</span>
                  )}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CreativityPreview;