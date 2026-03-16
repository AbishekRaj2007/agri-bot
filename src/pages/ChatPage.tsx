import { useState, useRef, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import type { ChatMessage as ChatMessageType } from '@/data/mockChat';
import { Leaf, AlertCircle } from 'lucide-react';
import type { Language } from '@/data/i18n';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const WELCOME_MESSAGE: ChatMessageType = {
  id: 'welcome',
  sender: 'ai',
  text: "Namaste! I'm your AgriShield farming expert. Ask me anything about crops, weather, flood management, or government schemes.",
  textHi: 'नमस्ते! मैं आपका AgriShield कृषि विशेषज्ञ हूं। फसलों, मौसम, बाढ़ प्रबंधन या सरकारी योजनाओं के बारे में कुछ भी पूछें।',
  timestamp: '',
};

function buildSystemPrompt(lang: Language): string {
  const langInstruction =
    lang === 'hi'
      ? 'IMPORTANT: You MUST respond ONLY in Hindi (Devanagari script). Do not write anything in English.'
      : 'IMPORTANT: You MUST respond ONLY in English. Do not use Hindi.';

  return `You are AgriShield, an expert AI farming assistant built for Indian farmers. You specialize in:
- Flood-resistant and climate-resilient crop varieties suited to Indian agro-climatic zones
- Indian government agricultural schemes (PM-KISAN, PMFBY, KCC, PMKSY, RKVY, NFSM, etc.)
- Crop management, sowing seasons (Kharif / Rabi / Zaid), pest control, and best practices
- Market prices, MSP guidance, and selling strategies
- Weather impact analysis on farming decisions
- Soil health, fertilizers, pesticides, and organic farming

${langInstruction}

Guidelines:
- Keep responses concise, practical, and farmer-friendly — avoid excessive technical jargon.
- Use markdown: **bold** for key terms, numbered lists for steps, bullet points for options.
- For crop recommendations, include yield estimate, flood tolerance level, and recommended states/regions.
- For government schemes, state the key benefit amount and the application process.
- Be empathetic — farming is the livelihood of these families.`;
}

interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function callGroq(
  systemPrompt: string,
  apiMessages: ApiMessage[],
  onToken: (token: string) => void,
  signal: AbortSignal,
) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'system', content: systemPrompt }, ...apiMessages],
      stream: true,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    let msg = 'Groq API error';
    try { msg = JSON.parse(errText)?.error?.message ?? msg; } catch { /* ignore */ }
    throw new Error(msg);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const payload = trimmed.slice(6).trim();
      if (payload === '[DONE]') return;
      try {
        const token = JSON.parse(payload)?.choices?.[0]?.delta?.content;
        if (typeof token === 'string' && token) onToken(token);
      } catch { /* incomplete or empty delta, skip */ }
    }
  }

  // Flush remaining buffer
  const trimmed = buffer.trim();
  if (trimmed.startsWith('data: ')) {
    const payload = trimmed.slice(6).trim();
    if (payload !== '[DONE]') {
      try {
        const token = JSON.parse(payload)?.choices?.[0]?.delta?.content;
        if (typeof token === 'string' && token) onToken(token);
      } catch { /* ignore */ }
    }
  }
}

function timestamp() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function ChatPage() {
  const { t, language, setLanguage } = useLanguage();
  const [messages, setMessages] = useState<ChatMessageType[]>([WELCOME_MESSAGE]);
  const [apiHistory, setApiHistory] = useState<ApiMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortCtrl = useRef<AbortController | null>(null);

  const hasApiKey = !!GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here';

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(
    async (text: string) => {
      if (isStreaming) return;
      setError(null);

      const userMsg: ChatMessageType = {
        id: Date.now().toString(),
        sender: 'user',
        text,
        timestamp: timestamp(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // Demo fallback — no API key
      if (!hasApiKey) {
        setIsStreaming(true);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              sender: 'ai',
              text: `Add your **Groq API key** to \`VITE_GROQ_API_KEY\` in \`.env\` to enable real AI responses.\n\nGet a free key at **console.groq.com/keys**`,
              timestamp: timestamp(),
            },
          ]);
          setIsStreaming(false);
        }, 600);
        return;
      }

      const nextHistory: ApiMessage[] = [...apiHistory, { role: 'user', content: text }];
      setApiHistory(nextHistory);

      const aiId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: aiId, sender: 'ai', text: '', timestamp: timestamp() },
      ]);
      setIsStreaming(true);

      const ctrl = new AbortController();
      abortCtrl.current = ctrl;

      let fullText = '';
      try {
        await callGroq(
          buildSystemPrompt(language),
          nextHistory,
          (token) => {
            fullText += token;
            setMessages((prev) =>
              prev.map((m) => (m.id === aiId ? { ...m, text: fullText } : m)),
            );
          },
          ctrl.signal,
        );
        setApiHistory((prev) => [...prev, { role: 'assistant', content: fullText }]);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to connect to Groq AI');
        setMessages((prev) => prev.filter((m) => m.id !== aiId));
      } finally {
        setIsStreaming(false);
        abortCtrl.current = null;
      }
    },
    [isStreaming, hasApiKey, apiHistory, language],
  );

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
              <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-primary-light animate-pulse' : 'bg-muted-foreground'}`} />
              <span className="text-xs text-muted-foreground">
                {hasApiKey ? `Groq · ${GROQ_MODEL}` : 'Demo mode'}
              </span>
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

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-3 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2.5 flex items-start gap-2 text-xs text-destructive">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Typing dots — only while waiting for very first token */}
        {isStreaming && messages[messages.length - 1]?.text === '' && (
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
            disabled={isStreaming}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {chip.text}
          </button>
        ))}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}
