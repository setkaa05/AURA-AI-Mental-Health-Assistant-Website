import { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { visionAPI } from '../../api/client';
import { useAppStore } from '../../store/appStore';
import GlassCard from '../ui/GlassCard';

export default function WebcamEmotion() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const setEmotion = useAppStore(state => state.setEmotion);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setIsActive(true);
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  useEffect(() => {
    if (isActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isActive]);

  const captureAndAnalyze = useCallback(async () => {
    if (!isActive || !videoRef.current || !canvasRef.current || isProcessing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Only capture if video is playing and has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);

    try {
      setIsProcessing(true);
      const result = await visionAPI.analyzeFrame(base64Image);
      // Update global AURA emotion state
      setEmotion(result);
    } catch (error) {
      console.error("Facial emotion analysis failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [isActive, isProcessing, setEmotion]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (isActive) {
      // Analyze a frame every 1.5 seconds
      intervalId = setInterval(() => {
        captureAndAnalyze();
      }, 1500);
    }
    return () => clearInterval(intervalId);
  }, [isActive, captureAndAnalyze]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <GlassCard className="p-3 mb-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 uppercase tracking-wider">Facial Analysis</span>
        <button
          onClick={isActive ? stopCamera : startCamera}
          className={`p-1.5 rounded-md transition-colors ${isActive ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'}`}
          title={isActive ? "Turn off webcam" : "Turn on webcam"}
        >
          {isActive ? <CameraOff size={14} /> : <Camera size={14} />}
        </button>
      </div>
      
      {isActive ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/50 ring-1 ring-white/10">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            translate="no"
            className="w-full h-full object-cover transform -scale-x-100 notranslate"
          />
          {isProcessing && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-500 animate-pulse" title="Analyzing..." />
          )}
        </div>
      ) : (
        <div className="w-full aspect-video rounded-lg bg-black/20 ring-1 ring-white/5 flex items-center justify-center border border-dashed border-slate-700/50">
          <span className="text-xs text-slate-500">Webcam disabled</span>
        </div>
      )}
      
      {/* Hidden canvas for capturing frames */}
      <canvas ref={canvasRef} className="hidden" />
    </GlassCard>
  );
}
