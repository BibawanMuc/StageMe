
import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, Upload } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });
      setStream(newStream);
      setStream(newStream);
      setIsCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please allow permissions or upload a file.");
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  // Attach stream to video element when it becomes available
  useEffect(() => {
    if (isCameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraActive, stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Empty dependency array ensures this only runs on unmount

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror if user facing
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageDataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCamera = () => {
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (!isCameraActive) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center p-8 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/50">
        <button 
          onClick={startCamera}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
        >
          <Camera size={20} />
          Take Photo
        </button>
        <div className="text-slate-400 text-sm">- OR -</div>
        <label className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold cursor-pointer transition-colors">
          <Upload size={20} />
          Upload Photo
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md aspect-[3/4] bg-black rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline
        muted
        onLoadedMetadata={() => videoRef.current?.play()}
        className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} 
      />
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 p-4">
        <button 
          onClick={stopCamera}
          className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-full text-white backdrop-blur-sm"
        >
          Cancel
        </button>
        <button 
          onClick={capturePhoto}
          className="w-16 h-16 bg-white rounded-full border-4 border-slate-300 shadow-lg hover:scale-105 transition-transform"
        />
        <button 
          onClick={toggleCamera}
          className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-full text-white backdrop-blur-sm"
        >
          <RefreshCw size={20} />
        </button>
      </div>
    </div>
  );
}
