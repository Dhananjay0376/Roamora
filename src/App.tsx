import React, { useState, useEffect } from 'react';
import TravelForm from './components/TravelForm';
import ItineraryView from './components/ItineraryView';
import FoodGuide from './components/FoodGuide';
import CultureMissions from './components/CultureMissions';
import BudgetPlanner from './components/BudgetPlanner';
import EtiquetteCard from './components/EtiquetteCard';
import StaysGuide from './components/StaysGuide';
import CurrencyConverter from './components/CurrencyConverter';
import PlaceMapModal from './components/PlaceMapModal';
import { JourneyResponse, TravelParams } from './types';
import { Compass, Sparkles, Map, Heart, Star, ShieldAlert, Award, ArrowLeft, RefreshCw, AlertCircle, Trees, Info, Bookmark, LogIn, LogOut, Save, User as UserIcon } from 'lucide-react';
import { generateItineraryPDF } from './utils/pdfGenerator';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import AuthModal from './components/AuthModal';
import SavedJourneys from './components/SavedJourneys';
import roamoraLogo from './assets/images/roamora_logo_1783152467098.jpg';

const LOADING_QUOTES = [
  "Unearthing ancient scrolls and archive maps...",
  "Consulting indigenous communities and local storytellers...",
  "Scouting hidden valleys and off-the-beaten-track taverns...",
  "Plotting solar paths for optimal golden-hour photography...",
  "Mapping traditional spice profiles and old recipes...",
  "Translating sacred temple etiquette and custom greetings..."
];

