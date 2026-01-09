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
        if (parsed && typeof parsed === 'object') {
          // Rehydrate the Set from the array
          const rehydratedSession: ExamSession = {
            ...parsed,
            flaggedQuestions: new Set(Array.isArray(parsed.flaggedQuestions) ? parsed.flaggedQuestions : [])
          };
          setCurrentSession(rehydratedSession);
          if (rehydratedSession.language) {
              setLanguage(rehydratedSession.language);
          }
        }
      } catch (e) {
        console.warn("Failed to load saved state:", e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // Load history
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setExamHistory(parsed);
        }
      } catch (e) {
        console.warn("Failed to load history:", e);
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

  const saveProgress = useCallback((session: ExamSession) => {
    try {
      const sessionToSave = {
        ...session,
        flaggedQuestions: Array.from(session.flaggedQuestions || [])
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionToSave));
    } catch (err) {
      console.error("Storage error:", err);
    }
  }, []);

  const handleStartExam = async (config: ExamConfig) => {
    setAppState(AppState.LOADING_EXAM);
    setError(null);
    setLanguage(config.language);

    try {
      const questions = await generateQuestions(config.subject, config.questionCount, config.language);
      
      let duration = 0;
      switch (config.questionCount) {
        case 5: duration = 5 * 60; break;
        case 10: duration = 15 * 60; break;
        case 20: duration = 30 * 60; break;
        case 30: duration = 45 * 60; break;
        default: duration = config.questionCount * 90;
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
      console.error("Question Generation Failed:", err);
      setError(err.message || "Failed to generate examination questions. Please check your network and try again.");
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
      try {
        const sessionToSave = {
          ...updated,
          flaggedQuestions: Array.from(updated.flaggedQuestions || [])
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionToSave));
      } catch (e) {}
      return updated;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    setCurrentSession(current => {
      if (!current) return null;

      let correct = 0;
      current.questions.forEach(q => {
        if (current.userAnswers[q.id] === q.correctOptionIndex) {
          correct++;
        }
      });
      const total = current.questions.length;
      const score = Math.round((correct / total) * 100);
      const passed = score >= 75;

      const historyItem: ExamHistoryItem = {
        id: `exam-${Date.now()}`,
        date: Date.now(),
        subject: current.subject,
        score,
        totalQuestions: total,
        passed
      };

      setExamHistory(prevHistory => {
        const newHistory = [historyItem, ...prevHistory];
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
        return newHistory;
      });

      localStorage.removeItem(STORAGE_KEY);
      setAppState(AppState.RESULTS);
      
      return current;
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
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-red-200 text-red-600 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px]" role="alert">
              <span className="flex-1 font-medium">{error}</span>
              <button onClick={() => setError(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900 to-slate-900 z-0 opacity-60"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-48 h-48 mb-10">
              <div className="absolute inset-0 rounded-full bg-blue-600/20 blur-2xl animate-pulse"></div>
              <div className="absolute inset-0 rounded-full bg-[#003399] border-4 border-[#FFCC00] shadow-2xl flex items-center justify-center overflow-hidden">
                 <div className="absolute inset-0 w-full h-full opacity-30">
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
                 <div className="w-20 h-20 animate-[spin_2.5s_linear_infinite] z-10 origin-center">
                   <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
                     <path fill="white" d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                   </svg>
                 </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold tracking-[0.2em] font-mono text-white drop-shadow-lg">GENERATING EXAMINATION</h2>
              <div className="w-64 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden border border-slate-700/50">
                <div className="h-full bg-[#FFCC00] animate-[shimmer_2s_infinite] w-full origin-left bg-gradient-to-r from-transparent via-yellow-200 to-transparent"></div>
              </div>
              <p className="text-slate-400 font-mono text-xs tracking-widest uppercase animate-pulse">Consulting AI Knowledge Bank...</p>
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
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default App;