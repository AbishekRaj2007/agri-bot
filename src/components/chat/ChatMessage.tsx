import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import type { ChatMessage as ChatMessageType } from '@/data/mockChat';
import { Leaf } from 'lucide-react';

interface Props {
  message: ChatMessageType;
}

function renderInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
  );
}

function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;

  function flushList() {
    if (listItems.length === 0) return;
    if (listType === 'ol') {
      nodes.push(<ol key={nodes.length} className="list-decimal ml-5 space-y-0.5 my-1">{listItems}</ol>);
    } else {
      nodes.push(<ul key={nodes.length} className="list-disc ml-5 space-y-0.5 my-1">{listItems}</ul>);
    }
    listItems = [];
    listType = null;
  }

  lines.forEach((line, i) => {
    const orderedMatch = line.match(/^(\d+)\.\s+(.*)/);
    const unorderedMatch = line.match(/^[-*]\s+(.*)/);

    if (orderedMatch) {
      if (listType !== 'ol') { flushList(); listType = 'ol'; }
      listItems.push(<li key={i}>{renderInline(orderedMatch[2])}</li>);
    } else if (unorderedMatch) {
      if (listType !== 'ul') { flushList(); listType = 'ul'; }
      listItems.push(<li key={i}>{renderInline(unorderedMatch[1])}</li>);
    } else {
      flushList();
      if (line.trim() === '') {
        nodes.push(<br key={i} />);
      } else {
        nodes.push(
          <span key={i} className="block">
            {renderInline(line)}
          </span>,
        );
      }
    }
  });
  flushList();
  return nodes;
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
          'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isAi
            ? 'bg-primary/10 text-foreground rounded-tl-sm'
            : 'bg-accent text-accent-foreground rounded-tr-sm'
        )}
      >
        {isAi ? renderMarkdown(text) : text}
        <p className={cn('text-xs mt-1.5', isAi ? 'text-muted-foreground' : 'text-accent-foreground/60')}>
          {message.timestamp}
        </p>
      </div>
    </div>
  );
}

