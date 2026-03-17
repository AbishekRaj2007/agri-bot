import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  ShoppingBag, Search, MapPin, Phone, Package, Trash2,
  ShoppingCart, Users, TrendingDown, Globe, ChevronRight, X,
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useWarehouse, formatPrice, type WarehouseListing } from '@/hooks/useWarehouse';
import { cn } from '@/lib/utils';

// ── Demo listings (same data as WarehousePage marketplace) ───────────────────
const DEMO_LISTINGS: WarehouseListing[] = [
  {
    id: 'demo-1', farmerId: 'demo', farmerName: 'Ramesh Kumar',
    farmerPhone: '+91 94321 56789', farmerState: 'Punjab',
    cropName: 'HD 3226 Wheat', emoji: '🌿', category: 'Wheat',
    quantity: 120, unit: 'quintal', pricePerUnit: 2150, minOrderQty: 10,
    location: 'Ludhiana', description: 'Premium Rabi wheat, freshly harvested, moisture < 12%.',
    status: 'available', listedAt: '2026-03-01',
    gradientFrom: '#F4A261', gradientTo: '#E9C46A',
  },
  {
    id: 'demo-2', farmerId: 'demo', farmerName: 'Meena Devi',
    farmerPhone: '+91 87654 32109', farmerState: 'West Bengal',
    cropName: 'Swarna Sub-1 Rice', emoji: '🌾', category: 'Rice',
    quantity: 80, unit: 'quintal', pricePerUnit: 2100, minOrderQty: 5,
    location: 'Murshidabad', description: 'Flood-resistant Swarna Sub-1, Grade A quality, polished.',
    status: 'available', listedAt: '2026-02-28',
    gradientFrom: '#2D6A4F', gradientTo: '#52B788',
  },
  {
    id: 'demo-3', farmerId: 'demo', farmerName: 'Suresh Patel',
    farmerPhone: '+91 76543 21098', farmerState: 'Gujarat',
    cropName: 'Bunny BT Cotton', emoji: '🌱', category: 'Cotton',
    quantity: 50, unit: 'quintal', pricePerUnit: 6200, minOrderQty: 10,
    location: 'Surat', description: 'High staple-length cotton, suitable for textile mills.',
    status: 'available', listedAt: '2026-03-05',
    gradientFrom: '#E76F51', gradientTo: '#F4A261',
  },
  {
    id: 'demo-4', farmerId: 'demo', farmerName: 'Ravi Shankar',
    farmerPhone: '+91 98765 43210', farmerState: 'Uttar Pradesh',
    cropName: 'Yellow Maize', emoji: '🌽', category: 'Maize',
    quantity: 200, unit: 'quintal', pricePerUnit: 1850, minOrderQty: 20,
    location: 'Varanasi', description: 'Kharif maize, sun-dried, < 14% moisture, suitable for poultry feed.',
    status: 'available', listedAt: '2026-03-10',
    gradientFrom: '#F7B731', gradientTo: '#F9CA24',
  },
  {
    id: 'demo-5', farmerId: 'demo', farmerName: 'Anita Singh',
    farmerPhone: '+91 65432 10987', farmerState: 'Haryana',
    cropName: 'Mustard Seeds', emoji: '🌻', category: 'Oilseeds',
    quantity: 30, unit: 'quintal', pricePerUnit: 5400, minOrderQty: 5,
    location: 'Hisar', description: 'High-oil-content mustard, MSP-compliant pricing.',
    status: 'available', listedAt: '2026-03-08',
    gradientFrom: '#F9CA24', gradientTo: '#F0932B',
  },
  {
    id: 'demo-6', farmerId: 'demo', farmerName: 'Kaveri Reddy',
    farmerPhone: '+91 88776 65544', farmerState: 'Andhra Pradesh',
    cropName: 'Red Chilli', emoji: '🌶️', category: 'Spices',
    quantity: 15, unit: 'quintal', pricePerUnit: 18500, minOrderQty: 2,
    location: 'Guntur', description: 'Teja variety red chilli, high capsaicin content, export quality.',
    status: 'available', listedAt: '2026-03-12',
    gradientFrom: '#C0392B', gradientTo: '#E74C3C',
  },
  {
    id: 'demo-7', farmerId: 'demo', farmerName: 'Baldev Singh',
    farmerPhone: '+91 91234 56780', farmerState: 'Punjab',
    cropName: 'Basmati Rice', emoji: '🌾', category: 'Rice',
    quantity: 60, unit: 'quintal', pricePerUnit: 4800, minOrderQty: 5,
    location: 'Amritsar', description: '1121 Basmati, Extra Long Grain, certified organic.',
    status: 'available', listedAt: '2026-03-03',
    gradientFrom: '#2D6A4F', gradientTo: '#52B788',
  },
  {
    id: 'demo-8', farmerId: 'demo', farmerName: 'Lalitha Kumari',
    farmerPhone: '+91 77889 90011', farmerState: 'Tamil Nadu',
    cropName: 'Green Moong Dal', emoji: '🫛', category: 'Pulses',
    quantity: 40, unit: 'quintal', pricePerUnit: 7200, minOrderQty: 5,
    location: 'Madurai', description: 'Machine-cleaned green moong, <1% impurities, double-sorted.',
    status: 'available', listedAt: '2026-03-11',
    gradientFrom: '#27AE60', gradientTo: '#2ECC71',
  },
];

