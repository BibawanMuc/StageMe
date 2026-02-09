
import QRCode from 'react-qr-code';
import { Download, RefreshCw } from 'lucide-react';

interface ResultViewProps {
  resultUrl: string;
  onRestart: () => void;
}

export function ResultView({ resultUrl, onRestart }: ResultViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 animate-fade-in space-y-8">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <img 
          src={resultUrl} 
          alt="Generated Masterpiece" 
          className="relative rounded-xl shadow-2xl max-h-[60vh] object-contain bg-black"
        />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-4xl bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700">
        
        <div className="flex-1 space-y-4 text-center md:text-left">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Your Masterpiece is Ready!
          </h2>
          <p className="text-slate-400">
            Scan the QR code to download your image instantly to your mobile device.
          </p>
          <div className="flex gap-4 justify-center md:justify-start">
            <button 
              onClick={onRestart}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={20} />
              Create Another
            </button>
            <button 
              onClick={async () => {
                try {
                  const response = await fetch(resultUrl);
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = "StageMe-Masterpiece.png";
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                } catch (e) {
                  console.error("Download failed:", e);
                  // Fallback for same-origin or if fetch fails
                  window.open(resultUrl, '_blank');
                }
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Download size={20} />
              Download
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-lg shrink-0">
          <QRCode value={resultUrl} size={128} />
        </div>
      </div>
    </div>
  );
}
