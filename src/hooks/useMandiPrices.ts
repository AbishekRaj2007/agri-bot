import { useQuery } from '@tanstack/react-query';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CommodityCategory =
  | 'Grains'
  | 'Vegetables'
  | 'Oilseeds'
  | 'Pulses'
  | 'Spices'
  | 'Other';

export interface ProcessedCommodity {
  id: string;
  commodity: string;
  variety: string;
  state: string;
  district: string;
  market: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  msp: number | null;
  priceChange: number; // % change vs previous close
  category: CommodityCategory;
  emoji: string;
  trend: { day: string; price: number }[];
}

// ─── Commodity Definitions ────────────────────────────────────────────────────

interface CommodityDef {
  id: string;
  name: string;        // Display name shown in UI
  symbol: string;      // Yahoo Finance futures symbol
  category: CommodityCategory;
  emoji: string;
  // Yahoo Finance returns prices in USX (US cents). ZR=F is USD per cwt.
  // This function converts to ₹/quintal given USD/INR rate.
  toINR: (cents: number, usdInr: number) => number;
  msp: number | null;  // MSP 2024-25 in ₹/quintal
}

// Unit conversion constants
// 1 bushel wheat/soy = 27.2155 kg  → 1 quintal = 100 / 27.2155 = 3.6744 bushels
// 1 bushel corn      = 25.4012 kg  → 1 quintal = 100 / 25.4012 = 3.9368 bushels
// 1 pound            = 0.453592 kg → 1 quintal = 100 / 0.453592 = 220.46 pounds
// ZR=F: USD per short-cwt (45.359 kg) → 1 quintal = 100 / 45.359 = 2.205 cwt

