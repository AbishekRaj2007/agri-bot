import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Store, Plus, Edit2, Trash2, Phone, MapPin, Package,
  Search, TrendingUp, ShoppingCart, CheckCircle2, Wheat, Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/context/AuthContext';
import { useMyCrops, computeStatus } from '@/hooks/useMyCrops';
import { useWarehouse, formatPrice, totalValue, type WarehouseListing, type ListingUnit } from '@/hooks/useWarehouse';
import { cn } from '@/lib/utils';

// ── Crop category presets (gradient colours, same as CropsPage) ────────────
const CROP_PRESETS = [
  { category: 'Rice',       emoji: '🌾', gradientFrom: '#2D6A4F', gradientTo: '#52B788' },
  { category: 'Wheat',      emoji: '🌿', gradientFrom: '#F4A261', gradientTo: '#E9C46A' },
  { category: 'Cotton',     emoji: '🌱', gradientFrom: '#E76F51', gradientTo: '#F4A261' },
  { category: 'Vegetables', emoji: '🍅', gradientFrom: '#E55039', gradientTo: '#E74C3C' },
  { category: 'Maize',      emoji: '🌽', gradientFrom: '#F7B731', gradientTo: '#F9CA24' },
  { category: 'Pulses',     emoji: '🫛', gradientFrom: '#27AE60', gradientTo: '#2ECC71' },
  { category: 'Sugarcane',  emoji: '🍃', gradientFrom: '#1ABC9C', gradientTo: '#16A085' },
  { category: 'Oilseeds',   emoji: '🌻', gradientFrom: '#F9CA24', gradientTo: '#F0932B' },
  { category: 'Spices',     emoji: '🌶️', gradientFrom: '#C0392B', gradientTo: '#E74C3C' },
  { category: 'Other',      emoji: '🌿', gradientFrom: '#6C5CE7', gradientTo: '#A29BFE' },
] as const;

const UNITS: { value: ListingUnit; label: string }[] = [
  { value: 'kg',      label: 'Kilograms (kg)' },
  { value: 'quintal', label: 'Quintal (100 kg)' },
  { value: 'ton',     label: 'Metric Ton (1000 kg)' },
];

