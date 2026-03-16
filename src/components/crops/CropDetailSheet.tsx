import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/hooks/useLanguage';
import type { Crop } from '@/data/mockCrops';

interface Props {
  crop: Crop | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CropDetailSheet({ crop, open, onOpenChange }: Props) {
  const { t } = useLanguage();
  if (!crop) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <div
            className="h-40 rounded-2xl flex items-center justify-center text-6xl mb-4"
            style={{
              background: `linear-gradient(135deg, ${crop.gradientFrom}, ${crop.gradientTo})`,
            }}
          >
            {crop.emoji}
          </div>
          <SheetTitle className="font-display text-xl">{crop.name}</SheetTitle>
          <SheetDescription>{crop.description}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant={crop.floodTolerance === 'High' ? 'default' : 'secondary'} className="rounded-full">
              {t('floodTolerance')}: {crop.floodTolerance}
            </Badge>
            <Badge variant="outline" className="rounded-full">{crop.season}</Badge>
            {crop.regions.map((r) => (
              <Badge key={r} variant="outline" className="rounded-full">{r}</Badge>
            ))}
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm mb-2">{t('yieldLabel')}</h4>
            <p className="text-sm text-muted-foreground">{crop.yield}</p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm mb-2">{t('plantingInstructions')}</h4>
            <p className="text-sm text-muted-foreground">{crop.plantingInstructions}</p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm mb-2">{t('costBenefit')}</h4>
            <p className="text-sm text-muted-foreground">{crop.costBenefit}</p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm mb-2">{t('successRate')}</h4>
            <div className="flex items-center gap-3">
              <Progress value={crop.successRate} className="flex-1" />
              <span className="text-sm font-semibold text-foreground">{crop.successRate}%</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
