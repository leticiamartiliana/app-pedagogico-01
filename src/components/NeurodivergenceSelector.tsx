import React from 'react';
import { NEURO_TYPES_LIST } from '../constants/neuroTypes';
import { NeuroType } from '../types';
import { sensory } from '../services/sensory';
import { CheckCircle2 } from 'lucide-react';

interface NeuroSelectorProps {
  selectedType: NeuroType;
  onSelect: (type: NeuroType) => void;
}

export const NeurodivergenceSelector: React.FC<NeuroSelectorProps> = ({
  selectedType,
  onSelect,
}) => {
  const handleSelect = (type: NeuroType) => {
    sensory.triggerSensoryAction('switch', 'toggle');
    onSelect(type);
  };

  return (
    <section aria-label="Seleção de Neurodivergência" className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <span>🧠 Selecione a Neurodivergência Alvo</span>
          <span className="text-xs normal-case font-normal text-slate-400">
            (ou use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300">Alt+1..6</kbd>)
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {NEURO_TYPES_LIST.map((meta, index) => {
          const isSelected = selectedType === meta.id;
          const shortcutKey = `Alt+${index + 1}`;

          return (
            <button
              key={meta.id}
              type="button"
              onClick={() => handleSelect(meta.id)}
              aria-pressed={isSelected}
              className={`
                group relative flex flex-col items-start text-left p-3 rounded-2xl
                transition-all duration-150 cursor-pointer select-none
                border-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
                ${
                  isSelected
                    ? `${meta.borderColor} ${meta.accentBg} shadow-lg ${meta.shadowColor} scale-[1.02] translate-y-[-2px] ring-2 ring-white/30`
                    : 'border-slate-800 bg-slate-850/80 hover:bg-slate-800/90 hover:border-slate-700 opacity-80 hover:opacity-100 hover:translate-y-[-1px]'
                }
              `}
              style={{
                backgroundColor: isSelected ? undefined : 'rgba(30, 41, 59, 0.65)',
              }}
            >
              {/* Header row: Icon, Badge, and Selected Check */}
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-2xl filter drop-shadow" aria-hidden="true">
                  {meta.symbol}
                </span>

                <div className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-black/40 text-slate-300 border border-white/10">
                    {shortcutKey}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className={`w-4 h-4 ${meta.textColor} fill-current/20`} />
                  )}
                </div>
              </div>

              {/* Title and Short Tagline */}
              <h3 className={`font-black text-sm tracking-tight leading-tight mb-1 ${isSelected ? meta.textColor : 'text-slate-100'}`}>
                {meta.shortName}
              </h3>
              <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                {meta.tagline}
              </p>

              {/* Color Stripe bar */}
              <div
                className={`w-full h-1.5 rounded-full mt-2.5 transition-all ${
                  isSelected ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'
                }`}
                style={{ backgroundColor: meta.primaryColor }}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
};
