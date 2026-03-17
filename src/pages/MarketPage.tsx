import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import {
  useMandiPrices,
  type ProcessedCommodity,
  type CommodityCategory,
} from '@/hooks/useMandiPrices';
import { useUserLocation } from '@/hooks/useUserLocation';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  AlertCircle,
  MapPin,
  Calendar,
  Info,
  Loader2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: (CommodityCategory | 'All')[] = [
  'All', 'Grains', 'Vegetables', 'Oilseeds', 'Pulses', 'Spices',
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChangeChip({ value }: { value: number }) {
  if (value > 0.05)
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
        <TrendingUp className="w-3 h-3" />+{value.toFixed(1)}%
      </span>
    );
  if (value < -0.05)
    return (
      <span className="inline-flex items-center gap-1 text-destructive font-semibold text-xs">
        <TrendingDown className="w-3 h-3" />{value.toFixed(1)}%
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground font-semibold text-xs">
      <Minus className="w-3 h-3" />0%
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="card-agri p-4 animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 bg-muted rounded" />
            <div className="h-3 w-32 bg-muted rounded" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="space-y-1.5 text-right">
            <div className="h-3 w-12 bg-muted rounded" />
            <div className="h-4 w-16 bg-muted rounded" />
          </div>
          <div className="h-3.5 w-12 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

function SkeletonPanel() {
  return (
    <div className="card-agri p-6 space-y-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted" />
        <div className="space-y-1.5 flex-1">
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="h-3 w-24 bg-muted rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-12 bg-muted rounded" />
            <div className="h-6 w-20 bg-muted rounded" />
          </div>
        ))}
      </div>
      <div className="h-52 bg-muted rounded-xl" />
      <div className="h-3 w-full bg-muted rounded" />
    </div>
  );
}

interface CommodityCardProps {
  commodity: ProcessedCommodity;
  isSelected: boolean;
  onClick: () => void;
}

