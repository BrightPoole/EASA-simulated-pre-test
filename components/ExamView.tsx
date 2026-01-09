import React, { useState, useEffect, useRef } from 'react';
import { Question, ExamSession, AppTheme } from '../types.ts';
import { Button } from './Button.tsx';
import { Flag, ChevronLeft, ChevronRight, Clock, LayoutGrid, CheckCircle, ClipboardList } from 'lucide-react';

interface ExamViewProps {
  session: ExamSession;
  onUpdateAnswer: (questionId: string, answerIndex: number) => void;
  onToggleFlag: (questionId: string) => void;
  onTimeUpdate: (remaining: number) => void;
  onSubmit: () => void;
  theme: AppTheme;
}

const UI_TEXT = {
  en: {
    question: "Question",
    of: "of",
    progress: "Examination Progress",
    timeRemaining: "Time Remaining",
    overview: "Overview",
    finishExam: "Finish Exam",
    previous: "Previous",
    next: "Next",
    finish: "Finish",
    answered: "answered",
    current: "Current",
    flagged: "Flagged",
    notAttempted: "Not Attempted",
    close: "Close"
  },
  de: {
    question: "Frage",
    of: "von",
    progress: "Fortschritt",
    timeRemaining: "Verbleibende Zeit",
    overview: "Übersicht",
    finishExam: "Prüfung beenden",
    previous: "Zurück",
    next: "Weiter",
    finish: "Beenden",
    answered: "beantwortet",
    current: "Aktuell",
    flagged: "Markiert",
    notAttempted: "Nicht versucht",
    close: "Schließen"
  },
  fr: {
    question: "Question",
    of: "sur",
    progress: "Progression",
    timeRemaining: "Temps restant",
    overview: "Aperçu",
    finishExam: "Finir l'examen",
    previous: "Précédent",
    next: "Suivant",
    finish: "Terminer",
    answered: "répondu",
    current: "Aktuel",
    flagged: "Signalé",
    notAttempted: "Non tenté",
    close: "Fermer"
  }
};

