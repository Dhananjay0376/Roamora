export const CURRENCY_RATES: Record<string, { symbol: string; rate: number; name: string }> = {
  USD: { symbol: '$', rate: 1.0, name: 'US Dollar' },
  INR: { symbol: '₹', rate: 83.5, name: 'Indian Rupee' },
  EUR: { symbol: '€', rate: 0.92, name: 'Euro' },
  GBP: { symbol: '£', rate: 0.79, name: 'British Pound' },
  JPY: { symbol: '¥', rate: 155.20, name: 'Japanese Yen' },
  CAD: { symbol: 'C$', rate: 1.37, name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', rate: 1.50, name: 'Australian Dollar' },
  MXN: { symbol: 'Mex$', rate: 17.10, name: 'Mexican Peso' },
  EGP: { symbol: 'EGP', rate: 47.80, name: 'Egyptian Pound' },
  CNY: { symbol: '¥', rate: 7.24, name: 'Chinese Yuan' },
  AED: { symbol: 'AED', rate: 3.67, name: 'UAE Dirham' },
  THB: { symbol: '฿', rate: 36.40, name: 'Thai Baht' },
};

export interface LocalCurrency {
  code: string;
  symbol: string;
  name: string;
  rateToUSD: number;
}

/**
 * Converts price string values (which could contain dollar signs like $50, word USD like 120 USD,
 * or be in local currency) to both the user's preferred currency and the destination's local currency.
 */
export function convertPriceString(
  priceStr: string,
  preferredCurrency: string = 'INR',
  localCurrency?: LocalCurrency
): string {
  if (!priceStr) return '';

  const prefInfo = CURRENCY_RATES[preferredCurrency] || CURRENCY_RATES.INR;

  // 1. Try to find dollar amounts like $50, $100, $5.50
  const usdRegex = /\$(\d+(?:\.\d+)?)/g;
  const hasDollar = usdRegex.test(priceStr);

  if (hasDollar) {
    // Replace all dollar amounts with the preferred currency amount
    const convertedPreferred = priceStr.replace(/\$(\d+(?:\.\d+)?)/g, (match, p1) => {
      const usdVal = parseFloat(p1);
      const prefVal = Math.round(usdVal * prefInfo.rate);
      return `${prefInfo.symbol}${prefVal.toLocaleString()}`;
    });

    // If we have local currency, let's also create a local currency version if different
    if (localCurrency && localCurrency.code !== preferredCurrency) {
      const convertedLocal = priceStr.replace(/\$(\d+(?:\.\d+)?)/g, (match, p1) => {
        const usdVal = parseFloat(p1);
        const localVal = Math.round(usdVal * localCurrency.rateToUSD);
        return `${localCurrency.symbol}${localVal.toLocaleString()}`;
      });
      return `${convertedPreferred} (≈ ${convertedLocal})`;
    }

    return convertedPreferred;
  }

  // 2. What if there is no '$' sign but there are numbers with "USD"?
  const usdWordRegex = /\b(\d+(?:\.\d+)?)\s*USD\b/gi;
  if (usdWordRegex.test(priceStr)) {
    const convertedPreferred = priceStr.replace(/\b(\d+(?:\.\d+)?)\s*USD\b/gi, (match, p1) => {
      const usdVal = parseFloat(p1);
      const prefVal = Math.round(usdVal * prefInfo.rate);
      return `${prefInfo.symbol}${prefVal.toLocaleString()}`;
    });

    if (localCurrency && localCurrency.code !== preferredCurrency) {
      const convertedLocal = priceStr.replace(/\b(\d+(?:\.\d+)?)\s*USD\b/gi, (match, p1) => {
        const usdVal = parseFloat(p1);
        const localVal = Math.round(usdVal * localCurrency.rateToUSD);
        return `${localCurrency.symbol}${localVal.toLocaleString()}`;
      });
      return `${convertedPreferred} (≈ ${convertedLocal})`;
    }
    return convertedPreferred;
  }

  // 3. What if it is already in local currency or has plain numbers?
  if (localCurrency && (priceStr.includes(localCurrency.code) || priceStr.includes(localCurrency.symbol))) {
    // Try converting any numbers in the local currency format to preferred currency
    const convertedPreferred = priceStr.replace(/(\d+(?:\.\d+)?)/g, (match) => {
      const localVal = parseFloat(match);
      if (isNaN(localVal)) return match;
      const usdVal = localVal / localCurrency.rateToUSD;
      const prefVal = Math.round(usdVal * prefInfo.rate);
      return `${prefInfo.symbol}${prefVal.toLocaleString()}`;
    });

    if (preferredCurrency !== localCurrency.code) {
      return `${convertedPreferred} (≈ ${priceStr})`;
    }
    return priceStr;
  }

  // 4. Fallback: If it's just a raw number, assume it's in USD and convert it!
  const plainNumberRegex = /^\s*(\d+(?:\.\d+)?)\s*$/;
  if (plainNumberRegex.test(priceStr)) {
    const usdVal = parseFloat(priceStr);
    const prefVal = Math.round(usdVal * prefInfo.rate);
    const prefStr = `${prefInfo.symbol}${prefVal.toLocaleString()}`;
    if (localCurrency && localCurrency.code !== preferredCurrency) {
      const localVal = Math.round(usdVal * localCurrency.rateToUSD);
      const localStr = `${localCurrency.symbol}${localVal.toLocaleString()}`;
      return `${prefStr} (≈ ${localStr})`;
    }
    return prefStr;
  }

  return priceStr;
}
