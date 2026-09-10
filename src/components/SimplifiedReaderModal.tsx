import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Type,
  AlignLeft,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { AdaptedActivity, ReadingSettings } from '../types';
import { screenReader } from '../services/screenReader';
import { sensory } from '../services/sensory';
import { TactileButton } from './TactileButton';

interface SimplifiedReaderModalProps {
  activity: AdaptedActivity;
  isOpen: boolean;
  onClose: () => void;
}

export const SimplifiedReaderModal: React.FC<SimplifiedReaderModalProps> = ({
  activity,
  isOpen,
  onClose,
}) => {
  const [settings, setSettings] = useState<ReadingSettings>({
    fontSize: 22,
    lineHeight: 1.8,
    letterSpacing: 1,
    fontFamily: 'lexend',
    bionicReading: false,
    readingRuler: true,
    rulerHeight: 48,
    bgTheme: 'dark',
    highlightCurrentSentence: true,
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [mouseY, setMouseY] = useState(200);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (settings.readingRuler) {
        setMouseY(e.clientY);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [settings.readingRuler]);

  useEffect(() => {
    const unsub = screenReader.subscribe((status) => {
      if (status === 'started' || status === 'resumed') {
        setIsPlaying(true);
      } else if (status === 'paused' || status === 'ended' || status === 'error') {
        setIsPlaying(false);
      }
    });
    return () => {
      unsub();
      screenReader.stop();
    };
  }, []);

  if (!isOpen) return null;

  // Background Theme styles
  const themeStyles = {
    dark: 'bg-slate-950 text-slate-100',
    sepia: 'bg-[#fbf0d9] text-[#2c2214]',
    cream: 'bg-[#fffbf0] text-[#1c1917]',
    mint: 'bg-[#e8f5e9] text-[#1b5e20]',
    'high-contrast-dark': 'bg-black text-yellow-300',
  }[settings.bgTheme];

  const toggleTTS = () => {
    if (screenReader.isSpeaking()) {
      if (screenReader.isPaused()) {
        screenReader.resume();
      } else {
        screenReader.pause();
      }
    } else {
      const fullText = `${activity.title}. ${activity.visualInstructions.join('. ')}. ${activity.adaptedContent}`;
      screenReader.speak(fullText);
    }
  };

  const changeRate = (newRate: number) => {
    setSpeechRate(newRate);
    screenReader.setRate(newRate);
    sensory.triggerSensoryAction('click', 'tap');
  };

  // Bionic reading formatter: highlights first 40% of each word
  const renderBionicText = (text: string) => {
    if (!settings.bionicReading) return text;
    const words = text.split(/(\s+)/);
    return words.map((chunk, idx) => {
      if (/^\s+$/.test(chunk)) return chunk;
      const mid = Math.ceil(chunk.length * 0.45);
      const boldPart = chunk.slice(0, mid);
      const restPart = chunk.slice(mid);
      return (
        <React.Fragment key={idx}>
          <strong className="font-extrabold text-amber-400 dark:text-amber-300">{boldPart}</strong>
          <span>{restPart}</span>
        </React.Fragment>
      );
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Modo de Leitura Simplificado"
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-slate-950/95 backdrop-blur-md"
    >
      {/* Top Controls Header */}
      <header className="w-full bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Eye className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-extrabold text-white">
              Modo Leitura Simplificado & Acessível
            </h2>
            <p className="text-xs text-slate-400">
              Personalize fonte, espaçamento, régua guia e leitor de tela
            </p>
          </div>
        </div>

        {/* Audio controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <TactileButton
            variant={isPlaying ? 'amber' : 'secondary'}
            size="sm"
            onClick={toggleTTS}
            icon={isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            soundTone="pop"
            aria-label={isPlaying ? 'Pausar leitura' : 'Iniciar leitura em voz alta'}
          >
            {isPlaying ? 'Pausar Áudio' : 'Ler em Voz Alta'}
          </TactileButton>

          {/* Speed selector */}
          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 text-xs font-bold text-slate-300">
            {[0.8, 1.0, 1.25].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => changeRate(rate)}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  speechRate === rate ? 'bg-indigo-600 text-white shadow' : 'hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Close button */}
          <TactileButton
            variant="ghost"
            size="sm"
            onClick={() => {
              screenReader.stop();
              onClose();
            }}
            icon={<X className="w-5 h-5" />}
            aria-label="Fechar modo de leitura simplificado (Esc)"
          >
            Sair (Esc)
          </TactileButton>
        </div>
      </header>

      {/* Settings Ribbon */}
      <div className="w-full bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-4 overflow-x-auto shrink-0 text-xs text-slate-300">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Font size */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-400">Tamanho:</span>
            <button
              type="button"
              onClick={() => setSettings((s) => ({ ...s, fontSize: Math.max(16, s.fontSize - 2) }))}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
            >
              -
            </button>
            <span className="w-8 text-center font-mono font-bold text-amber-400">{settings.fontSize}px</span>
            <button
              type="button"
              onClick={() => setSettings((s) => ({ ...s, fontSize: Math.min(36, s.fontSize + 2) }))}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Bionic Reading Toggle */}
          <button
            type="button"
            onClick={() => {
              sensory.triggerSensoryAction('click', 'toggle');
              setSettings((s) => ({ ...s, bionicReading: !s.bionicReading }));
            }}
            className={`px-3 py-1 rounded-xl border font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              settings.bionicReading
                ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Bionic Reading (Destaque Inicial)</span>
          </button>

          {/* Reading Ruler Toggle */}
          <button
            type="button"
            onClick={() => {
              sensory.triggerSensoryAction('click', 'toggle');
              setSettings((s) => ({ ...s, readingRuler: !s.readingRuler }));
            }}
            className={`px-3 py-1 rounded-xl border font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              settings.readingRuler
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Régua Guia dos Olhos</span>
          </button>

          {/* Theme Color Palettes */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-400">Contraste:</span>
            {(['dark', 'sepia', 'cream', 'mint', 'high-contrast-dark'] as const).map((theme) => (
              <button
                key={theme}
                type="button"
                onClick={() => {
                  sensory.triggerSensoryAction('click', 'tap');
                  setSettings((s) => ({ ...s, bgTheme: theme }));
                }}
                className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                  settings.bgTheme === theme ? 'scale-125 ring-2 ring-amber-400' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  backgroundColor:
                    theme === 'dark'
                      ? '#0f172a'
                      : theme === 'sepia'
                      ? '#fbf0d9'
                      : theme === 'cream'
                      ? '#fffbf0'
                      : theme === 'mint'
                      ? '#e8f5e9'
                      : '#000000',
                  borderColor: theme === 'high-contrast-dark' ? '#facc15' : '#475569',
                }}
                title={`Tema ${theme}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Reader Body Content */}
      <main
        ref={contentRef}
        className={`relative flex-1 overflow-y-auto p-6 sm:p-12 transition-colors select-text ${themeStyles}`}
        style={{
          fontFamily:
            settings.fontFamily === 'lexend'
              ? "'Lexend', sans-serif"
              : "'Plus Jakarta Sans', sans-serif",
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
          letterSpacing: `${settings.letterSpacing}px`,
        }}
      >
        {/* Floating Reading Ruler */}
        {settings.readingRuler && (
          <div
            className="pointer-events-none fixed left-0 right-0 z-20 border-y-2 border-amber-400/40 bg-amber-400/10 transition-all duration-75"
            style={{
              top: `${mouseY - settings.rulerHeight / 2}px`,
              height: `${settings.rulerHeight}px`,
            }}
          />
        )}

        <div className="max-w-3xl mx-auto space-y-8">
          {/* Title */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">
              {renderBionicText(activity.title)}
            </h1>
            {activity.studentAlias && (
              <p className="text-sm font-semibold opacity-75">
                Atividade preparada para: <strong>{activity.studentAlias}</strong>
              </p>
            )}
          </div>

          {/* Steps */}
          {activity.visualInstructions && activity.visualInstructions.length > 0 && (
            <div className="p-6 rounded-2xl border-2 border-current/20 bg-black/5 dark:bg-white/5 space-y-3">
              <h2 className="text-lg font-bold">Instruções Passo a Passo:</h2>
              <ul className="space-y-2">
                {activity.visualInstructions.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="font-mono font-bold text-amber-500">[{idx + 1}]</span>
                    <span>{renderBionicText(s)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Adapted Core Text */}
          <div className="whitespace-pre-wrap leading-relaxed space-y-4">
            {renderBionicText(activity.adaptedContent)}
          </div>

          {/* Questions */}
          {activity.interactiveQuestions && activity.interactiveQuestions.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-current/20">
              <h2 className="text-xl font-bold">Perguntas:</h2>
              {activity.interactiveQuestions.map((q) => (
                <div key={q.number} className="p-5 rounded-2xl border border-current/20 space-y-3">
                  <p className="font-bold">
                    {q.number}. {renderBionicText(q.question)}
                  </p>
                  {q.options && (
                    <div className="space-y-2 pl-4">
                      {q.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span>{renderBionicText(opt)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
