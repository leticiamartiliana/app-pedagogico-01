import React from 'react';
import { sensory } from '../services/sensory';

interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'amber' | 'orange' | 'cyan' | 'emerald' | 'purple' | 'blue' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  soundTone?: 'click' | 'pop' | 'success' | 'chime' | 'switch';
  hapticFeedback?: 'tap' | 'toggle' | 'success' | 'alert';
  shortcutBadge?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  variant = 'primary',
  size = 'md',
  soundTone = 'click',
  hapticFeedback = 'tap',
  shortcutBadge,
  icon,
  children,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    sensory.triggerSensoryAction(soundTone, hapticFeedback);
    if (onClick) {
      onClick(e);
    }
  };

  const variantStyles = {
    primary:
      'bg-indigo-600 hover:bg-indigo-500 text-white border-2 border-indigo-400 shadow-[0_4px_0_#3730a3] active:shadow-[0_0px_0_#3730a3] focus-visible:ring-indigo-400',
    secondary:
      'bg-slate-800 hover:bg-slate-700 text-slate-100 border-2 border-slate-600 shadow-[0_4px_0_#1e293b] active:shadow-[0_0px_0_#1e293b] focus-visible:ring-slate-400',
    amber:
      'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border-2 border-amber-300 shadow-[0_4px_0_#b45309] active:shadow-[0_0px_0_#b45309] focus-visible:ring-amber-300',
    orange:
      'bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold border-2 border-orange-300 shadow-[0_4px_0_#c2410c] active:shadow-[0_0px_0_#c2410c] focus-visible:ring-orange-300',
    cyan:
      'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold border-2 border-cyan-300 shadow-[0_4px_0_#0e7490] active:shadow-[0_0px_0_#0e7490] focus-visible:ring-cyan-300',
    emerald:
      'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold border-2 border-emerald-300 shadow-[0_4px_0_#047857] active:shadow-[0_0px_0_#047857] focus-visible:ring-emerald-300',
    purple:
      'bg-purple-600 hover:bg-purple-500 text-white font-bold border-2 border-purple-400 shadow-[0_4px_0_#6b21a8] active:shadow-[0_0px_0_#6b21a8] focus-visible:ring-purple-300',
    blue:
      'bg-blue-600 hover:bg-blue-500 text-white font-bold border-2 border-blue-400 shadow-[0_4px_0_#1d4ed8] active:shadow-[0_0px_0_#1d4ed8] focus-visible:ring-blue-300',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white font-bold border-2 border-rose-400 shadow-[0_4px_0_#9f1239] active:shadow-[0_0px_0_#9f1239] focus-visible:ring-rose-400',
    ghost:
      'bg-transparent hover:bg-slate-800 text-slate-200 border-2 border-transparent hover:border-slate-700 active:bg-slate-800/80 shadow-none',
  }[variant];

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5 min-h-[36px]',
    md: 'px-4 py-2.5 text-sm rounded-xl gap-2 min-h-[44px]',
    lg: 'px-6 py-3.5 text-base rounded-xl gap-2.5 min-h-[50px]',
    xl: 'px-8 py-4 text-lg rounded-2xl gap-3 min-h-[56px]',
  }[size];

  return (
    <button
      {...props}
      disabled={disabled}
      onClick={handleClick}
      className={`
        relative inline-flex items-center justify-center font-semibold select-none
        transition-all duration-75 active:translate-y-1 cursor-pointer
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:shadow-none
        ${variantStyles}
        ${sizeStyles}
        ${className}
      `}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <span className="whitespace-nowrap">{children}</span>
      {shortcutBadge && (
        <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded bg-black/30 border border-white/20 text-white/90">
          {shortcutBadge}
        </span>
      )}
    </button>
  );
};
