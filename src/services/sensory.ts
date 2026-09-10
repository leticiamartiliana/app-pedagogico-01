import confetti from 'canvas-confetti';
import { SensorySettings } from '../types';

class SensoryService {
  private audioCtx: AudioContext | null = null;
  private settings: SensorySettings = {
    hapticsEnabled: true,
    soundEnabled: true,
    soundVolume: 0.5,
    visualParticles: true,
    highStimulusMode: true,
  };

  constructor() {
    this.loadSettings();
  }

  public getSettings(): SensorySettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<SensorySettings>) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem('neuro_sensory_settings', JSON.stringify(this.settings));
    } catch {
      // ignore
    }
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem('neuro_sensory_settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
  }

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  /**
   * Haptic vibration feedback for mobile / touch devices
   */
  public triggerHaptic(type: 'tap' | 'success' | 'toggle' | 'alert' = 'tap') {
    if (!this.settings.hapticsEnabled || typeof navigator === 'undefined' || !navigator.vibrate) {
      return;
    }
    try {
      switch (type) {
        case 'tap':
          navigator.vibrate(20);
          break;
        case 'toggle':
          navigator.vibrate([15, 30, 25]);
          break;
        case 'success':
          navigator.vibrate([40, 60, 40, 60, 80]);
          break;
        case 'alert':
          navigator.vibrate([80, 50, 80]);
          break;
      }
    } catch {
      // Silent fail
    }
  }

  /**
   * Synthesize gentle, pleasant sound feedback using Web Audio API
   */
  public playTone(type: 'click' | 'pop' | 'success' | 'chime' | 'switch') {
    if (!this.settings.soundEnabled) return;
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      gain.connect(this.audioCtx.destination);
      gain.gain.setValueAtTime(0.001, now);

      const maxGain = 0.15 * this.settings.soundVolume;

      switch (type) {
        case 'click':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
          gain.gain.linearRampToValueAtTime(maxGain, now + 0.005);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
          osc.connect(gain);
          osc.start(now);
          osc.stop(now + 0.04);
          break;

        case 'pop':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(680, now + 0.06);
          gain.gain.linearRampToValueAtTime(maxGain * 1.2, now + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
          osc.connect(gain);
          osc.start(now);
          osc.stop(now + 0.07);
          break;

        case 'switch':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.setValueAtTime(740, now + 0.03);
          gain.gain.linearRampToValueAtTime(maxGain, now + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
          osc.connect(gain);
          osc.start(now);
          osc.stop(now + 0.08);
          break;

        case 'success':
        case 'chime':
          // Harmonious arpeggio
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
            if (!this.audioCtx) return;
            const subOsc = this.audioCtx.createOscillator();
            const subGain = this.audioCtx.createGain();
            const startTime = now + i * 0.06;

            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(freq, startTime);
            subGain.gain.setValueAtTime(0.001, startTime);
            subGain.gain.linearRampToValueAtTime(maxGain * 0.8, startTime + 0.02);
            subGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);

            subGain.connect(this.audioCtx.destination);
            subOsc.connect(subGain);
            subOsc.start(startTime);
            subOsc.stop(startTime + 0.35);
          });
          break;
      }
    } catch {
      // Audio error ignored
    }
  }

  /**
   * Combined sensory feedback (tactile + auditory)
   */
  public triggerSensoryAction(tone: 'click' | 'pop' | 'success' | 'chime' | 'switch', haptic: 'tap' | 'toggle' | 'success' | 'alert' = 'tap') {
    this.playTone(tone);
    this.triggerHaptic(haptic);
  }

  /**
   * Confetti celebration for completing an adaptation or milestone
   */
  public triggerCelebration() {
    this.triggerSensoryAction('success', 'success');

    if (!this.settings.visualParticles) return;

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#EAB308', '#F97316', '#06B6D4', '#10B981', '#A855F7', '#3B82F6'],
      });
    } catch {
      // fallback
    }
  }
}

export const sensory = new SensoryService();
