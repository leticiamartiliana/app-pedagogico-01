import React, { useState, useRef } from 'react';
import {
  Wand2,
  FileText,
  UploadCloud,
  RotateCcw,
  Sparkles,
  BookOpenCheck,
  User,
  GraduationCap,
  BookmarkPlus,
  Loader2,
} from 'lucide-react';
import { TactileButton } from './TactileButton';
import { TEACHER_PRESETS } from '../constants/presets';
import { NeurodivergenceMeta, TeacherPreset } from '../types';
import { sensory } from '../services/sensory';

interface ActivityInputFormProps {
  currentNeuro: NeurodivergenceMeta;
  originalText: string;
  setOriginalText: (text: string) => void;
  subject: string;
  setSubject: (subject: string) => void;
  gradeLevel: string;
  setGradeLevel: (grade: string) => void;
  studentAlias: string;
  setStudentAlias: (alias: string) => void;
  extraNotes: string;
  setExtraNotes: (notes: string) => void;
  onAdapt: () => void;
  onReset: () => void;
  isAdapting: boolean;
  onSelectPresetNeuro?: (neuroId: any) => void;
}

export const ActivityInputForm: React.FC<ActivityInputFormProps> = ({
  currentNeuro,
  originalText,
  setOriginalText,
  subject,
  setSubject,
  gradeLevel,
  setGradeLevel,
  studentAlias,
  setStudentAlias,
  extraNotes,
  setExtraNotes,
  onAdapt,
  onReset,
  isAdapting,
  onSelectPresetNeuro,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setOriginalText(content);
        sensory.triggerSensoryAction('pop', 'toggle');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          setOriginalText(content);
          sensory.triggerSensoryAction('pop', 'toggle');
        }
      };
      reader.readAsText(file);
    }
  };

  const loadPreset = (preset: TeacherPreset) => {
    setOriginalText(preset.text);
    setSubject(preset.subject);
    setGradeLevel(preset.gradeLevel);
    if (onSelectPresetNeuro) {
      onSelectPresetNeuro(preset.suggestedNeuro);
    }
    sensory.triggerSensoryAction('pop', 'toggle');
  };

  return (
    <div className="bg-slate-850 border-2 border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-4">
      {/* Header and Quick Presets */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <label htmlFor="original-activity-input" className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Cole ou Digite o Material da Atividade Original</span>
          </label>
          <span className="text-xs text-slate-400">
            {originalText.length} caracteres
          </span>
        </div>

        {/* Quick Presets for Busy Teachers */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 mr-1">
            <BookmarkPlus className="w-3.5 h-3.5 text-indigo-400" />
            Modelos Rápidos:
          </span>
          {TEACHER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => loadPreset(preset)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 hover:border-indigo-400 transition-colors cursor-pointer select-none flex items-center gap-1 active:scale-95"
              title={`Carregar: ${preset.title}`}
            >
              <span>{preset.subject}</span>
              <span className="text-[10px] text-slate-400">({preset.gradeLevel})</span>
            </button>
          ))}
        </div>

        {/* Textarea with Drag and Drop */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative rounded-xl border-2 transition-all ${
            isDragging
              ? 'border-amber-400 bg-amber-500/10'
              : 'border-slate-700 bg-slate-900/90 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/30'
          }`}
        >
          <textarea
            id="original-activity-input"
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Exemplo: Cole aqui a pergunta, texto, história, lista de exercícios matemáticos ou instruções que você deseja que sejam adaptadas para atender esta neurodivergência..."
            rows={7}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 p-3.5 text-sm sm:text-base leading-relaxed focus:outline-none resize-y min-h-[140px]"
          />

          {/* Bottom Bar inside Textarea: File upload shortcut */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-slate-800 bg-slate-900/60 rounded-b-xl text-xs text-slate-400">
            <span className="hidden sm:inline">
              Dica: Você também pode arrastar e soltar um arquivo de texto (.txt, .md).
            </span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.text"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer font-medium ml-auto"
            >
              <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>Importar Arquivo de Texto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Optional Metadata: Subject, Grade, Student alias, Extra notes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Subject */}
        <div>
          <label htmlFor="subject-input" className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
            <BookOpenCheck className="w-3.5 h-3.5 text-indigo-400" />
            Disciplina / Matéria
          </label>
          <input
            id="subject-input"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ex: Português, Matemática..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Grade */}
        <div>
          <label htmlFor="grade-input" className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
            Ano / Ciclo Escolar
          </label>
          <input
            id="grade-input"
            type="text"
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            placeholder="Ex: 4º Ano Fund. I"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Student Alias - Local Only */}
        <div>
          <label htmlFor="student-alias-input" className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              Identificação do Aluno (Privado)
            </span>
          </label>
          <input
            id="student-alias-input"
            type="text"
            value={studentAlias}
            onChange={(e) => setStudentAlias(e.target.value)}
            placeholder="Ex: Lucas M. (Fica só no seu aparelho)"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Extra teacher instructions / Personalization */}
      <div>
        <label htmlFor="extra-instructions-input" className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Instruções Especiais ou Interesses do Aluno (Opcional)
        </label>
        <input
          id="extra-instructions-input"
          type="text"
          value={extraNotes}
          onChange={(e) => setExtraNotes(e.target.value)}
          placeholder="Ex: 'O aluno se interessa muito por carros esportivos', 'Substitua cálculos complexos por números redondos'..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
        <TactileButton
          type="button"
          variant="ghost"
          size="md"
          onClick={onReset}
          icon={<RotateCcw className="w-4 h-4 text-slate-400" />}
          shortcutBadge="Alt+N"
          soundTone="click"
          aria-label="Limpar todos os campos da atividade"
        >
          Limpar Campos
        </TactileButton>

        {/* Adapt Button: Color adapts dynamically to current neurodivergence! */}
        <TactileButton
          type="button"
          variant={
            currentNeuro.id === 'tea'
              ? 'amber'
              : currentNeuro.id === 'tdah'
              ? 'orange'
              : currentNeuro.id === 'dyslexia'
              ? 'cyan'
              : currentNeuro.id === 'dyscalculia'
              ? 'emerald'
              : currentNeuro.id === 'gifted'
              ? 'purple'
              : 'blue'
          }
          size="lg"
          onClick={onAdapt}
          disabled={!originalText.trim() || isAdapting}
          shortcutBadge="Alt+A"
          soundTone="chime"
          hapticFeedback="success"
          icon={
            isAdapting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Wand2 className="w-5 h-5" />
            )
          }
          aria-label="Adaptar material para a neurodivergência selecionada"
        >
          {isAdapting
            ? 'Adaptando Material com Rigor Pedagógico...'
            : `Adaptar para ${currentNeuro.shortName}`}
        </TactileButton>
      </div>
    </div>
  );
};
