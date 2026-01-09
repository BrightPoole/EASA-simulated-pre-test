import React, { useState } from 'react';
import { Subject, ExamConfig, ExamHistoryItem, AppTheme, Language } from '../types.ts';
import { Button } from './Button.tsx';
import { BookOpen, Clock, AlertCircle, Code, History, CheckCircle, XCircle, Globe } from 'lucide-react';

interface StartScreenProps {
  onStartExam: (config: ExamConfig) => void;
  onDeveloper: () => void;
  examHistory: ExamHistoryItem[];
  currentTheme: AppTheme;
  initialLanguage?: Language;
}

const UI_TEXT = {
  en: {
    title: "EASA Simulated Pre-Test",
    description: "EASA-compliant examination simulator. Select your subject and test your knowledge with questions tailored to PPL and ATPL standards.",
    configTitle: "Exam Configuration",
    subjectLabel: "Subject Area",
    questionsLabel: "Number of Questions",
    languageLabel: "Internationalization",
    startBtn: "Start Examination",
    rulesTitle: "Standard Rules",
    rule1: "Pass mark is 75%",
    rule2: "No negative marking",
    rule3: "Review flagged questions before submitting",
    rule4: "Precise explanations provided upon completion",
    disclaimerTitle: "Disclaimer",
    disclaimerText: "This application is for training purposes only. Questions are based on certification by taking the EASA test in Zurich and may not reflect the exact phrasing of official question banks (ECQB). Always consult official study materials.",
    historyTitle: "Pilot Logbook",
    devBtn: "Developer & System Info"
  },
  de: {
    title: "EASA Simulierte Vorprüfung",
    description: "EASA-konformer Prüfungssimulator. Wählen Sie Ihr Fach und testen Sie Ihr Wissen mit Fragen nach PPL- und ATPL-Standards.",
    configTitle: "Prüfungskonfiguration",
    subjectLabel: "Fachgebiet",
    questionsLabel: "Anzahl der Fragen",
    languageLabel: "Internationalisierung",
    startBtn: "Prüfung starten",
    rulesTitle: "Standardregeln",
    rule1: "Bestehensgrenze liegt bei 75%",
    rule2: "Keine Minuspunkte",
    rule3: "Markierte Fragen vor Abgabe überprüfen",
    rule4: "Präzise Erklärungen nach Abschluss",
    disclaimerTitle: "Haftungsausschluss",
    disclaimerText: "Diese Anwendung dient nur zu Übungszwecken. Die Fragen basieren auf einer EASA-Prüfung in Zürich und spiegeln möglicherweise nicht den Wortlaut der offiziellen Fragendatenbank (ECQB) wider. Nutzen Sie offizielle Lernmaterialien.",
    historyTitle: "Pilotenlogbuch",
    devBtn: "Entwickler & Systeminfo"
  },
  fr: {
    title: "Pré-test simulé EASA",
    description: "Simulateur d'examen conforme à l'EASA. Sélectionnez votre sujet et testez vos connaissances avec des questions adaptées aux normes PPL et ATPL.",
    configTitle: "Configuration de l'examen",
    subjectLabel: "Sujet",
    questionsLabel: "Nombre de questions",
    languageLabel: "Internationalisation",
    startBtn: "Commencer l'examen",
    rulesTitle: "Règles standard",
    rule1: "La note de passage est de 75%",
    rule2: "Pas de points négatifs",
    rule3: "Revoir les questions signalées avant de soumettre",
    rule4: "Explications précises fournies à la fin",
    disclaimerTitle: "Avertissement",
    disclaimerText: "Cette application est à des fins de formation. Les questions sont basées sur un test EASA à Zurich et peuvent ne pas refléter exactement la formulation officielle (ECQB). Consultez toujours les supports officiels.",
    historyTitle: "Carnet de vol",
    devBtn: "Info développeur & système"
  }
};

