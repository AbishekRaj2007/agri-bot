import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import type { ChatMessage as ChatMessageType } from '@/data/mockChat';
import { Leaf } from 'lucide-react';

interface Props {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: Props) {
  const { language } = useLanguage();
  const isAi = message.sender === 'ai';
  const text = language === 'hi' && message.textHi ? message.textHi : message.text;

  return (
    <div className={cn('flex gap-3 animate-fade-in', isAi ? 'justify-start' : 'justify-end')}>
      {isAi && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
          <Leaf className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
          isAi
            ? 'bg-primary/10 text-foreground rounded-tl-sm'
            : 'bg-accent text-accent-foreground rounded-tr-sm'
        )}
      >
        {text}
        <p className={cn('text-xs mt-1', isAi ? 'text-muted-foreground' : 'text-accent-foreground/60')}>
          {message.timestamp}
        </p>
      </div>
    </div>
  );
}
