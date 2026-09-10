import React, { useState, useEffect } from 'react';
import {
  X,
  Keyboard,
  RotateCcw,
  Check,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { KeyboardShortcut } from '../types';
import { DEFAULT_SHORTCUTS } from '../constants/shortcuts';
import { sensory } from '../services/sensory';
import { TactileButton } from './TactileButton';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
  onUpdateShortcuts: (updated: KeyboardShortcut[]) => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
  shortcuts,
  onUpdateShortcuts,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [listeningKey, setListeningKey] = useState<string>('');

  useEffect(() => {
    if (!editingId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape') {
        setEditingId(null);
        return;
      }

      if (['Alt', 'Control', 'Shift', 'Meta'].includes(e.key)) {
        return;
      }

      const keyChar = e.key.toLowerCase();
      const updated = shortcuts.map((sc) => {
        if (sc.id === editingId) {
          const combo = `${e.altKey ? 'Alt + ' : ''}${e.ctrlKey ? 'Ctrl + ' : ''}${e.shiftKey ? 'Shift + ' : ''}${keyChar.toUpperCase()}`;
          return {
            ...sc,
            key: keyChar,
            altKey: e.altKey || true, // Keep Alt by default for browser conflicts prevention
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            defaultCombo: combo || `Alt + ${keyChar.toUpperCase()}`,
          };
        }
        return sc;
      });

      sensory.triggerSensoryAction('success', 'success');
      onUpdateShortcuts(updated);
      setEditingId(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingId, shortcuts, onUpdateShortcuts]);

  if (!isOpen) return null;

  const handleResetDefaults = () => {
    sensory.triggerSensoryAction('pop', 'tap');
    onUpdateShortcuts([...DEFAULT_SHORTCUTS]);
    setEditingId(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Gerenciador de Atalhos de Teclado"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm"
    >
      <div className="bg-slate-900 border-3 border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b-2 border-slate-800 flex items-center justify-between gap-3 bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Keyboard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                Atalhos de Teclado Personalizados
              </h2>
              <p className="text-xs text-slate-400">
                Acelere sua navegação com combinações de teclas táteis e destacadas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer"
            aria-label="Fechar modal de atalhos"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-200 flex items-center justify-between">
          <span>
            💡 Dica: Você também pode usar <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-amber-400 font-mono text-amber-300 font-bold">Alt + 1</kbd> a <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-amber-400 font-mono text-amber-300 font-bold">Alt + 6</kbd> para trocar de neurodivergência instantaneamente.
          </span>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0 ml-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Padrões
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          {shortcuts.map((sc) => {
            const isBeingEdited = editingId === sc.id;

            return (
              <div
                key={sc.id}
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  isBeingEdited
                    ? 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-400/50'
                    : 'border-slate-800 bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-100">{sc.description}</h4>
                  <p className="text-xs text-slate-400 font-mono">Ação: {sc.action}</p>
                </div>

                <div className="flex items-center gap-2">
                  {isBeingEdited ? (
                    <span className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs animate-pulse">
                      Pressione uma nova tecla... (Esc para cancelar)
                    </span>
                  ) : (
                    <kbd className="px-3 py-1.5 rounded-xl bg-slate-950 border-2 border-slate-700 text-amber-300 font-mono font-black text-xs sm:text-sm shadow-inner tracking-wider">
                      {sc.defaultCombo}
                    </kbd>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      sensory.triggerSensoryAction('click', 'tap');
                      setEditingId(isBeingEdited ? null : sc.id);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                    title={isBeingEdited ? 'Cancelar' : 'Personalizar tecla'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-end">
          <TactileButton variant="primary" size="md" onClick={onClose}>
            Concluído
          </TactileButton>
        </div>
      </div>
    </div>
  );
};
