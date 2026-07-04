import React, { useState } from 'react';
import { DayPlan, Experience } from '../types';
import { Calendar, Clock, Map, Star, Camera, Users, ShieldAlert, Check, RefreshCw, Volume2, ExternalLink, Copy } from 'lucide-react';
import PlaceMapModal from './PlaceMapModal';

interface ItineraryViewProps {
  itinerary: DayPlan[];
  destination?: string;
}

export default function ItineraryView({ itinerary, destination = '' }: ItineraryViewProps) {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [swappedExperiences, setSwappedExperiences] = useState<Record<string, boolean>>({});
  const [storyAudioPlaying, setStoryAudioPlaying] = useState<Record<string, boolean>>({});
  const [showMapModal, setShowMapModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeMapPlace, setActiveMapPlace] = useState<string | null>(null);

  const activeDay = itinerary[selectedDayIdx];

  const toggleSwapExperience = (expId: string) => {
    setSwappedExperiences(prev => ({
      ...prev,
      [expId]: !prev[expId]
    }));
  };

  const speakStorytelling = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      if (storyAudioPlaying[id]) {
        window.speechSynthesis.cancel();
        setStoryAudioPlaying(prev => ({ ...prev, [id]: false }));
      } else {
        window.speechSynthesis.cancel(); // Stop anything else
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95; // Slightly slower, more emotional storytelling
        utterance.onend = () => {
          setStoryAudioPlaying(prev => ({ ...prev, [id]: false }));
        };
        setStoryAudioPlaying(prev => {
          const updated: Record<string, boolean> = {};
          updated[id] = true;
          return updated;
        });
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert("Text-to-speech is not supported in this browser environment.");
    }
  };

  const getGoogleMapsURL = () => {
    const allPlaces = itinerary.flatMap(day => day.experiences.map(exp => exp.name));
    if (allPlaces.length === 0) return '';
    
    const origin = encodeURIComponent(allPlaces[0]);
    const destination = encodeURIComponent(allPlaces[allPlaces.length - 1]);
    const waypointsList = allPlaces.slice(1, -1).slice(0, 8);
    const waypoints = waypointsList.length > 0 ? encodeURIComponent(waypointsList.join('|')) : '';
    
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ''}`;
  };

  const handleCopyLink = () => {
    const url = getGoogleMapsURL();
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="p-8 text-center bg-dark-bg border border-white/5 rounded text-text-subtle font-mono">
        No itinerary available yet. Craft your journey first!
      </div>
    );
  }

  return (
    <div className="space-y-6" id="itinerary-view">
      {/* Day Selector & Map Export row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        {/* Day Selector Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none max-w-full">
          {itinerary.map((day, idx) => (
            <button
              key={day.dayNumber}
              id={`tab-day-${day.dayNumber}`}
              onClick={() => setSelectedDayIdx(idx)}
              className={`px-4 py-2.5 rounded font-mono text-xs transition-all whitespace-nowrap border cursor-pointer ${
                selectedDayIdx === idx
                  ? 'bg-gold text-black font-semibold border-gold shadow-md shadow-gold/15'
                  : 'bg-dark-bg text-text-muted border-white/5 hover:border-gold/30'
              }`}
            >
              Day {day.dayNumber}
            </button>
          ))}
        </div>

        {/* Map Export Button */}
        <button
          type="button"
          id="btn-export-maps"
          onClick={() => setShowMapModal(true)}
          className="px-4 py-2 bg-dark-panel border border-gold/20 text-gold hover:border-gold rounded text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-gold/5"
        >
          <Map className="h-3.5 w-3.5" />
          Export Journey to Map
        </button>
      </div>

      {/* Map Export Modal Popup */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" id="map-export-modal">
          <div className="bg-[#0F0F11] border border-white/15 rounded-xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button
              type="button"
              className="absolute right-4 top-4 text-text-subtle hover:text-white font-mono text-xs cursor-pointer p-1"
              onClick={() => setShowMapModal(false)}
            >
              ✕ Close
            </button>
            
            <div className="space-y-2">
              <h4 className="text-lg font-serif font-bold text-white italic flex items-center gap-2">
                <Map className="h-5 w-5 text-gold" />
                Google Maps Multi-Destination Route
              </h4>
              <p className="text-xs text-text-muted font-sans leading-relaxed">
                We've compiled your sequential travel itinerary into a direct Google Maps routing path, allowing you to seamlessly navigate every single custom-planned experience.
              </p>
            </div>

            <div className="bg-dark-bg border border-white/5 rounded-lg p-4 space-y-3.5">
              <span className="text-[10px] font-mono uppercase font-bold text-gold tracking-widest block">Ordered Stops Sequence</span>
              <div className="max-h-32 overflow-y-auto space-y-1.5 scrollbar-thin pr-1">
                {itinerary.flatMap(d => d.experiences).map((exp, idx) => (
                  <div key={idx} className="flex gap-2.5 items-center text-[11px] text-text-warm font-sans">
                    <span className="text-gold font-mono w-4 font-bold text-[10px]">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="truncate">{exp.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase font-mono tracking-wider text-text-subtle">Exportable Mapping Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={getGoogleMapsURL()}
                  className="flex-1 px-3 py-2 bg-dark-bg border border-white/10 rounded text-[10px] font-mono text-text-muted select-all focus:outline-none focus:border-gold"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 bg-gold hover:bg-[#D5B388] text-black rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href={getGoogleMapsURL()}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 bg-gold hover:bg-[#D5B388] text-black font-semibold font-mono rounded text-xs text-center flex items-center justify-center gap-2 transition-all shadow-lg shadow-gold/10"
              >
                <ExternalLink className="h-4 w-4" />
                Open on Google Maps
              </a>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="px-5 py-3 bg-dark-panel hover:bg-white/5 border border-white/10 text-text-warm text-xs font-mono rounded transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Day Header/Theme card */}
      <div className="p-5 bg-dark-sidebar border border-white/5 rounded-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 h-24 w-24 bg-gold/5 rounded-full blur-2xl" />
        <div className="flex items-center gap-2 text-[10px] font-mono text-gold uppercase tracking-widest font-bold">
          <Calendar className="h-3.5 w-3.5" />
          Day Theme & Cultural Concept
        </div>
        <h3 className="text-lg font-serif font-bold text-white mt-2 leading-tight italic">
          {activeDay.theme}
        </h3>
      </div>

      {/* Experiences Sequence/Timeline */}
      <div className="space-y-6 relative pl-3.5 border-l border-white/5 ml-2.5">
        {activeDay.experiences.map((exp, expIdx) => {
          const expKey = `${selectedDayIdx}-${expIdx}`;
          const isSwapped = swappedExperiences[expKey];
          const isAudioActive = storyAudioPlaying[expKey];

          return (
            <div key={expIdx} className="relative group animate-fade-in" id={`experience-card-${expIdx}`}>
              {/* Timeline marker node */}
              <div className="absolute -left-[22px] top-1 h-3.5 w-3.5 rounded-full bg-[#0F0F11] border-2 border-gold shadow-sm shadow-gold/20" />

              {/* Card Container */}
              <div className="bg-dark-panel border border-white/5 hover:border-white/10 transition-all rounded-lg p-5 space-y-4 shadow-md">
                
                {/* Header Row */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    {/* Alternate mode banner */}
                    {isSwapped && (
                      <span className="inline-block px-1.5 py-0.5 text-[9px] font-mono font-semibold bg-gold/10 text-gold rounded mb-1.5 border border-gold/20">
                        🔄 Swapped: Smart Substitution
                      </span>
                    )}

                    <h4 className="text-md font-serif font-bold text-white group-hover:text-gold transition-colors italic leading-snug">
                      {isSwapped ? exp.alternative.name : exp.name}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <button
                        type="button"
                        id={`btn-map-exp-${expKey}`}
                        onClick={() => setActiveMapPlace(isSwapped ? exp.alternative.name : exp.name)}
                        className="inline-flex items-center gap-1 text-[10px] text-gold hover:text-white bg-gold/10 hover:bg-gold/20 px-2 py-0.5 rounded border border-gold/20 transition-all font-mono font-semibold cursor-pointer"
                      >
                        <Map className="h-3 w-3" />
                        <span>Interactive Map</span>
                      </button>
                    </div>

                    <p className="text-xs text-text-muted mt-1.5 italic leading-relaxed font-sans">
                      {isSwapped ? exp.alternative.why : exp.whyItMatters}
                    </p>
                  </div>

                  {/* Interactive Swap Control */}
                  <button
                    type="button"
                    id={`btn-swap-${expKey}`}
                    onClick={() => toggleSwapExperience(expKey)}
                    className={`p-2 rounded text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isSwapped
                        ? 'bg-dark-bg text-gold border-gold/40 hover:bg-gold/10'
                        : 'bg-dark-bg text-text-subtle border-white/10 hover:border-gold/50'
                    }`}
                    title={isSwapped ? "Restore Original Experience" : "Swap with Crowded/Weather Alternative"}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSwapped ? 'animate-spin-slow text-gold' : ''}`} />
                    <span className="hidden sm:inline">{isSwapped ? "Restore" : "Substitute"}</span>
                  </button>
                </div>

                {/* Info Pills Row */}
                <div className="flex flex-wrap gap-2 text-[10px] text-text-subtle font-mono">
                  {exp.timeSlot && (
                    <div className="flex items-center gap-1.5 bg-gold/15 text-gold font-bold px-2.5 py-1 rounded border border-gold/30">
                      <Clock className="h-3 w-3" />
                      <span>{exp.timeSlot}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 bg-dark-bg px-2.5 py-1 rounded border border-white/5">
                    <span>Duration: {exp.timeNeeded}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-dark-bg px-2.5 py-1 rounded border border-white/5">
                    <Star className="h-3 w-3 text-gold" />
                    <span>Best: {exp.bestTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-dark-bg px-2.5 py-1 rounded border border-white/5">
                    <span>Cost: {isSwapped ? exp.alternative.cost : exp.cost}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-dark-bg px-2.5 py-1 rounded border border-white/5">
                    <span>Pace: {exp.difficulty}</span>
                  </div>
                </div>

                {/* Cultural Quality Metrics - Step 4 */}
                {!isSwapped && (
                  <div className="grid grid-cols-3 gap-2 border-t border-b border-white/5 py-3 text-[10px] font-mono">
                    <div className="space-y-1">
                      <div className="text-text-subtle text-[9px] uppercase tracking-wider">AUTHENTICITY</div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-gold">{exp.authenticityScore}</span>
                        <span className="text-text-subtle">/10</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-text-subtle text-[9px] uppercase tracking-wider">CONGESTION</div>
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-bold ${exp.crowdScore > 7 ? 'text-red-400' : 'text-gold'}`}>
                          {exp.crowdScore}
                        </span>
                        <span className="text-text-subtle">/10</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-text-subtle text-[9px] uppercase tracking-wider">PHOTO VIBES</div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-gold">{exp.photographyScore}</span>
                        <span className="text-text-subtle">/10</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Storytelling Mode - Step 6 */}
                {!isSwapped && (
                  <div className="bg-gold/5 border border-gold/15 rounded p-4 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-2.5">
                      <div className="text-[10px] uppercase font-mono tracking-widest text-gold font-bold flex items-center gap-1.5">
                        <Volume2 className="h-3.5 w-3.5 animate-pulse text-gold" />
                        Live Storytelling Narration
                      </div>
                      
                      {/* Audio voice synthesis */}
                      <button
                        type="button"
                        id={`btn-narration-${expKey}`}
                        onClick={() => speakStorytelling(exp.storytelling, expKey)}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-all cursor-pointer ${
                          isAudioActive
                            ? 'bg-gold text-black border-gold font-bold'
                            : 'bg-dark-bg text-text-subtle border-white/10 hover:text-gold hover:border-gold'
                        }`}
                      >
                        {isAudioActive ? '■ Stop Audio' : '▶ Speak Story'}
                      </button>
                    </div>

                    <p className="text-xs text-text-warm leading-relaxed font-serif italic relative z-10">
                      "{exp.storytelling}"
                    </p>
                  </div>
                )}

                {/* Tag Indicators */}
                <div className="flex items-center gap-3 text-[10px] text-text-subtle font-mono">
                  {exp.familyFriendly ? (
                    <span className="text-green-400">✓ Family Friendly</span>
                  ) : (
                    <span>Adult-oriented pace</span>
                  )}
                  <span>•</span>
                  <span>Access: {exp.accessibility}</span>
                </div>

              </div>
            </div>
          );
        })}
      </div>
      {activeMapPlace && (
        <PlaceMapModal
          isOpen={!!activeMapPlace}
          onClose={() => setActiveMapPlace(null)}
          placeName={activeMapPlace}
          destination={destination}
        />
      )}
    </div>
  );
}
