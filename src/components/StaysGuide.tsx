import React, { useState } from 'react';
import { Accommodation } from '../types';
import { Hotel, CheckCircle, MapPin, DollarSign, Leaf, Map } from 'lucide-react';
import PlaceMapModal from './PlaceMapModal';
import { convertPriceString, LocalCurrency } from '../utils/currency';

interface StaysGuideProps {
  accommodations: Accommodation[];
  destination?: string;
  preferredCurrency?: string;
  localCurrency?: LocalCurrency;
}

export default function StaysGuide({
  accommodations,
  destination = '',
  preferredCurrency = 'INR',
  localCurrency
}: StaysGuideProps) {
  const [activeMapPlace, setActiveMapPlace] = useState<string | null>(null);

  if (!accommodations || accommodations.length === 0) {
    return (
      <div className="p-8 text-center bg-dark-bg border border-white/5 rounded text-text-subtle font-mono">
        No heritage stays or accommodations available for this selection.
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Heritage':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Boutique':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Eco-Lodge':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Homestay':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'Local Inn':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <div className="space-y-6" id="stays-guide">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accommodations.map((stay, idx) => (
          <div key={idx} className="bg-dark-panel border border-white/5 hover:border-white/10 transition-all rounded-lg p-5 flex flex-col justify-between space-y-4 shadow-md h-full" id={`stay-card-${idx}`}>
            <div className="space-y-3">
              {/* Type Badge & Title */}
              <div className="flex justify-between items-start gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getTypeColor(stay.type)}`}>
                  {stay.type}
                </span>
                <span className="text-text-subtle font-mono text-[10px] bg-dark-bg px-2 py-0.5 rounded border border-white/5 flex items-center gap-1" title="Estimated heritage stay pricing">
                  <DollarSign className="h-3 w-3 text-gold shrink-0" />
                  <span>{convertPriceString(stay.priceRange, preferredCurrency, localCurrency)}</span>
                </span>
              </div>

              <h4 className="text-md font-serif font-bold text-white italic tracking-tight">{stay.name}</h4>
              
              <p className="text-xs text-text-muted leading-relaxed font-sans">{stay.description}</p>

              {/* Location */}
              <div className="flex items-center justify-between gap-2 text-[11px] text-text-warm font-sans bg-dark-bg/45 p-2 rounded border border-white/5">
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
                  <span className="truncate" title={stay.location}>{stay.location}</span>
                </div>
                <button
                  type="button"
                  id={`btn-map-stay-${idx}`}
                  onClick={() => setActiveMapPlace(stay.name)}
                  className="text-[9px] text-gold hover:text-white bg-gold/10 border border-gold/20 px-1.5 py-0.5 rounded transition-all cursor-pointer shrink-0 font-mono font-bold"
                >
                  Map
                </button>
              </div>

              {/* Philosophy Connection */}
              <div className="bg-gold/5 border border-gold/10 rounded p-3 text-[11px] leading-relaxed">
                <span className="text-gold font-mono uppercase font-bold text-[9px] tracking-wider block mb-1">Cultural Connection</span>
                <p className="text-text-warm italic font-serif">"{stay.whyItFitsPhilosophy}"</p>
              </div>
            </div>

            {/* Eco Features */}
            {stay.sustainableFeatures && stay.sustainableFeatures.length > 0 && (
              <div className="space-y-1.5 pt-3 border-t border-white/5">
                <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold tracking-widest flex items-center gap-1">
                  <Leaf className="h-3 w-3" /> Eco & Local Credentials
                </span>
                <div className="flex flex-wrap gap-1">
                  {stay.sustainableFeatures.map((feat, fidx) => (
                    <span key={fidx} className="px-1.5 py-0.5 rounded bg-emerald-500/5 text-emerald-300 border border-emerald-500/10 text-[9px] font-mono">
                      • {feat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
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
