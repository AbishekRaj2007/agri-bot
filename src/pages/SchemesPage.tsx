import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useLanguage } from '@/hooks/useLanguage';
import { mockSchemes, type Scheme, type SchemeCategory } from '@/data/mockSchemes';
import { Search, CheckCircle2, ExternalLink, Phone, FileText, Clock } from 'lucide-react';

const CATEGORIES: (SchemeCategory | 'All')[] = [
  'All',
  'Income Support',
  'Insurance',
  'Credit',
  'Irrigation',
  'Subsidy',
  'Infrastructure',
];

const CATEGORY_COLOR: Record<SchemeCategory, string> = {
  'Income Support': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  Insurance: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Credit: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  Irrigation: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  Subsidy: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  Infrastructure: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
};

export default function SchemesPage() {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<SchemeCategory | 'All'>('All');
  const [selected, setSelected] = useState<Scheme | null>(null);

  const filtered = mockSchemes.filter((s) => {
    const name = language === 'hi' ? s.nameHi : s.name;
    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      s.ministry.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || s.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <h1 className="font-display text-2xl font-bold">{t('schemesTitle')}</h1>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchSchemes')}
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

      {/* Cards grid */}
      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No schemes found.</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((scheme) => {
          const name = language === 'hi' ? scheme.nameHi : scheme.name;
          const tagline = language === 'hi' ? scheme.taglineHi : scheme.tagline;
          const benefit = language === 'hi' ? scheme.benefitHi : scheme.benefit;
          return (
            <Card key={scheme.id} className="card-agri flex flex-col">
              <CardContent className="p-5 flex flex-col flex-1 gap-3">
                {/* Category + ministry */}
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLOR[scheme.category]}`}
                  >
                    {scheme.category}
                  </span>
                  <span className="text-xs text-muted-foreground text-right leading-tight">
                    {scheme.ministry}
                  </span>
                </div>

                {/* Name */}
                <div>
                  <h3 className="font-display font-bold text-base text-foreground">{name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tagline}</p>
                </div>

                {/* Key benefit */}
                <div className="bg-primary/5 rounded-xl p-3 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground leading-relaxed">{benefit}</p>
                </div>

                {/* Deadline */}
                {scheme.deadline && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    {scheme.deadline}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => setSelected(scheme)}
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                    {t('learnMore')}
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => window.open(scheme.applyUrl, '_blank', 'noopener noreferrer')}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    {t('applyNow')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="space-y-1 pb-4 border-b border-border">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLOR[selected.category]}`}
                  >
                    {selected.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{selected.ministry}</span>
                </div>
                <SheetTitle className="font-display text-xl">
                  {language === 'hi' ? selected.nameHi : selected.name}
                </SheetTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {language === 'hi' ? selected.taglineHi : selected.tagline}
                </p>
              </SheetHeader>

              <div className="mt-5 space-y-5">
                {/* Benefits */}
                <section>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {t('benefits')}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-primary/5 rounded-xl p-3">
                    {language === 'hi' ? selected.benefitHi : selected.benefit}
                  </p>
                </section>

                {/* Eligibility */}
                <section>
                  <h4 className="font-semibold text-sm mb-2">{t('eligibility')}</h4>
                  <ul className="space-y-1.5">
                    {(language === 'hi' ? selected.eligibilityHi : selected.eligibility).map(
                      (item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ),
                    )}
                  </ul>
                </section>

                {/* Documents */}
                <section>
                  <h4 className="font-semibold text-sm mb-2">{t('documentsRequired')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.documents.map((doc) => (
                      <Badge key={doc} variant="outline" className="rounded-full text-xs">
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </section>

                {/* How to apply */}
                <section>
                  <h4 className="font-semibold text-sm mb-2">{t('howToApply')}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selected.howToApply}
                  </p>
                </section>

                {/* Deadline + Helpline */}
                <div className="grid grid-cols-2 gap-3">
                  {selected.deadline && (
                    <div className="bg-muted/50 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">{t('deadline')}</p>
                      <p className="text-sm font-medium mt-0.5">{selected.deadline}</p>
                    </div>
                  )}
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">{t('helpline')}</p>
                    <p className="text-sm font-medium mt-0.5 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {selected.helpline}
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() =>
                    window.open(selected.applyUrl, '_blank', 'noopener noreferrer')
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('applyNow')}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
