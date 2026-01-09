import React from 'react';
import { Button } from './Button.tsx';
import { Code, ArrowLeft, Database, ShieldCheck, Palette } from 'lucide-react';
import { AppTheme } from '../types.ts';

interface DeveloperSectionProps {
  onBack: () => void;
  theme: AppTheme;
  onSetTheme: (theme: AppTheme) => void;
}

export const DeveloperSection: React.FC<DeveloperSectionProps> = ({ onBack, theme, onSetTheme }) => {
  const isDark = theme === 'blue';
  
  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className={`pl-0 hover:bg-transparent ${isDark ? 'text-blue-200 hover:text-white' : 'text-slate-600 hover:text-blue-600'}`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className={`p-8 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'}`}>
                <Code className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Developer Information</h1>
            </div>
            <p className={`leading-relaxed ${isDark ? 'text-blue-200' : 'text-slate-600'}`}>
              The EASA Simulated Pre-Test application demonstrates the integration of advanced Integrated systems in aviation training. 
              It allows pilots to practice with dynamic, on-demand content that mimics the rigor of official European Union Aviation Safety Agency examinations.
            </p>
          </div>

          <div className="p-8 grid gap-8">
            <section>
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center ${isDark ? 'text-blue-300' : 'text-slate-900'}`}>
                <Database className="w-4 h-4 mr-2 text-slate-500" />
                System Architecture
              </h3>
              <ul className={`space-y-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                <li className="flex gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${isDark ? 'bg-blue-500' : 'bg-blue-50'}`} />
                  <span>
                    <strong>Dynamic Content Generation:</strong> Unlike traditional static databases, this app generates unique questions for every session using the LLM, ensuring endless practice variations.
                  </span>
                </li>
                 <li className="flex gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${isDark ? 'bg-blue-500' : 'bg-blue-50'}`} />
                  <span>
                    <strong>Context Awareness:</strong> This program is prompted with specific EASA learning objectives (LOs) implied by the subject selection to ensure relevance.
                  </span>
                </li>
              </ul>
            </section>

             <section>
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center ${isDark ? 'text-blue-300' : 'text-slate-900'}`}>
                <Palette className="w-4 h-4 mr-2 text-slate-500" />
                Appearance
              </h3>
              <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <span className={`text-sm font-medium ${isDark ? 'text-blue-200' : 'text-slate-600'}`}>Interface Theme</span>
                <div className="flex space-x-2">
                   <button 
                     onClick={() => onSetTheme('slate')}
                     className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all flex items-center ${theme === 'slate' ? 'bg-white border-slate-300 shadow-sm text-slate-900 ring-1 ring-slate-200' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
                   >
                     <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-300 mr-2"></div>
                     Light
                   </button>
                   <button 
                     onClick={() => onSetTheme('blue')}
                     className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all flex items-center ${theme === 'blue' ? 'bg-blue-900 border-blue-900 shadow-sm text-white ring-1 ring-blue-700' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-700 hover:text-slate-300'}`}
                   >
                     <div className="w-3 h-3 rounded-full bg-blue-950 border border-blue-700 mr-2"></div>
                     Dark
                   </button>
                </div>
              </div>
            </section>
            
             <section>
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center ${isDark ? 'text-blue-300' : 'text-slate-900'}`}>
                <ShieldCheck className="w-4 h-4 mr-2 text-slate-500" />
                Compliance & Safety
              </h3>
               <p className={`text-sm leading-relaxed p-4 rounded-lg border ${isDark ? 'bg-yellow-900/20 border-yellow-900/50 text-yellow-200/70' : 'bg-yellow-50 border-yellow-100 text-yellow-800'}`}>
                 This tool is a "Simulated Pre-Test" and is intended for educational purposes only. While it aims to reflect the standard and style of EASA exams, it is not an official source. Pilots should always refer to the official ECQB (European Central Question Bank) and approved ATO materials for certification.
               </p>
            </section>
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-slate-400">
          Built by Wingmentor Team
        </div>
      </div>
    </div>
  );
};