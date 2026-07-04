import React, { useState } from 'react';
import { DollarSign, ArrowLeftRight, RefreshCw } from 'lucide-react';
import { CURRENCY_RATES } from '../utils/currency';

const RATES_TO_USD: Record<string, number> = Object.entries(CURRENCY_RATES).reduce(
  (acc, [code, info]) => {
    acc[code] = info.rate;
    return acc;
  },
  {} as Record<string, number>
);

const CURRENCY_NAMES: Record<string, string> = Object.entries(CURRENCY_RATES).reduce(
  (acc, [code, info]) => {
    acc[code] = `${info.name} (${info.symbol})`;
    return acc;
  },
  {} as Record<string, string>
);

export default function CurrencyConverter() {
  const [amount, setAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('INR');
  const [isSimulating, setIsSimulating] = useState(false);

  // Convert amount
  const rateFrom = RATES_TO_USD[fromCurrency] || 1;
  const rateTo = RATES_TO_USD[toCurrency] || 1;
  const converted = (amount / rateFrom) * rateTo;

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleSimulateUpdate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 800);
  };

  return (
    <div className="bg-dark-panel border border-white/5 rounded-lg p-5 space-y-4" id="currency-converter-widget">
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-gold flex items-center gap-1.5">
          <DollarSign className="h-4 w-4 text-gold" />
          Heritage Exchange Rate Tool
        </div>
        <button
          type="button"
          onClick={handleSimulateUpdate}
          className="text-text-subtle hover:text-gold transition-colors focus:outline-none cursor-pointer"
          title="Verify rates (Simulation)"
        >
          <RefreshCw className={`h-3 w-3 ${isSimulating ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3.5">
        {/* Input Amount */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-text-subtle">Amount to Convert</label>
          <input
            type="number"
            min="1"
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-3 py-2 bg-dark-bg border border-white/10 rounded text-xs text-white font-mono focus:outline-none focus:border-gold"
          />
        </div>

        {/* Currency Selectors */}
        <div className="grid grid-cols-5 items-center gap-1.5">
          <div className="col-span-2 space-y-1">
            <label className="text-[9px] font-mono uppercase tracking-wider text-text-subtle block">From</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full p-2 bg-dark-bg border border-white/10 rounded text-[11px] text-white font-mono focus:outline-none focus:border-gold"
            >
              {Object.keys(RATES_TO_USD).map(cur => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1 flex justify-center pt-4">
            <button
              type="button"
              onClick={handleSwap}
              className="p-1.5 rounded bg-dark-bg border border-white/10 hover:border-gold/50 transition-all cursor-pointer text-text-subtle hover:text-white"
              title="Swap currencies"
            >
              <ArrowLeftRight className="h-3 w-3" />
            </button>
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-[9px] font-mono uppercase tracking-wider text-text-subtle block">To</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full p-2 bg-dark-bg border border-white/10 rounded text-[11px] text-white font-mono focus:outline-none focus:border-gold"
            >
              {Object.keys(RATES_TO_USD).map(cur => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Output Conversion Result */}
        <div className="p-3 bg-dark-bg border border-white/5 rounded-lg text-center space-y-1">
          <span className="text-[10px] font-mono text-text-subtle uppercase">Converted Value</span>
          <div className="text-sm font-mono font-bold text-white flex items-center justify-center gap-1">
            <span>{amount.toLocaleString()} {fromCurrency}</span>
            <span className="text-gold">=</span>
            <span className="text-gold">{converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}</span>
          </div>
          <span className="text-[9px] text-text-subtle block italic">
            1 {fromCurrency} = {(rateTo / rateFrom).toFixed(4)} {toCurrency}
          </span>
        </div>
      </div>
    </div>
  );
}
