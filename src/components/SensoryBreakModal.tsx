import React, { useState, useEffect } from 'react';
import {
  X,
  HeartPulse,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
} from 'lucide-react';
import { sensory } from '../services/sensory';
import { TactileButton } from './TactileButton';

interface SensoryBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SensoryBreakModal: React.FC<SensoryBreakModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [phase, setPhase] = useState<'inspire' | 'hold' | 'expire'>('inspire');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [poppedBubbles, setPoppedBubbles] = useState<Record<number, boolean>>({});

  // 4-4-4 Box Breathing cycle
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setPhase((currentPhase) => {
            if (currentPhase === 'inspire') {
              sensory.playTone('chime');
              sensory.triggerHaptic('toggle');
              return 'hold';
            } else if (currentPhase === 'hold') {
              sensory.playTone('switch');
              sensory.triggerHaptic('tap');
              return 'expire';
            } else {
              sensory.playTone('pop');
              sensory.triggerHaptic('tap');
              return 'inspire';
            }
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePopBubble = (index: number) => {
    sensory.triggerSensoryAction('pop', 'tap');
    setPoppedBubbles((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleResetBubbles = () => {
    sensory.triggerSensoryAction('click', 'tap');
    setPoppedBubbles({});
  };

  const phaseText = {
    inspire: 'Inspire o ar lentamente pelo nariz...',
    hold: 'Segure o ar com calma...',
    expire: 'Solte o ar devagar pela boca...',
  }[phase];

  const phaseColor = {
    inspire: 'from-cyan-400 to-blue-500 shadow-cyan-500/40 border-cyan-300',
    hold: 'from-amber-400 to-yellow-500 shadow-amber-500/40 border-amber-300',
    expire: 'from-purple-400 to-pink-500 shadow-pink-500/40 border-pink-300',
  }[phase];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pausa Sensorial e Respiração Guiada"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md"
    >
      <div className="bg-slate-900 border-3 border-indigo-500/50 rounded-3xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b-2 border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Pausa Sensorial & Foco Calmo
              </h2>
              <p className="text-xs text-slate-400">
                Momento de autorregulação e descompressão neurocognitiva
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Breathing Circle Area */}
        <div className="p-8 flex flex-col items-center justify-center bg-radial from-slate-850 to-slate-900">
          {/* Animated pulsing sphere */}
          <div
            className={`
              w-44 h-44 rounded-full flex flex-col items-center justify-center
              bg-gradient-to-tr ${phaseColor}
              shadow-2xl border-4 text-slate-950 font-black
              transition-all duration-1000 transform
              ${phase === 'inspire' ? 'scale-110' : phase === 'hold' ? 'scale-105' : 'scale-90'}
            `}
          >
            <span className="text-4xl font-extrabold">{secondsLeft}</span>
            <span className="text-xs font-bold uppercase tracking-wider mt-1 opacity-90">
              {phase === 'inspire' ? 'Inspire' : phase === 'hold' ? 'Segure' : 'Expire'}
            </span>
          </div>

          <p className="text-sm sm:text-base font-bold text-slate-200 mt-6 text-center">
            {phaseText}
          </p>
        </div>

        {/* Tactile Fidget Bubble Pad */}
        <div className="p-5 border-t border-slate-800 bg-slate-850/80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Placa Tátil de Descompressão (Pop Sensory Pad)</span>
            </h3>
            <button
              type="button"
              onClick={handleResetBubbles}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              Reiniciar Bolhas
            </button>
          </div>

          {/* 12 interactive silicone-style pop bubbles */}
          <div className="grid grid-cols-6 gap-2.5">
            {Array.from({ length: 12 }).map((_, i) => {
              const popped = !!poppedBubbles[i];
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePopBubble(i)}
                  className={`
                    h-11 rounded-2xl border-2 transition-all cursor-pointer font-black text-xs select-none
                    flex items-center justify-center
                    ${
                      popped
                        ? 'bg-slate-950 border-slate-800 text-slate-600 shadow-inner scale-90 translate-y-1'
                        : 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300 text-slate-950 shadow-[0_3px_0_#9a3412] hover:scale-105 active:scale-95'
                    }
                  `}
                  aria-label={`Estourar bolha sensorial ${i + 1}`}
                >
                  {popped ? '•' : 'POP'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-end">
          <TactileButton variant="primary" size="md" onClick={onClose}>
            Retornar à Atividade
          </TactileButton>
        </div>
      </div>
    </div>
  );
};
