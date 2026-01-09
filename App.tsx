
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, ExamConfig, ExamSession, Question, ExamHistoryItem, AppTheme, Language } from './types';
import { StartScreen } from './components/StartScreen';
import { ExamView } from './components/ExamView';
import { ResultsView } from './components/ResultsView';
import { DeveloperSection } from './components/DeveloperSection';
import { generateQuestions } from './services/geminiService';

const STORAGE_KEY = 'EASA_EXAM_STATE';
const HISTORY_KEY = 'EASA_EXAM_HISTORY';
const THEME_KEY = 'EASA_APP_THEME';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [currentSession, setCurrentSession] = useState<ExamSession | null>(null);
  const [examHistory, setExamHistory] = useState<ExamHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<AppTheme>('slate');
  const [language, setLanguage] = useState<Language>('en');

  // Load state, history, and theme from localStorage on mount
  useEffect(() => {
    // Load active session
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Rehydrate the Set from the array
        const rehydratedSession: ExamSession = {
          ...parsed,
          flaggedQuestions: new Set(parsed.flaggedQuestions)
        };
        setCurrentSession(rehydratedSession);
        // Restore language from session if available
        if (rehydratedSession.language) {
            setLanguage(rehydratedSession.language);
        }
      } catch (e) {
        console.error("Failed to load saved state", e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // Load history
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        setExamHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }

    // Load theme
    const savedTheme = localStorage.getItem(THEME_KEY) as AppTheme | null;
    if (savedTheme && ['slate', 'blue'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  const handleSetTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  };

  // Helper to save current state to localStorage
  const saveProgress = useCallback((session: ExamSession) => {
    const sessionToSave = {
      ...session,
      // Convert Set to Array for JSON serialization
      flaggedQuestions: Array.from(session.flaggedQuestions)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionToSave));
  }, []);

  const handleStartExam = async (config: ExamConfig) => {
    setAppState(AppState.LOADING_EXAM);
    setError(null);
    setLanguage(config.language); // Update global language state

    try {
      const questions = await generateQuestions(config.subject, config.questionCount, config.language);
      
      // Calculate duration based on specific rules:
      // 5 items  -> 5 minutes
      // 10 items -> 15 minutes
      // 20 items -> 30 minutes
      // 30 items -> 45 minutes
      let duration = 0;
      switch (config.questionCount) {
        case 5:
          duration = 5 * 60; // 5 minutes
          break;
        case 10:
          duration = 15 * 60; // 15 minutes
          break;
        case 20:
          duration = 30 * 60; // 30 minutes
          break;
        case 30:
          duration = 45 * 60; // 45 minutes
          break;
        default:
          duration = config.questionCount * 90; // Fallback 1.5 min/q
      }
      
      const newSession: ExamSession = {
        questions,
        userAnswers: {},
        flaggedQuestions: new Set(),
        startTime: Date.now(),
        durationSeconds: duration,
        secondsRemaining: duration,
        subject: config.subject,
        language: config.language
      };

      setCurrentSession(newSession);
      saveProgress(newSession);
      setAppState(AppState.EXAM_ACTIVE);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setAppState(AppState.HOME);
    }
  };

  const handleUpdateAnswer = useCallback((questionId: string, answerIndex: number) => {
    setCurrentSession(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        userAnswers: { ...prev.userAnswers, [questionId]: answerIndex }
      };
      saveProgress(updated);
      return updated;
    });
  }, [saveProgress]);

  const handleToggleFlag = useCallback((questionId: string) => {
    setCurrentSession(prev => {
      if (!prev) return null;
      const newFlags = new Set(prev.flaggedQuestions);
      if (newFlags.has(questionId)) {
        newFlags.delete(questionId);
      } else {
        newFlags.add(questionId);
      }
      const updated = { ...prev, flaggedQuestions: newFlags };
      saveProgress(updated);
      return updated;
    });
  }, [saveProgress]);

  const handleTimeUpdate = useCallback((remaining: number) => {
    setCurrentSession(prev => {
      if (!prev) return null;
      const updated = { ...prev, secondsRemaining: remaining };
      const sessionToSave = {
        ...updated,
        flaggedQuestions: Array.from(updated.flaggedQuestions)
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionToSave));
      return updated;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    setCurrentSession(current => {
      if (!current) return null;

      // Calculate results
      let correct = 0;
      current.questions.forEach(q => {
        if (current.userAnswers[q.id] === q.correctOptionIndex) {
          correct++;
        }
      });
      const total = current.questions.length;
      const score = Math.round((correct / total) * 100);
      const passed = score >= 75;

      // Create history item
      const historyItem: ExamHistoryItem = {
        id: `exam-${Date.now()}`,
        date: Date.now(),
        subject: current.subject,
        score,
        totalQuestions: total,
        passed
      };

      // Update history state and storage
      setExamHistory(prevHistory => {
        const newHistory = [historyItem, ...prevHistory];
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
        return newHistory;
      });

      // Clear active session storage
      localStorage.removeItem(STORAGE_KEY);
      setAppState(AppState.RESULTS);
      
      return current; // Return current state as we are unmounting anyway
    });
  }, []);

  const handleRestart = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAppState(AppState.HOME);
    setCurrentSession(null);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      theme === 'blue' ? 'bg-blue-950 text-white' : 
      'bg-slate-50 text-slate-900'
    }`}>
      {appState === AppState.HOME && (
        <>
          <StartScreen 
            onStartExam={handleStartExam} 
            onDeveloper={() => setAppState(AppState.DEVELOPER)}
            examHistory={examHistory}
            currentTheme={theme}
            initialLanguage={language}
          />
          {error && (
            <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
        </>
      )}

      {appState === AppState.DEVELOPER && (
        <DeveloperSection 
          onBack={() => setAppState(AppState.HOME)} 
          theme={theme}
          onSetTheme={handleSetTheme}
        />
      )}

      {appState === AppState.LOADING_EXAM && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white overflow-hidden relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900 to-slate-900 z-0"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            {/* EU Flag A320 Loader */}
            <div className="relative w-48 h-48 mb-10">
              {/* Outer Glow */}
              <div className="absolute inset-0 rounded-full bg-blue-600/20 blur-xl animate-pulse"></div>
              
              {/* EU Flag Circle */}
              <div className="absolute inset-0 rounded-full bg-[#003399] border-4 border-[#FFCC00] shadow-2xl flex items-center justify-center overflow-hidden">
                 
                 {/* Ring of 12 Stars */}
                 <div className="absolute inset-0 w-full h-full">
                   <svg viewBox="0 0 100 100" className="w-full h-full p-1">
                      <defs>
                         <path id="star" d="M 0 -1 L 0.22 -0.31 L 0.95 -0.31 L 0.36 0.12 L 0.59 0.81 L 0 0.38 L -0.59 0.81 L -0.36 0.12 L -0.95 -0.31 L -0.22 -0.31 Z" fill="#FFCC00" />
                      </defs>
                      <g transform="translate(50, 50)">
                        {[...Array(12)].map((_, i) => (
                          <g key={i} transform={`rotate(${i * 30}) translate(0, -38)`}>
                            <use href="#star" transform="scale(3.5)" />
                          </g>
                        ))}
                      </g>
                   </svg>
                 </div>

                 {/* Rotating A320 */}
                 <div className="w-20 h-20 animate-[spin_2s_linear_infinite] z-10 origin-center">
                   <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
                     <path 
                       fill="white"
                       d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" 
                     />
                   </svg>
                 </div>
              </div>
            </div>

            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold tracking-widest font-mono text-white drop-shadow-md">
                PREPARING YOUR TEST
              </h2>
              <div className="w-64 h-1 bg-slate-800 rounded-full mx-auto overflow-hidden border border-slate-700">
                <div className="h-full bg-[#FFCC00] animate-[pulse_1s_ease-in-out_infinite] w-full origin-left"></div>
              </div>
              <p className="text-slate-400 font-mono text-xs tracking-wider uppercase">
                GET READY FOR EASA-EXAM PARAMETERS...
              </p>
            </div>
          </div>
        </div>
      )}

      {appState === AppState.EXAM_ACTIVE && currentSession && (
        <ExamView 
          key={currentSession.startTime}
          session={currentSession}
          onUpdateAnswer={handleUpdateAnswer}
          onToggleFlag={handleToggleFlag}
          onTimeUpdate={handleTimeUpdate}
          onSubmit={handleSubmit}
          theme={theme}
        />
      )}

      {appState === AppState.RESULTS && currentSession && (
        <ResultsView 
          session={currentSession}
          onRestart={handleRestart}
          onHome={handleRestart}
          theme={theme}
        />
      )}
    </div>
  );
};

export default App;
