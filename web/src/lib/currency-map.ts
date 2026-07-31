export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

// A map of ISO 3166-1 alpha-2 country codes to currency info
export const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  // North America
  US: { code: 'USD', symbol: '$', name: 'US Dollar' },
  CA: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  MX: { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  
  // Europe
  GB: { code: 'GBP', symbol: '£', name: 'British Pound' },
  EU: { code: 'EUR', symbol: '€', name: 'Euro' },
  FR: { code: 'EUR', symbol: '€', name: 'Euro' },
  DE: { code: 'EUR', symbol: '€', name: 'Euro' },
  IT: { code: 'EUR', symbol: '€', name: 'Euro' },
  ES: { code: 'EUR', symbol: '€', name: 'Euro' },
  CH: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  
  // Asia
  IN: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  JP: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  CN: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  KR: { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  SG: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  
  // Oceania
  AU: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  NZ: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  
  // Middle East / Africa
  AE: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  ZA: { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  SA: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  
  // South America
  BR: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  AR: { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
};

// Fallback currency
export const DEFAULT_CURRENCY: CurrencyInfo = { code: 'USD', symbol: '$', name: 'US Dollar' };

/**
 * Gets currency info for a given country code.
 * Falls back to EUR for some unlisted european countries, or USD for others.
 */
export const getCurrencyForCountry = (countryCode: string | null): CurrencyInfo => {
  if (!countryCode) return DEFAULT_CURRENCY;
  
  const code = countryCode.toUpperCase();
  if (CURRENCY_MAP[code]) {
    return CURRENCY_MAP[code];
  }
  
  // Fallback for Eurozone-ish countries not explicitly listed above
  const euroZone = ['AT', 'BE', 'CY', 'EE', 'FI', 'GR', 'IE', 'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI'];
  if (euroZone.includes(code)) {
    return { code: 'EUR', symbol: '€', name: 'Euro' };
  }
  
  return DEFAULT_CURRENCY;
};
