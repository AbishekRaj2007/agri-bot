import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/hooks/useLanguage';
import CropCard from '@/components/crops/CropCard';
import CropDetailSheet from '@/components/crops/CropDetailSheet';
import { mockCrops, type Crop } from '@/data/mockCrops';
import {
  useMyCrops,
  type UserCrop,
  computeStatus,
  getProgress,
  getDaysToHarvest,
} from '@/hooks/useMyCrops';
import { Search, Plus, Edit2, Trash2, CheckCircle2, Sprout, Calendar, Wheat } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ── Preset categories ──────────────────────────────────────────────────────
const CROP_PRESETS = [
  { category: 'Rice',       emoji: '🌾', gradientFrom: '#2D6A4F', gradientTo: '#52B788', days: 120 },
  { category: 'Wheat',      emoji: '🌿', gradientFrom: '#F4A261', gradientTo: '#E9C46A', days: 135 },
  { category: 'Cotton',     emoji: '🌱', gradientFrom: '#E76F51', gradientTo: '#F4A261', days: 180 },
  { category: 'Vegetables', emoji: '🍅', gradientFrom: '#E55039', gradientTo: '#E74C3C', days: 60  },
  { category: 'Maize',      emoji: '🌽', gradientFrom: '#F7B731', gradientTo: '#F9CA24', days: 90  },
  { category: 'Pulses',     emoji: '🫛', gradientFrom: '#27AE60', gradientTo: '#2ECC71', days: 80  },
  { category: 'Sugarcane',  emoji: '🍃', gradientFrom: '#1ABC9C', gradientTo: '#16A085', days: 360 },
  { category: 'Other',      emoji: '🌿', gradientFrom: '#6C5CE7', gradientTo: '#A29BFE', days: 90  },
] as const;