// ── Sample listings from other farmers — always visible in Marketplace ──────
const SAMPLE_LISTINGS: WarehouseListing[] = [
  {
    id: 'sample-1', farmerId: 'sample', farmerName: 'Ramesh Kumar',
    farmerPhone: '+91 94321 56789', farmerState: 'Punjab',
    cropName: 'HD 3226 Wheat', emoji: '🌿', category: 'Wheat',
    quantity: 120, unit: 'quintal', pricePerUnit: 2150, minOrderQty: 10,
    location: 'Ludhiana', description: 'Premium Rabi wheat, freshly harvested, moisture < 12%.',
    status: 'available', listedAt: '2026-03-01',
    gradientFrom: '#F4A261', gradientTo: '#E9C46A',
  },
  {
    id: 'sample-2', farmerId: 'sample', farmerName: 'Meena Devi',
    farmerPhone: '+91 87654 32109', farmerState: 'West Bengal',
    cropName: 'Swarna Sub-1 Rice', emoji: '🌾', category: 'Rice',
    quantity: 80, unit: 'quintal', pricePerUnit: 2100, minOrderQty: 5,
    location: 'Murshidabad', description: 'Flood-resistant Swarna Sub-1, Grade A quality, polished.',
    status: 'available', listedAt: '2026-02-28',
    gradientFrom: '#2D6A4F', gradientTo: '#52B788',
  },
  {
    id: 'sample-3', farmerId: 'sample', farmerName: 'Suresh Patel',
    farmerPhone: '+91 76543 21098', farmerState: 'Gujarat',
    cropName: 'Bunny BT Cotton', emoji: '🌱', category: 'Cotton',
    quantity: 50, unit: 'quintal', pricePerUnit: 6200, minOrderQty: 10,
    location: 'Surat', description: 'High staple-length cotton, suitable for textile mills.',
    status: 'available', listedAt: '2026-03-05',
    gradientFrom: '#E76F51', gradientTo: '#F4A261',
  },
  {
    id: 'sample-4', farmerId: 'sample', farmerName: 'Ravi Shankar',
    farmerPhone: '+91 98765 43210', farmerState: 'Uttar Pradesh',
    cropName: 'Yellow Maize', emoji: '🌽', category: 'Maize',
    quantity: 200, unit: 'quintal', pricePerUnit: 1850, minOrderQty: 20,
    location: 'Varanasi', description: 'Kharif maize, sun-dried, < 14% moisture, suitable for poultry feed.',
    status: 'available', listedAt: '2026-03-10',
    gradientFrom: '#F7B731', gradientTo: '#F9CA24',
  },
  {
    id: 'sample-5', farmerId: 'sample', farmerName: 'Anita Singh',
    farmerPhone: '+91 65432 10987', farmerState: 'Haryana',
    cropName: 'Mustard Seeds', emoji: '🌻', category: 'Oilseeds',
    quantity: 30, unit: 'quintal', pricePerUnit: 5400, minOrderQty: 5,
    location: 'Hisar', description: 'High-oil-content mustard, MSP-compliant pricing.',
    status: 'available', listedAt: '2026-03-08',
    gradientFrom: '#F9CA24', gradientTo: '#F0932B',
  },
  {
    id: 'sample-6', farmerId: 'sample', farmerName: 'Kaveri Reddy',
    farmerPhone: '+91 88776 65544', farmerState: 'Andhra Pradesh',
    cropName: 'Red Chilli', emoji: '🌶️', category: 'Spices',
    quantity: 15, unit: 'quintal', pricePerUnit: 12500, minOrderQty: 2,
    location: 'Guntur', description: 'Guntur Sannam variety, sorted and dried, suitable for export.',
    status: 'available', listedAt: '2026-03-12',
    gradientFrom: '#C0392B', gradientTo: '#E74C3C',
  },
];

const ALL_CATEGORIES = ['All', ...Array.from(new Set(SAMPLE_LISTINGS.map(l => l.category)))];
const ALL_STATES = ['All States', ...Array.from(new Set(SAMPLE_LISTINGS.map(l => l.farmerState)))];

