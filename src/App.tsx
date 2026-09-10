import React, { useState, useEffect, useCallback } from 'react';
import {
  NeuroType,
  AdaptedActivity,
  KeyboardShortcut,
  SensorySettings,
} from './types';
import { NEURO_MAP, NEURO_TYPES_LIST } from './constants/neuroTypes';
import { DEFAULT_SHORTCUTS } from './constants/shortcuts';
import { adaptActivityService } from './services/adaptEngine';
import { localDB } from './services/db';
import { sensory } from './services/sensory';
import { screenReader } from './services/screenReader';

import { Navbar } from './components/Navbar';
import { NeurodivergenceSelector } from './components/NeurodivergenceSelector';
import { ActivityInputForm } from './components/ActivityInputForm';
import { AdaptedResultView } from './components/AdaptedResultView';
import { SimplifiedReaderModal } from './components/SimplifiedReaderModal';
import { DatabaseModal } from './components/DatabaseModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { SensoryBreakModal } from './components/SensoryBreakModal';
import {
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function App() {
  // Current active neurodivergence profile
  const [selectedNeuro, setSelectedNeuro] = useState<NeuroType>('tea');

  // Input states
  const [originalText, setOriginalText] = useState<string>('');
  const [subject, setSubject] = useState<string>('História');
  const [gradeLevel, setGradeLevel] = useState<string>('5º Ano');
  const [studentAlias, setStudentAlias] = useState<string>('');
  const [extraNotes, setExtraNotes] = useState<string>('');

  // Results & Database states
  const [activeAdapted, setActiveAdapted] = useState<AdaptedActivity | null>(null);
  const [savedActivities, setSavedActivities] = useState<AdaptedActivity[]>([]);
  const [isAdapting, setIsAdapting] = useState<boolean>(false);

  // Modals
  const [isReaderOpen, setIsReaderOpen] = useState<boolean>(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isSensoryBreakOpen, setIsSensoryBreakOpen] = useState<boolean>(false);

  // Sensory and Shortcuts config
  const [sensorySettings, setSensorySettings] = useState<SensorySettings>(() => sensory.getSettings());
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>(() => {
    try {
      const saved = localStorage.getItem('neuro_shortcuts');
      return saved ? JSON.parse(saved) : DEFAULT_SHORTCUTS;
    } catch {
      return DEFAULT_SHORTCUTS;
    }
  });

  const currentNeuroMeta = NEURO_MAP.get(selectedNeuro) || NEURO_TYPES_LIST[0];

  // Refresh saved activities list from IndexedDB
  const refreshDatabase = useCallback(async () => {
    try {
      const list = await localDB.getAllActivities();
      setSavedActivities(list);
    } catch (e) {
      console.error('Falha ao carregar banco local:', e);
    }
  }, []);

  // Initial load: seed demo data if fresh & load DB
  useEffect(() => {
    const initApp = async () => {
      await localDB.seedInitialExamples();
      await refreshDatabase();
      // If there are saved activities and none is active, pick the first one as a starting example
      const list = await localDB.getAllActivities();
      if (list.length > 0 && !activeAdapted) {
        setActiveAdapted(list[0]);
        setSelectedNeuro(list[0].neurodivergence);
        setOriginalText(list[0].originalText || '');
        setSubject(list[0].subject || '');
        setGradeLevel(list[0].gradeLevel || '');
        setStudentAlias(list[0].studentAlias || '');
      }
    };
    initApp();
  }, [refreshDatabase]);

  // Update sensory settings
  const handleUpdateSensory = (newSettings: Partial<SensorySettings>) => {
    sensory.updateSettings(newSettings);
    setSensorySettings(sensory.getSettings());
    sensory.triggerSensoryAction('switch', 'toggle');
  };

  // Update shortcuts
  const handleUpdateShortcuts = (updated: KeyboardShortcut[]) => {
    setShortcuts(updated);
    try {
      localStorage.setItem('neuro_shortcuts', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Adapt Activity
  const handleAdapt = async () => {
    if (!originalText.trim()) return;

    setIsAdapting(true);
    sensory.triggerSensoryAction('click', 'tap');
    screenReader.announceLive(`Iniciando adaptação pedagógica para ${currentNeuroMeta.name}`);

    try {
      const adapted = await adaptActivityService({
        originalActivity: originalText,
        neurodivergenceType: selectedNeuro,
        subject,
        gradeLevel,
        studentAlias,
        extraInstructions: extraNotes,
      });

      setActiveAdapted(adapted);
      sensory.triggerCelebration();
      screenReader.announceLive(`Atividade adaptada com sucesso para ${currentNeuroMeta.name}.`);

      // Auto-save to local DB for privacy & persistence!
      await localDB.saveActivity(adapted);
      await refreshDatabase();
    } catch (err: any) {
      console.error('Erro na adaptação:', err);
      alert('Não foi possível gerar a adaptação. Tente novamente.');
    } finally {
      setIsAdapting(false);
    }
  };

  // Reset fields
  const handleReset = () => {
    sensory.triggerSensoryAction('click', 'toggle');
    setOriginalText('');
    setExtraNotes('');
    setStudentAlias('');
    screenReader.announceLive('Campos da atividade limpos.');
  };

  // Save to DB explicitly
  const handleSaveToDB = async (activity: AdaptedActivity) => {
    sensory.triggerSensoryAction('success', 'success');
    await localDB.saveActivity(activity);
    await refreshDatabase();
    screenReader.announceLive('Atividade salva com sucesso no banco de dados local.');
  };

  // Check if current active activity is already saved in local DB
  const isCurrentSaved = activeAdapted
    ? savedActivities.some((a) => a.id === activeAdapted.id)
    : false;

  // Global Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing inside textarea or input unless Alt is pressed
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Alt + 1..6: Quick neuro switch
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= NEURO_TYPES_LIST.length) {
          e.preventDefault();
          const targetNeuro = NEURO_TYPES_LIST[num - 1].id;
          setSelectedNeuro(targetNeuro);
          sensory.triggerSensoryAction('switch', 'toggle');
          screenReader.announceLive(`Perfil alterado para ${NEURO_TYPES_LIST[num - 1].name}`);
          return;
        }
      }

      // Check configured shortcuts
      for (const sc of shortcuts) {
        const matchKey = e.key.toLowerCase() === sc.key.toLowerCase();
        const matchAlt = sc.altKey ? e.altKey : true;
        const matchCtrl = sc.ctrlKey ? e.ctrlKey : true;
        const matchShift = sc.shiftKey ? e.shiftKey : true;

        if (matchKey && matchAlt && matchCtrl && matchShift) {
          if (isInput && !e.altKey) {
            // allow normal typing inside inputs if shortcut doesn't use Alt
            continue;
          }

          e.preventDefault();
          switch (sc.action) {
            case 'new_activity':
              handleReset();
              break;
            case 'adapt_activity':
              handleAdapt();
              break;
            case 'simple_reading':
              if (activeAdapted) {
                sensory.triggerSensoryAction('switch', 'tap');
                setIsReaderOpen((prev) => !prev);
              }
              break;
            case 'text_to_speech':
              if (activeAdapted) {
                if (screenReader.isSpeaking()) {
                  screenReader.stop();
                } else {
                  const speech = `${activeAdapted.title}. ${activeAdapted.visualInstructions.join('. ')}. ${activeAdapted.adaptedContent}`;
                  screenReader.speak(speech);
                }
              }
              break;
            case 'save_db':
              if (activeAdapted) {
                handleSaveToDB(activeAdapted);
              }
              break;
            case 'open_db':
              sensory.triggerSensoryAction('pop', 'tap');
              setIsDatabaseOpen((prev) => !prev);
              break;
            case 'print_material':
              sensory.triggerSensoryAction('pop', 'tap');
              window.print();
              break;
            case 'sensory_break':
              sensory.triggerSensoryAction('chime', 'tap');
              setIsSensoryBreakOpen((prev) => !prev);
              break;
            case 'shortcuts_help':
              sensory.triggerSensoryAction('click', 'tap');
              setIsShortcutsOpen((prev) => !prev);
              break;
          }
          break;
        }
      }

      // Escape closes modals
      if (e.key === 'Escape') {
        if (isReaderOpen) setIsReaderOpen(false);
        if (isDatabaseOpen) setIsDatabaseOpen(false);
        if (isShortcutsOpen) setIsShortcutsOpen(false);
        if (isSensoryBreakOpen) setIsSensoryBreakOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    shortcuts,
    selectedNeuro,
    originalText,
    activeAdapted,
    isReaderOpen,
    isDatabaseOpen,
    isShortcutsOpen,
    isSensoryBreakOpen,
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Screen Reader ARIA Live Announcer */}
      <div id="a11y-live-announcer" aria-live="polite" aria-atomic="true" className="sr-only" />

      {/* Main Top Navigation */}
      <Navbar
        currentNeuro={currentNeuroMeta}
        sensorySettings={sensorySettings}
        onUpdateSensory={handleUpdateSensory}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenDatabase={() => setIsDatabaseOpen(true)}
        onOpenReader={() => {
          if (activeAdapted) setIsReaderOpen(true);
        }}
        onOpenSensoryBreak={() => setIsSensoryBreakOpen(true)}
        savedCount={savedActivities.length}
        hasActiveActivity={!!activeAdapted}
      />

      {/* Main Container */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Neurodivergence Selector with High Visual Contrast */}
        <NeurodivergenceSelector
          selectedType={selectedNeuro}
          onSelect={(newType) => setSelectedNeuro(newType)}
        />

        {/* Dynamic Focus Header Box matching current active neurodivergence */}
        <section
          aria-label="Resumo Metodológico da Neurodivergência Ativa"
          className={`p-4 sm:p-5 rounded-2xl border-2 ${currentNeuroMeta.borderColor} ${currentNeuroMeta.accentBg} transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
        >
          <div className="flex items-start gap-3.5">
            <span className="text-3xl sm:text-4xl filter drop-shadow mt-0.5" aria-hidden="true">
              {currentNeuroMeta.symbol}
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Adaptação Focada em {currentNeuroMeta.name}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-0.5 leading-relaxed">
                {currentNeuroMeta.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/20 text-xs font-bold text-slate-200 flex items-center gap-1.5 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentNeuroMeta.visualSymbolDescription}</span>
            </div>
          </div>
        </section>

        {/* 2-Column Responsive Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Activity Input Form (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            <ActivityInputForm
              currentNeuro={currentNeuroMeta}
              originalText={originalText}
              setOriginalText={setOriginalText}
              subject={subject}
              setSubject={setSubject}
              gradeLevel={gradeLevel}
              setGradeLevel={setGradeLevel}
              studentAlias={studentAlias}
              setStudentAlias={setStudentAlias}
              extraNotes={extraNotes}
              setExtraNotes={setExtraNotes}
              onAdapt={handleAdapt}
              onReset={handleReset}
              isAdapting={isAdapting}
              onSelectPresetNeuro={(id) => setSelectedNeuro(id)}
            />

            {/* Quick Privacy & Safety Guarantee */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-200">
                  Armazenamento Local & Privacidade Garantida
                </p>
                <p className="mt-0.5 leading-relaxed">
                  Os nomes e informações de seus alunos nunca são armazenados na nuvem. Todos os dados permanecem protegidos no banco de dados local do seu navegador (IndexedDB).
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Adapted Output & Interaction (7 cols on lg) */}
          <div className="lg:col-span-7">
            {activeAdapted ? (
              <AdaptedResultView
                activity={activeAdapted}
                currentNeuro={currentNeuroMeta}
                onSaveToDB={handleSaveToDB}
                onOpenReader={() => setIsReaderOpen(true)}
                isSavedInDB={isCurrentSaved}
              />
            ) : (
              <div className="p-12 text-center rounded-3xl border-3 border-dashed border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center min-h-[400px]">
                <Layers className="w-16 h-16 text-slate-700 mb-4 animate-bounce" />
                <h3 className="text-lg font-bold text-slate-300">
                  Pronto para Adaptar Atividades
                </h3>
                <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">
                  Selecione uma neurodivergência, cole sua atividade ou escolha um dos Modelos Rápidos acima e clique no botão de adaptação.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 text-amber-300 text-xs font-mono font-bold border border-slate-700">
                  Atalho rápido: <kbd>Alt + A</kbd> para adaptar
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {activeAdapted && (
        <SimplifiedReaderModal
          activity={activeAdapted}
          isOpen={isReaderOpen}
          onClose={() => setIsReaderOpen(false)}
        />
      )}

      <DatabaseModal
        isOpen={isDatabaseOpen}
        onClose={() => setIsDatabaseOpen(false)}
        activities={savedActivities}
        onSelectActivity={(act) => {
          setActiveAdapted(act);
          setSelectedNeuro(act.neurodivergence);
          setOriginalText(act.originalText || '');
          setSubject(act.subject || '');
          setGradeLevel(act.gradeLevel || '');
          setStudentAlias(act.studentAlias || '');
        }}
        onRefreshList={refreshDatabase}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        shortcuts={shortcuts}
        onUpdateShortcuts={handleUpdateShortcuts}
      />

      <SensoryBreakModal
        isOpen={isSensoryBreakOpen}
        onClose={() => setIsSensoryBreakOpen(false)}
      />

      {/* Accessible Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          Adaptador de Atividades Neurodivergentes • Desenho Universal para a Aprendizagem (DUA) • 100% Offline & Seguro
        </p>
      </footer>
    </div>
  );
}
