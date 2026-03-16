import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import CropCard from '@/components/crops/CropCard';
import CropDetailSheet from '@/components/crops/CropDetailSheet';
import { mockCrops, type Crop } from '@/data/mockCrops';
import { Search } from 'lucide-react';

const categories = ['All', 'Rice', 'Wheat', 'Cotton', 'Vegetables'] as const;

export default function CropsPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('All');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = mockCrops.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || c.category === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchCrops')}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
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

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((crop) => (
          <CropCard
            key={crop.id}
            crop={crop}
            onViewDetails={(c) => {
              setSelectedCrop(c);
              setSheetOpen(true);
            }}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No crops found matching your search.</p>
      )}

      <CropDetailSheet crop={selectedCrop} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
