
import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Eraser, Pencil, RotateCcw } from 'lucide-react';

interface DrawingCanvasProps {
  width?: number;
  height?: number;
}

export interface DrawingCanvasRef {
  getDataUrl: () => string;
  clear: () => void;
}

export const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({ width = 512, height = 512 }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil');
  const [lineWidth, setLineWidth] = useState(5);
  // History for undo could be added here, keeping it simple for now

  useImperativeHandle(ref, () => ({
    getDataUrl: () => {
      if (canvasRef.current) {
        return canvasRef.current.toDataURL('image/png');
      }
      return '';
    },
    clear: () => clearCanvas()
  }));

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000000'; // Black background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  useEffect(() => {
    clearCanvas();
  }, []);


  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.beginPath(); // Reset path to avoid connecting lines
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get coordinates
    let clientX, clientY;
    if ('touches' in e) {
        const touch = e.touches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = tool === 'pencil' ? '#FFFFFF' : '#000000'; // White stroke, Black eraser

    // To make smooth lines, we usually need prevPos. For simplicity here (dots/fast movement might break),
    // but `lineTo` is needed.
    // Simplest reliable way without state:
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  
  // Fix specifically for the "start" of the line
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
      setIsDrawing(true);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.beginPath();
      draw(e);
  };


  return (
    <div className="flex flex-col gap-2 items-center">
      <div className="relative border-4 border-slate-700 rounded-lg overflow-hidden shadow-xl bg-black touch-none">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="cursor-crosshair w-full h-full block"
          style={{ width: '100%', maxWidth: '500px', aspectRatio: '1/1' }}
          onMouseDown={handleStart}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={handleStart}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      
      <div className="flex gap-4 p-2 bg-slate-800 rounded-full border border-slate-700">
        <button 
            onClick={() => { setTool('pencil'); setLineWidth(5); }}
            className={`p-3 rounded-full transition-colors ${tool === 'pencil' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
            <Pencil size={20} />
        </button>
        <button 
            onClick={() => { setTool('eraser'); setLineWidth(20); }}
            className={`p-3 rounded-full transition-colors ${tool === 'eraser' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
            <Eraser size={20} />
        </button>
        <div className="w-px bg-slate-600 mx-2"></div>
        <button 
            onClick={clearCanvas}
            className="p-3 rounded-full text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
        >
            <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';
