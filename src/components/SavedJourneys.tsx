import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { JourneyResponse, TravelParams } from '../types';
import { Calendar, Trash2, ExternalLink, Bookmark, AlertCircle, Sparkles, X, Compass } from 'lucide-react';

interface SavedJourneyDoc {
  id: string;
  userId: string;
  createdAt: string;
  destination: string;
  params: TravelParams;
  journey: JourneyResponse;
}

interface SavedJourneysProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectJourney: (journey: JourneyResponse, params: TravelParams) => void;
}

export default function SavedJourneys({ user, isOpen, onClose, onSelectJourney }: SavedJourneysProps) {
  const [journeys, setJourneys] = useState<SavedJourneyDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isOpen) {
      setJourneys([]);
      return;
    }

    setLoading(true);
    setError(null);

    // Setup real-time listener for the user's journeys
    const journeysPath = `users/${user.uid}/journeys`;
    const journeysRef = collection(db, 'users', user.uid, 'journeys');
    const q = query(journeysRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: SavedJourneyDoc[] = [];
        snapshot.forEach((docSnap) => {
          list.push({
            id: docSnap.id,
            ...docSnap.data()
          } as SavedJourneyDoc);
        });
        // Sort client-side by createdAt descending to avoid index requirements
        list.sort((a, b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });
        setJourneys(list);
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to saved journeys:", err);
        setError("Could not load your saved travel plans.");
        setLoading(false);
        handleFirestoreError(err, OperationType.GET, journeysPath);
      }
    );

    return () => unsubscribe();
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (e: React.MouseEvent, journeyId: string) => {
    e.stopPropagation();
    if (!user) return;
    if (!window.confirm("Are you sure you want to permanently delete this itinerary?")) return;

    const docPath = `users/${user.uid}/journeys/${journeyId}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'journeys', journeyId));
    } catch (err) {
      console.error("Error deleting journey:", err);
      alert("Failed to delete the journey. Please try again.");
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
  };

  const handleSelect = (saved: SavedJourneyDoc) => {
    onSelectJourney(saved.journey, saved.params);
    onClose();
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Unknown Date';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/85 backdrop-blur-sm animate-fade-in" id="saved-journeys-overlay">
      <div 
        className="w-full max-w-lg h-full bg-[#0F0F11] border-l border-white/10 p-6 md:p-8 flex flex-col relative overflow-hidden shadow-2xl"
        id="saved-journeys-panel"
      >
        {/* Glow ambient background */}
        <div className="absolute right-0 top-0 h-40 w-40 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/5 mb-6">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-gold animate-pulse" />
            <h2 className="text-lg font-serif font-bold text-white tracking-tight italic">My Saved Expeditions</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-text-subtle hover:text-white transition-colors cursor-pointer p-1"
            title="Close Drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-text-subtle">Unlocking saved chronicles...</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-lg flex gap-2 text-xs text-red-300 items-start mb-4">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && journeys.length === 0 && (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="p-4 bg-white/5 rounded-full text-text-muted">
              <Compass className="h-10 w-10 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-serif font-bold text-white italic">No Curated Legends Yet</h3>
              <p className="text-xs text-text-subtle max-w-xs leading-relaxed">
                Start curating high-authenticity cultural journeys and save them to build your personal atlas of conscious exploration.
              </p>
            </div>
          </div>
        )}

        {/* Scrollable list of plans */}
        {!loading && !error && journeys.length > 0 && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            {journeys.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className="group relative bg-[#131317] border border-white/5 hover:border-gold/30 rounded-xl p-4 transition-all cursor-pointer select-none space-y-3 hover:bg-[#16161B]"
              >
                {/* Visual badge highlight */}
                <div className="absolute right-3 top-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-mono font-bold text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20 flex items-center gap-1">
                    <ExternalLink className="h-2.5 w-2.5" /> LOAD ITINERARY
                  </span>
                </div>

                {/* Destination & Meta */}
                <div className="space-y-1">
                  <h3 className="text-sm font-serif font-bold text-white group-hover:text-gold transition-colors italic">
                    {item.destination}
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono text-text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-gold" /> {formatDate(item.createdAt)}
                    </span>
                    <span>•</span>
                    <span>{item.params.duration} Days</span>
                    <span>•</span>
                    <span className="capitalize">{item.params.budget} Budget</span>
                  </div>
                </div>

                {/* Travel styles tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.params.travelStyle?.slice(0, 3).map((style, idx) => (
                    <span 
                      key={idx}
                      className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/5 text-text-subtle"
                    >
                      {style}
                    </span>
                  ))}
                  {item.params.travelStyle && item.params.travelStyle.length > 3 && (
                    <span className="text-[9px] font-mono text-text-muted font-bold self-center">
                      +{item.params.travelStyle.length - 3} more
                    </span>
                  )}
                </div>

                {/* Score & Delete Action row */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono">
                    <Sparkles className="h-3 w-3 text-gold" />
                    <span className="text-text-subtle">Heritage Score:</span>
                    <span className="text-gold font-bold">{item.journey.aiTravelScore?.score || 95}/100</span>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-950/10 rounded transition-all cursor-pointer"
                    title="Delete saved itinerary"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-white/5 text-center text-[10px] font-mono text-text-muted">
          Your atlas is preserved in real-time Cloud Firestore.
        </div>
      </div>
    </div>
  );
}
