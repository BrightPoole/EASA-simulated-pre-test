import React from 'react';
import { ExamSession, Question, AppTheme } from '../types.ts';
import { Button } from './Button.tsx';
import { CheckCircle, XCircle, RotateCcw, Home, Award, AlertTriangle, PieChart, BarChart3 } from 'lucide-react';

interface ResultsViewProps {
  session: ExamSession;
  onRestart: () => void;
  onHome: () => void;
  theme: AppTheme;
}

const UI_TEXT = {
  en: {
    passed: "Examination Passed",
    failed: "Examination Failed",
    scored: "You scored",
    correct: "Correct",
    incorrect: "Incorrect",
    limit: "Limit",
    backHome: "Back to Home",
    tryAgain: "Try Another Exam",
    topicBreakdown: "Topic Breakdown",
    detailedReview: "Detailed Review",
    correctAnswer: "Correct Answer",
    yourSelection: "Your Selection",
    explanation: "Explanation",
    skipped: "Skipped"
  },
  de: {
    passed: "Prüfung bestanden",
    failed: "Prüfung nicht bestanden",
    scored: "Sie erreichten",
    correct: "Richtig",
    incorrect: "Falsch",
    limit: "Limit",
    backHome: "Zurück zum Start",
    tryAgain: "Neue Prüfung",
    topicBreakdown: "Themenübersicht",
    detailedReview: "Detaillierte Übersicht",
    correctAnswer: "Richtige Antwort",
    yourSelection: "Ihre Wahl",
    explanation: "Erklärung",
    skipped: "Übersprungen"
  },
  fr: {
    passed: "Examen réussi",
    failed: "Examen échoué",
    scored: "Vous avez obtenu",
    correct: "Correct",
    incorrect: "Incorrect",
    limit: "Limite",
    backHome: "Retour à l'accueil",
    tryAgain: "Nouvel examen",
    topicBreakdown: "Répartition par sujet",
    detailedReview: "Revue détaillée",
    correctAnswer: "Réponse correcte",
    yourSelection: "Votre sélection",
    explanation: "Explication",
    skipped: "Sauté"
  }
};

export const ResultsView: React.FC<ResultsViewProps> = ({ session, onRestart, onHome, theme }) => {
  const total = session.questions.length;
  let correct = 0;
  const isDark = theme === 'blue';
  const text = UI_TEXT[session.language || 'en'];
  
  const topicStats: Record<string, { correct: number; total: number }> = {};

  session.questions.forEach(q => {
    const isCorrect = session.userAnswers[q.id] === q.correctOptionIndex;
    if (isCorrect) {
      correct++;
    }

    const topic = q.topic || "General Knowledge";
    if (!topicStats[topic]) {
      topicStats[topic] = { correct: 0, total: 0 };
    }
    topicStats[topic].total++;
    if (isCorrect) {
      topicStats[topic].correct++;
    }
  });

  const percentage = Math.round((correct / total) * 100);
  const passed = percentage >= 75;

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className={`p-8 text-center ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="inline-flex justify-center items-center w-20 h-20 bg-white rounded-full shadow-sm mb-4">
              {passed ? (
                <Award className="w-10 h-10 text-green-600" />
              ) : (
                <AlertTriangle className="w-10 h-10 text-red-600" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {passed ? text.passed : text.failed}
            </h1>
            <p className="text-slate-600 mb-6">
              {text.scored} {percentage}% in {session.subject}
            </p>
            
            <div className="flex justify-center gap-8 text-sm">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-slate-900">{correct}</span>
                <span className="text-slate-500">{text.correct}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-slate-900">{total - correct}</span>
                <span className="text-slate-500">{text.incorrect}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-slate-900">{Math.floor(session.durationSeconds / 60)}m</span>
                <span className="text-slate-500">{text.limit}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 px-8 py-4 flex justify-between items-center border-t border-slate-100">
             <Button variant="outline" onClick={onHome}>
               <Home className="w-4 h-4 mr-2" />
               {text.backHome}
             </Button>
             <Button variant="primary" onClick={onRestart}>
               <RotateCcw className="w-4 h-4 mr-2" />
               {text.tryAgain}
             </Button>
          </div>
        </div>

        {Object.keys(topicStats).length > 0 && (
          <div className="mb-8">
            <h2 className={`text-xl font-bold mb-4 flex items-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              {text.topicBreakdown}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(topicStats).map(([topic, stats]) => {
                const topicPct = Math.round((stats.correct / stats.total) * 100);
                let barColor = 'bg-blue-600';
                if (topicPct >= 75) barColor = 'bg-green-500';
                else if (topicPct < 50) barColor = 'bg-red-500';
                else barColor = 'bg-yellow-500';

                return (
                  <div key={topic} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 min-h-[2.5rem]">{topic}</h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        topicPct >= 75 ? 'bg-green-100 text-green-700' : 
                        topicPct < 50 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {topicPct}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${barColor}`} 
                        style={{ width: `${topicPct}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-xs text-slate-500 flex justify-between">
                      <span>{stats.correct} / {stats.total} {text.correct}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{text.detailedReview}</h2>
        <div className="space-y-6">
          {session.questions.map((q, idx) => {
            const userAnswer = session.userAnswers[q.id];
            const isCorrect = userAnswer === q.correctOptionIndex;
            const isSkipped = userAnswer === undefined;

            return (
              <div key={q.id} className={`bg-white rounded-xl border p-6 ${isCorrect ? 'border-slate-200' : 'border-red-200 ring-1 ring-red-100'}`}>
                <div className="flex items-start gap-4 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full font-mono text-sm font-bold text-slate-600">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {q.topic && (
                         <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                           {q.topic}
                         </span>
                      )}
                    </div>
                    <p className="text-lg text-slate-900 font-medium mb-1">{q.questionText}</p>
                    <div className="flex items-center gap-2 mt-2">
                       {isCorrect ? (
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                           <CheckCircle className="w-3 h-3 mr-1" /> {text.correct}
                         </span>
                       ) : (
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                           <XCircle className="w-3 h-3 mr-1" /> {isSkipped ? text.skipped : text.incorrect}
                         </span>
                       )}
                    </div>
                  </div>
                </div>

                <div className="ml-12 space-y-2">
                  {q.options.map((opt, optIdx) => {
                    let style = "p-3 rounded-lg text-sm border ";
                    const isSelected = userAnswer === optIdx;
                    const isCorrectOption = q.correctOptionIndex === optIdx;

                    if (isCorrectOption) {
                      style += "bg-green-50 border-green-200 text-green-800 font-medium";
                    } else if (isSelected && !isCorrectOption) {
                      style += "bg-red-50 border-red-200 text-red-800";
                    } else {
                      style += "bg-white border-slate-100 text-slate-500 opacity-70";
                    }

                    return (
                      <div key={optIdx} className={style}>
                         <span className="mr-3 font-mono font-semibold">{String.fromCharCode(65 + optIdx)}.</span>
                         {opt}
                         {isCorrectOption && <span className="float-right text-xs uppercase tracking-wider font-bold">{text.correctAnswer}</span>}
                         {isSelected && !isCorrectOption && <span className="float-right text-xs uppercase tracking-wider font-bold">{text.yourSelection}</span>}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="ml-12 mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{text.explanation}</h4>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};