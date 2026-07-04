import React, { useState } from 'react';
import { MapPin, ExternalLink, Copy, Check, X } from 'lucide-react';

interface PlaceMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeName: string;
  destination: string;
}

export default function PlaceMapModal({ isOpen, onClose, placeName, destination }: PlaceMapModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const searchQuery = `${placeName}, ${destination}`;
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const externalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;

  const handleCopyName = () => {
    navigator.clipboard.writeText(placeName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
      id="place-map-modal"
      onClick={onClose}
    >
      <div 
        className="bg-[#0F0F11] border border-white/15 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col h-[520px]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-dark-panel">
          <div className="flex items-center gap-2">
            <MapPin className="h-4.5 w-4.5 text-gold" />
            <div>
              <h3 className="text-sm font-serif font-bold text-white italic truncate pr-2" title={placeName}>
                {placeName}
              </h3>
              <p className="text-[10px] text-text-subtle font-mono">Location search in {destination}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-text-subtle hover:text-white transition-colors cursor-pointer p-1 rounded hover:bg-white/5"
            aria-label="Close Map"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Live Interactive Map Frame */}
        <div className="flex-1 bg-dark-bg relative">
          <iframe
            title={`Map for ${placeName}`}
            src={embedUrl}
            className="w-full h-full border-0"
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-dark-panel border-t border-white/5 space-y-3 font-sans">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="text-[10px] text-text-muted leading-tight">
              <span className="text-gold font-bold font-mono block mb-0.5">MAP RESOLUTION TIP</span>
              If this exact heritage landmark isn't directly indexed, search Google Maps for nearby local coordinates.
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
              <button
                type="button"
                onClick={handleCopyName}
                className="px-3 py-2 bg-dark-bg hover:bg-white/5 border border-white/10 text-white rounded text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5 text-gold" />}
                {copied ? 'Copied name' : 'Copy Place Name'}
              </button>

              <a
                href={externalUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-gold hover:bg-[#D5B388] text-black rounded text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-gold/5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open on Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
