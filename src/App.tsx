
import { useState, useRef } from 'react';
import { CameraCapture } from './components/CameraCapture';
import { DrawingCanvas, type DrawingCanvasRef } from './components/DrawingCanvas';
import { StageSelector } from './components/StageSelector';
import { ResultView } from './components/ResultView';
import { generateStageImage } from './services/geminiService';
import { uploadFile, saveGenerationRecord } from './services/supabaseService';
import { Sparkles, Loader2 } from 'lucide-react';

function App() {
  // State
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>('Stage 1');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Refs
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const handleCapture = (imageSrc: string) => {
    setPhoto(imageSrc);
  };

  const handleGenerate = async () => {
    if (!photo) {
      alert("Please take a photo first!");
      return;
    }
    if (!canvasRef.current) return;

    const sketchDataUrl = canvasRef.current.getDataUrl();
    // Basic check if canvas is empty? (Optional)

    setIsGenerating(true);
    setStatusMessage('Dreaming up your stage...');

    try {
      // 1. Get Selected Stage Details
      // We need to import STAGES or find it. Ideally STAGES should be consistent.
      // For now, I will assume we can get it or just pass the ID and let the service handle it? 
      // No, service is pure logic. The App should prepare the data.
      // Let's quickly grab the path based on ID.
      const stageConfig = {
        'Stage 1': { path: '/stages/stage1.png', prompt: 'The character is a DJ performing a set. Ensure they are positioned correctly behind the decks if visible, or commanding the stage. Scale them to fit a realistic human proportion within this specific concert venue.' },
        'Stage 2': { path: '/stages/stage2.png', prompt: 'The character is standing in a magical forest. Ensure the lighting from the glowing plants reflects on them.' },
        'Stage 3': { path: '/stages/stage3.png', prompt: 'The character is an explorer on Mars. Adjust lighting to match the reddish atmospheric haze.' }
      }[selectedStage] || { path: '/stages/stage1.png', prompt: 'A generic stage' };

      // Fetch Stage Image
      let stageBase64 = '';
      try {
        const response = await fetch(stageConfig.path);
        const blob = await response.blob();
        const reader = new FileReader();
        stageBase64 = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.warn("Could not load stage image, sending placeholder text context only.", err);
      }

      // 1. Generate with Gemini
      // Now passing 3rd arg matches the updated signature? 
      // Wait, I updated geminiService signature?
      // I need to update the call to match the new signature: (sketch, photo, stageImageBase64, promptContext)
      // I need to update geminiService signature properly first if I haven't.
      // Let's check `geminiService` signature in my previous step... 
      // I updated logic but did I update arguments?
      // I need to ensure App passes specific arguments.
      
      const generatedImageBase64 = await generateStageImage(
          sketchDataUrl, 
          photo, 
          stageBase64, 
          stageConfig.prompt 
      );
      
      // Determine if we got an image or text
      // If it starts with data:image, it's an image.
      // If prompt logic expects text, we might need to handle it.
      // For now, assume geminiService returns something we can use.
      // IF geminiService returns *text description*, we can't display it as image.
      // See note in geminiService: we are currently logging text.
      // If the model creates an image (e.g. via tooling), we'd get a url or base64.
      
      // MOCK BEHAVIOR FOR SKELETON:
      // If the service returns text (likely), we might mock the "Generation" for the UI flow 
      // if we don't have a real image generator connected yet.
      // BUT we must try to upload whatever we got.
      
      // Let's assume for this MVP step, if it's not a valid image URL/Base64, we might show a placeholder
      // or if logic in service handles it. 
      // Re-reading geminiService: it currently returns `response.text()`.
      // This will definitely NOT be an image.
      // I will add a temporary placeholder logic HERE for the UI to be testable,
      // while acknowledging that real image gen requires a capable model/endpoint.
      
      // Temporary: If result is text, Alert it? 
      // Better: Create a dummy image or use the sketch as result for testing flow.
      // I will interpret the response. If it's long text, it's a description.
      // I will use a placeholder image for the "Result" to prove the flow works (Upload -> Save).
      
      let finalResultUrl = generatedImageBase64;
      
      if (!generatedImageBase64.startsWith('data:image') && !generatedImageBase64.startsWith('http')) {
          console.warn("Gemini returned text, not image:", generatedImageBase64);
          // Show the actual error/message from Gemini in the UI status
          setStatusMessage(`AI Message: ${generatedImageBase64.substring(0, 100)}...`);
          // Fallback: Use sketch as the visual result, but we will save the text description in the database
          finalResultUrl = sketchDataUrl; 
          
          // Allow use to see the message for a moment before proceeding? 
          // Or just let them see the result is the sketch.
          alert(`Gemini could not generate an image. Reason:\n\n${generatedImageBase64}`);
      }

      setStatusMessage('Saving masterpiece...');

      // 2. Upload Assets to Supabase
      // Convert Base64 to Blobs
      const photoBlob = await (await fetch(photo)).blob();
      const sketchBlob = await (await fetch(sketchDataUrl)).blob();
      
      // If finalResult is base64
      let resultBlob: Blob;
      if (finalResultUrl.startsWith('data:')) {
          resultBlob = await (await fetch(finalResultUrl)).blob();
      } else {
          // It's a URL or text? If URL, we might not need to re-upload.
          // If it was a mock, it's sketchBlob.
          resultBlob = sketchBlob;
      }

      const [photoUrl, sketchUrl, uploadedResultUrl] = await Promise.all([
        uploadFile(photoBlob, 'pAIntBoard', `photos/${Date.now()}_photo.jpg`),
        uploadFile(sketchBlob, 'pAIntBoard', `sketches/${Date.now()}_sketch.png`),
        uploadFile(resultBlob, 'pAIntBoard', `results/${Date.now()}_result.png`)
      ]);

      if (!photoUrl || !sketchUrl || !uploadedResultUrl) {
        throw new Error("Failed to upload assets");
      }

      // 3. Save Record
      await saveGenerationRecord(
        sketchUrl, 
        uploadedResultUrl, 
        photoUrl, 
        { raw_prompt: "Generated via StageMe", model_response: generatedImageBase64 }, 
        selectedStage
      );

      setResultUrl(uploadedResultUrl);

    } catch (e) {
      console.error(e);
      alert("Something went wrong! Check console.");
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  const handleRestart = () => {
    setResultUrl(null);
    setPhoto(null);
    canvasRef.current?.clear();
  };

  if (resultUrl) {
    return <ResultView resultUrl={resultUrl} onRestart={handleRestart} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans">
      
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
           <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">StageMe</h1>
           <p className="text-slate-400">Sketch to Reality</p>
        </div>
        {/* Kiosk Mode hidden trigger or settings could go here */}
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
        
        {/* Left Col: Inputs */}
        <div className="lg:col-span-5 space-y-8">
            <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                    Your Photo
                </h2>
                <CameraCapture onCapture={handleCapture} />
                {photo && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 h-24 w-24 object-cover">
                       <img src={photo} className="w-full h-full object-cover" alt="Captured" />
                       <button onClick={() => setPhoto(null)} className="absolute inset-0 bg-black/50 hover:bg-black/70 flex items-center justify-center text-xs opacity-0 hover:opacity-100 transition-opacity">Retake</button>
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                    Select Stage
                </h2>
                <StageSelector selectedStage={selectedStage} onSelectStage={setSelectedStage} />
            </section>
        </div>

        {/* Right Col: Canvas */}
        <div className="lg:col-span-7 space-y-8 flex flex-col">
            <section className="space-y-4 flex-1 flex flex-col">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="bg-pink-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                    Sketch Pose
                </h2>
                <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 p-4 flex items-center justify-center">
                    <DrawingCanvas ref={canvasRef} width={600} height={600} />
                </div>
            </section>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-800">
                <button
                    onClick={handleGenerate}
                    disabled={!photo || isGenerating}
                    className={`w-full py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-3 transition-all
                        ${!photo || isGenerating 
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-purple-900/20'
                        }`}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="animate-spin" />
                            {statusMessage}
                        </>
                    ) : (
                        <>
                            <Sparkles className="fill-current" />
                            Generate Masterpiece
                        </>
                    )}
                </button>
            </div>
        </div>

      </div>

    </div>
  );
}

export default App;