export default function App() {
  const [journey, setJourney] = useState<JourneyResponse | null>(null);
  const [travelParams, setTravelParams] = useState<TravelParams | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingQuoteIdx, setLoadingQuoteIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'food' | 'missions' | 'budget' | 'etiquette' | 'gems' | 'accommodations'>('itinerary');
  const [preferredCurrency, setPreferredCurrency] = useState<string>('INR');
  const [preferredDestination, setPreferredDestination] = useState<string>('');
  const [activeMapPlace, setActiveMapPlace] = useState<string | null>(null);

  // Authentication & Firestore state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSavedJourneysOpen, setIsSavedJourneysOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Monitor Auth Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // Cycle loading quotes when generating
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingQuoteIdx(prev => (prev + 1) % LOADING_QUOTES.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Save current journey to Firestore
  const handleSaveJourney = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!journey) return;

    // Build fallback params if missing
    const params: TravelParams = travelParams || {
      destination: preferredDestination || journey.destination || 'Uncharted Lands',
      duration: journey.itinerary?.length || 3,
      travelers: 1,
      ageGroup: 'All Ages',
      budget: 'moderate',
      travelStyle: ['Culture & Heritage'],
      physicalLimitations: 'None',
      languagesKnown: 'English',
      dietaryRestrictions: 'None',
      accessibilityRequirements: 'None',
      transportationPreference: 'Local Standard',
      interests: ['Heritage'],
      preferredCurrency: preferredCurrency
    };

    setIsSaving(true);
    setSaveSuccess(false);

    const newDocRef = doc(collection(db, 'users', user.uid, 'journeys'));
    try {
      const journeyId = newDocRef.id;

      const payload = {
        id: journeyId,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        destination: params.destination,
        params,
        journey: journey
      };

      await setDoc(newDocRef, payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save journey to database:", err);
      alert("Failed to save your journey. Please check database permissions or connection.");
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/journeys/${newDocRef.id}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Load a previously saved journey
  const handleSelectSavedJourney = (savedJourney: JourneyResponse, params: TravelParams) => {
    setJourney(savedJourney);
    setTravelParams(params);
    setPreferredDestination(params.destination);
    if (params.preferredCurrency) {
      setPreferredCurrency(params.preferredCurrency);
    }
    setActiveTab('itinerary');
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  const handleGenerateJourney = async (params: TravelParams) => {
    setIsLoading(true);
    setError(null);
    setTravelParams(params);
    if (params.preferredCurrency) {
      setPreferredCurrency(params.preferredCurrency);
    }
    setPreferredDestination(params.destination);
    try {
      const response = await fetch('/api/generate-journey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to craft your journey. Please try again.');
      }

      setJourney(data);
      setActiveTab('itinerary'); // Reset to first tab
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected connection error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setJourney(null);
    setTravelParams(null);
    setError(null);
  };

  const handleDownloadPDF = () => {
    if (!journey) return;
    const params: TravelParams = travelParams || {
      destination: preferredDestination,
      duration: journey.itinerary?.length || 3,
      travelers: 1,
      ageGroup: 'All Ages',
      budget: 'moderate',
      travelStyle: ['Culture & Heritage'],
      physicalLimitations: 'None',
      languagesKnown: 'English',
      dietaryRestrictions: 'None',
      accessibilityRequirements: 'None',
      transportationPreference: 'Local Standard',
      interests: ['Heritage'],
      preferredCurrency: preferredCurrency
    };
    generateItineraryPDF(journey, params);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-text-warm selection:bg-gold selection:text-black flex font-sans">
      
      {/* Left Navigation Rail (Workflow Tracker) */}
      <aside className="w-20 bg-dark-sidebar border-r border-white/5 flex flex-col items-center py-8 space-y-12 shrink-0 hidden md:flex animate-fade-in" id="app-workflow-rail">
        <div className="w-10 h-10 bg-gold rounded flex items-center justify-center text-black font-serif font-black text-xl shadow-lg shadow-gold/20">R</div>
        <nav className="flex flex-col space-y-8">
          {/* Step 1 */}
          <div 
            onClick={handleReset}
            title="Travel Profiler"
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-mono cursor-pointer transition-all border ${
              !journey 
                ? 'border-2 border-gold text-gold font-bold bg-gold/5 shadow-sm shadow-gold/10' 
                : 'border-white/20 text-text-muted hover:border-gold/50'
            }`}
          >
            01
          </div>
          {/* Step 2 */}
          <div 
            onClick={() => { if (journey) setActiveTab('itinerary'); }}
            title="Immersive Itinerary"
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-mono cursor-pointer transition-all border ${
              journey && activeTab === 'itinerary'
                ? 'border-2 border-gold text-gold font-bold bg-gold/5 shadow-sm shadow-gold/10' 
                : 'border-white/10 text-text-subtle hover:border-gold/40'
            } ${!journey ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            02
          </div>
          {/* Step 3 */}
          <div 
            onClick={() => { if (journey) setActiveTab('food'); }}
            title="Heritage Gastronomy"
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-mono cursor-pointer transition-all border ${
              journey && activeTab === 'food'
                ? 'border-2 border-gold text-gold font-bold bg-gold/5 shadow-sm shadow-gold/10' 
                : 'border-white/10 text-text-subtle hover:border-gold/40'
            } ${!journey ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            03
          </div>
          {/* Step 4 */}
          <div 
            onClick={() => { if (journey) setActiveTab('missions'); }}
            title="Cultural Challenges"
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-mono cursor-pointer transition-all border ${
              journey && activeTab === 'missions'
                ? 'border-2 border-gold text-gold font-bold bg-gold/5 shadow-sm shadow-gold/10' 
                : 'border-white/10 text-text-subtle hover:border-gold/40'
            } ${!journey ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            04
          </div>
          {/* Step 5 */}
          <div 
            onClick={() => { if (journey) setActiveTab('budget'); }}
            title="Financial Estimates"
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-mono cursor-pointer transition-all border ${
              journey && activeTab === 'budget'
                ? 'border-2 border-gold text-gold font-bold bg-gold/5 shadow-sm shadow-gold/10' 
                : 'border-white/10 text-text-subtle hover:border-gold/40'
            } ${!journey ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            05
          </div>
          {/* Step 6 */}
          <div 
            onClick={() => { if (journey) setActiveTab('etiquette'); }}
            title="Sacred Customs & Do's/Don'ts"
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-mono cursor-pointer transition-all border ${
              journey && activeTab === 'etiquette'
                ? 'border-2 border-gold text-gold font-bold bg-gold/5 shadow-sm shadow-gold/10' 
                : 'border-white/10 text-text-subtle hover:border-gold/40'
            } ${!journey ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            06
          </div>
          {/* Step 7 */}
          <div 
            onClick={() => { if (journey) setActiveTab('gems'); }}
            title="Off-Grid Hidden Gems"
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-mono cursor-pointer transition-all border ${
              journey && activeTab === 'gems'
                ? 'border-2 border-gold text-gold font-bold bg-gold/5 shadow-sm shadow-gold/10' 
                : 'border-white/10 text-text-subtle hover:border-gold/40'
            } ${!journey ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            07
          </div>
          {/* Step 8 */}
          <div 
            onClick={() => { if (journey) setActiveTab('accommodations'); }}
            title="Heritage Stays"
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-mono cursor-pointer transition-all border ${
              journey && activeTab === 'accommodations'
                ? 'border-2 border-gold text-gold font-bold bg-gold/5 shadow-sm shadow-gold/10' 
                : 'border-white/10 text-text-subtle hover:border-gold/40'
            } ${!journey ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            08
          </div>
        </nav>
        <div className="mt-auto mb-4">
          <div className="w-1 h-32 bg-white/5 rounded-full relative">
            <div 
              className="absolute top-0 w-full bg-gold rounded-full transition-all duration-500"
              style={{ 
                height: !journey ? '12.5%' : activeTab === 'itinerary' ? '25%' : activeTab === 'food' ? '37.5%' : activeTab === 'missions' ? '50%' : activeTab === 'budget' ? '62.5%' : activeTab === 'etiquette' ? '75%' : activeTab === 'gems' ? '87.5%' : '100%' 
              }}
            />
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Dynamic Header */}
        <header className="border-b border-white/5 bg-dark-bg/85 backdrop-blur sticky top-0 z-50 px-6 py-4" id="app-header">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-zinc-800/50 p-0.5 rounded text-black shadow-lg shadow-gold/5 w-11 h-11 flex items-center justify-center overflow-hidden border border-white/10">
                <img src={roamoraLogo} alt="Roamora Logo" className="w-10 h-10 object-cover rounded" referrerPolicy="no-referrer" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-black tracking-tight text-white flex items-center gap-1.5 italic">
                  Roamora <span className="text-[9px] uppercase tracking-widest text-gold px-1.5 py-0.5 rounded bg-gold/10 border border-gold/20 font-mono font-bold">ELITE PLANNER</span>
                </h1>
                <p className="text-[10px] text-text-subtle font-sans tracking-wide uppercase">Deep Immersion, Local Lore & Heritage Journeys</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* If logged in, show My Atlas button & User Profile info */}
              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="btn-open-atlas"
                    onClick={() => setIsSavedJourneysOpen(true)}
                    className="px-3 py-1.5 rounded text-xs font-mono text-gold border border-gold/30 bg-gold/5 hover:bg-gold/10 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    My Atlas
                  </button>

                  <button
                    type="button"
                    id="btn-sign-out"
                    onClick={handleSignOut}
                    title="Log Out"
                    className="p-1.5 rounded text-text-muted hover:text-white border border-white/5 hover:border-white/10 transition-all cursor-pointer flex items-center justify-center"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>

                  <div className="hidden sm:flex items-center gap-1.5 pl-1.5 border-l border-white/10 text-xs text-text-subtle font-mono">
                    <UserIcon className="h-3 w-3 text-gold/80" />
                    <span className="max-w-[100px] truncate">{user.displayName || user.email?.split('@')[0]}</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  id="btn-sign-in-header"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3.5 py-1.5 rounded text-xs font-mono font-bold border border-gold/40 text-gold hover:bg-gold/5 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Explorer Sign In
                </button>
              )}

              {journey && (
                <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                  {/* Save to Atlas Button */}
                  <button
                    type="button"
                    id="btn-save-atlas-header"
                    onClick={handleSaveJourney}
                    disabled={isSaving}
                    className={`px-3.5 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      saveSuccess 
                        ? 'bg-emerald-500 text-black' 
                        : 'bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:border-gold/30'
                    }`}
                  >
                    {isSaving ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : saveSuccess ? (
                      <Sparkles className="h-3.5 w-3.5 animate-bounce" />
                    ) : (
                      <Save className="h-3.5 w-3.5 text-gold" />
                    )}
                    {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save to Atlas'}
                  </button>

                  <button
                    type="button"
                    id="btn-download-pdf-header"
                    onClick={handleDownloadPDF}
                    className="px-3.5 py-1.5 rounded text-xs font-mono font-bold bg-gold text-black hover:bg-gold-light flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-gold/5"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    Save PDF
                  </button>
                  <button
                    type="button"
                    id="btn-new-search"
                    onClick={handleReset}
                    className="px-3.5 py-1.5 rounded text-xs font-mono text-text-muted border border-white/10 hover:text-gold hover:border-gold/60 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    New Journey
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Arena */}
        <main className="max-w-7xl mx-auto px-6 py-8 md:py-12 w-full flex-1">
          
          {/* State 1: Loading view */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto text-center space-y-6" id="loading-screen">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-gold/10 border-t-gold animate-spin" />
                <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-gold animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-widest">Consulting the Cultural Oracle</h3>
                <p className="text-md text-gold/90 italic font-serif animate-fade-in transition-all duration-500">
                  "{LOADING_QUOTES[loadingQuoteIdx]}"
                </p>
                <p className="text-xs text-text-subtle pt-2 font-mono">This will take about 15-30 seconds to formulate deep storytelling insights.</p>
              </div>
            </div>
          )}

          {/* State 2: Error view */}
          {!isLoading && error && (
            <div className="max-w-xl mx-auto p-6 bg-red-950/10 border border-red-900 rounded-xl space-y-4 text-center my-10" id="error-screen">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-md font-bold text-red-300 font-mono uppercase">Journey Blocked</h3>
                <p className="text-xs text-text-muted leading-relaxed font-sans">{error}</p>
              </div>
              <button
                type="button"
                id="btn-error-retry"
                onClick={handleReset}
                className="px-4 py-2 bg-dark-panel border border-white/10 text-xs font-mono text-gold rounded hover:border-gold/50"
              >
                Back to Travel Profiler
              </button>
            </div>
          )}

        {/* State 3: Welcome Form Screen (No journey yet) */}
        {!isLoading && !error && !journey && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in" id="form-screen">
            
            {/* Left sidebar info card */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl font-serif text-white tracking-tight leading-tight">
                  Reject the Ordinary. <span className="text-gold block mt-2 italic font-medium">Discover Heritage.</span>
                </h2>
                <p className="text-xs text-text-muted leading-relaxed font-sans">
                  Welcome to Roamora. We do not construct checklists of tourist magnets. We design highly authentic journeys packed with local storytelling, forgotten rituals, native table rules, and gamified missions.
                </p>
              </div>

              {/* Bento informational blocks */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-panel border border-white/5 rounded-lg p-5 space-y-2">
                  <div className="text-lg">🌿</div>
                  <div className="text-xs font-bold text-text-warm font-sans">Sustainable Footprint</div>
                  <div className="text-[10px] text-text-subtle leading-relaxed">Green transport, native-owned hostels, and cultural preservation guidance.</div>
                </div>
                <div className="bg-dark-panel border border-white/5 rounded-lg p-5 space-y-2">
                  <div className="text-lg">📜</div>
                  <div className="text-xs font-bold text-text-warm font-sans">Authentic Storytelling</div>
                  <div className="text-[10px] text-text-subtle leading-relaxed">Sensory scripts with sounds and smells, letting you live the history.</div>
                </div>
              </div>

              {/* Interactive quote / proof banner */}
              <div className="bg-gold/5 border border-gold/15 p-5 rounded-lg">
                <p className="text-xs text-text-warm/90 italic font-serif leading-relaxed">
                  "Oaxaca's markets are not just places to trade, they are ancient spaces where Zapotec dialects echo across heaps of mole chichilo, unchanged since the conquistadors arrived."
                </p>
                <div className="text-[10px] font-mono text-gold mt-2.5 tracking-wider uppercase">— Roamora Storyteller</div>
              </div>
            </div>

            {/* Right Form side */}
            <div className="lg:col-span-7 bg-[#0F0F11] border border-white/10 rounded-lg p-8 shadow-2xl">
              <div className="border-b border-white/5 pb-4 mb-6">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-gold" />
                  Traveler Custom Profiler
                </h3>
                <p className="text-xs text-text-subtle mt-1">Provide your details to initiate the deep-local cultural synthesizer.</p>
              </div>
              <TravelForm onSubmit={handleGenerateJourney} isLoading={isLoading} />
            </div>

          </div>
        )}

        {/* State 4: Journey Planner Dashboard Screen (Successfully loaded) */}
        {!isLoading && !error && journey && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in" id="dashboard-screen">
            
            {/* Left metadata sidebar */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Destination Overview */}
              <div className="bg-dark-sidebar border border-white/5 rounded-lg p-6 space-y-3 relative overflow-hidden" id="overview-card">
                <div className="absolute right-0 top-0 h-24 w-24 bg-gold/5 rounded-full blur-2xl" />
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-gold">
                  Cultural DNA Overview
                </div>
                <h3 className="text-xl font-serif font-bold text-white tracking-tight italic">
                  {journey.overview.split(' - ')[0] || 'Destination Profile'}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed font-sans">
                  {journey.overview}
                </p>
              </div>

              {/* Personalized Trip Summary */}
              <div className="bg-dark-panel border border-white/5 rounded-lg p-6 space-y-2" id="summary-card">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-gold">
                  Curator's Philosophy
                </div>
                <p className="text-xs text-text-warm leading-relaxed italic font-serif">
                  "{journey.summary}"
                </p>
              </div>

              {/* AI Travel Authenticity Score */}
              <div className="bg-gold/5 border border-gold/15 rounded-lg p-6 space-y-3.5 relative overflow-hidden" id="score-card">
                <div className="absolute right-0 top-0 h-24 w-24 bg-gold/5 rounded-full blur-2xl" />
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-gold/80">
                  Immersion Depth Evaluation
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-serif italic font-bold text-gold">
                    {journey.aiTravelScore?.score || 95}%
                  </div>
                  <div className="text-xs text-text-warm font-sans font-semibold leading-tight uppercase tracking-wider">
                    Authenticity & Depth Rating
                  </div>
                </div>

                <p className="text-[11px] text-text-muted leading-relaxed font-sans">
                  {journey.aiTravelScore?.explanation}
                </p>
              </div>

              {/* Cloud Sync & PDF Preservation Card */}
              <div className="bg-[#0F0F11] border border-white/10 rounded-lg p-6 space-y-4 relative overflow-hidden" id="pdf-export-card">
                <div className="absolute right-0 top-0 h-16 w-16 bg-gold/5 rounded-full blur-xl animate-pulse" />
                
                <div className="space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-gold flex items-center gap-1.5">
                    <Compass className="h-4 w-4 text-gold" />
                    Itinerary Preservation
                  </div>
                  <h4 className="text-sm font-serif font-bold text-white tracking-tight italic">Save Your Travel Chronicle</h4>
                  <p className="text-[11px] text-text-subtle leading-relaxed font-sans">
                    Keep your custom itinerary accessible on any device, or print it to a beautifully typeset offline travel PDF.
                  </p>
                </div>

                <div className="space-y-2">
                  {/* Save to Cloud Atlas */}
                  <button
                    type="button"
                    id="btn-save-atlas-sidebar"
                    onClick={handleSaveJourney}
                    disabled={isSaving}
                    className={`w-full py-2.5 rounded font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      saveSuccess 
                        ? 'bg-emerald-500 text-black' 
                        : 'bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:border-gold/30'
                    }`}
                  >
                    {isSaving ? (
                      <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
                    ) : saveSuccess ? (
                      <Sparkles className="h-4 w-4 animate-bounce shrink-0" />
                    ) : (
                      <Bookmark className="h-4 w-4 text-gold shrink-0" />
                    )}
                    {isSaving ? 'Preserving to Cloud...' : saveSuccess ? 'Saved to Atlas!' : 'Save Itinerary to Cloud'}
                  </button>

                  {/* Save to PDF */}
                  <button
                    type="button"
                    id="btn-download-pdf-sidebar"
                    onClick={handleDownloadPDF}
                    className="w-full py-2.5 bg-gold text-black hover:bg-gold-light rounded font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold/10 hover:shadow-gold/25"
                  >
                    <Compass className="h-4 w-4 shrink-0" />
                    Download Offline PDF
                  </button>
                </div>

                {!user && (
                  <p className="text-[9px] font-mono text-text-muted text-center">
                    * Creates a free Explorer account to save across devices.
                  </p>
                )}
              </div>

              {/* Currency Converter */}
              <CurrencyConverter />

              {/* Sustainable Travel Tips */}
              <div className="bg-dark-panel border border-white/5 rounded-lg p-6 space-y-3.5" id="sustainability-card">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-gold flex items-center gap-1.5">
                  <Trees className="h-4 w-4 text-gold" />
                  Preservation & Eco-Tips
                </div>
                <ul className="space-y-2.5 text-[11px] text-text-warm leading-relaxed font-sans">
                  {journey.sustainableTravelTips?.map((tip, idx) => {
                    const tipText = typeof tip === 'string' 
                      ? tip 
                      : (tip && typeof tip === 'object' && 'tip' in tip)
                        ? (tip as any).tip
                        : JSON.stringify(tip);
                    return (
                      <li key={idx} className="flex gap-2.5 items-start">
                        <span className="text-gold font-mono">•</span>
                        <span>{tipText}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Emergency & Survival phrasebook */}
              <div className="bg-dark-panel border border-white/5 rounded-lg p-6 space-y-3.5" id="emergency-card">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400 flex items-center gap-1">
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                  Emergency & Survival Assets
                </div>
                
                <div className="grid grid-cols-2 gap-3 border-b border-white/5 pb-4">
                  <div className="space-y-0.5">
                    <span className="text-text-subtle block font-mono text-[9px] tracking-wider">POLICE</span>
                    <span className="text-white font-mono font-bold text-sm">{journey.emergencyInformation?.police}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-text-subtle block font-mono text-[9px] tracking-wider">MEDICAL</span>
                    <span className="text-white font-mono font-bold text-sm">{journey.emergencyInformation?.medical}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-text-subtle block font-mono uppercase font-bold tracking-wider">Linguistic Safety Phrases</span>
                  <div className="space-y-2">
                    {journey.emergencyInformation?.usefulPhrases?.map((p, idx) => (
                      <div key={idx} className="p-3 bg-dark-bg border border-white/5 rounded text-[11px] space-y-1">
                        <div className="font-bold text-white font-sans">{p.phrase}</div>
                        <div className="text-text-muted font-sans italic">"{p.meaning}"</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Right main workspace columns (Interactive Tabs) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Workspace Navigation Tabs bar */}
              <div className="flex gap-1.5 overflow-x-auto bg-dark-sidebar border border-white/5 p-1.5 rounded-lg scrollbar-none" id="dashboard-tabs">
                {[
                  { id: 'itinerary', label: '🗺️ Itinerary' },
                  { id: 'food', label: '🍲 Local Food' },
                  { id: 'missions', label: '🏅 Missions' },
                  { id: 'budget', label: '💴 Budget' },
                  { id: 'etiquette', label: '🎭 Customs' },
                  { id: 'gems', label: '💎 Gems & Events' },
                  { id: 'accommodations', label: '🏨 Heritage Stays' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    id={`btn-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2.5 rounded font-mono text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-gold text-black shadow-md shadow-gold/15'
                        : 'text-text-muted hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Dynamic View Panel Container */}
              <div className="bg-[#0F0F11] border border-white/10 rounded-lg p-6 md:p-8 min-h-[50vh] shadow-2xl" id="tab-content-panel">
                
                {activeTab === 'itinerary' && (
                  <div className="space-y-4">
                    <div className="border-b border-white/5 pb-4 mb-5">
                      <h3 className="text-lg font-serif font-bold text-white tracking-tight italic">Immersive Day-by-Day Journey</h3>
                      <p className="text-xs text-text-subtle mt-1 font-sans">Deep, educational itineraries focusing on native legends, golden-hour photo sights, and slow pacing.</p>
                    </div>
                    <ItineraryView itinerary={journey.itinerary} destination={preferredDestination} />
                  </div>
                )}

                {activeTab === 'food' && (
                  <div className="space-y-4">
                    <div className="border-b border-white/5 pb-4 mb-5">
                      <h3 className="text-lg font-serif font-bold text-white tracking-tight italic">Heritage Gastronomy & dining Guide</h3>
                      <p className="text-xs text-text-subtle mt-1 font-sans">Traditional recipes, native ingredients, historic backgrounds, and essential dining etiquettes.</p>
                    </div>
                    <FoodGuide foodItems={journey.mustTryFood} destination={preferredDestination} preferredCurrency={preferredCurrency} localCurrency={journey.localCurrency} />
                  </div>
                )}

                {activeTab === 'missions' && (
                  <div className="space-y-4">
                    <div className="border-b border-white/5 pb-4 mb-5">
                      <h3 className="text-lg font-serif font-bold text-white tracking-tight italic">Offline Cultural Challenges</h3>
                      <p className="text-xs text-text-subtle mt-1 font-sans">Gamify your exploration. Complete assignments to support local weaving shops, learn dialects, and earn badges.</p>
                    </div>
                    <CultureMissions missions={journey.culturalMissions} />
                  </div>
                )}

                {activeTab === 'budget' && (
                  <div className="space-y-4">
                    <div className="border-b border-white/5 pb-4 mb-5">
                      <h3 className="text-lg font-serif font-bold text-white tracking-tight italic">Financial Estimator & Thrift Optimization</h3>
                      <p className="text-xs text-text-subtle mt-1 font-sans">Allocation graphs by category based on your budget tier, alongside smart savings tips.</p>
                    </div>
                    <BudgetPlanner estimate={journey.budgetEstimate} preferredCurrency={preferredCurrency} localCurrency={journey.localCurrency} />
                  </div>
                )}

                {activeTab === 'etiquette' && (
                  <div className="space-y-4">
                    <div className="border-b border-white/5 pb-4 mb-5">
                      <h3 className="text-lg font-serif font-bold text-white tracking-tight italic">Sacred Etiquette & Dialect phrasebook</h3>
                      <p className="text-xs text-text-subtle mt-1 font-sans">Essential custom Do's and Don'ts, photography boundaries, clothing rules, and conversational practice.</p>
                    </div>
                    <EtiquetteCard etiquette={journey.localEtiquette} />
                  </div>
                )}

                {activeTab === 'gems' && (
                  <div className="space-y-8">
                    
                    {/* Hidden Gems Column */}
                    <div className="space-y-4">
                      <div className="border-b border-white/5 pb-4">
                        <h3 className="text-lg font-serif font-bold text-white tracking-tight italic">Off-Grid Hidden Gems (Locals' Favorites)</h3>
                        <p className="text-xs text-text-subtle mt-1 font-sans">Locations tourists routinely bypass, embedded with rich local folk stories and legends.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {journey.hiddenGems?.map((gem, idx) => (
                          <div key={idx} className="bg-dark-panel border border-white/5 rounded-lg p-5 space-y-2.5">
                            <span className="text-gold font-mono text-[9px] uppercase font-bold tracking-widest block">Hidden Gem #{idx + 1}</span>
                            <h4 className="text-md font-serif font-bold text-white italic">{gem.name}</h4>
                            <p className="text-xs text-text-muted italic leading-relaxed">"{gem.story}"</p>
                            <p className="text-[11px] text-text-subtle pt-1 leading-normal">
                              <strong className="text-gold font-mono text-[9px] tracking-wider uppercase mr-1.5">Why locals love it:</strong> {gem.whyItMatters}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Local Events Column */}
                    <div className="space-y-4 pt-6 border-t border-white/5">
                      <div className="pb-4">
                        <h3 className="text-lg font-serif font-bold text-white tracking-tight italic">Seasonal Gatherings & Rituals</h3>
                        <p className="text-xs text-text-subtle mt-1 font-sans">True seasonal festivals, local art fairs, or sacred religious ceremony calendars.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {journey.localEvents?.map((event, idx) => (
                          <div key={idx} className="bg-dark-panel border border-white/5 hover:border-gold/20 transition-all rounded-xl p-5 flex flex-col justify-between gap-4 shadow-lg" id={`event-card-${idx}`}>
                            <div className="space-y-2">
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-gold font-mono text-[9px] uppercase font-bold tracking-widest">Ritual / Gathering #{idx + 1}</span>
                                <span className="px-2 py-0.5 rounded bg-gold/15 text-gold border border-gold/20 text-[9px] font-mono font-bold whitespace-nowrap shrink-0">{event.price}</span>
                              </div>
                              <h4 className="text-sm font-serif font-bold text-white italic tracking-tight">{event.name}</h4>
                              <p className="text-xs text-text-muted leading-relaxed font-sans">{event.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 text-[10px] font-mono text-text-subtle items-center">
                              <div className="flex items-center gap-1 truncate">
                                <span className="text-gold">📅</span>
                                <span className="truncate text-white" title={event.date}>{event.date}</span>
                              </div>
                              <div className="flex items-center gap-1 truncate justify-end">
                                <span className="text-gold">📍</span>
                                <span className="truncate text-white mr-1" title={event.location}>{event.location}</span>
                                <button
                                  type="button"
                                  onClick={() => setActiveMapPlace(event.location)}
                                  className="text-[8px] bg-gold/15 text-gold border border-gold/25 px-1 rounded hover:bg-gold/20 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                                >
                                  Map
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {activeTab === 'accommodations' && (
                  <div className="space-y-4">
                    <div className="border-b border-white/5 pb-4 mb-5">
                      <h3 className="text-lg font-serif font-bold text-white tracking-tight italic">Heritage Accommodations & Conscious Stays</h3>
                      <p className="text-xs text-text-subtle mt-1 font-sans">Locally-owned home stays, ancient preservation estates, and eco-lodges supporting neighborhood wealth.</p>
                    </div>
                    <StaysGuide accommodations={journey.accommodations} destination={preferredDestination} preferredCurrency={preferredCurrency} localCurrency={journey.localCurrency} />
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 bg-dark-bg text-center text-text-subtle text-xs font-mono">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <div>© {new Date().getFullYear()} Roamora. Co-curated with Google Gemini & Local Heritage Preservation Guilds.</div>
          <div className="text-[10px] text-text-subtle/50">All itineraries generated are structured around slow travel, cultural respect, and local wealth distribution.</div>
        </div>
      </footer>

      {activeMapPlace && (
        <PlaceMapModal
          isOpen={!!activeMapPlace}
          onClose={() => setActiveMapPlace(null)}
          placeName={activeMapPlace}
          destination={preferredDestination}
        />
      )}

      {/* Firebase Auth & Database overlays */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <SavedJourneys
        user={user}
        isOpen={isSavedJourneysOpen}
        onClose={() => setIsSavedJourneysOpen(false)}
        onSelectJourney={handleSelectSavedJourney}
      />

    </div>
  </div>
  );
}
