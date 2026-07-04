import React, { useState } from 'react';
import { LocalEtiquette } from '../types';
import { Check, X, Shield, Sparkles, MessageCircle, AlertTriangle, BookOpen } from 'lucide-react';

interface EtiquetteCardProps {
  etiquette: LocalEtiquette;
  onGreetingPracticed?: (phrase: string) => void;
}

export default function EtiquetteCard({ etiquette, onGreetingPracticed }: EtiquetteCardProps) {
  const [practicedPhrases, setPracticedPhrases] = useState<Record<string, boolean>>({});

  const {
    dos = [],
    donts = [],
    dressCode = '',
    greetings = [],
    tippingCulture = '',
    scamAwareness = ''
  } = etiquette;

  const handlePracticeGreeting = (native: string) => {
    setPracticedPhrases(prev => ({
      ...prev,
      [native]: !prev[native]
    }));
    if (onGreetingPracticed) {
      onGreetingPracticed(native);
    }
  };

  return (
    <div className="space-y-6" id="etiquette-view">
      
      {/* Do's and Don'ts Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Do's card */}
        <div className="bg-zinc-950/80 border border-green-950/45 rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-mono font-bold tracking-wider text-green-400 uppercase flex items-center gap-1.5">
            <Check className="h-4 w-4 bg-green-950 text-green-400 rounded-full p-0.5 stroke-[3]" />
            Sacred Customs: Things to Do
          </h4>
          <ul className="space-y-2.5 text-xs text-zinc-300 leading-relaxed font-sans">
            {dos.map((item, idx) => {
              const itemText = typeof item === 'string'
                ? item
                : (item && typeof item === 'object' && 'do' in item)
                  ? (item as any).do
                  : (item && typeof item === 'object' && 'text' in item)
                    ? (item as any).text
                    : JSON.stringify(item);
              return (
                <li key={idx} className="flex gap-2.5 items-start">
                  <span className="text-green-500 font-mono mt-0.5">•</span>
                  <span>{itemText}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Don'ts card */}
        <div className="bg-zinc-950/80 border border-red-950/45 rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-mono font-bold tracking-wider text-red-400 uppercase flex items-center gap-1.5">
            <X className="h-4 w-4 bg-red-950 text-red-400 rounded-full p-0.5 stroke-[3]" />
            Cultural Taboos: Things to Avoid
          </h4>
          <ul className="space-y-2.5 text-xs text-zinc-300 leading-relaxed font-sans">
            {donts.map((item, idx) => {
              const itemText = typeof item === 'string'
                ? item
                : (item && typeof item === 'object' && 'dont' in item)
                  ? (item as any).dont
                  : (item && typeof item === 'object' && 'text' in item)
                    ? (item as any).text
                    : JSON.stringify(item);
              return (
                <li key={idx} className="flex gap-2.5 items-start">
                  <span className="text-red-500 font-mono mt-0.5">•</span>
                  <span>{itemText}</span>
                </li>
              );
            })}
          </ul>
        </div>

      </div>

      {/* Dress Code, Tipping, and Scams Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Dress code */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
          <div className="text-[10px] font-mono font-bold text-amber-500 uppercase">👗 Proper Dress Code</div>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">{dressCode}</p>
        </div>

        {/* Tipping */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
          <div className="text-[10px] font-mono font-bold text-amber-500 uppercase">💴 Tipping Customs</div>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">{tippingCulture}</p>
        </div>

        {/* Scam awareness */}
        <div className="bg-zinc-900 border border-red-950/20 rounded-xl p-4 space-y-2 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-12 w-12 bg-red-500/5 rounded-full blur-xl" />
          <div className="text-[10px] font-mono font-bold text-red-400 uppercase flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-red-500" /> Scam Alert Warnings
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">{scamAwareness}</p>
        </div>

      </div>

      {/* Interactive Greetings Phrasebook */}
      {greetings && greetings.length > 0 && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4 text-amber-500" />
              Indigenous Greetings & Linguistics
            </h4>
            <span className="text-[10px] text-zinc-500 font-mono">Tap greetings to practice!</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {greetings.map((greet, idx) => {
              const isPracticed = practicedPhrases[greet.native];
              return (
                <button
                  key={idx}
                  type="button"
                  id={`greeting-practice-${idx}`}
                  onClick={() => handlePracticeGreeting(greet.native)}
                  className={`p-3.5 rounded-lg border text-left transition-all flex justify-between items-center ${
                    isPracticed
                      ? 'bg-amber-950/15 border-amber-500/50 shadow-sm shadow-amber-500/5'
                      : 'bg-zinc-900 border-zinc-850 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-base font-bold text-white font-sans">{greet.native}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">"{greet.transliteration}"</div>
                    <div className="text-xs text-zinc-500 font-sans mt-0.5">{greet.meaning}</div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    isPracticed
                      ? 'bg-amber-500 text-black border-amber-500 font-bold'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                  }`}>
                    {isPracticed ? '✓ Practiced' : 'Practice'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
