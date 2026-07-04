import React, { useState } from 'react';
import { TravelParams } from '../types';
import { MapPin, Calendar, Users, DollarSign, Sparkles, AlertCircle, ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';

interface TravelFormProps {
  onSubmit: (params: TravelParams) => void;
  isLoading: boolean;
}

const DESTINATION_PRESETS = [
  { name: 'Kyoto, Japan', description: 'Ancient Shrines & Tea Ceremonies' },
  { name: 'Oaxaca, Mexico', description: 'Culinary Heritage & Artisan Crafts' },
  { name: 'Jaipur, India', description: 'Royal Palaces & Desert Storytelling' },
  { name: 'Cairo, Egypt', description: 'Pharaonic Myths & Traditional Souks' }
];

const TRAVEL_STYLES = [
  { id: 'Heritage', label: '🏛️ Heritage' },
  { id: 'Foodie', label: '🍜 Foodie' },
  { id: 'Photography', label: '📸 Photography' },
  { id: 'Spiritual', label: '✨ Spiritual' },
  { id: 'Adventure', label: '🏔️ Adventure' },
  { id: 'Backpacking', label: '🎒 Backpacking' },
  { id: 'Luxury', label: '💎 Luxury' },
  { id: 'Family', label: '👨‍👩‍👧‍👦 Family' },
  { id: 'Solo', label: '🚶 Solo' },
  { id: 'Couple', label: '❤️ Couple' },
  { id: 'Wildlife', label: '🐆 Wildlife' },
  { id: 'Shopping', label: '🛍️ Shopping' }
];

const DEFAULT_INTERESTS = [
  'Deep Local History & Storytelling',
  'Traditional Crafts & Artisan Workshops',
  'Authentic Food Crawls & Hidden Markets',
  'Folklore, Myths & Sacred Ceremonies',
  'Off-the-beaten-track Villages'
];

export default function TravelForm({ onSubmit, isLoading }: TravelFormProps) {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [ageGroup, setAgeGroup] = useState('Adults (25-50)');
  const [budget, setBudget] = useState<'budget' | 'moderate' | 'luxury'>('moderate');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['Heritage', 'Foodie']);
  const [physicalLimitations, setPhysicalLimitations] = useState('');
  const [languagesKnown, setLanguagesKnown] = useState('English');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [accessibilityRequirements, setAccessibilityRequirements] = useState('');
  const [transportationPreference, setTransportationPreference] = useState('Public Transit & Walking');
  const [preferredCurrency, setPreferredCurrency] = useState('INR');
  
  // Custom interests list with rank up/down controls
  const [interests, setInterests] = useState<string[]>(DEFAULT_INTERESTS);
  const [newInterest, setNewInterest] = useState('');

  const handleToggleStyle = (styleId: string) => {
    setSelectedStyles(prev =>
      prev.includes(styleId) ? prev.filter(s => s !== styleId) : [...prev, styleId]
    );
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const handleMoveInterest = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === interests.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...interests];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setInterests(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    onSubmit({
      destination: destination.trim(),
      duration,
      travelers,
      ageGroup,
      budget,
      travelStyle: selectedStyles,
      physicalLimitations,
      languagesKnown,
      dietaryRestrictions,
      accessibilityRequirements,
      transportationPreference,
      interests,
      preferredCurrency
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-text-warm" id="travel-planner-form">
      {/* Destination presets */}
      <div className="space-y-2">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-gold font-mono">
          Or Select an Inspiring Cultural Preset
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {DESTINATION_PRESETS.map(preset => (
            <button
              key={preset.name}
              type="button"
              id={`preset-${preset.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={() => setDestination(preset.name)}
              className={`p-3 rounded text-left transition-all border cursor-pointer ${
                destination === preset.name
                  ? 'bg-gold/10 border-gold shadow-md shadow-gold/10'
                  : 'bg-dark-bg/60 border-white/5 hover:border-gold/30'
              }`}
            >
              <div className="font-semibold text-xs text-white">{preset.name}</div>
              <div className="text-[10px] text-text-subtle mt-0.5 line-clamp-1">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Destination Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-widest text-text-warm font-mono">
          Where do you wish to journey?
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-text-subtle" />
          <input
            type="text"
            id="input-destination"
            value={destination}
            onChange={e => setDestination(e.target.value)}
            placeholder="e.g. Oaxaca, Mexico or Tokyo, Japan"
            className="w-full pl-9 pr-4 py-3 bg-dark-bg border border-white/10 rounded text-sm text-white placeholder-text-subtle focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-sans"
            required
          />
        </div>
      </div>

      {/* Basic Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-widest text-text-warm font-mono">
            Trip Duration
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-text-subtle" />
            <input
              type="number"
              id="input-duration"
              min={1}
              max={14}
              value={duration}
              onChange={e => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full pl-9 pr-4 py-3 bg-dark-bg border border-white/10 rounded text-sm text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            />
            <span className="absolute right-3 top-3 text-xs text-text-subtle font-mono">days</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-widest text-text-warm font-mono">
            Travelers
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-3.5 h-4 w-4 text-text-subtle" />
            <input
              type="number"
              id="input-travelers"
              min={1}
              value={travelers}
              onChange={e => setTravelers(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full pl-9 pr-4 py-3 bg-dark-bg border border-white/10 rounded text-sm text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            />
            <span className="absolute right-3 top-3 text-xs text-text-subtle font-mono font-sans">pax</span>
          </div>
        </div>
      </div>

      {/* Age Group and Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-widest text-text-warm font-mono">
            Traveler Age Group
          </label>
          <select
            id="select-age-group"
            value={ageGroup}
            onChange={e => setAgeGroup(e.target.value)}
            className="w-full px-3 py-3 bg-dark-bg border border-white/10 rounded text-sm text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold cursor-pointer"
          >
            <option className="bg-[#0F0F11]">Solo Young Adult (18-25)</option>
            <option className="bg-[#0F0F11]">Adults (25-50)</option>
            <option className="bg-[#0F0F11]">Family with Kids (1-12)</option>
            <option className="bg-[#0F0F11]">Family with Teens (13-18)</option>
            <option className="bg-[#0F0F11]">Active Seniors (50-70)</option>
            <option className="bg-[#0F0F11]">Seniors requiring slow pace (70+)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-widest text-text-warm font-mono">
            Budget Standard
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['budget', 'moderate', 'luxury'] as const).map(tier => (
              <button
                key={tier}
                type="button"
                id={`budget-tier-${tier}`}
                onClick={() => setBudget(tier)}
                className={`py-2 text-xs font-mono rounded border capitalize font-medium cursor-pointer transition-all ${
                  budget === tier
                    ? 'bg-gold/15 text-gold border-gold'
                    : 'bg-dark-bg/60 text-text-subtle border-white/5 hover:border-gold/30'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preferred Currency Section */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-widest text-text-warm font-mono">
          Preferred Display Currency
        </label>
        <select
          id="select-preferred-currency"
          value={preferredCurrency}
          onChange={e => setPreferredCurrency(e.target.value)}
          className="w-full px-3 py-3 bg-dark-bg border border-white/10 rounded text-sm text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold cursor-pointer font-mono text-xs"
        >
          <option className="bg-[#0F0F11]" value="INR">Indian Rupee (INR - ₹)</option>
          <option className="bg-[#0F0F11]" value="USD">US Dollar (USD - $)</option>
          <option className="bg-[#0F0F11]" value="EUR">Euro (EUR - €)</option>
          <option className="bg-[#0F0F11]" value="GBP">British Pound (GBP - £)</option>
          <option className="bg-[#0F0F11]" value="JPY">Japanese Yen (JPY - ¥)</option>
          <option className="bg-[#0F0F11]" value="CAD">Canadian Dollar (CAD - C$)</option>
          <option className="bg-[#0F0F11]" value="AUD">Australian Dollar (AUD - A$)</option>
          <option className="bg-[#0F0F11]" value="MXN">Mexican Peso (MXN - Mex$)</option>
          <option className="bg-[#0F0F11]" value="EGP">Egyptian Pound (EGP - EGP)</option>
          <option className="bg-[#0F0F11]" value="CNY">Chinese Yuan (CNY - ¥)</option>
          <option className="bg-[#0F0F11]" value="AED">UAE Dirham (AED - AED)</option>
          <option className="bg-[#0F0F11]" value="THB">Thai Baht (THB - ฿)</option>
        </select>
        <p className="text-[10px] text-text-subtle">
          The whole journey, including stays, transport, meals, and emergencies will calculate pricing conversions in your preferred currency.
        </p>
      </div>

      {/* Travel style choices */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-widest text-text-warm font-mono">
          Travel Style / Philosophy
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TRAVEL_STYLES.map(style => (
            <button
              key={style.id}
              type="button"
              id={`style-${style.id}`}
              onClick={() => handleToggleStyle(style.id)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer ${
                selectedStyles.includes(style.id)
                  ? 'bg-gold text-black font-semibold border-gold shadow-md shadow-gold/15'
                  : 'bg-dark-bg/60 text-text-subtle border-white/5 hover:border-gold/30'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interests Ordering / Ranking Section */}
      <div className="space-y-2 border-t border-white/5 pt-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold uppercase tracking-widest text-text-warm font-mono">
            Ranked Interests (Highest to Lowest)
          </label>
          <span className="text-[9px] text-gold font-mono tracking-wider">ORDER MATTERS</span>
        </div>
        <p className="text-[11px] text-text-subtle">
          Rank priority of experiences. Use arrows to re-order based on your ultimate cultural focus.
        </p>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {interests.map((interest, idx) => (
            <div
              key={interest}
              className="flex items-center justify-between bg-dark-bg/60 border border-white/5 rounded p-2.5 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[9px] bg-gold/15 px-2 py-0.5 rounded text-gold font-bold">
                  #{idx + 1}
                </span>
                <span className="text-white line-clamp-1">{interest}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  id={`interest-up-${idx}`}
                  disabled={idx === 0}
                  onClick={() => handleMoveInterest(idx, 'up')}
                  className="p-1 text-text-subtle hover:text-gold disabled:opacity-20 cursor-pointer"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  id={`interest-down-${idx}`}
                  disabled={idx === interests.length - 1}
                  onClick={() => handleMoveInterest(idx, 'down')}
                  className="p-1 text-text-subtle hover:text-gold disabled:opacity-20 cursor-pointer"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  id={`interest-remove-${idx}`}
                  onClick={() => handleRemoveInterest(idx)}
                  className="p-1 text-text-subtle hover:text-red-400 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-1.5">
          <input
            type="text"
            id="input-new-interest"
            value={newInterest}
            onChange={e => setNewInterest(e.target.value)}
            placeholder="Add custom focus e.g. Textile weaving, Zen gardens"
            className="flex-1 px-3 py-2.5 bg-dark-bg border border-white/10 rounded text-xs text-white placeholder-text-subtle focus:outline-none focus:border-gold"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddInterest(); } }}
          />
          <button
            type="button"
            id="btn-add-interest"
            onClick={handleAddInterest}
            className="p-2.5 bg-dark-bg border border-white/10 rounded hover:border-gold text-gold cursor-pointer transition-all"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Advanced Customizations */}
      <div className="space-y-3 border-t border-white/5 pt-4">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-text-subtle font-mono">
          Cultural & Health Tailoring
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="text-[10px] text-text-muted uppercase tracking-wider font-mono">Dietary Profile / Restrictions</label>
            <input
              type="text"
              id="input-dietary"
              value={dietaryRestrictions}
              onChange={e => setDietaryRestrictions(e.target.value)}
              placeholder="e.g. Vegetarian, Halal, Gluten-Free"
              className="w-full px-3 py-2 bg-dark-bg border border-white/10 rounded text-xs text-white focus:outline-none focus:border-gold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-text-muted uppercase tracking-wider font-mono">Languages Known</label>
            <input
              type="text"
              id="input-languages"
              value={languagesKnown}
              onChange={e => setLanguagesKnown(e.target.value)}
              placeholder="e.g. English, basic Spanish"
              className="w-full px-3 py-2 bg-dark-bg border border-white/10 rounded text-xs text-white focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="text-[10px] text-text-muted uppercase tracking-wider font-mono">Physical Pace / Limitations</label>
            <input
              type="text"
              id="input-physical"
              value={physicalLimitations}
              onChange={e => setPhysicalLimitations(e.target.value)}
              placeholder="e.g. Knee problems, cannot walk over 2 miles"
              className="w-full px-3 py-2 bg-dark-bg border border-white/10 rounded text-xs text-white focus:outline-none focus:border-gold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-text-muted uppercase tracking-wider font-mono">Accessibility Requirements</label>
            <input
              type="text"
              id="input-accessibility"
              value={accessibilityRequirements}
              onChange={e => setAccessibilityRequirements(e.target.value)}
              placeholder="e.g. Wheelchair access, elevator access"
              className="w-full px-3 py-2 bg-dark-bg border border-white/10 rounded text-xs text-white focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-text-muted uppercase tracking-wider font-mono">Transit Choice</label>
          <input
            type="text"
            id="input-transit"
            value={transportationPreference}
            onChange={e => setTransportationPreference(e.target.value)}
            placeholder="e.g. Walking & Subway, Private driver, TukTuks"
            className="w-full px-3 py-2 bg-dark-bg border border-white/10 rounded text-xs text-white focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      <button
        type="submit"
        id="btn-generate-journey"
        disabled={isLoading || !destination.trim()}
        className="w-full py-3.5 bg-gold text-black font-semibold font-mono rounded text-xs hover:bg-[#D5B388] transition-all shadow-lg shadow-gold/15 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
      >
        <Sparkles className="h-4 w-4 animate-pulse" />
        {isLoading ? 'Consulting Cultural Archives...' : 'Craft Cultural Journey'}
      </button>
    </form>
  );
}
