import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import { mockChatMessages, type ChatMessage as ChatMessageType } from '@/data/mockChat';
import { Leaf } from 'lucide-react';

export default function ChatPage() {
  const { t, language, setLanguage } = useLanguage();
  const [messages, setMessages] = useState<ChatMessageType[]>(mockChatMessages);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    const userMsg: ChatMessageType = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Thank you for your question about "${text}". Based on current data for your region, I recommend consulting the crop database for flood-tolerant varieties and checking the latest weather forecast. Would you like me to help with something specific?`,
        textHi: `"${text}" के बारे में आपके प्रश्न के लिए धन्यवाद। आपके क्षेत्र के वर्तमान डेटा के आधार पर, मैं बाढ़-सहनशील किस्मों के लिए फसल डेटाबेस देखने और नवीनतम मौसम पूर्वानुमान की जाँच करने की सलाह देता हूं। क्या आप चाहेंगे कि मैं किसी विशिष्ट विषय में मदद करूं?`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const chips = [
    { key: 'chipFloodCrops' as const, text: t('chipFloodCrops') },
    { key: 'chipWeather' as const, text: t('chipWeather') },
    { key: 'chipSchemes' as const, text: t('chipSchemes') },
    { key: 'chipFloodRisk' as const, text: t('chipFloodRisk') },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh)] max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Leaf className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-foreground">{t('chatTitle')}</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary-light" />
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Badge
            className="cursor-pointer rounded-full"
            variant={language === 'en' ? 'default' : 'outline'}
            onClick={() => setLanguage('en')}
          >
            EN
          </Badge>
          <Badge
            className="cursor-pointer rounded-full"
            variant={language === 'hi' ? 'default' : 'outline'}
            onClick={() => setLanguage('hi')}
          >
            हिंदी
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex gap-1 bg-primary/10 rounded-2xl px-4 py-3">
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce-dot" style={{ animationDelay: '0s' }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce-dot" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce-dot" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
      </div>

      {/* Quick chips */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto border-t border-border">
        {chips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => handleSend(chip.text)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            {chip.text}
          </button>
        ))}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} />
    </div>
  );
}
