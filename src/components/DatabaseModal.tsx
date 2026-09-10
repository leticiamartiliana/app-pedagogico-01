import React, { useState, useRef } from 'react';
import {
  X,
  Database,
  Search,
  Trash2,
  Download,
  Upload,
  BookOpen,
  Calendar,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import { AdaptedActivity, NeuroType } from '../types';
import { NEURO_MAP, NEURO_TYPES_LIST } from '../constants/neuroTypes';
import { localDB } from '../services/db';
import { sensory } from '../services/sensory';
import { TactileButton } from './TactileButton';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: AdaptedActivity[];
  onSelectActivity: (activity: AdaptedActivity) => void;
  onRefreshList: () => Promise<void>;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  isOpen,
  onClose,
  activities,
  onSelectActivity,
  onRefreshList,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<NeuroType | 'all'>('all');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filtered = activities.filter((act) => {
    const matchesSearch =
      act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.studentAlias?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || act.neurodivergence === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir esta atividade salva do banco local?')) {
      sensory.triggerSensoryAction('click', 'alert');
      await localDB.deleteActivity(id);
      await onRefreshList();
      setStatusMessage('Atividade removida com sucesso!');
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  const handleExport = async () => {
    sensory.triggerSensoryAction('pop', 'success');
    const jsonStr = await localDB.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_atividades_neuro_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Backup JSON exportado com sucesso!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const count = await localDB.importBackup(text);
      await onRefreshList();
      sensory.triggerCelebration();
      setStatusMessage(`${count} atividades importadas com sucesso para o banco local!`);
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      alert(`Falha ao importar: ${err.message}`);
    }
    e.target.value = '';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Banco de Dados Local Seguro"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm"
    >
      <div className="bg-slate-900 border-3 border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b-2 border-slate-800 flex items-center justify-between gap-3 bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>Banco de Dados Local Seguro</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs border border-emerald-500/30 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Privacidade 100% Offline
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Seus materiais e dados de alunos ficam protegidos no seu aparelho via IndexedDB.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer"
            aria-label="Fechar banco de dados"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search, Filter, Export, Import */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, matéria ou aluno..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Neuro Filter */}
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">Todas as Neurodivergências</option>
            {NEURO_TYPES_LIST.map((n) => (
              <option key={n.id} value={n.id}>
                {n.symbol} {n.shortName}
              </option>
            ))}
          </select>

          {/* Backup Actions */}
          <div className="flex items-center gap-2">
            <TactileButton
              variant="secondary"
              size="sm"
              onClick={handleExport}
              icon={<Download className="w-4 h-4 text-cyan-400" />}
              aria-label="Exportar backup completo em JSON"
            >
              Exportar Backup
            </TactileButton>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
            <TactileButton
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              icon={<Upload className="w-4 h-4 text-emerald-400" />}
              aria-label="Importar backup de atividades"
            >
              Importar JSON
            </TactileButton>
          </div>
        </div>

        {/* Feedback message banner */}
        {statusMessage && (
          <div className="bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/30 px-4 py-2 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Activities List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Database className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-base font-bold text-slate-300">
                Nenhuma atividade encontrada neste filtro.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Adapte novos materiais e clique em "Salvar no Banco" para que apareçam aqui!
              </p>
            </div>
          ) : (
            filtered.map((act) => {
              const meta = NEURO_MAP.get(act.neurodivergence);
              return (
                <div
                  key={act.id}
                  onClick={() => {
                    sensory.triggerSensoryAction('pop', 'tap');
                    onSelectActivity(act);
                    onClose();
                  }}
                  className="p-4 rounded-2xl bg-slate-850 border-2 border-slate-750 hover:border-indigo-500/60 hover:bg-slate-800 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-700 shrink-0"
                      aria-hidden="true"
                    >
                      {meta?.symbol || '🧠'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${meta?.borderColor} ${meta?.textColor} ${meta?.accentBg}`}
                        >
                          {meta?.shortName}
                        </span>
                        {act.studentAlias && (
                          <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                            Aluno: {act.studentAlias}
                          </span>
                        )}
                        {act.subject && (
                          <span className="text-xs text-slate-400 font-medium">
                            • {act.subject}
                          </span>
                        )}
                        {act.gradeLevel && (
                          <span className="text-xs text-slate-500">
                            ({act.gradeLevel})
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors">
                        {act.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {act.visualInstructions?.[0] || act.adaptedContent}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(act.createdAt).toLocaleDateString('pt-BR')}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(act.id, e)}
                      className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 border border-slate-700 transition-colors cursor-pointer"
                      title="Excluir Atividade Salva"
                      aria-label={`Excluir atividade ${act.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-between text-xs text-slate-400">
          <span>
            Total: <strong>{activities.length}</strong> atividades salvas localmente
          </span>
          <TactileButton variant="ghost" size="sm" onClick={onClose}>
            Fechar
          </TactileButton>
        </div>
      </div>
    </div>
  );
};
