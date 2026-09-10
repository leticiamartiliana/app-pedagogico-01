import React from 'react';
import {
  Volume2,
  VolumeX,
  Vibrate,
  Keyboard,
  Database,
  BookOpen,
  Sparkles,
  ShieldCheck,
  HeartPulse,
} from 'lucide-react';
import { TactileButton } from './TactileButton';
import { NeurodivergenceMeta, SensorySettings } from '../types';

interface NavbarProps {
  currentNeuro: NeurodivergenceMeta;
  sensorySettings: SensorySettings;
  onUpdateSensory: (newSettings: Partial<SensorySettings>) => void;
  onOpenShortcuts: () => void;
  onOpenDatabase: () => void;
  onOpenReader: () => void;
  onOpenSensoryBreak: () => void;
  savedCount: number;
  hasActiveActivity: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentNeuro,
  sensorySettings,
  onUpdateSensory,
  onOpenShortcuts,
  onOpenDatabase,
  onOpenReader,
  onOpenSensoryBreak,
  savedCount,
  hasActiveActivity,
}) => {
  return (
    <header className="w-full bg-slate-900/95 backdrop-blur border-b-2 border-slate-700/80 sticky top-0 z-40 px-4 py-3 sm:px-6">
      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-400 focus:text-slate-950 focus:font-bold focus:rounded-lg focus:outline-none focus:ring-4 focus:ring-amber-200"
      >
        Pular para o conteúdo principal
      </a>

      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg border-2 ${currentNeuro.borderColor} ${currentNeuro.accentBg} transition-all duration-300`}
            title={currentNeuro.name}
            aria-hidden="true"
          >
            {currentNeuro.symbol}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Adaptador Neurodivergente
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Offline & Seguro
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
              Foco Atual: <span className={`${currentNeuro.textColor} font-bold`}>{currentNeuro.shortName}</span>
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Simplified Reading Mode Button */}
          <TactileButton
            variant="cyan"
            size="sm"
            onClick={onOpenReader}
            disabled={!hasActiveActivity}
            title={hasActiveActivity ? 'Modo de Leitura Simplificada (Alt+L)' : 'Adapte uma atividade primeiro para abrir o leitor'}
            icon={<BookOpen className="w-4 h-4" />}
            shortcutBadge="Alt+L"
            soundTone="switch"
            aria-label="Abrir modo de leitura simplificado"
          >
            <span className="hidden md:inline">Leitura</span>
          </TactileButton>

          {/* Local DB Button */}
          <TactileButton
            variant="secondary"
            size="sm"
            onClick={onOpenDatabase}
            title="Banco de Dados Local Seguro (Alt+B)"
            icon={<Database className="w-4 h-4 text-emerald-400" />}
            shortcutBadge="Alt+B"
            soundTone="pop"
            aria-label={`Abrir banco de dados local com ${savedCount} atividades salvas`}
          >
            <span className="hidden sm:inline">Banco Local</span>
            <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-slate-700 text-emerald-300 border border-emerald-500/30">
              {savedCount}
            </span>
          </TactileButton>

          {/* Sensory Break */}
          <TactileButton
            variant="purple"
            size="sm"
            onClick={onOpenSensoryBreak}
            title="Pausa Sensorial & Respiração Calma (Alt+R)"
            icon={<HeartPulse className="w-4 h-4 text-pink-300 animate-pulse" />}
            soundTone="chime"
            aria-label="Abrir pausa sensorial e exercício de respiração"
          >
            <span className="hidden lg:inline">Pausa Sensorial</span>
          </TactileButton>

          {/* Keyboard Shortcuts Guide */}
          <TactileButton
            variant="secondary"
            size="sm"
            onClick={onOpenShortcuts}
            title="Atalhos de Teclado Personalizados (Alt+K)"
            icon={<Keyboard className="w-4 h-4 text-amber-300" />}
            shortcutBadge="Alt+K"
            soundTone="click"
            aria-label="Ver e configurar atalhos de teclado"
          >
            <span className="hidden xl:inline">Atalhos</span>
          </TactileButton>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => onUpdateSensory({ soundEnabled: !sensorySettings.soundEnabled })}
            className={`p-2 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center ${
              sensorySettings.soundEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
            title={sensorySettings.soundEnabled ? 'Sons Táteis Ativados (clique para silenciar)' : 'Sons Silenciados (clique para ativar)'}
            aria-label={sensorySettings.soundEnabled ? 'Desativar sons sensoriais' : 'Ativar sons sensoriais'}
          >
            {sensorySettings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Haptic Toggle */}
          <button
            type="button"
            onClick={() => onUpdateSensory({ hapticsEnabled: !sensorySettings.hapticsEnabled })}
            className={`p-2 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center ${
              sensorySettings.hapticsEnabled
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
            title={sensorySettings.hapticsEnabled ? 'Feedback Tátil/Vibração Ativado' : 'Feedback Tátil Desativado'}
            aria-label={sensorySettings.hapticsEnabled ? 'Desativar vibração tátil' : 'Ativar vibração tátil'}
          >
            <Vibrate className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
