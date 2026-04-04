import type { PersonaType } from '@/lib/types';
import { PERSONA_DEFINITIONS } from '@/lib/personas';

interface PersonaSelectorProps {
  selectedPersona: PersonaType | 'freeplay';
  onPersonaChange: (persona: PersonaType | 'freeplay') => void;
  tradingStarted: boolean;
  isLoading: boolean;
  onReset: () => void;
  selectedPersonaData: {
    name: string;
    title: string;
    organisation: string;
    briefing: string;
    budgetRange: string;
    volumeTarget: string;
    patience: number;
  } | null;
}

export default function PersonaSelector({
  selectedPersona,
  onPersonaChange,
  tradingStarted,
  isLoading,
  onReset,
  selectedPersonaData,
}: PersonaSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6" data-demo="persona-selector">
      <h3 className="bloomberg-card-title text-[#1E293B] mb-4">Select Buyer Persona</h3>

      <div className="space-y-3">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            value="freeplay"
            checked={selectedPersona === 'freeplay'}
            onChange={(e) => onPersonaChange(e.target.value as 'freeplay')}
            disabled={tradingStarted}
            className="text-[#0EA5E9] focus:ring-[#0EA5E9] focus:ring-offset-2"
          />
          <div className="flex-1">
            <div className="font-medium text-[#1E293B]">Free Play</div>
            <div className="bloomberg-small-text text-[#64748B]">Negotiate naturally</div>
          </div>
        </label>

        {PERSONA_DEFINITIONS.map((persona) => (
          <label key={persona.id} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              value={persona.id}
              checked={selectedPersona === persona.id}
              onChange={(e) => onPersonaChange(e.target.value as PersonaType)}
              disabled={tradingStarted}
              className="text-[#0EA5E9] focus:ring-[#0EA5E9] focus:ring-offset-2"
            />
            <div className="flex-1">
              <div className="font-medium text-[#1E293B]">{persona.name}</div>
              <div className="bloomberg-small-text text-[#64748B]">{persona.title}</div>
              <div className="bloomberg-section-label text-[#64748B]">{persona.organisation}</div>
            </div>
          </label>
        ))}
      </div>

      {tradingStarted && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="bloomberg-small-text text-gray-600">Persona locked</span>
            <button
              onClick={onReset}
              disabled={isLoading}
              className="bloomberg-section-label text-[#0EA5E9] hover:text-[#0284C7] font-medium disabled:opacity-50"
            >
              Start New
            </button>
          </div>
        </div>
      )}

      {/* Persona Briefing */}
      {selectedPersonaData && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className=" text-amber-800 mb-2">YOUR ROLE</div>
          <p className="bloomberg-small-text text-amber-700 mb-3">{selectedPersonaData.briefing}</p>
          <div className="grid grid-cols-3 gap-2 bloomberg-section-label">
            <div>
              <div className="font-medium text-amber-800">Budget</div>
              <div className="text-amber-700">{selectedPersonaData.budgetRange}</div>
            </div>
            <div>
              <div className="font-medium text-amber-800">Volume</div>
              <div className="text-amber-700">{selectedPersonaData.volumeTarget}</div>
            </div>
            <div>
              <div className="font-medium text-amber-800">Patience</div>
              <div className="text-amber-700">{selectedPersonaData.patience}/10</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