type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'quantity';

interface InquiryItem {
  listing: WarehouseListing;
  requestedQty: number;
}

// ── Small Stat Card ───────────────────────────────────────────────────────────
function StatBadge({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-xl p-4">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// ── Listing Card ─────────────────────────────────────────────────────────────
function ListingCard({
  listing,
  inCart,
  onAdd,
  onRemove,
}: {
  listing: WarehouseListing;
  inCart: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
      {/* Gradient header */}
      <div
        className="h-20 flex items-center justify-between px-4"
        style={{
          background: `linear-gradient(135deg, ${listing.gradientFrom}, ${listing.gradientTo})`,
        }}
      >
        <div>
          <p className="text-white/80 text-xs font-medium">{listing.category}</p>
          <p className="text-white font-bold text-base leading-tight">{listing.cropName}</p>
        </div>
        <span className="text-3xl">{listing.emoji}</span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Farmer info */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
            {listing.farmerName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{listing.farmerName}</p>
            <p className="text-xs text-muted-foreground">{listing.farmerState}</p>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {formatPrice(listing.pricePerUnit, listing.unit)}
          </span>
          <Badge variant="outline" className="text-xs">
            <Package className="w-3 h-3 mr-1" />
            {listing.quantity} {listing.unit}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2">{listing.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
            <MapPin className="w-3 h-3" /> {listing.location}
          </span>
          <span className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full px-2 py-0.5">
            Min: {listing.minOrderQty} {listing.unit}
          </span>
        </div>

        {/* CTA */}
        <div className="mt-auto pt-1">
          {inCart ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full border-red-500 text-red-500 hover:bg-red-500/10"
              onClick={onRemove}
            >
              <X className="w-4 h-4 mr-1.5" />
              Remove from Cart
            </Button>
          ) : (
            <Button size="sm" className="w-full" onClick={onAdd}>
              <ShoppingCart className="w-4 h-4 mr-1.5" />
              Add to Inquiry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BuyersPage() {
  const { t } = useLanguage();
  const { listings: userListings } = useWarehouse();

  // Merge user listings (available only) with demo listings
  const allListings = useMemo(() => {
    const userAvailable = userListings.filter(l => l.status === 'available');
    return [...userAvailable, ...DEMO_LISTINGS];
  }, [userListings]);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('newest');

  // Inquiry cart
  const [cart, setCart] = useState<InquiryItem[]>([]);
  const [showContactDialog, setShowContactDialog] = useState(false);

  // Unique categories and states for filter dropdowns
  const categories = useMemo(() => {
    const cats = new Set(allListings.map(l => l.category));
    return Array.from(cats).sort();
  }, [allListings]);

  const states = useMemo(() => {
    const sts = new Set(allListings.map(l => l.farmerState));
    return Array.from(sts).sort();
  }, [allListings]);

  // Filtered + sorted listings
  const filtered = useMemo(() => {
    let result = allListings;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.cropName.toLowerCase().includes(q) ||
        l.farmerName.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.farmerState.toLowerCase().includes(q)
      );
    }

    if (filterCategory !== 'all') {
      result = result.filter(l => l.category === filterCategory);
    }

    if (filterState !== 'all') {
      result = result.filter(l => l.farmerState === filterState);
    }

    switch (sortKey) {
      case 'price_asc':
        result = [...result].sort((a, b) => a.pricePerUnit - b.pricePerUnit);
        break;
      case 'price_desc':
        result = [...result].sort((a, b) => b.pricePerUnit - a.pricePerUnit);
        break;
      case 'quantity':
        result = [...result].sort((a, b) => b.quantity - a.quantity);
        break;
      case 'newest':
      default:
        result = [...result].sort(
          (a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime()
        );
    }

    return result;
  }, [allListings, search, filterCategory, filterState, sortKey]);

  // Stats
  const statsListings = allListings.length;
  const statsStates  = new Set(allListings.map(l => l.farmerState)).size;
  const statsFarmers = new Set(allListings.map(l => l.farmerName)).size;
  const statsBestPrice = allListings.length
    ? Math.min(...allListings.map(l => l.pricePerUnit))
    : 0;
  const bestPriceListing = allListings.find(l => l.pricePerUnit === statsBestPrice);

  // Cart helpers
  const addToCart = (listing: WarehouseListing) => {
    setCart(prev => {
      if (prev.some(i => i.listing.id === listing.id)) return prev;
      return [...prev, { listing, requestedQty: listing.minOrderQty }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.listing.id !== id));
  };

  const updateQty = (id: string, qty: number) => {
    setCart(prev =>
      prev.map(i =>
        i.listing.id === id
          ? { ...i, requestedQty: Math.max(i.listing.minOrderQty, Math.min(qty, i.listing.quantity)) }
          : i
      )
    );
  };

  const cartTotal = cart.reduce(
    (sum, i) => sum + i.listing.pricePerUnit * i.requestedQty,
    0
  );

  const isInCart = (id: string) => cart.some(i => i.listing.id === id);

  // Group cart items by farmer for contact dialog
  const farmerGroups = useMemo(() => {
    const map = new Map<string, { farmerName: string; farmerPhone: string; items: InquiryItem[] }>();
    cart.forEach(item => {
      const key = item.listing.farmerId + item.listing.farmerName;
      if (!map.has(key)) {
        map.set(key, {
          farmerName: item.listing.farmerName,
          farmerPhone: item.listing.farmerPhone,
          items: [],
        });
      }
      map.get(key)!.items.push(item);
    });
    return Array.from(map.values());
  }, [cart]);

  return (
    <div className="flex h-full">
      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Page header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{t('buyersPageTitle')}</h1>
          </div>
          <p className="text-sm text-muted-foreground">{t('buyersPageSubtitle')}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatBadge icon={Package}    label="Crops Listed"     value={statsListings}               color="bg-primary" />
          <StatBadge icon={Users}      label="Farmers"          value={statsFarmers}                color="bg-emerald-500" />
          <StatBadge icon={Globe}      label="States"           value={statsStates}                 color="bg-violet-500" />
          <StatBadge
            icon={TrendingDown}
            label={`Best Price${bestPriceListing ? ` (${bestPriceListing.category})` : ''}`}
            value={statsBestPrice ? `₹${statsBestPrice.toLocaleString('en-IN')}` : '—'}
            color="bg-amber-500"
          />
        </div>

        {/* Wholesale notice */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex gap-3 items-start">
          <ShoppingBag className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            <strong>Wholesale marketplace:</strong> All purchases are direct farm-to-buyer. Minimum order quantities apply per listing. Contact farmers directly to negotiate delivery and payment terms.
          </p>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search crops, farmers, locations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category filter */}
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* State filter */}
          <Select value={filterState} onValueChange={setFilterState}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortKey} onValueChange={v => setSortKey(v as SortKey)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="quantity">Quantity: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          {filtered.length} listing{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Listings grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No crops match your filters.</p>
            <Button variant="link" onClick={() => { setSearch(''); setFilterCategory('all'); setFilterState('all'); }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                inCart={isInCart(listing.id)}
                onAdd={() => addToCart(listing)}
                onRemove={() => removeFromCart(listing.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Inquiry Cart sidebar ──────────────────────────────────────────── */}
      <aside className="w-80 flex-shrink-0 border-l border-border bg-card flex flex-col h-full overflow-hidden">
        {/* Cart header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Inquiry Cart</h2>
            {cart.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-auto p-1" onClick={() => setCart([])}>
              Clear all
            </Button>
          )}
        </div>

        {/* Cart body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10 px-4">
              <ShoppingCart className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Your inquiry cart is empty.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Add crops from the listings to get started.
              </p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.listing.id} className="bg-background border border-border rounded-lg p-3 space-y-2">
                {/* Crop name + remove */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-base leading-none">{item.listing.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.listing.cropName}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.listing.farmerName} · {item.listing.farmerState}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.listing.id)}
                    className="flex-shrink-0 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Qty adjuster */}
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground w-7 flex-shrink-0">Qty</Label>
                  <div className="flex items-center gap-1 flex-1">
                    <button
                      onClick={() => updateQty(item.listing.id, item.requestedQty - 1)}
                      disabled={item.requestedQty <= item.listing.minOrderQty}
                      className="w-6 h-6 rounded border border-border flex items-center justify-center text-sm font-bold hover:bg-muted disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="flex-1 text-center text-sm font-medium">
                      {item.requestedQty}
                    </span>
                    <button
                      onClick={() => updateQty(item.listing.id, item.requestedQty + 1)}
                      disabled={item.requestedQty >= item.listing.quantity}
                      className="w-6 h-6 rounded border border-border flex items-center justify-center text-sm font-bold hover:bg-muted disabled:opacity-40"
                    >
                      +
                    </button>
                    <span className="text-xs text-muted-foreground">{item.listing.unit}</span>
                  </div>
                </div>

                {/* Price per unit + subtotal */}
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{formatPrice(item.listing.pricePerUnit, item.listing.unit)}</span>
                  <span className="font-semibold text-foreground">
                    ₹{(item.listing.pricePerUnit * item.requestedQty).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-border space-y-3">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-muted-foreground">Estimated Total</span>
              <span className="text-foreground text-base">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Actual price is subject to negotiation with each farmer.
            </p>
            <Button
              className="w-full"
              onClick={() => setShowContactDialog(true)}
            >
              <Phone className="w-4 h-4 mr-2" />
              Contact All Sellers
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          </div>
        )}
      </aside>

      {/* ── Contact All Sellers dialog ───────────────────────────────────── */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Your Inquiry Summary
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {/* Order details table */}
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted text-muted-foreground text-xs uppercase">
                    <th className="text-left px-3 py-2">Crop</th>
                    <th className="text-right px-3 py-2">Qty</th>
                    <th className="text-right px-3 py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.listing.id} className="border-t border-border">
                      <td className="px-3 py-2">
                        <span>{item.listing.emoji} </span>
                        <span className="font-medium">{item.listing.cropName}</span>
                        <p className="text-xs text-muted-foreground">{item.listing.farmerName}</p>
                      </td>
                      <td className="px-3 py-2 text-right text-muted-foreground">
                        {item.requestedQty} {item.listing.unit}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">
                        ₹{(item.listing.pricePerUnit * item.requestedQty).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/50">
                    <td colSpan={2} className="px-3 py-2 font-bold text-foreground">Grand Total (Est.)</td>
                    <td className="px-3 py-2 text-right font-bold text-primary text-base">
                      ₹{cartTotal.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Farmer contacts */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Farmer Contacts</p>
              <div className="space-y-3">
                {farmerGroups.map(group => (
                  <div key={group.farmerName + group.farmerPhone} className="bg-background border border-border rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                        {group.farmerName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm">{group.farmerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {group.items.map(i => i.listing.cropName).join(', ')}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`tel:${group.farmerPhone}`}
                      className="flex items-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg px-3 py-2 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {group.farmerPhone}
                    </a>
                    <p className="text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      Pickup: {group.items.map(i => i.listing.location).join(' / ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
              <strong>Note:</strong> AgriShield connects buyers directly with farmers. All pricing and delivery terms are subject to direct negotiation. Ensure you verify crop quality before making payment.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