// ── Form factory ──────────────────────────────────────────────────────────────
const makeForm = () => ({
  cropName:     '',
  emoji:        '🌾',
  category:     'Rice',
  quantity:     '',
  unit:         'quintal' as ListingUnit,
  pricePerUnit: '',
  minOrderQty:  '',
  location:     '',
  description:  '',
  gradientFrom: '#2D6A4F',
  gradientTo:   '#52B788',
});

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// ══════════════════════════════════════════════════════════════════════════════
export default function WarehousePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { crops } = useMyCrops();
  const { listings, addListing, updateListing, removeListing, markAsSold } = useWarehouse();

  // My Listings tab state
  const [dialogOpen,  setDialogOpen]  = useState(false);
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [deleteId,    setDeleteId]    = useState<string | null>(null);
  const [form,        setForm]        = useState(makeForm);

  // Marketplace tab state
  const [search,        setSearch]        = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stateFilter,   setStateFilter]   = useState('All States');

  // Contact dialog
  const [contactListing, setContactListing] = useState<WarehouseListing | null>(null);

  // ── Derived data ──────────────────────────────────────────────────────────
  // Farmer's own listings only
  const myListings = listings.filter(l => l.farmerId === user?.id);
  const myActive   = myListings.filter(l => l.status === 'available');
  const myTotalVal = myActive.reduce((s, l) => s + totalValue(l), 0);

  // Harvested crops available for quick-pick
  const harvestedCrops = crops.filter(c => computeStatus(c) === 'harvested');

  // Marketplace: sample + own available listings, with filters applied
  const allAvailable = [
    ...SAMPLE_LISTINGS,
    ...listings.filter(l => l.status === 'available'),
  ].filter(l => {
    const matchSearch   = l.cropName.toLowerCase().includes(search.toLowerCase()) ||
                          l.farmerName.toLowerCase().includes(search.toLowerCase()) ||
                          l.location.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'All' || l.category === categoryFilter;
    const matchState    = stateFilter    === 'All States' || l.farmerState === stateFilter;
    return matchSearch && matchCategory && matchState;
  });

  // Update category filter options to include user's own categories too
  const dynamicCategories = ['All', ...Array.from(new Set([
    ...ALL_CATEGORIES.slice(1),
    ...listings.map(l => l.category),
  ]))];
  const dynamicStates = ['All States', ...Array.from(new Set([
    ...ALL_STATES.slice(1),
    ...listings.map(l => l.farmerState),
  ]))];

  // ── Dialog helpers ────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingId(null);
    setForm(makeForm());
    setDialogOpen(true);
  };

  const openEdit = (listing: WarehouseListing) => {
    setEditingId(listing.id);
    setForm({
      cropName:     listing.cropName,
      emoji:        listing.emoji,
      category:     listing.category,
      quantity:     String(listing.quantity),
      unit:         listing.unit,
      pricePerUnit: String(listing.pricePerUnit),
      minOrderQty:  String(listing.minOrderQty),
      location:     listing.location,
      description:  listing.description,
      gradientFrom: listing.gradientFrom,
      gradientTo:   listing.gradientTo,
    });
    setDialogOpen(true);
  };

  // Auto-fill form from a harvested crop
  const applyHarvestedCrop = (crop: { cropName: string; emoji: string; category: string; gradientFrom: string; gradientTo: string }) => {
    const preset = CROP_PRESETS.find(p => p.category === crop.category);
    setForm(f => ({
      ...f,
      cropName:     crop.cropName,
      emoji:        crop.emoji,
      category:     crop.category,
      gradientFrom: preset?.gradientFrom ?? crop.gradientFrom,
      gradientTo:   preset?.gradientTo   ?? crop.gradientTo,
    }));
  };

  const handleCategoryChange = (cat: string) => {
    const preset = CROP_PRESETS.find(p => p.category === cat);
    setForm(f => ({
      ...f,
      category:     cat,
      emoji:        preset?.emoji        ?? f.emoji,
      gradientFrom: preset?.gradientFrom ?? f.gradientFrom,
      gradientTo:   preset?.gradientTo   ?? f.gradientTo,
    }));
  };

  const handleSave = () => {
    if (!form.cropName.trim())                                    { toast.error('Crop name is required.');          return; }
    if (!form.quantity || Number(form.quantity) <= 0)             { toast.error('Enter a valid quantity.');         return; }
    if (!form.pricePerUnit || Number(form.pricePerUnit) <= 0)     { toast.error('Enter a valid price.');            return; }
    if (!form.minOrderQty || Number(form.minOrderQty) <= 0)       { toast.error('Enter a valid minimum order.');   return; }
    if (Number(form.minOrderQty) > Number(form.quantity))         { toast.error('Min order cannot exceed quantity.'); return; }
    if (!form.location.trim())                                    { toast.error('Location is required.');           return; }

    const data = {
      farmerId:     user?.id       ?? 'unknown',
      farmerName:   user?.fullName ?? 'Unknown Farmer',
      farmerPhone:  user?.phone    ?? 'Not provided',
      farmerState:  user?.state    ?? 'Unknown',
      cropName:     form.cropName.trim(),
      emoji:        form.emoji,
      category:     form.category,
      quantity:     Number(form.quantity),
      unit:         form.unit,
      pricePerUnit: Number(form.pricePerUnit),
      minOrderQty:  Number(form.minOrderQty),
      location:     form.location.trim(),
      description:  form.description.trim(),
      gradientFrom: form.gradientFrom,
      gradientTo:   form.gradientTo,
    };

    if (editingId) {
      updateListing(editingId, data);
      toast.success('Listing updated!');
    } else {
      addListing(data);
      toast.success(`${data.cropName} listed in the warehouse!`);
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    removeListing(deleteId);
    setDeleteId(null);
    toast.success('Listing removed.');
  };

  const handleMarkSold = (id: string, cropName: string) => {
    markAsSold(id);
    toast.success(`${cropName} marked as sold!`);
  };

  // ── Marketplace summary stats ─────────────────────────────────────────────
  const totalCropsAvailable = [...SAMPLE_LISTINGS, ...listings.filter(l => l.status === 'available')].length;
  const lowestPrice = [...SAMPLE_LISTINGS, ...listings.filter(l => l.status === 'available')]
    .reduce<number | null>((min, l) => (min === null || l.pricePerUnit < min) ? l.pricePerUnit : min, null);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Store className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{t('warehouse')}</h1>
          <p className="text-sm text-muted-foreground">
            List your harvested crops for wholesale buyers
          </p>
        </div>
      </div>

      <Tabs defaultValue="marketplace">
        <TabsList className="mb-6">
          <TabsTrigger value="marketplace" className="gap-2">
            <ShoppingCart className="w-4 h-4" />
            {t('marketplaceBuy')}
            <Badge variant="secondary" className="ml-1 rounded-full text-xs px-1.5 py-0">
              {totalCropsAvailable}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="my-listings" className="gap-2">
            <Package className="w-4 h-4" />
            {t('myListings')}
            {myActive.length > 0 && (
              <Badge variant="secondary" className="ml-1 rounded-full text-xs px-1.5 py-0">
                {myActive.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ══ MARKETPLACE TAB ══════════════════════════════════════════════ */}
        <TabsContent value="marketplace" className="space-y-6">

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard icon={<ShoppingCart className="w-5 h-5 text-primary" />}
              label="Crops Available" value={String(totalCropsAvailable)}
              bg="bg-primary/5 dark:bg-primary/10" />
            <StatCard icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
              label="Best Price"
              value={lowestPrice ? `₹${lowestPrice.toLocaleString('en-IN')}` : '—'}
              bg="bg-emerald-50 dark:bg-emerald-950/30" />
            <StatCard icon={<MapPin className="w-5 h-5 text-blue-500" />}
              label="States" value={String(dynamicStates.length - 1)}
              bg="bg-blue-50 dark:bg-blue-950/30" />
            <StatCard icon={<Wheat className="w-5 h-5 text-amber-600" />}
              label="Categories" value={String(dynamicCategories.length - 1)}
              bg="bg-amber-50 dark:bg-amber-950/30" />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by crop, farmer or location..."
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {dynamicCategories.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {dynamicStates.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Wholesale notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-sm">
            <Star className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-amber-800 dark:text-amber-300">
              All listings are <strong>wholesale only</strong>. Minimum order quantities apply.
              Contact the farmer directly to arrange payment and delivery.
            </p>
          </div>

          {/* Listing grid */}
          {allAvailable.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl">🏪</div>
              <p className="font-semibold text-foreground">{t('noMarketplaceMsg')}</p>
              <p className="text-xs text-muted-foreground">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {allAvailable.map(listing => (
                <MarketplaceCard
                  key={listing.id}
                  listing={listing}
                  isOwn={listing.farmerId === user?.id}
                  onContact={() => setContactListing(listing)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ══ MY LISTINGS TAB ══════════════════════════════════════════════ */}
        <TabsContent value="my-listings" className="space-y-6">

          {/* Summary bar */}
          {myListings.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatCard icon={<Package className="w-5 h-5 text-primary" />}
                label={t('activeListingsLabel')} value={String(myActive.length)}
                bg="bg-primary/5 dark:bg-primary/10" />
              <StatCard icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
                label={t('totalValueLabel')}
                value={`₹${myTotalVal.toLocaleString('en-IN')}`}
                bg="bg-emerald-50 dark:bg-emerald-950/30" />
              <StatCard icon={<CheckCircle2 className="w-5 h-5 text-gray-500" />}
                label="Sold" value={String(myListings.length - myActive.length)}
                bg="bg-gray-50 dark:bg-gray-900/30" />
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {myListings.length === 0
                ? 'Start selling your harvested crops in wholesale.'
                : `${myListings.length} listing${myListings.length > 1 ? 's' : ''} total`}
            </p>
            <Button onClick={openAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              {t('addListingBtn')}
            </Button>
          </div>

          {/* Empty state */}
          {myListings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl">🏪</div>
              <div>
                <p className="font-semibold text-foreground text-lg">No listings yet</p>
                <p className="text-muted-foreground text-sm mt-1 max-w-sm">{t('noListingsMsg')}</p>
              </div>
              <Button onClick={openAdd} size="lg" className="gap-2 mt-2">
                <Plus className="w-4 h-4" />
                {t('addListingBtn')}
              </Button>
            </div>
          )}

          {/* My listing cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {myListings.map(listing => (
              <MyListingCard
                key={listing.id}
                listing={listing}
                t={t}
                onEdit={() => openEdit(listing)}
                onDelete={() => setDeleteId(listing.id)}
                onMarkSold={() => handleMarkSold(listing.id, listing.cropName)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Add / Edit Listing Dialog ───────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingId ? t('editListingTitle') : t('addListingTitle')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Quick pick from harvested crops */}
            {harvestedCrops.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">{t('pickHarvestedLabel')}</Label>
                <div className="flex gap-2 flex-wrap">
                  {harvestedCrops.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => applyHarvestedCrop(c)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors',
                        form.cropName === c.cropName
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted/40 hover:bg-muted border-border'
                      )}
                    >
                      <span>{c.emoji}</span>
                      <span className="max-w-[100px] truncate">{c.cropName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={cn('space-y-4', harvestedCrops.length > 0 && 'border-t pt-4')}>
              {/* Crop name */}
              <div>
                <Label htmlFor="cropName">{t('cropNameLabel')} *</Label>
                <div className="flex gap-2 mt-1">
                  <span className="text-2xl px-2 py-1 border rounded-md bg-muted/40 flex items-center">{form.emoji}</span>
                  <Input
                    id="cropName"
                    value={form.cropName}
                    onChange={e => setForm(f => ({ ...f, cropName: e.target.value }))}
                    placeholder="e.g. Basmati Rice"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <Label>{t('categoryLabel')} *</Label>
                <Select value={form.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CROP_PRESETS.map(p => (
                      <SelectItem key={p.category} value={p.category}>
                        {p.emoji} {p.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity + Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="quantity">{t('quantityLabel')} *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                    placeholder="e.g. 50"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t('unitLabel')}</Label>
                  <Select value={form.unit} onValueChange={(v: ListingUnit) => setForm(f => ({ ...f, unit: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map(u => (
                        <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price + Min order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="price">{t('pricePerUnitLabel')} *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="1"
                    value={form.pricePerUnit}
                    onChange={e => setForm(f => ({ ...f, pricePerUnit: e.target.value }))}
                    placeholder="e.g. 2100"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="minOrder">{t('minOrderLabel')} *</Label>
                  <Input
                    id="minOrder"
                    type="number"
                    min="1"
                    value={form.minOrderQty}
                    onChange={e => setForm(f => ({ ...f, minOrderQty: e.target.value }))}
                    placeholder="e.g. 5"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location">{t('listingLocationLabel')} *</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Ludhiana, Punjab"
                  className="mt-1"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="desc">{t('notesOptional')}</Label>
                <Textarea
                  id="desc"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Quality details, moisture content, packaging, transport availability..."
                  className="mt-1 resize-none"
                  rows={2}
                />
              </div>

              {/* Live price preview */}
              {form.quantity && form.pricePerUnit && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                  <span className="text-muted-foreground">Total stock value</span>
                  <span className="font-semibold text-primary">
                    ₹{(Number(form.quantity) * Number(form.pricePerUnit)).toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      ({form.quantity} {form.unit} × ₹{Number(form.pricePerUnit).toLocaleString('en-IN')})
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {t('saveListingBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ─────────────────────────────────────────── */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Listing?</AlertDialogTitle>
            <AlertDialogDescription>{t('confirmRemoveListing')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Contact seller dialog ───────────────────────────────────────── */}
      <Dialog open={!!contactListing} onOpenChange={open => !open && setContactListing(null)}>
        {contactListing && (
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display">{t('contactDetailsTitle')}</DialogTitle>
            </DialogHeader>

            {/* Crop summary */}
            <div
              className="rounded-xl p-4 text-white mb-2"
              style={{ background: `linear-gradient(135deg, ${contactListing.gradientFrom}, ${contactListing.gradientTo})` }}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{contactListing.emoji}</span>
                <div>
                  <p className="font-display font-bold text-lg">{contactListing.cropName}</p>
                  <p className="text-white/80 text-sm">
                    {contactListing.quantity} {contactListing.unit} · {formatPrice(contactListing.pricePerUnit, contactListing.unit)}
                  </p>
                </div>
              </div>
            </div>

            {/* Farmer details */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {contactListing.farmerName.split(' ').map(w => w[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{contactListing.farmerName}</p>
                  <p className="text-xs text-muted-foreground">{contactListing.farmerState}</p>
                </div>
              </div>

              <a
                href={`tel:${contactListing.farmerPhone}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm group-hover:underline">
                    {contactListing.farmerPhone}
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pickup Location</p>
                  <p className="font-medium text-foreground text-sm">{contactListing.location}, {contactListing.farmerState}</p>
                </div>
              </div>

              {/* Wholesale terms */}
              <div className="p-3 rounded-lg border border-dashed border-border/60 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground text-sm">Order Terms</p>
                <p>Min. order: <strong className="text-foreground">{contactListing.minOrderQty} {contactListing.unit}</strong></p>
                <p>Price: <strong className="text-foreground">{formatPrice(contactListing.pricePerUnit, contactListing.unit)}</strong></p>
                {contactListing.description && <p className="pt-1 italic">{contactListing.description}</p>}
              </div>
            </div>

            <DialogFooter>
              <Button className="w-full gap-2" onClick={() => setContactListing(null)}>
                <CheckCircle2 className="w-4 h-4" />
                Got it
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, bg }: {
  icon: React.ReactNode; label: string; value: string; bg: string;
}) {
  return (
    <div className={cn('rounded-xl p-4 flex items-center gap-3', bg)}>
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold text-foreground text-sm">{value}</p>
      </div>
    </div>
  );
}

// ── Marketplace card (buyer view) ─────────────────────────────────────────────
function MarketplaceCard({ listing, isOwn, onContact }: {
  listing: WarehouseListing;
  isOwn: boolean;
  onContact: () => void;
}) {
  const stockPct = Math.min(100, (listing.quantity / 200) * 100);

  return (
    <div className="card-agri overflow-hidden flex flex-col group">
      {/* Gradient header */}
      <div
        className="h-20 flex items-center justify-between px-4 relative"
        style={{ background: `linear-gradient(135deg, ${listing.gradientFrom}, ${listing.gradientTo})` }}
      >
        <span className="text-4xl drop-shadow">{listing.emoji}</span>
        <div className="flex flex-col items-end gap-1">
          <Badge className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm">
            {listing.category}
          </Badge>
          {isOwn && (
            <Badge className="bg-primary/80 text-white border-0 text-xs">
              Your listing
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-2.5">
        {/* Crop + farmer */}
        <div>
          <h3 className="font-display font-semibold text-foreground leading-tight">{listing.cropName}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-xs text-muted-foreground">{listing.farmerName}</span>
            <span className="text-muted-foreground/40 text-xs">·</span>
            <span className="text-xs text-muted-foreground">{listing.farmerState}</span>
          </div>
        </div>

        {/* Price highlight */}
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-primary">
            ₹{listing.pricePerUnit.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-muted-foreground">/ {listing.unit}</span>
        </div>

        {/* Stock quantity bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Available</span>
            <span className="font-medium text-foreground">{listing.quantity} {listing.unit}</span>
          </div>
          <Progress value={stockPct} className="h-1.5" />
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">
            <Package className="w-3 h-3" />
            Min {listing.minOrderQty} {listing.unit}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {listing.location}
          </span>
        </div>

        {/* Description snippet */}
        {listing.description && (
          <p className="text-xs text-muted-foreground italic line-clamp-2">{listing.description}</p>
        )}

        {/* Listed date */}
        <p className="text-xs text-muted-foreground">Listed {fmtDate(listing.listedAt)}</p>

        {/* CTA */}
        <Button
          size="sm"
          className="mt-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={onContact}
        >
          <Phone className="w-3.5 h-3.5" />
          Contact Seller
        </Button>
      </div>
    </div>
  );
}

// ── My listing card (farmer/seller view) ──────────────────────────────────────
function MyListingCard({ listing, t, onEdit, onDelete, onMarkSold }: {
  listing: WarehouseListing;
  t: (key: string) => string;
  onEdit: () => void;
  onDelete: () => void;
  onMarkSold: () => void;
}) {
  const isSold = listing.status === 'sold';

  return (
    <div className={cn('card-agri overflow-hidden flex flex-col', isSold && 'opacity-60')}>
      {/* Gradient header */}
      <div
        className="h-20 flex items-center justify-between px-4"
        style={{ background: `linear-gradient(135deg, ${listing.gradientFrom}, ${listing.gradientTo})` }}
      >
        <span className="text-4xl drop-shadow">{listing.emoji}</span>
        <Badge
          className={cn(
            'text-xs font-semibold border-0',
            isSold
              ? 'bg-gray-500/80 text-white'
              : 'bg-emerald-600/90 text-white'
          )}
        >
          {isSold ? t('soldTag') : t('availableTag')}
        </Badge>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-2">
        {/* Name */}
        <div>
          <h3 className="font-display font-semibold text-foreground">{listing.cropName}</h3>
          <p className="text-xs text-muted-foreground">{listing.category} · {listing.location}</p>
        </div>

        {/* Price + quantity */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-muted/40">
            <p className="text-muted-foreground">Price</p>
            <p className="font-semibold text-foreground">{formatPrice(listing.pricePerUnit, listing.unit)}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/40">
            <p className="text-muted-foreground">Stock</p>
            <p className="font-semibold text-foreground">{listing.quantity} {listing.unit}</p>
          </div>
        </div>

        {/* Total value */}
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-muted-foreground">Total value</span>
          <span className="font-semibold text-primary">
            ₹{totalValue(listing).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Min order + date */}
        <p className="text-xs text-muted-foreground">
          Min order: <strong className="text-foreground">{listing.minOrderQty} {listing.unit}</strong>
          <span className="mx-1.5">·</span>
          Listed {fmtDate(listing.listedAt)}
        </p>

        {listing.description && (
          <p className="text-xs text-muted-foreground italic line-clamp-1">{listing.description}</p>
        )}

        {/* Actions */}
        <div className="mt-auto pt-3 flex gap-2">
          {!isSold && (
            <>
              <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" onClick={onEdit}>
                <Edit2 className="w-3 h-3" />
                {t('editCropBtn')}
              </Button>
              <Button
                size="sm"
                className="flex-1 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                onClick={onMarkSold}
              >
                <CheckCircle2 className="w-3 h-3" />
                {t('markSoldBtn')}
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
