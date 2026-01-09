
export enum Subject {
  AIR_LAW = "Air Law",
  AIRCRAFT_GENERAL_KNOWLEDGE = "Aircraft General Knowledge",
  FLIGHT_PLANNING = "Flight Performance & Planning",
  HUMAN_PERFORMANCE = "Human Performance",
  METEOROLOGY = "Meteorology",
  NAVIGATION = "Navigation",
  OPERATIONAL_PROCEDURES = "Operational Procedures",
  PRINCIPLES_OF_FLIGHT = "Principles of Flight",
  COMMUNICATIONS = "Communications"
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number; // 0-3
  explanation?: string; // Filled after exam or if pre-generated
  topic?: string; // Sub-topic for detailed reporting
}

export type Language = 'en' | 'de' | 'fr';

export interface ExamSession {
  questions: Question[];
  userAnswers: Record<string, number>; // questionId -> selectedOptionIndex
  flaggedQuestions: Set<string>;
  startTime: number;
  durationSeconds: number; // Total time allowed
  secondsRemaining: number; // Current time remaining for resume functionality
  subject: Subject;
  language: Language;
}

export interface ExamHistoryItem {
  id: string;
  date: number;
  subject: Subject;
  score: number;
  totalQuestions: number;
  passed: boolean;
}

export enum AppState {
  HOME = 'HOME',
  LOADING_EXAM = 'LOADING_EXAM',
  EXAM_ACTIVE = 'EXAM_ACTIVE',
  RESULTS = 'RESULTS',
  DEVELOPER = 'DEVELOPER'
}

export interface ExamConfig {
  subject: Subject;
  questionCount: number;
  language: Language;
}

export type AppTheme = 'slate' | 'blue';