const COMMODITY_DEFS: CommodityDef[] = [
  {
    id: 'wheat',
    name: 'Wheat (Gehu)',
    symbol: 'ZW=F',
    category: 'Grains',
    emoji: '🌾',
    toINR: (c, r) => Math.round((c / 100) * r * 3.6744),
    msp: 2275,
  },
  {
    id: 'corn',
    name: 'Maize (Makka)',
    symbol: 'ZC=F',
    category: 'Grains',
    emoji: '🌽',
    toINR: (c, r) => Math.round((c / 100) * r * 3.9368),
    msp: 2090,
  },
  {
    id: 'soybean',
    name: 'Soybean (Soyabean)',
    symbol: 'ZS=F',
    category: 'Oilseeds',
    emoji: '🫘',
    toINR: (c, r) => Math.round((c / 100) * r * 3.6744),
    msp: 4892,
  },
  {
    id: 'soyoil',
    name: 'Soybean Oil',
    symbol: 'ZL=F',
    category: 'Oilseeds',
    emoji: '🫚',
    toINR: (c, r) => Math.round((c / 100) * r * 220.46),
    msp: null,
  },
  {
    id: 'cotton',
    name: 'Cotton (Kapas)',
    symbol: 'CT=F',
    category: 'Other',
    emoji: '🌱',
    toINR: (c, r) => Math.round((c / 100) * r * 220.46),
    msp: 7020,
  },
  {
    id: 'sugar',
    name: 'Sugar (Chini)',
    symbol: 'SB=F',
    category: 'Other',
    emoji: '🍬',
    toINR: (c, r) => Math.round((c / 100) * r * 220.46),
    msp: null,
  },
  {
    id: 'oat',
    name: 'Oat (Jai)',
    symbol: 'ZO=F',
    category: 'Grains',
    emoji: '🌾',
    toINR: (c, r) => Math.round((c / 100) * r * 3.6744),
    msp: null,
  },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

// ─── Fetch helpers ────────────────────────────────────────────────────────────

// allorigins.win is a free public CORS proxy — no key required
const CORS_PROXY = 'https://api.allorigins.win/get?url=';

async function proxyFetch<T>(targetUrl: string): Promise<T | null> {
  try {
    const res = await fetch(CORS_PROXY + encodeURIComponent(targetUrl));
    if (!res.ok) return null;
    const wrapper = await res.json();
    return wrapper.contents ? (JSON.parse(wrapper.contents) as T) : null;
  } catch {
    return null;
  }
}

async function fetchUsdInr(): Promise<number> {
  try {
    // frankfurter.app has native CORS support, no proxy needed
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=INR');
    if (!res.ok) return 84;
    const json = await res.json();
    return (json.rates?.INR as number) ?? 84;
  } catch {
    return 84;
  }
}

interface YFMeta {
  regularMarketPrice: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  currency: string;
}

interface YFChart {
  chart: {
    result: Array<{
      meta: YFMeta;
      indicators: { quote: Array<{ close: (number | null)[] }> };
    }>;
    error: unknown;
  };
}

async function fetchYahooChart(symbol: string): Promise<YFChart | null> {
  const url =
    `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?interval=1d&range=10d&includePrePost=false`;
  return proxyFetch<YFChart>(url);
}

// ─── Build ProcessedCommodity ─────────────────────────────────────────────────

function buildCommodity(
  def: CommodityDef,
  chart: YFChart,
  usdInr: number,
  userState?: string,
): ProcessedCommodity {
  const meta = chart.chart.result[0].meta;
  const rawCloses = chart.chart.result[0].indicators.quote[0].close;

  const modal = def.toINR(meta.regularMarketPrice, usdInr);
  const high = def.toINR(meta.regularMarketDayHigh, usdInr);
  const low = def.toINR(meta.regularMarketDayLow, usdInr);

  // Derive % change from previous session's close
  const validCloses = rawCloses.filter((v): v is number => v !== null);
  const prevClose = validCloses.length >= 2 ? validCloses[validCloses.length - 2] : null;
  const prevModal = prevClose !== null ? def.toINR(prevClose, usdInr) : modal;
  const priceChange = prevModal > 0 ? ((modal - prevModal) / prevModal) * 100 : 0;

  // 7-day trend from actual closing prices
  const last7 = validCloses.slice(-7);
  const trend = last7.map((price, i) => ({
    day: DAYS[Math.max(0, DAYS.length - last7.length + i)],
    price: def.toINR(price, usdInr),
  }));
  // Replace last entry with today's live price
  if (trend.length > 0) {
    trend[trend.length - 1] = { day: 'Today', price: modal };
  }

  return {
    id: def.id,
    commodity: def.name,
    variety: def.symbol.replace('=F', '') + ' Futures',
    state: userState ?? 'National Market',
    district: '',
    market: 'CBOT / ICE',
    arrivalDate: new Date().toLocaleDateString('en-IN'),
    minPrice: low,
    maxPrice: high,
    modalPrice: modal,
    msp: def.msp,
    priceChange,
    category: def.category,
    emoji: def.emoji,
    trend,
  };
}

// ─── Mock fallback (shown when live fetch fails) ───────────────────────────────

function getMockPrices(): ProcessedCommodity[] {
  const BASE = [
    { id: 'wheat',   name: 'Wheat (Gehu)',      modal: 2350, min: 2200, max: 2490, msp: 2275, cat: 'Grains' as CommodityCategory,   emoji: '🌾' },
    { id: 'corn',    name: 'Maize (Makka)',      modal: 2150, min: 2020, max: 2280, msp: 2090, cat: 'Grains' as CommodityCategory,   emoji: '🌽' },
    { id: 'soybean', name: 'Soybean (Soyabean)', modal: 4700, min: 4500, max: 4900, msp: 4892, cat: 'Oilseeds' as CommodityCategory, emoji: '🫘' },
    { id: 'soyoil',  name: 'Soybean Oil',        modal: 9800, min: 9400, max: 10200, msp: null, cat: 'Oilseeds' as CommodityCategory, emoji: '🫚' },
    { id: 'cotton',  name: 'Cotton (Kapas)',      modal: 6800, min: 6500, max: 7100, msp: 7020, cat: 'Other' as CommodityCategory,   emoji: '🌱' },
    { id: 'sugar',   name: 'Sugar (Chini)',       modal: 3900, min: 3700, max: 4100, msp: null,  cat: 'Other' as CommodityCategory,   emoji: '🍬' },
    { id: 'oat',     name: 'Oat (Jai)',           modal: 3200, min: 3000, max: 3400, msp: null,  cat: 'Grains' as CommodityCategory,  emoji: '🌾' },
  ];
  return BASE.map((m, i) => {
    const range = m.max - m.min;
    return {
      id: m.id,
      commodity: m.name,
      variety: '— Demo prices —',
      state: 'National Market',
      district: '',
      market: 'Demo Data',
      arrivalDate: new Date().toLocaleDateString('en-IN'),
      minPrice: m.min,
      maxPrice: m.max,
      modalPrice: m.modal,
      msp: m.msp,
      priceChange: ((m.modal - m.min) / m.min) * 100,
      category: m.cat,
      emoji: m.emoji,
      trend: DAYS.map((day, j) => ({
        day,
        price: Math.round(m.min + range * (0.3 + (j / 6) * 0.7) + Math.sin(i + j * 1.3) * range * 0.1),
      })),
    };
  });
}

// ─── Main fetch function ──────────────────────────────────────────────────────

export async function fetchCommodityPrices(userState?: string): Promise<ProcessedCommodity[]> {
  const [usdInr, ...charts] = await Promise.all([
    fetchUsdInr(),
    ...COMMODITY_DEFS.map((def) => fetchYahooChart(def.symbol)),
  ]);

  const results: ProcessedCommodity[] = [];

  for (let i = 0; i < COMMODITY_DEFS.length; i++) {
    const def = COMMODITY_DEFS[i];
    const chart = charts[i];
    const price = chart?.chart?.result?.[0]?.meta?.regularMarketPrice;
    if (chart && typeof price === 'number' && price > 0) {
      results.push(buildCommodity(def, chart, usdInr as number, userState));
    }
  }

  return results.length > 0 ? results : getMockPrices();
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

// No API key required — uses Yahoo Finance (via CORS proxy) + frankfurter.app
export const hasDataGovKey = true;

export function useMandiPrices(userState?: string) {
  return useQuery({
    queryKey: ['commodity-prices', userState ?? 'all'],
    queryFn: () => fetchCommodityPrices(userState),
    staleTime: 10 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000, // futures update slower than spot markets
    retry: 1,
    placeholderData: getMockPrices,
  });
}