export const ExamView: React.FC<ExamViewProps> = ({
  session,
  onUpdateAnswer,
  onToggleFlag,
  onTimeUpdate,
  onSubmit,
  theme
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(session.secondsRemaining ?? session.durationSeconds);
  const [showGrid, setShowGrid] = useState(false);
  
  const startTimeRef = useRef(Date.now());
  const initialTimeRef = useRef(session.secondsRemaining ?? session.durationSeconds);
  const lastTimeUpdateRef = useRef(timeLeft);
  
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onSubmitRef = useRef(onSubmit);

  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);
  
  const isDark = theme === 'blue';
  const text = UI_TEXT[session.language || 'en'];

  const currentQuestion = session.questions[currentQuestionIndex];
  const totalQuestions = session.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const answeredCount = Object.keys(session.userAnswers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);
  
  const totalDuration = session.durationSeconds;
  const timePercentage = Math.max(0, (timeLeft / totalDuration) * 100);
  const circleRadius = 18;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (timePercentage / 100) * circumference;

  let timerColorClass = isDark ? "text-blue-400" : "text-blue-600";
  let ringColorClass = "stroke-blue-600";
  
  if (timePercentage < 10) {
    timerColorClass = "text-red-600 animate-pulse";
    ringColorClass = "stroke-red-600";
  } else if (timePercentage < 25) {
    timerColorClass = "text-orange-600";
    ringColorClass = "stroke-orange-500";
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTimeRef.current) / 1000);
      const newTimeLeft = Math.max(0, initialTimeRef.current - elapsedSeconds);
      
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
        setTimeout(() => {
            onSubmitRef.current();
        }, 100);
        return;
      }
      
      if (Math.abs(lastTimeUpdateRef.current - newTimeLeft) >= 5 || newTimeLeft < 15) {
        onTimeUpdateRef.current(newTimeLeft);
        lastTimeUpdateRef.current = newTimeLeft;
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      if (lastTimeUpdateRef.current > 0) {
        onTimeUpdateRef.current(lastTimeUpdateRef.current); 
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (index: number) => {
    const q = session.questions[index];
    const isAnswered = session.userAnswers[q.id] !== undefined;
    const isFlagged = session.flaggedQuestions.has(q.id);
    const isCurrent = index === currentQuestionIndex;

    let classes = "w-full h-10 rounded text-xs font-medium border transition-all ";
    
    if (isCurrent) {
      classes += "border-blue-600 ring-1 ring-blue-600 text-blue-700 bg-blue-50 ";
    } else if (isFlagged) {
      classes += "bg-orange-100 border-orange-300 text-orange-800 ";
    } else if (isAnswered) {
      classes += "bg-slate-800 border-slate-800 text-white ";
    } else {
      classes += "bg-white border-slate-200 text-slate-500 hover:border-slate-300 ";
    }
    
    return classes;
  };

  return (
    <div className="flex flex-col h-screen bg-transparent">
      <header className={`border-b px-6 py-3 flex items-center justify-between sticky top-0 z-10 transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center space-x-4">
           <div className="flex flex-col">
             <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-slate-500'}`}>{session.subject}</span>
             <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{text.question} {currentQuestionIndex + 1} {text.of} {totalQuestions}</span>
           </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden lg:flex flex-col items-end">
             <div className="flex items-center mb-1 space-x-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{text.progress}</span>
                <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{progressPercent}%</span>
             </div>
             <div className={`w-32 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
             </div>
          </div>

          <div className={`h-8 w-px hidden lg:block ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

          <div className={`flex items-center px-3 py-1.5 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
             <div className="relative w-9 h-9 mr-3 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                   <circle
                     className={isDark ? "text-slate-700" : "text-slate-200"}
                     strokeWidth="3"
                     stroke="currentColor"
                     fill="transparent"
                     r={circleRadius}
                     cx="18"
                     cy="18"
                   />
                   <circle
                     className={`${ringColorClass} transition-all duration-1000 ease-linear`}
                     strokeWidth="3"
                     strokeDasharray={circumference}
                     strokeDashoffset={strokeDashoffset}
                     strokeLinecap="round"
                     stroke="currentColor"
                     fill="transparent"
                     r={circleRadius}
                     cx="18"
                     cy="18"
                   />
                </svg>
                <Clock className={`w-3.5 h-3.5 absolute ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
             </div>
             <div className="flex flex-col">
               <span className="text-[9px] uppercase font-bold text-slate-400 leading-none mb-0.5">{text.timeRemaining}</span>
               <span className={`font-mono text-base font-bold leading-none tracking-tight ${timerColorClass}`}>
                 {formatTime(timeLeft)}
               </span>
             </div>
          </div>
          
          <Button 
            variant={isDark ? "outline" : "ghost"}
            size="sm" 
            onClick={() => setShowGrid(!showGrid)}
            className={`hidden md:flex ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : ''}`}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            {text.overview}
          </Button>

          <Button 
            variant="primary" 
            size="sm" 
            onClick={onSubmit}
          >
            {text.finishExam}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <div className={`w-full h-1.5 rounded-full mb-8 ${isDark ? 'bg-blue-900/40' : 'bg-slate-200/50'}`}>
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
              ></div>
            </div>

            <div className={`rounded-xl shadow-sm border p-6 md:p-10 mb-6 transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-start mb-6">
                <h2 className={`text-xl md:text-2xl font-medium leading-relaxed ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {currentQuestion.questionText}
                </h2>
                <button
                  onClick={() => onToggleFlag(currentQuestion.id)}
                  className={`p-2 rounded-full transition-colors ${
                    session.flaggedQuestions.has(currentQuestion.id)
                      ? 'bg-orange-500/10 text-orange-500'
                      : isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'
                  }`}
                  title="Flag for review"
                >
                  <Flag className="w-6 h-6 fill-current" />
                </button>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <div 
                    key={idx}
                    onClick={() => onUpdateAnswer(currentQuestion.id, idx)}
                    className={`
                      group relative p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${session.userAnswers[currentQuestion.id] === idx
                        ? 'border-blue-600 bg-blue-500/10'
                        : isDark 
                          ? 'border-slate-700 hover:border-blue-500 hover:bg-slate-700' 
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }
                    `}
                  >
                    <div className="flex items-center">
                      <div className={`
                        flex items-center justify-center w-8 h-8 rounded-full border mr-4 text-sm font-semibold transition-colors
                        ${session.userAnswers[currentQuestion.id] === idx
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : isDark 
                             ? 'bg-slate-800 border-slate-600 text-slate-400 group-hover:border-blue-400 group-hover:text-blue-400'
                             : 'bg-white border-slate-300 text-slate-500 group-hover:border-blue-400'
                        }
                      `}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className={`text-base ${
                        session.userAnswers[currentQuestion.id] === idx 
                          ? isDark ? 'text-blue-300 font-medium' : 'text-blue-900 font-medium' 
                          : isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        {option}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className={isDark ? "bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800" : "bg-white"}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                {text.previous}
              </Button>

              <div className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-slate-500'}`}>
                {Object.keys(session.userAnswers).length} {text.answered}
              </div>

              <Button
                variant={isLastQuestion ? "primary" : "secondary"}
                onClick={() => {
                  if (isLastQuestion) {
                    onSubmit();
                  } else {
                    setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1));
                  }
                }}
              >
                {isLastQuestion ? (
                  <>
                    {text.finish}
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    {text.next}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>

        <aside className={`
          ${showGrid ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} 
          fixed md:relative inset-y-0 right-0 w-72 border-l shadow-xl md:shadow-none transition-transform duration-300 z-20 md:block
          ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}
        `}>
          <div className="h-full flex flex-col">
            <div className={`p-4 border-b flex justify-between items-center md:hidden ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{text.overview}</h3>
              <button onClick={() => setShowGrid(false)} className="text-slate-500">{text.close}</button>
            </div>

            <div className={`p-4 border-b hidden md:block ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{text.overview}</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-4 gap-2">
                {session.questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setShowGrid(false);
                    }}
                    className={getQuestionStatus(idx)}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <div className="mt-8 space-y-3 px-2">
                 <div className="flex items-center text-xs text-slate-500">
                   <div className="w-3 h-3 bg-blue-50 border border-blue-600 rounded mr-2"></div>
                   {text.current}
                 </div>
                 <div className="flex items-center text-xs text-slate-500">
                   <div className="w-3 h-3 bg-slate-800 rounded mr-2"></div>
                   {text.answered}
                 </div>
                 <div className="flex items-center text-xs text-slate-500">
                   <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded mr-2"></div>
                   {text.flagged}
                 </div>
                 <div className="flex items-center text-xs text-slate-500">
                   <div className={`w-3 h-3 border rounded mr-2 ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}></div>
                   {text.notAttempted}
                 </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};