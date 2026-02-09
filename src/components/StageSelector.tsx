
import { Check } from 'lucide-react';

interface StageSelectorProps {
  selectedStage: string;
  onSelectStage: (stage: string) => void;
}

const STAGES = [
  { 
    id: 'Stage 1', 
    name: 'Mega DJ Stage #1', 
    imagePath: '/stages/stage1.png',
    description: 'A high-tech DJ booth on a massive stage with neon lights and a cheering crowd.',
    promptContext: 'The character is a DJ performing a set. Ensure they are positioned correctly behind the decks if visible, or commanding the stage. Scale them to fit a realistic human proportion within this specific concert venue.',
    color: 'from-pink-500 to-purple-500' 
  },
  { 
    id: 'Stage 2', 
    name: 'Mega DJ Stage #2', 
    imagePath: '/stages/stage2.png',
    description: 'A high-tech DJ booth on a massive stage with neon lights and a cheering crowd.',
    promptContext: 'The character is a DJ performing a set. Ensure they are positioned correctly behind the decks if visible, or commanding the stage. Scale them to fit a realistic human proportion within this specific concert venue.',
    color: 'from-green-500 to-emerald-500' 
  },
  { 
    id: 'Stage 3', 
    name: 'Mega DJ Stage #3', 
    imagePath: '/stages/stage3.png',
    description: 'A high-tech DJ booth on a massive stage with neon lights and a cheering crowd.',
    promptContext: 'The character is a DJ performing a set. Ensure they are positioned correctly behind the decks if visible, or commanding the stage. Scale them to fit a realistic human proportion within this specific concert venue.',
    color: 'from-orange-500 to-red-500' 
  },
];

export function StageSelector({ selectedStage, onSelectStage }: StageSelectorProps) {
  return (
    <div className="w-full max-w-md">
      <label className="block text-sm font-medium text-slate-400 mb-2">Select Environment</label>
      <div className="grid grid-cols-1 gap-3">
        {STAGES.map((stage) => (
          <button
            key={stage.id}
            onClick={() => onSelectStage(stage.id)}
            className={`relative h-24 rounded-xl border transition-all duration-200 flex items-center justify-between group overflow-hidden
              ${selectedStage === stage.id 
                ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                : 'border-slate-700 hover:border-slate-500'
              }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
                <img src={stage.imagePath} alt={stage.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
            </div>

            <div className="relative z-10 flex items-center gap-4 p-4 w-full">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stage.color} flex items-center justify-center shadow-inner shrink-0`}>
                <span className="text-white font-bold text-lg">{stage.id.split(' ')[1]}</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-white text-lg shadow-black/50 drop-shadow-md">{stage.name}</div>
                <div className="text-xs text-slate-300 font-medium">{stage.description}</div>
              </div>
              
              {selectedStage === stage.id && (
                <div className="ml-auto bg-blue-600 rounded-full p-2 shadow-lg">
                  <Check size={20} className="text-white" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