const STATUS_STYLES: Record<UserCrop['status'], string> = {
  planted:   'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  growing:   'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  ready:     'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  harvested: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const addDays = (dateStr: string, days: number) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const fmtDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// ── Empty form factory ─────────────────────────────────────────────────────
const makeForm = () => {
  const today = new Date().toISOString().slice(0, 10);
  return {
    cropName: '',
    emoji: '🌾',
    category: 'Rice',
    fieldSize: '',
    plantingDate: today,
    expectedHarvestDate: addDays(today, 120),
    notes: '',
    gradientFrom: '#2D6A4F',
    gradientTo: '#52B788',
  };
};

// ── Crop categories for browse filter ─────────────────────────────────────
const BROWSE_CATEGORIES = ['All', 'Rice', 'Wheat', 'Cotton', 'Vegetables'] as const;

// ══════════════════════════════════════════════════════════════════════════
export default function CropsPage() {
  const { t } = useLanguage();

  // My Crops state
  const { crops, addCrop, updateCrop, deleteCrop, markHarvested } = useMyCrops();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(makeForm);

  // Browse Varieties state
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('All');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // ── Dialog helpers ───────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingId(null);
    setForm(makeForm());
    setDialogOpen(true);
  };

  const openEdit = (crop: UserCrop) => {
    setEditingId(crop.id);
    setForm({
      cropName:             crop.cropName,
      emoji:                crop.emoji,
      category:             crop.category,
      fieldSize:            String(crop.fieldSize),
      plantingDate:         crop.plantingDate,
      expectedHarvestDate:  crop.expectedHarvestDate,
      notes:                crop.notes,
      gradientFrom:         crop.gradientFrom,
      gradientTo:           crop.gradientTo,
    });
    setDialogOpen(true);
  };

  const applyPreset = (category: string) => {
    const preset = CROP_PRESETS.find(p => p.category === category);
    if (!preset) return;
    setForm(f => ({
      ...f,
      category:            preset.category,
      emoji:               preset.emoji,
      gradientFrom:        preset.gradientFrom,
      gradientTo:          preset.gradientTo,
      expectedHarvestDate: addDays(f.plantingDate, preset.days),
    }));
  };

  const applyMockVariety = (crop: Crop) => {
    const preset = CROP_PRESETS.find(p => p.category === crop.category) ?? CROP_PRESETS[0];
    setForm(f => ({
      ...f,
      cropName:            crop.name,
      emoji:               crop.emoji,
      category:            crop.category,
      gradientFrom:        crop.gradientFrom,
      gradientTo:          crop.gradientTo,
      expectedHarvestDate: addDays(f.plantingDate, preset.days),
    }));
  };

  const handleCategoryChange = (cat: string) => {
    setForm(f => ({ ...f, category: cat }));
    applyPreset(cat);
  };

  const handlePlantingDateChange = (date: string) => {
    const preset = CROP_PRESETS.find(p => p.category === form.category) ?? CROP_PRESETS[0];
    setForm(f => ({
      ...f,
      plantingDate:        date,
      expectedHarvestDate: addDays(date, preset.days),
    }));
  };

  const handleSave = () => {
    if (!form.cropName.trim()) {
      toast.error('Please enter a crop name.');
      return;
    }
    if (!form.fieldSize || isNaN(Number(form.fieldSize)) || Number(form.fieldSize) <= 0) {
      toast.error('Please enter a valid field size.');
      return;
    }
    if (!form.plantingDate || !form.expectedHarvestDate) {
      toast.error('Please enter both dates.');
      return;
    }
    const data = {
      cropName:            form.cropName.trim(),
      emoji:               form.emoji,
      category:            form.category,
      fieldSize:           Number(form.fieldSize),
      plantingDate:        form.plantingDate,
      expectedHarvestDate: form.expectedHarvestDate,
      notes:               form.notes,
      gradientFrom:        form.gradientFrom,
      gradientTo:          form.gradientTo,
    };
    if (editingId) {
      updateCrop(editingId, data);
      toast.success('Crop updated!');
    } else {
      addCrop(data);
      toast.success('Crop added!');
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteCrop(deleteId);
    setDeleteId(null);
    toast.success('Crop removed.');
  };

  const handleMarkHarvested = (id: string, name: string) => {
    markHarvested(id);
    toast.success(`${name} marked as harvested!`);
  };

  // ── Summary stats ────────────────────────────────────────────────────────
  const activeCrops  = crops.filter(c => computeStatus(c) !== 'harvested');
  const readyCrops   = crops.filter(c => computeStatus(c) === 'ready');
  const totalAcres   = activeCrops.reduce((sum, c) => sum + c.fieldSize, 0);
  const nextHarvest  = activeCrops
    .filter(c => computeStatus(c) !== 'harvested')
    .sort((a, b) => new Date(a.expectedHarvestDate).getTime() - new Date(b.expectedHarvestDate).getTime())[0];

  // ── Browse filter ────────────────────────────────────────────────────────
  const filtered = mockCrops.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || c.category === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Tabs defaultValue="my-crops">
        <TabsList className="mb-6">
          <TabsTrigger value="my-crops" className="gap-2">
            <Sprout className="w-4 h-4" />
            {t('myCropsTab')}
            {activeCrops.length > 0 && (
              <Badge variant="secondary" className="ml-1 rounded-full text-xs px-1.5 py-0">
                {activeCrops.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="browse" className="gap-2">
            <Wheat className="w-4 h-4" />
            {t('browseVarieties')}
          </TabsTrigger>
        </TabsList>

        {/* ══ MY CROPS TAB ══════════════════════════════════════════════════ */}
        <TabsContent value="my-crops" className="space-y-6">
          {/* Summary bar */}
          {crops.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <SummaryCard
                icon={<Sprout className="w-5 h-5 text-emerald-600" />}
                label={t('activeCrops')}
                value={String(activeCrops.length)}
                bg="bg-emerald-50 dark:bg-emerald-950/30"
              />
              <SummaryCard
                icon={<span className="text-lg">🌾</span>}
                label={t('totalAreaLabel')}
                value={`${totalAcres.toFixed(1)} ${t('acresUnit')}`}
                bg="bg-blue-50 dark:bg-blue-950/30"
              />
              <SummaryCard
                icon={<Calendar className="w-5 h-5 text-amber-600" />}
                label={t('nextHarvestLabel')}
                value={nextHarvest ? fmtDate(nextHarvest.expectedHarvestDate) : '—'}
                bg="bg-amber-50 dark:bg-amber-950/30"
              />
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center justify-between">
            <div>
              {readyCrops.length > 0 && (
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white rounded-full gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {readyCrops.length} crop{readyCrops.length > 1 ? 's' : ''} ready to harvest
                </Badge>
              )}
            </div>
            <Button onClick={openAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              {t('addCropBtn')}
            </Button>
          </div>

          {/* Empty state */}
          {crops.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-4xl">
                🌱
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg">Start Tracking Your Fields</p>
                <p className="text-muted-foreground text-sm mt-1 max-w-sm">{t('noCropsMessage')}</p>
              </div>
              <Button onClick={openAdd} size="lg" className="gap-2 mt-2">
                <Plus className="w-4 h-4" />
                {t('addCropBtn')}
              </Button>
            </div>
          )}

          {/* Crop grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {crops.map(crop => {
              const status   = computeStatus(crop);
              const progress = getProgress(crop);
              const days     = getDaysToHarvest(crop);
              return (
                <UserCropCard
                  key={crop.id}
                  crop={crop}
                  status={status}
                  progress={progress}
                  days={days}
                  t={t}
                  onEdit={() => openEdit(crop)}
                  onDelete={() => setDeleteId(crop.id)}
                  onMarkHarvested={() => handleMarkHarvested(crop.id, crop.cropName)}
                />
              );
            })}
          </div>
        </TabsContent>

        {/* ══ BROWSE VARIETIES TAB ══════════════════════════════════════════ */}
        <TabsContent value="browse" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('searchCrops')}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {BROWSE_CATEGORIES.map(cat => (
                <Badge
                  key={cat}
                  className="cursor-pointer rounded-full"
                  variant={filter === cat ? 'default' : 'outline'}
                  onClick={() => setFilter(cat)}
                >
                  {cat === 'All' ? t('all') : cat}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(crop => (
              <CropCard
                key={crop.id}
                crop={crop}
                onViewDetails={c => { setSelectedCrop(c); setSheetOpen(true); }}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No crops found.</p>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Add / Edit Dialog ────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingId ? t('editCropTitle') : t('addCropTitle')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Quick variety picker */}
            <div>
              <Label className="text-sm font-medium mb-2 block">{t('pickVarietyLabel')}</Label>
              <div className="flex gap-2 flex-wrap">
                {mockCrops.map(mc => (
                  <button
                    key={mc.id}
                    type="button"
                    onClick={() => applyMockVariety(mc)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors',
                      form.cropName === mc.name
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/40 hover:bg-muted border-border'
                    )}
                  >
                    <span>{mc.emoji}</span>
                    <span className="max-w-[90px] truncate">{mc.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              {/* Crop name + emoji preview */}
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

              {/* Field size */}
              <div>
                <Label htmlFor="fieldSize">{t('fieldSizeAcres')} *</Label>
                <Input
                  id="fieldSize"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={form.fieldSize}
                  onChange={e => setForm(f => ({ ...f, fieldSize: e.target.value }))}
                  placeholder="e.g. 2.5"
                  className="mt-1"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="plantingDate">{t('plantingDateLabel')} *</Label>
                  <Input
                    id="plantingDate"
                    type="date"
                    value={form.plantingDate}
                    onChange={e => handlePlantingDateChange(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="harvestDate">{t('harvestDateLabel')} *</Label>
                  <Input
                    id="harvestDate"
                    type="date"
                    value={form.expectedHarvestDate}
                    min={form.plantingDate}
                    onChange={e => setForm(f => ({ ...f, expectedHarvestDate: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">{t('notesOptional')}</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Fertilizer schedule, field notes..."
                  className="mt-1 resize-none"
                  rows={2}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{t('saveCropBtn')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ──────────────────────────────────────────── */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Crop?</AlertDialogTitle>
            <AlertDialogDescription>{t('confirmDeleteMsg')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CropDetailSheet crop={selectedCrop} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({ icon, label, value, bg }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
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

function UserCropCard({
  crop, status, progress, days, t, onEdit, onDelete, onMarkHarvested,
}: {
  crop: UserCrop;
  status: UserCrop['status'];
  progress: number;
  days: number;
  t: (key: string) => string;
  onEdit: () => void;
  onDelete: () => void;
  onMarkHarvested: () => void;
}) {
  const statusLabels: Record<UserCrop['status'], string> = {
    planted:   t('planted'),
    growing:   t('growing'),
    ready:     t('readyHarvest'),
    harvested: t('harvestedStatus'),
  };

  return (
    <div className="card-agri overflow-hidden flex flex-col">
      {/* Gradient header */}
      <div
        className="h-24 flex items-center justify-between px-4 relative"
        style={{ background: `linear-gradient(135deg, ${crop.gradientFrom}, ${crop.gradientTo})` }}
      >
        <span className="text-4xl drop-shadow">{crop.emoji}</span>
        <span className={cn('text-xs px-2.5 py-1 rounded-full font-semibold', STATUS_STYLES[status])}>
          {statusLabels[status]}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-2">
        {/* Name + category */}
        <div>
          <h3 className="font-display font-semibold text-foreground leading-tight">{crop.cropName}</h3>
          <p className="text-xs text-muted-foreground">{crop.category} · {crop.fieldSize} acres</p>
        </div>

        {/* Dates */}
        <div className="text-xs text-muted-foreground space-y-0.5">
          <div className="flex justify-between">
            <span>Planted</span>
            <span className="text-foreground font-medium">{fmtDate(crop.plantingDate)}</span>
          </div>
          {status === 'harvested' && crop.actualHarvestDate ? (
            <div className="flex justify-between">
              <span>{t('harvestedOnLabel')}</span>
              <span className="text-foreground font-medium">{fmtDate(crop.actualHarvestDate)}</span>
            </div>
          ) : (
            <div className="flex justify-between">
              <span>Harvest</span>
              <span className="text-foreground font-medium">{fmtDate(crop.expectedHarvestDate)}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        {status !== 'harvested' && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{t('growthProgressLabel')}</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
            <p className={cn('text-xs mt-1 font-medium', days < 0 ? 'text-red-500' : days <= 7 ? 'text-amber-600' : 'text-muted-foreground')}>
              {days < 0
                ? `${Math.abs(days)} ${t('daysOverdueLabel')}`
                : days === 0
                ? 'Harvest today!'
                : `${days} ${t('daysToHarvestLabel')}`}
            </p>
          </div>
        )}

        {/* Notes */}
        {crop.notes && (
          <p className="text-xs text-muted-foreground italic line-clamp-2">{crop.notes}</p>
        )}

        {/* Actions */}
        <div className="mt-auto pt-3 flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" onClick={onEdit}>
            <Edit2 className="w-3 h-3" />
            {t('editCropBtn')}
          </Button>
          {status !== 'harvested' && (
            <Button
              size="sm"
              className="flex-1 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0"
              onClick={onMarkHarvested}
            >
              <CheckCircle2 className="w-3 h-3" />
              Harvest
            </Button>
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
