type SpeechCallback = (status: 'started' | 'paused' | 'resumed' | 'ended' | 'error', wordIndex?: number) => void;

class ScreenReaderService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingState = false;
  private isPausedState = false;
  private rate = 1.0;
  private pitch = 1.0;
  private listeners: Set<SpeechCallback> = new Set();
  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.availableVoices = this.synth.getVoices();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.availableVoices;
  }

  public setRate(newRate: number) {
    this.rate = Math.max(0.5, Math.min(2.0, newRate));
    if (this.isSpeakingState && this.currentUtterance) {
      // Replay with new rate
    }
  }

  public getRate(): number {
    return this.rate;
  }

  public subscribe(cb: SpeechCallback) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify(status: 'started' | 'paused' | 'resumed' | 'ended' | 'error', wordIndex?: number) {
    this.listeners.forEach((cb) => cb(status, wordIndex));
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  public isPaused(): boolean {
    return this.isPausedState;
  }

  public speak(text: string, onWord?: (charIndex: number) => void) {
    if (!this.synth) {
      console.warn('Síntese de voz não suportada neste navegador.');
      return;
    }

    this.stop();

    const cleanText = text
      .replace(/[*#_`>~]/g, '') // remove markdown symbols
      .replace(/\[\s*\]/g, 'caixa de seleção')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    // Prioritize natural PT-BR voice
    const ptVoice = this.availableVoices.find(
      (v) => v.lang.startsWith('pt') && (v.name.includes('Google') || v.name.includes('Luciana') || v.name.includes('Francisca') || v.localService)
    ) || this.availableVoices.find((v) => v.lang.startsWith('pt'));

    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    utterance.onstart = () => {
      this.isSpeakingState = true;
      this.isPausedState = false;
      this.notify('started');
    };

    utterance.onpause = () => {
      this.isPausedState = true;
      this.notify('paused');
    };

    utterance.onresume = () => {
      this.isPausedState = false;
      this.notify('resumed');
    };

    utterance.onend = () => {
      this.isSpeakingState = false;
      this.isPausedState = false;
      this.currentUtterance = null;
      this.notify('ended');
    };

    utterance.onerror = () => {
      this.isSpeakingState = false;
      this.isPausedState = false;
      this.currentUtterance = null;
      this.notify('error');
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word' && onWord) {
        onWord(event.charIndex);
      }
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause() {
    if (this.synth && this.isSpeakingState && !this.isPausedState) {
      this.synth.pause();
      this.isPausedState = true;
      this.notify('paused');
    }
  }

  public resume() {
    if (this.synth && this.isPausedState) {
      this.synth.resume();
      this.isPausedState = false;
      this.notify('resumed');
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeakingState = false;
      this.isPausedState = false;
      this.currentUtterance = null;
      this.notify('ended');
    }
  }

  /**
   * Helper to announce accessibility updates dynamically to screen readers
   */
  public announceLive(message: string) {
    const liveRegion = document.getElementById('a11y-live-announcer');
    if (liveRegion) {
      liveRegion.textContent = '';
      setTimeout(() => {
        liveRegion.textContent = message;
      }, 50);
    }
  }
}

export const screenReader = new ScreenReaderService();
