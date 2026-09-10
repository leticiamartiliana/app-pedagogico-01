import React, { useState } from 'react';
import {
  AdaptedActivity,
  NeurodivergenceMeta,
} from '../types';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Printer,
  Copy,
  Check,
  Save,
  BookOpen,
  Sparkles,
  Info,
  CheckSquare,
  Square,
  Lightbulb,
  ShieldCheck,
  BrainCircuit,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { TactileButton } from './TactileButton';
import { screenReader } from '../services/screenReader';
import { sensory } from '../services/sensory';

interface AdaptedResultViewProps {
  activity: AdaptedActivity;
  currentNeuro: NeurodivergenceMeta;
  onSaveToDB: (activity: AdaptedActivity) => void;
  onOpenReader: () => void;
  isSavedInDB: boolean;
}

export const AdaptedResultView: React.FC<AdaptedResultViewProps> = ({
  activity,
  currentNeuro,
  onSaveToDB,
  onOpenReader,
  isSavedInDB,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<'student' | 'educator'>('student');

  // Toggle step checklist
  const toggleStep = (index: number) => {
    sensory.triggerSensoryAction('pop', 'tap');
    setCompletedSteps((prev) => {
      const next = { ...prev, [index]: !prev[index] };
      // Check if all steps completed
      const allDone = activity.visualInstructions.every((_, i) => (i === index ? next[i] : prev[i]));
      if (allDone) {
        sensory.triggerCelebration();
      }
      return next;
    });
  };

  // Text-to-speech
  const handleToggleSpeech = () => {
    if (screenReader.isSpeaking()) {
      if (screenReader.isPaused()) {
        screenReader.resume();
        setIsPlayingAudio(true);
      } else {
        screenReader.pause();
        setIsPlayingAudio(false);
      }
    } else {
      const fullTextToRead = `
        Atividade Adaptada: ${activity.title}.
        Instruções: ${activity.visualInstructions.join('. ')}.
        Conteúdo: ${activity.adaptedContent}.
        ${activity.interactiveQuestions?.map((q) => `Questão ${q.number}: ${q.question}`).join('. ') || ''}
      `;
      screenReader.speak(fullTextToRead);
      setIsPlayingAudio(true);
      sensory.triggerSensoryAction('switch', 'tap');

      screenReader.subscribe((status) => {
        if (status === 'ended' || status === 'error') {
          setIsPlayingAudio(false);
        } else if (status === 'started' || status === 'resumed') {
          setIsPlayingAudio(true);
        } else if (status === 'paused') {
          setIsPlayingAudio(false);
        }
      });
    }
  };

  const handleCopy = () => {
    const formatted = `
${activity.title}
Foco: ${currentNeuro.name}
${activity.studentAlias ? `Aluno: ${activity.studentAlias}\n` : ''}

=== PASSOS VISUAIS ===
${activity.visualInstructions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

=== MATERIAL ADAPTADO ===
${activity.adaptedContent}

=== QUESTÕES ===
${activity.interactiveQuestions
  ?.map(
    (q) =>
      `Questão ${q.number}: ${q.question}\n${q.options?.map((o) => `  ( ) ${o}`).join('\n') || ''}`
  )
  .join('\n\n')}

=== JUSTIFICATIVA PEDAGÓGICA (PARA O PROFESSOR) ===
${activity.pedagogicalJustification}

=== DICAS SENSORIAIS ===
${activity.sensoryTips.map((t) => `- ${t}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    sensory.triggerSensoryAction('success', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    sensory.triggerSensoryAction('pop', 'tap');
    window.print();
  };

  return (
    <article
      id="adapted-result-container"
      className="bg-slate-850 border-3 border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl transition-all"
    >
      {/* Top Header Row with Neuro Theme Tag, Student ID, and AI/Offline status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-slate-750">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs sm:text-sm font-extrabold rounded-xl border-2 ${currentNeuro.borderColor} ${currentNeuro.accentBg} ${currentNeuro.textColor}`}
          >
            <span className="text-base">{currentNeuro.symbol}</span>
            <span>{currentNeuro.name}</span>
          </span>

          {activity.studentAlias && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
              Aluno: <strong className="text-white">{activity.studentAlias}</strong>
            </span>
          )}

          {activity.gradeLevel && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-slate-800 text-slate-400 border border-slate-700">
              {activity.gradeLevel}
            </span>
          )}
        </div>

        {/* Source Badge */}
        <div className="flex items-center gap-2 text-xs">
          {activity.isAiGenerated ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Adaptado com Inteligência Artificial
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Motor Pedagógico Local (100% Offline)
            </span>
          )}
        </div>
      </div>

      {/* Main Title */}
      <div className="my-4">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
          {activity.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {currentNeuro.tagline}
        </p>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/80 rounded-2xl border border-slate-700/80 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Audio TTS Button */}
          <TactileButton
            variant={isPlayingAudio ? 'amber' : 'secondary'}
            size="sm"
            onClick={handleToggleSpeech}
            icon={isPlayingAudio ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            shortcutBadge="Alt+V"
            aria-label={isPlayingAudio ? 'Pausar leitura de tela' : 'Ouvir atividade em voz alta'}
          >
            {isPlayingAudio ? 'Pausar Leitura' : 'Ouvir em Voz Alta'}
          </TactileButton>

          {/* Simplified Reading Mode */}
          <TactileButton
            variant="cyan"
            size="sm"
            onClick={onOpenReader}
            icon={<BookOpen className="w-4 h-4" />}
            shortcutBadge="Alt+L"
            aria-label="Abrir modo de leitura simplificado"
          >
            Modo Leitura
          </TactileButton>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Save to Local DB */}
          <TactileButton
            variant={isSavedInDB ? 'emerald' : 'secondary'}
            size="sm"
            onClick={() => onSaveToDB(activity)}
            icon={isSavedInDB ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            shortcutBadge="Alt+S"
            aria-label={isSavedInDB ? 'Atividade salva no banco de dados local' : 'Salvar atividade no banco de dados local'}
          >
            {isSavedInDB ? 'Salvo no Banco Local' : 'Salvar no Banco'}
          </TactileButton>

          {/* Copy Text */}
          <TactileButton
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            icon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            aria-label="Copiar texto da atividade"
          >
            {copied ? 'Copiado!' : 'Copiar'}
          </TactileButton>

          {/* Print */}
          <TactileButton
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4 text-slate-300" />}
            shortcutBadge="Alt+P"
            aria-label="Imprimir folha de atividade adaptada"
          >
            Imprimir
          </TactileButton>
        </div>
      </div>

      {/* Tabs: Material do Aluno vs Guia do Educador */}
      <div className="flex items-center gap-2 mb-4 border-b border-slate-750">
        <button
          type="button"
          onClick={() => {
            sensory.triggerSensoryAction('click', 'tap');
            setActiveTab('student');
          }}
          className={`pb-2.5 px-4 font-extrabold text-sm sm:text-base border-b-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'student'
              ? `${currentNeuro.borderColor} ${currentNeuro.textColor}`
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Material do Aluno (Pronto para Aplicação)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sensory.triggerSensoryAction('click', 'tap');
            setActiveTab('educator');
          }}
          className={`pb-2.5 px-4 font-extrabold text-sm sm:text-base border-b-3 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'educator'
              ? `${currentNeuro.borderColor} ${currentNeuro.textColor}`
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Guia Pedagógico & Dicas Sensoriais</span>
        </button>
      </div>

      {/* TAB CONTENT 1: MATERIAL DO ALUNO */}
      {activeTab === 'student' && (
        <div className="space-y-6">
          {/* Visual Instructions / Checklist */}
          {activity.visualInstructions && activity.visualInstructions.length > 0 && (
            <section
              aria-label="Checklist de Passos Visuais"
              className="p-4 rounded-2xl bg-slate-900 border-2 border-slate-700/80"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                  <span>Checklist Visual Passo a Passo:</span>
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  Marque cada passo concluído!
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activity.visualInstructions.map((step, idx) => {
                  const done = !!completedSteps[idx];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleStep(idx)}
                      className={`flex items-start text-left gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        done
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 line-through'
                          : 'bg-slate-800/90 border-slate-700 hover:border-slate-500 text-slate-100'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {done ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold leading-relaxed">
                        {step}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Adapted Core Content */}
          <section
            aria-label="Conteúdo Principal Adaptado"
            className="p-5 rounded-2xl bg-slate-900 border-2 border-slate-700/90 leading-relaxed text-slate-100 text-base"
          >
            <div className="prose prose-invert max-w-none space-y-3 whitespace-pre-wrap font-sans text-sm sm:text-base">
              {activity.adaptedContent}
            </div>
          </section>

          {/* Interactive Questions with Immediate Visual Feedback */}
          {activity.interactiveQuestions && activity.interactiveQuestions.length > 0 && (
            <section aria-label="Questões e Exercícios Adaptados" className="space-y-4">
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>✏️ Questões e Desafios Adaptados:</span>
              </h3>

              <div className="space-y-4">
                {activity.interactiveQuestions.map((q) => {
                  const userAns = selectedAnswers[q.number];
                  const hintOpen = !!showHints[q.number];

                  return (
                    <div
                      key={q.number}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-900 border-2 border-slate-700/90 flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-bold text-sm sm:text-base text-slate-100 leading-snug">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs mr-2">
                            {q.number}
                          </span>
                          {q.question}
                        </h4>

                        {q.hint && (
                          <button
                            type="button"
                            onClick={() => {
                              sensory.triggerSensoryAction('pop', 'tap');
                              setShowHints((prev) => ({ ...prev, [q.number]: !prev[q.number] }));
                            }}
                            className="shrink-0 p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            title="Ver Dica"
                          >
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                            <span className="hidden sm:inline">Dica</span>
                          </button>
                        )}
                      </div>

                      {/* Hint Accordion */}
                      {hintOpen && q.hint && (
                        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs sm:text-sm flex items-start gap-2 animate-fadeIn">
                          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{q.hint}</span>
                        </div>
                      )}

                      {/* Visual Support Note */}
                      {q.visualSupportNote && (
                        <p className="text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 p-2.5 rounded-xl flex items-center gap-2">
                          <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span>{q.visualSupportNote}</span>
                        </p>
                      )}

                      {/* Interactive Options if provided */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = userAns === opt;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => {
                                  sensory.triggerSensoryAction('pop', 'tap');
                                  setSelectedAnswers((prev) => ({ ...prev, [q.number]: opt }));
                                }}
                                className={`p-3 rounded-xl border-2 text-left font-semibold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-md'
                                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500'
                                }`}
                              >
                                <span>{opt}</span>
                                {isSelected && <Check className="w-4 h-4 text-slate-950 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: GUIA PEDAGÓGICO & DICAS SENSORIAIS */}
      {activeTab === 'educator' && (
        <div className="space-y-5">
          {/* Pedagogical Justification Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border-2 border-indigo-500/40">
            <h3 className="text-base font-black text-indigo-300 flex items-center gap-2 mb-2">
              <BrainCircuit className="w-5 h-5 text-indigo-400" />
              <span>Fundamentação & Justificativa Pedagógica:</span>
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed">
              {activity.pedagogicalJustification}
            </p>
          </div>

          {/* Sensory and Classroom Tips */}
          {activity.sensoryTips && activity.sensoryTips.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900 border-2 border-emerald-500/40">
              <h3 className="text-base font-black text-emerald-300 flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>Orientações de Mediação & Ambiente Sensorial:</span>
              </h3>
              <ul className="space-y-2.5">
                {activity.sensoryTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Neurodivergence Guidelines Reminder */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Pilares Metodológicos para {currentNeuro.name}:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentNeuro.keyPedagogy.map((ped, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-800 text-xs text-slate-300 flex items-center gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{ped}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
