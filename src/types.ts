export type NeuroType =
  | 'tea'
  | 'tdah'
  | 'dyslexia'
  | 'dyscalculia'
  | 'gifted'
  | 'down_syndrome';

export interface NeurodivergenceMeta {
  id: NeuroType;
  name: string;
  shortName: string;
  symbol: string;
  tagline: string;
  description: string;
  primaryColor: string; // Tailwind color class or hex
  accentBg: string;
  borderColor: string;
  textColor: string;
  gradient: string;
  shadowColor: string;
  keyPedagogy: string[];
  classroomTips: string[];
  visualSymbolDescription: string;
}

export interface InteractiveQuestion {
  number: number;
  question: string;
  options?: string[];
  hint?: string;
  visualSupportNote?: string;
}

export interface AdaptedActivity {
  id: string;
  title: string;
  originalText: string;
  neurodivergence: NeuroType;
  subject?: string;
  gradeLevel?: string;
  studentAlias?: string; // Optional local alias (e.g., "Lucas - 4º Ano A")
  visualInstructions: string[];
  adaptedContent: string;
  interactiveQuestions?: InteractiveQuestion[];
  pedagogicalJustification: string;
  sensoryTips: string[];
  createdAt: number;
  updatedAt: number;
  isAiGenerated: boolean;
  tags?: string[];
}

export interface KeyboardShortcut {
  id: string;
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  action: string;
  description: string;
  defaultCombo: string;
}

export interface ReadingSettings {
  fontSize: number; // 16 to 36
  lineHeight: number; // 1.4 to 2.4
  letterSpacing: number; // 0 to 4
  fontFamily: 'lexend' | 'sans' | 'dyslexic' | 'mono';
  bionicReading: boolean;
  readingRuler: boolean;
  rulerHeight: number; // 30 to 80
  bgTheme: 'dark' | 'sepia' | 'cream' | 'mint' | 'high-contrast-dark';
  highlightCurrentSentence: boolean;
}

export interface SensorySettings {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  visualParticles: boolean;
  highStimulusMode: boolean; // extra vibrant colors and borders
}

export interface TeacherPreset {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  suggestedNeuro: NeuroType;
  text: string;
}