function CommodityCard({ commodity: c, isSelected, onClick }: CommodityCardProps) {
  return (
    <div
      onClick={onClick}
      className={`card-agri p-4 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-primary shadow-md'
          : 'hover:ring-1 hover:ring-primary/40 hover:shadow-sm hover:-translate-y-0.5'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: icon + name + location */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl shrink-0">{c.emoji}</span>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate leading-tight">
              {c.commodity}
            </p>
            {c.variety && (
              <p className="text-xs text-muted-foreground truncate">{c.variety}</p>
            )}
            <p className="text-xs text-muted-foreground flex items-center gap-0.5 mt-0.5 truncate">
              <MapPin className="w-2.5 h-2.5 shrink-0" />
              {c.market}{c.state ? `, ${c.state}` : ''}
            </p>
          </div>
        </div>

        {/* Right: prices + change */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Modal</p>
            <p className="font-display font-bold text-foreground text-sm">
              ₹{c.modalPrice.toLocaleString('en-IN')}
            </p>
          </div>
          {c.msp !== null && (
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">MSP</p>
              <p className="text-sm font-medium text-foreground">
                ₹{c.msp.toLocaleString('en-IN')}
              </p>
            </div>
          )}
          <div className="w-16 text-right">
            <ChangeChip value={c.priceChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface DetailsPanelProps {
  commodity: ProcessedCommodity;
}

function DetailsPanel({ commodity: c }: DetailsPanelProps) {
  const { t } = useLanguage();
  const aboveMsp = c.msp !== null && c.modalPrice >= c.msp;

  return (
    <Card className="card-agri sticky top-6">
      <CardHeader className="pb-3">
        {/* Title */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{c.emoji}</span>
            <div>
              <CardTitle className="font-display text-lg leading-tight">{c.commodity}</CardTitle>
              {c.variety && (
                <p className="text-xs text-muted-foreground">{c.variety}</p>
              )}
            </div>
          </div>
          <Badge variant="outline" className="rounded-full text-xs shrink-0">
            {c.category}
          </Badge>
        </div>

        {/* Price trio */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="rounded-xl bg-primary/8 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Modal</p>
            <p className="font-display font-bold text-lg text-foreground">
              ₹{c.modalPrice.toLocaleString('en-IN')}
            </p>
            <ChangeChip value={c.priceChange} />
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Min</p>
            <p className="font-display font-semibold text-lg">
              ₹{c.minPrice.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Max</p>
            <p className="font-display font-semibold text-lg">
              ₹{c.maxPrice.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* MSP comparison */}
        {c.msp !== null && (
          <div
            className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm mt-2 ${
              aboveMsp
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-destructive/8 text-destructive'
            }`}
          >
            <span className="font-medium">
              MSP: ₹{c.msp.toLocaleString('en-IN')} / quintal
            </span>
            <span className="text-xs font-semibold">
              {aboveMsp
                ? `▲ ₹${(c.modalPrice - c.msp).toLocaleString('en-IN')} above`
                : `▼ ₹${(c.msp - c.modalPrice).toLocaleString('en-IN')} below`}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 7-Day Trend Chart */}
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-2">{t('priceHistory')}</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={c.trend} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`
                  }
                  width={52}
                />
                <Tooltip
                  formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Price']}
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                {c.msp && (
                  <ReferenceLine
                    y={c.msp}
                    stroke="hsl(var(--primary))"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: 'MSP', position: 'right', fontSize: 9, fill: 'hsl(var(--primary))' }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'hsl(var(--primary))' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mandi details */}
        <div className="border-t border-border pt-3 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {[c.market, c.district, c.state].filter(Boolean).join(' · ')}
            </span>
          </div>
          {c.arrivalDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Arrival: {c.arrivalDate}</span>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
            <Info className="w-3 h-3 shrink-0" />
            Prices based on CBOT/ICE commodity futures · Converted to ₹ using live USD/INR rate
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MarketPage() {
  const { t } = useLanguage();
  const { location, isLocating } = useUserLocation();

  const { data, isLoading, isFetching, isError, error, dataUpdatedAt, refetch } =
    useMandiPrices(location?.state ?? undefined);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CommodityCategory | 'All'>('All');
  const [selected, setSelected] = useState<ProcessedCommodity | null>(null);

  // Auto-select first item when data loads or location changes
  useEffect(() => {
    setSelected(null);
  }, [location?.state]);

  useEffect(() => {
    if (data && data.length > 0 && !selected) {
      setSelected(data[0]);
    }
  }, [data, selected]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((c) => {
      const matchSearch =
        c.commodity.toLowerCase().includes(search.toLowerCase()) ||
        c.market.toLowerCase().includes(search.toLowerCase()) ||
        c.state.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'All' || c.category === category;
      return matchSearch && matchCat;
    });
  }, [data, search, category]);

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Top bar ── */}
      <div className="px-6 pt-6 pb-4 space-y-4 bg-background border-b border-border">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl font-bold">{t('marketTitle')}</h1>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('lastUpdated')}: {lastUpdated}
                <span className="ml-2 text-primary/70">· Live commodity futures</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Location chip */}
            {isLocating ? (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Detecting location…
              </div>
            ) : location?.state ? (
              <div className="flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary rounded-full px-3 py-1.5">
                <MapPin className="w-3 h-3 shrink-0" />
                {location.city ? `${location.city}, ` : ''}{location.state}
              </div>
            ) : null}

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* API error */}
        {isError && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2.5 flex items-start gap-2 text-xs text-destructive">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            {(error as Error)?.message ?? 'Failed to fetch mandi prices. Showing cached data.'}
          </div>
        )}

        {/* Search + Category filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchCommodities')}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <Badge
                key={cat}
                className="cursor-pointer rounded-full"
                variant={category === cat ? 'default' : 'outline'}
                onClick={() => setCategory(cat)}
              >
                {cat === 'All' ? t('allCategories') : cat}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* ── Split panel ── */}
      <div className="flex flex-1 overflow-hidden gap-0">
        {/* Left — Commodity list */}
        <div className="w-full lg:w-[45%] overflow-y-auto p-4 space-y-2 border-r border-border">
          {isLoading && !data
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.length === 0
            ? (
              <p className="text-center text-muted-foreground py-16 text-sm">
                No commodities found.
              </p>
            )
            : filtered.map((c) => (
              <CommodityCard
                key={c.id}
                commodity={c}
                isSelected={selected?.id === c.id}
                onClick={() => setSelected(c)}
              />
            ))}

          {/* Record count */}
          {data && filtered.length > 0 && (
            <p className="text-center text-xs text-muted-foreground pt-2 pb-4">
              Showing {filtered.length} of {data.length} records
            </p>
          )}
        </div>

        {/* Right — Details panel */}
        <div className="hidden lg:block lg:w-[55%] overflow-y-auto p-4">
          {isLoading && !selected ? (
            <SkeletonPanel />
          ) : selected ? (
            <DetailsPanel commodity={selected} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Select a commodity to see details
            </div>
          )}
        </div>
      </div>

      {/* Mobile: selected details below list — shown as bottom card on small screens */}
      {selected && (
        <div className="lg:hidden border-t border-border overflow-y-auto max-h-[45vh] p-4">
          <DetailsPanel commodity={selected} />
        </div>
      )}
    </div>
  );
}
