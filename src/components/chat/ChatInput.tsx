import { useState } from 'react';
import { Send, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/useLanguage';

interface Props {
  onSend: (message: string) => void;
}

export default function ChatInput({ onSend }: Props) {
  const [value, setValue] = useState('');
  const { t } = useLanguage();

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <div className="flex items-center gap-2 p-4 border-t border-border bg-background">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder={t('chatPlaceholder')}
        className="flex-1"
      />
      <Button size="icon" variant="ghost" className="flex-shrink-0">
        <Mic className="w-5 h-5" />
      </Button>
      <Button size="icon" onClick={handleSend} className="flex-shrink-0">
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
}
