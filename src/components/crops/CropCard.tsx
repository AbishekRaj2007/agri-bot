import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import type { Crop } from '@/data/mockCrops';

interface Props {
  crop: Crop;
  onViewDetails: (crop: Crop) => void;
}

export default function CropCard({ crop, onViewDetails }: Props) {
  const { t } = useLanguage();

  return (
    <div className="card-agri overflow-hidden flex flex-col">
      {/* Gradient header with emoji */}
      <div
        className="h-32 flex items-center justify-center text-5xl"
        style={{
          background: `linear-gradient(135deg, ${crop.gradientFrom}, ${crop.gradientTo})`,
        }}
      >
        {crop.emoji}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-display font-semibold text-foreground">{crop.name}</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge
            variant={crop.floodTolerance === 'High' ? 'default' : 'secondary'}
            className="rounded-full"
          >
            {crop.floodTolerance}
          </Badge>
          <Badge variant="outline" className="rounded-full text-xs">
            {crop.season}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{crop.regions.join(', ')}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t('yieldLabel')}: {crop.yield}
        </p>
        <div className="mt-auto pt-3">
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => onViewDetails(crop)}
          >
            {t('viewDetails')}
          </Button>
        </div>
      </div>
    </div>
  );
}