export const StartScreen: React.FC<StartScreenProps> = ({ 
  onStartExam, 
  onDeveloper,
  examHistory,
  currentTheme,
  initialLanguage = 'en'
}) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject>(Subject.AIR_LAW);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [language, setLanguage] = useState<Language>(initialLanguage);

  const subjects = Object.values(Subject);
  const isDark = currentTheme === 'blue';
  const text = UI_TEXT[language];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(language === 'de' ? 'de-DE' : language === 'fr' ? 'fr-FR' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="mb-8 flex justify-center">
          <svg width="140" height="140" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" className="shadow-2xl rounded-full">
            <circle cx="60" cy="60" r="60" fill="#003399" />
            <g transform="translate(60, 60)">
              {[...Array(12)].map((_, i) => (
                <g key={i} transform={`rotate(${i * 30}) translate(0, -42)`}>
                  <path 
                    d="M0 -3.5 L0.9 -1.1 L3.3 -1.1 L1.4 0.4 L2.1 2.8 L0 1.4 L-2.1 2.8 L-1.4 0.4 L-3.3 -1.1 L-0.9 -1.1 Z" 
                    fill="#FFCC00" 
                    transform="rotate(0) scale(2.2)" 
                  />
                </g>
              ))}
              <path 
                d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" 
                fill="white" 
                transform="rotate(45) scale(2.5) translate(-12, -12)"
              />
            </g>
          </svg>
        </div>

        <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>{text.title}</h1>
        <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-blue-100' : 'text-slate-600'}`}>
          {text.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className={`md:col-span-2 rounded-2xl shadow-sm border p-8 transition-colors ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h2 className={`text-xl font-semibold mb-6 flex items-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <BookOpen className={`w-5 h-5 mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            {text.configTitle}
          </h2>

          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-blue-200' : 'text-slate-700'}`}>{text.subjectLabel}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subjects.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(sub)}
                    className={`px-4 py-3 rounded-lg text-sm text-left transition-all ${
                      selectedSubject === sub
                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-2'
                        : isDark 
                          ? 'bg-slate-800 text-blue-100 hover:bg-slate-700' 
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-blue-200' : 'text-slate-700'}`}>{text.questionsLabel}</label>
              <div className="flex gap-2">
                {[5, 10, 20, 30].map((count) => (
                  <button
                    key={count}
                    onClick={() => setQuestionCount(count)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      questionCount === count
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : isDark 
                          ? 'border-slate-700 text-blue-200 hover:border-blue-500 hover:bg-slate-800' 
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={() => onStartExam({ subject: selectedSubject, questionCount, language })} 
                fullWidth 
                size="lg"
              >
                {text.startBtn}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-400" />
              {text.rulesTitle}
            </h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                {text.rule1}
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                {text.rule2}
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                {text.rule3}
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                {text.rule4}
              </li>
            </ul>
          </div>
          
          <div className={`border rounded-2xl p-6 ${isDark ? 'bg-yellow-900/20 border-yellow-900/50' : 'bg-yellow-50 border-yellow-200'}`}>
             <h3 className={`font-semibold text-sm mb-2 flex items-center ${isDark ? 'text-yellow-400' : 'text-yellow-800'}`}>
              <AlertCircle className="w-4 h-4 mr-2" />
              {text.disclaimerTitle}
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-yellow-200/70' : 'text-yellow-700'}`}>
              {text.disclaimerText}
            </p>
          </div>

          <div className={`rounded-2xl p-6 shadow-sm border text-center transition-all ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex flex-col items-center mb-5">
               <div className={`p-4 rounded-full mb-3 shadow-lg transform hover:scale-105 transition-transform bg-gradient-to-br from-blue-600 to-blue-400`}>
                  <Globe className="w-8 h-8 text-white" />
               </div>
               <h3 className={`font-bold text-xs tracking-widest uppercase ${isDark ? 'text-blue-400' : 'text-slate-500'}`}>
                 {text.languageLabel}
               </h3>
            </div>
            
            <div className="grid grid-cols-3 gap-2 px-1">
               <button
                  onClick={() => setLanguage('en')}
                  className={`py-4 rounded-xl border flex flex-col items-center justify-center transition-all ${
                     language === 'en' 
                     ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/30' 
                     : isDark 
                       ? 'border-slate-800 bg-slate-800 hover:border-slate-600' 
                       : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                  }`}
               >
                  <div className="w-9 h-6 mb-2 shadow-sm overflow-hidden rounded-sm border border-slate-200/20">
                    <svg viewBox="0 0 60 30" className="w-full h-full">
                       <rect width="60" height="30" fill="#012169"/>
                       <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                       <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="2"/>
                       <path d="M30,0 L30,30 M0,15 L60,15" stroke="#fff" strokeWidth="10"/>
                       <path d="M30,0 L30,30 M0,15 L60,15" stroke="#C8102E" strokeWidth="6"/>
                    </svg>
                  </div>
                  <span className={`text-[10px] font-bold tracking-tighter uppercase ${language === 'en' ? 'text-blue-700' : 'text-slate-500'}`}>EN</span>
               </button>
               
               <button
                  onClick={() => setLanguage('de')}
                  className={`py-4 rounded-xl border flex flex-col items-center justify-center transition-all ${
                     language === 'de' 
                     ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/30' 
                     : isDark 
                       ? 'border-slate-800 bg-slate-800 hover:border-slate-600' 
                       : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                  }`}
               >
                  <div className="w-9 h-6 mb-2 shadow-sm overflow-hidden rounded-sm border border-slate-200/20">
                    <svg viewBox="0 0 5 3" className="w-full h-full">
                       <rect width="5" height="3" y="0" x="0" fill="#000"/>
                       <rect width="5" height="2" y="1" x="0" fill="#DD0000"/>
                       <rect width="5" height="1" y="2" x="0" fill="#FFCC00"/>
                    </svg>
                  </div>
                  <span className={`text-[10px] font-bold tracking-tighter uppercase ${language === 'de' ? 'text-blue-700' : 'text-slate-500'}`}>DE</span>
               </button>

               <button
                  onClick={() => setLanguage('fr')}
                  className={`py-4 rounded-xl border flex flex-col items-center justify-center transition-all ${
                     language === 'fr' 
                     ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/30' 
                     : isDark 
                       ? 'border-slate-800 bg-slate-800 hover:border-slate-600' 
                       : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                  }`}
               >
                  <div className="w-9 h-6 mb-2 shadow-sm overflow-hidden rounded-sm border border-slate-200/20">
                    <svg viewBox="0 0 3 2" className="w-full h-full">
                       <rect width="3" height="2" fill="#ED2939"/>
                       <rect width="2" height="2" fill="#fff"/>
                       <rect width="1" height="2" fill="#002395"/>
                    </svg>
                  </div>
                  <span className={`text-[10px] font-bold tracking-tighter uppercase ${language === 'fr' ? 'text-blue-700' : 'text-slate-500'}`}>FR</span>
               </button>
            </div>
          </div>

          {examHistory.length > 0 && (
            <div className={`rounded-2xl p-6 shadow-sm border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
              <h3 className={`font-semibold text-sm mb-4 flex items-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <History className="w-4 h-4 mr-2 text-slate-500" />
                {text.historyTitle}
              </h3>
              <div className="space-y-3">
                {examHistory.slice(0, 3).map((item) => (
                  <div key={item.id} className={`flex justify-between items-center text-sm p-2 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <div className="flex-1 min-w-0 mr-3">
                       <div className={`font-medium truncate ${isDark ? 'text-blue-100' : 'text-slate-900'}`}>{item.subject}</div>
                       <div className="text-xs text-slate-500">{formatDate(item.date)}</div>
                    </div>
                    <div className={`flex items-center font-bold ${item.passed ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="mr-1">{item.score}%</span>
                      {item.passed ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 text-center">
         <Button 
           variant="ghost" 
           size="sm" 
           onClick={onDeveloper} 
           className={`${isDark ? 'text-blue-300 hover:text-white hover:bg-blue-900' : 'text-slate-400 hover:text-slate-600'}`}
         >
           <Code className="w-4 h-4 mr-2" />
           {text.devBtn}
         </Button>
      </div>
    </div>
  );
};