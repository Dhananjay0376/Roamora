import React, { useState } from 'react';
import { CulturalMission } from '../types';
import { Trophy, CheckCircle, Award, Sparkles, Zap, Lock } from 'lucide-react';

interface CultureMissionsProps {
  missions: CulturalMission[];
}

// Preset visual colors/styles for badge names to make them look incredibly game-like
const BADGE_STYLES: Record<string, { bg: string, text: string, border: string, icon: string }> = {
  'Sari Stylist': { bg: 'bg-indigo-950/40', text: 'text-indigo-400', border: 'border-indigo-500/30', icon: '👘' },
  'Spice Whisperer': { bg: 'bg-red-950/40', text: 'text-red-400', border: 'border-red-500/30', icon: '🌶️' },
  'Artisan Envoy': { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: '🏺' },
  'Tea Disciple': { bg: 'bg-green-950/40', text: 'text-green-400', border: 'border-green-500/30', icon: '🍵' },
  'Mezcal Master': { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-500/30', icon: '🥃' },
  'Plaza Explorer': { bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-500/30', icon: '🏛️' },
  'Myth Keeper': { bg: 'bg-purple-950/40', text: 'text-purple-400', border: 'border-purple-500/30', icon: '📜' },
  'Souk Voyager': { bg: 'bg-orange-950/40', text: 'text-orange-400', border: 'border-orange-500/30', icon: '🐫' },
  'Temple Pilgrim': { bg: 'bg-teal-950/40', text: 'text-teal-400', border: 'border-teal-500/30', icon: '⛩️' }
};

export default function CultureMissions({ missions }: CultureMissionsProps) {
  const [completedMissions, setCompletedMissions] = useState<Record<string, boolean>>({});
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);

  const toggleMission = (id: string) => {
    setCompletedMissions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering completion toggle if clicked on card text
    setExpandedMissionId(prev => prev === id ? null : id);
  };

  const completedCount = Object.values(completedMissions).filter(Boolean).length;
  const totalCount = missions.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6" id="cultural-missions-view">
      {/* Gamification summary card */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-24 w-24 bg-amber-500/5 rounded-full blur-2xl" />
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-400" />
              Active Cultural Guild Challenge
            </div>
            <h3 className="text-lg font-bold text-white font-sans">
              Gamified Local Explorations
            </h3>
            <p className="text-xs text-zinc-400 leading-normal max-w-md">
              Complete these custom offline challenges during your journey to unlock sacred knowledge, connect with native residents, and earn high-tier badges.
            </p>
          </div>

          <div className="text-center p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg min-w-[80px]">
            <div className="text-2xl font-black text-amber-400 font-mono">{completedCount}/{totalCount}</div>
            <div className="text-[9px] text-zinc-500 uppercase font-mono mt-0.5">Unlocked</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>EXPLORATION LEVEL PROGRESS</span>
            <span className="text-amber-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800/50">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid: Challenges vs Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column: Missions checklist */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">
            Active Exploration Missions
          </h4>

          <div className="space-y-2">
            {missions.map(mission => {
              const isDone = completedMissions[mission.id];
              const isExpanded = expandedMissionId === mission.id;
              return (
                <div
                  key={mission.id}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('.btn-checkbox-toggle')) return;
                    setExpandedMissionId(prev => prev === mission.id ? null : mission.id);
                  }}
                  className={`w-full rounded-xl border transition-all p-4 space-y-3 cursor-pointer select-none hover:border-gold/30 ${
                    isDone
                      ? 'bg-amber-950/10 border-amber-500/30 shadow-sm shadow-amber-500/5'
                      : 'bg-[#0F0F11] border-white/5 hover:bg-white/5'
                  }`}
                  id={`mission-card-${mission.id}`}
                >
                  {/* Card Header row */}
                  <div className="flex gap-3.5 items-start">
                    {/* Completion Toggle Button */}
                    <button
                      type="button"
                      id={`btn-mission-toggle-${mission.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMission(mission.id);
                      }}
                      className="mt-0.5 shrink-0 focus:outline-none cursor-pointer btn-checkbox-toggle"
                      title={isDone ? "Mark as Incomplete" : "Mark as Completed!"}
                    >
                      {isDone ? (
                        <CheckCircle className="h-5 w-5 text-amber-500 fill-amber-500/10" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-zinc-700 hover:border-amber-500/50 transition-colors" />
                      )}
                    </button>

                    {/* Content text */}
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-xs font-bold font-sans ${isDone ? 'text-amber-300 line-through opacity-70' : 'text-white'}`}>
                          {mission.title}
                        </span>
                        <span className="text-[10px] font-mono text-amber-400 font-semibold shrink-0 whitespace-nowrap">
                          {isExpanded ? 'Hide Details ▲' : 'Show Details ▼'}
                        </span>
                      </div>
                      <div className={`text-[11px] leading-relaxed ${isDone ? 'text-zinc-500 font-sans' : 'text-text-muted font-sans'}`}>
                        {mission.description}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detailing Drawer */}
                  {isExpanded && (
                    <div className="pl-8.5 pt-3.5 border-t border-white/5 space-y-3 animate-fade-in text-[11px]" id={`mission-detailing-${mission.id}`}>
                      {/* Accomplish Instructions */}
                      <div className="space-y-1">
                        <span className="text-gold font-mono font-bold uppercase tracking-wider text-[9px] block">
                          🎯 How to Accomplish
                        </span>
                        <p className="text-text-warm leading-relaxed">
                          {mission.howToAccomplish || "Talk with local traditional craft vendors or follow heritage pathways. Avoid tourist crowds, respect photography boundaries."}
                        </p>
                      </div>

                      {/* Cultural Context */}
                      <div className="space-y-1 bg-white/3 p-3 rounded-lg border border-white/5">
                        <span className="text-gold font-mono font-bold uppercase tracking-wider text-[9px] block">
                          📜 Cultural Heritage Significance
                        </span>
                        <p className="text-text-muted leading-relaxed italic">
                          {mission.culturalContext || "This challenge connects directly with heritage preservation. Handcrafted industries and traditional dialect maintenance help retain ancestral legacy."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Badge Shelf display */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-zinc-500" />
            Your Badge Shelf
          </h4>

          <div className="grid grid-cols-2 gap-2.5">
            {missions.map(mission => {
              const isDone = completedMissions[mission.id];
              // Determine preset colors, default to fallback
              const badgePreset = BADGE_STYLES[mission.badgeName] || {
                bg: 'bg-zinc-900',
                text: 'text-zinc-400',
                border: 'border-zinc-800',
                icon: '🏅'
              };

              return (
                <div
                  key={mission.id}
                  className={`p-3.5 rounded-xl border flex flex-col items-center text-center justify-center space-y-2 transition-all ${
                    isDone
                      ? `${badgePreset.bg} ${badgePreset.border} ring-1 ring-amber-500/20`
                      : 'bg-zinc-950/40 border-zinc-900/80 grayscale opacity-40'
                  }`}
                >
                  <div className="relative">
                    <div className="text-3xl filter drop-shadow">
                      {badgePreset.icon}
                    </div>
                    {isDone ? (
                      <span className="absolute -top-1 -right-1 bg-amber-500 text-black p-0.5 rounded-full text-[8px] font-bold">
                        ★
                      </span>
                    ) : (
                      <div className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center rounded-full">
                        <Lock className="h-3.5 w-3.5 text-zinc-500" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className={`text-[10px] font-mono font-bold tracking-wider uppercase ${isDone ? badgePreset.text : 'text-zinc-500'}`}>
                      {mission.badgeName}
                    </div>
                    <div className="text-[9px] text-zinc-500 leading-none">
                      {isDone ? 'UNLOCKED' : 'LOCKED'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
