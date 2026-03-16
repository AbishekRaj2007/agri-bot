import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/useLanguage';
import { mockCommodities, type Commodity, type CommodityCategory } from '@/data/mockMarket';
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CATEGORIES: (CommodityCategory | 'All')[] = [
  'All',
  'Grains',
  'Vegetables',
  'Oilseeds',
  'Pulses',
  'Spices',
];

function ChangeChip({ value }: { value: number }) {
  if (value > 0)
    return (
      <span className="flex items-center gap-1 text-emerald-600 font-medium text-sm">
        <TrendingUp className="w-3.5 h-3.5" />+{value.toFixed(1)}%
      </span>
    );
  if (value < 0)
    return (
      <span className="flex items-center gap-1 text-destructive font-medium text-sm">
        <TrendingDown className="w-3.5 h-3.5" />{value.toFixed(1)}%
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-muted-foreground font-medium text-sm">
      <Minus className="w-3.5 h-3.5" />0%
    </span>
  );
}

export default function MarketPage() {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CommodityCategory | 'All'>('All');
  const [selected, setSelected] = useState<Commodity>(mockCommodities[0]);

  const filtered = mockCommodities.filter((c) => {
    const name = language === 'hi' ? c.nameHi : c.name;
    const matchSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || c.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="font-display text-2xl font-bold">{t('marketTitle')}</h1>
        <p className="text-xs text-muted-foreground">
          {t('lastUpdated')}: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 w-full">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commodity list */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No commodities found.</p>
          )}
          {filtered.map((c) => {
            const name = language === 'hi' ? c.nameHi : c.name;
            const isSelected = selected.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                className={`card-agri p-4 cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-border'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl">{c.emoji}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.mandi}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{t('currentPrice')}</p>
                      <p className="font-display font-bold text-foreground">
                        ₹{c.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                    {c.msp !== null && (
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground">{t('mspPrice')}</p>
                        <p className="text-sm font-medium text-foreground">
                          ₹{c.msp.toLocaleString('en-IN')}
                        </p>
                      </div>
                    )}
                    <div className="text-right w-20">
                      <ChangeChip value={c.change} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trend chart */}
        <div className="space-y-4">
          <Card className="card-agri sticky top-6">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <span>{selected.emoji}</span>
                <span>{language === 'hi' ? selected.nameHi : selected.name}</span>
              </CardTitle>
              <div className="flex gap-4 pt-1">
                <div>
                  <p className="text-xs text-muted-foreground">{t('currentPrice')}</p>
                  <p className="font-display font-bold text-xl">
                    ₹{selected.price.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('perQuintal')}</p>
                </div>
                {selected.msp !== null && (
                  <div>
                    <p className="text-xs text-muted-foreground">{t('mspPrice')}</p>
                    <p className="font-semibold text-xl">
                      ₹{selected.msp.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('perQuintal')}</p>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">{t('priceHistory')}</p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selected.trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="day"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}k`}
                      width={48}
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
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs text-muted-foreground">
                <span>{t('mandi')}: {selected.mandi}</span>
                <Badge variant="outline" className="text-xs rounded-full">{selected.category}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
