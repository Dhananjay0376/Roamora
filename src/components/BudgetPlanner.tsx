import React, { useState } from 'react';
import { BudgetEstimate } from '../types';
import { DollarSign, HelpCircle, Check, Info, ShieldAlert, ArrowDown } from 'lucide-react';
import { CURRENCY_RATES } from '../utils/currency';

interface BudgetPlannerProps {
  estimate: BudgetEstimate;
  preferredCurrency?: string;
  localCurrency?: {
    code: string;
    symbol: string;
    name: string;
    rateToUSD: number;
  };
}

export default function BudgetPlanner({ estimate, preferredCurrency = 'INR', localCurrency }: BudgetPlannerProps) {
  const [useThriftMode, setUseThriftMode] = useState(false);

  // Parse original estimate keys
  const {
    accommodation = 0,
    food = 0,
    transport = 0,
    tickets = 0,
    shopping = 0,
    emergencyBuffer = 0,
    cheaperAlternatives = ''
  } = estimate;

  // Calculate scaling factor if thrift mode is active (reduce costs by 30% except emergency buffer which stays stable for safety)
  const discountFactor = useThriftMode ? 0.7 : 1.0;

  const currentAccommodation = Math.round(accommodation * discountFactor);
  const currentFood = Math.round(food * discountFactor);
  const currentTransport = Math.round(transport * discountFactor);
  const currentTickets = Math.round(tickets * discountFactor);
  const currentShopping = Math.round(shopping * discountFactor);
  const currentEmergency = emergencyBuffer; // Keep buffer fixed for safety!

  const totalCost = currentAccommodation + currentFood + currentTransport + currentTickets + currentShopping + currentEmergency;
  const originalTotal = accommodation + food + transport + tickets + shopping + emergencyBuffer;
  const totalSaved = originalTotal - totalCost;

  const costBreakdown = [
    { label: 'Accommodation', amount: currentAccommodation, original: accommodation, color: 'bg-amber-500' },
    { label: 'Food & Culinary Experiences', amount: currentFood, original: food, color: 'bg-orange-500' },
    { label: 'Transportation', amount: currentTransport, original: transport, color: 'bg-blue-500' },
    { label: 'Sightseeing & Tickets', amount: currentTickets, original: tickets, color: 'bg-green-500' },
    { label: 'Artisan Crafts & Shopping', amount: currentShopping, original: shopping, color: 'bg-purple-500' },
    { label: 'Emergency Buffer', amount: currentEmergency, original: emergencyBuffer, color: 'bg-rose-500' }
  ];

  const formatAmount = (usdValue: number) => {
    // Convert to preferred currency
    const prefInfo = CURRENCY_RATES[preferredCurrency] || CURRENCY_RATES.INR;
    const prefVal = usdValue * prefInfo.rate;
    const prefString = `${prefInfo.symbol}${Math.round(prefVal).toLocaleString()}`;

    // Convert to local currency (if local currency exists and is different from preferred currency)
    if (localCurrency && localCurrency.code !== preferredCurrency) {
      const localVal = usdValue * localCurrency.rateToUSD;
      const localString = `${localCurrency.symbol}${Math.round(localVal).toLocaleString()}`;
      return {
        preferred: prefString,
        local: localString,
        both: `${prefString} (${localString})`,
      };
    }

    return {
      preferred: prefString,
      local: prefString,
      both: prefString,
    };
  };

  const renderExchangeBoard = () => {
    if (!localCurrency || localCurrency.code === preferredCurrency) return null;

    const prefInfo = CURRENCY_RATES[preferredCurrency] || CURRENCY_RATES.INR;
    
    // 1 Pref = X Local
    const toLocal = (localCurrency.rateToUSD / prefInfo.rate).toFixed(3);
    // 1 Local = Y Pref
    const toPref = (prefInfo.rate / localCurrency.rateToUSD).toFixed(3);

    return (
      <div className="bg-dark-panel border border-white/5 rounded-xl p-5 space-y-3.5" id="exchange-rates-board">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gold animate-pulse" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gold">Live Currency Exchange Valuation</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
          <div className="bg-dark-bg p-4 rounded-lg border border-white/5 flex flex-col justify-between">
            <div>
              <span className="text-[9px] uppercase font-mono text-text-subtle block tracking-wider font-bold">Your Currency Value in Area</span>
              <div className="text-xl font-bold text-white font-mono mt-1">
                1 {preferredCurrency} = {toLocal} {localCurrency.code}
              </div>
            </div>
            <p className="text-[10px] text-text-muted mt-2 leading-relaxed">
              This measures how much purchasing weight {preferredCurrency} carries at the destination.
            </p>
          </div>
          <div className="bg-dark-bg p-4 rounded-lg border border-white/5 flex flex-col justify-between">
            <div>
              <span className="text-[9px] uppercase font-mono text-text-subtle block tracking-wider font-bold">Local Price Equivalency</span>
              <div className="text-xl font-bold text-gold font-mono mt-1">
                1 {localCurrency.code} = {toPref} {preferredCurrency}
              </div>
            </div>
            <p className="text-[10px] text-text-muted mt-2 leading-relaxed">
              Multiply any local {localCurrency.code} price tag by <strong>{toPref}</strong> to instantly get the cost in your currency.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" id="budget-planner-view">
      {/* Top Total Cost Bento Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Core total */}
        <div className="col-span-1 md:col-span-2 bg-[#0F0F11] border border-white/10 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 h-24 w-24 bg-gold/5 rounded-full blur-2xl" />
          
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold tracking-widest text-gold uppercase">
              Financial Curations & Estimates
            </div>
            <h3 className="text-xs text-text-subtle font-sans">
              Estimated Trip Investment ({preferredCurrency})
            </h3>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 justify-between">
            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-white font-mono">{formatAmount(totalCost).preferred}</span>
                <span className="text-xs text-text-muted font-mono">{preferredCurrency} Total</span>
              </div>
              {localCurrency && localCurrency.code !== preferredCurrency && (
                <div className="text-[11px] font-mono text-gold font-bold">
                  ≈ {formatAmount(totalCost).local} {localCurrency.code} (Local Standard)
                </div>
              )}
            </div>
            
            {useThriftMode && (
              <span className="text-xs text-green-400 font-mono bg-green-950/30 border border-green-900/30 px-2.5 py-1 rounded flex items-center gap-1.5 animate-pulse self-start sm:self-center">
                <ArrowDown className="h-3.5 w-3.5" /> Saved {formatAmount(totalSaved).preferred}
              </span>
            )}
          </div>
        </div>

        {/* Thrift Mode toggle card */}
        <div className="bg-dark-panel border border-white/5 rounded-xl p-5 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-white font-sans flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-green-400" />
              Thrift Savings Optimization
            </div>
            <p className="text-[11px] text-text-subtle leading-normal">
              Optimize and apply regional savings measures (home-style dining, standard local transit).
            </p>
          </div>

          <button
            type="button"
            id="toggle-thrift-mode"
            onClick={() => setUseThriftMode(!useThriftMode)}
            className={`w-full py-2.5 rounded text-xs font-mono font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-3 ${
              useThriftMode
                ? 'bg-green-500 text-black border-green-500 hover:bg-green-400'
                : 'bg-dark-bg text-text-subtle border-white/10 hover:border-gold'
            }`}
          >
            {useThriftMode ? 'Thrift Savings Active' : 'Apply Thrift Savings'}
          </button>
        </div>
      </div>

      {/* Live Exchange Valuation Board */}
      {renderExchangeBoard()}

      {/* Itemized bar chart & items */}
      <div className="bg-dark-panel border border-white/5 rounded-xl p-5 space-y-6">
        <h4 className="text-[10px] font-mono font-bold tracking-widest text-gold uppercase">
          Expense Allocation Breakdown ({preferredCurrency})
        </h4>

        {/* Custom stacked bar visualization */}
        <div className="w-full h-3.5 bg-dark-bg rounded-full overflow-hidden flex border border-white/5">
          {costBreakdown.map((item, idx) => {
            const percent = totalCost > 0 ? (item.amount / totalCost) * 100 : 0;
            if (percent === 0) return null;
            return (
              <div
                key={idx}
                className={`${item.color} h-full transition-all duration-300`}
                style={{ width: `${percent}%` }}
                title={`${item.label}: ${formatAmount(item.amount).preferred} (${Math.round(percent)}%)`}
              />
            );
          })}
        </div>

        {/* Legend / Itemized cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {costBreakdown.map((item, idx) => {
            const percent = totalCost > 0 ? Math.round((item.amount / totalCost) * 100) : 0;
            return (
              <div key={idx} className="bg-dark-bg border border-white/5 rounded-lg p-3.5 space-y-2 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    <span className="text-xs text-white font-serif italic tracking-tight">{item.label}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-sm font-bold text-white font-mono">
                      {formatAmount(item.amount).preferred}
                    </div>
                    <div className="text-[10px] text-text-subtle font-mono">
                      {percent}%
                    </div>
                  </div>
                </div>
                {localCurrency && localCurrency.code !== preferredCurrency && (
                  <div className="text-[9px] font-mono text-gold pt-1.5 border-t border-white/5 flex justify-between items-center">
                    <span className="text-text-muted">In {localCurrency.code}:</span>
                    <span className="font-bold">{formatAmount(item.amount).local}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cheaper Alternatives Advice - Step 10 */}
      {cheaperAlternatives && (
        <div className="bg-gold/5 border border-gold/15 rounded-xl p-5 space-y-3">
          <h4 className="text-[10px] font-mono font-bold tracking-widest text-gold uppercase flex items-center gap-1.5">
            <Info className="h-4 w-4" />
            Cultural Thrift & Savings Tactics (Locals' Guide)
          </h4>
          <p className="text-xs text-text-warm leading-relaxed font-sans">
            {cheaperAlternatives}
          </p>
          <div className="text-[10px] text-text-subtle font-mono leading-relaxed pt-1 border-t border-white/5">
            💡 <strong>Cultural insight:</strong> Eating at locally-owned diner structures ("comedores", "shokudo", "souk stalls") not only shaves up to 40% off dining bills but offers triple the authenticity of tourist-facing establishments.
          </div>
        </div>
      )}
    </div>
  );
}
