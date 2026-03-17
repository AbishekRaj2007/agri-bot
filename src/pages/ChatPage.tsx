import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import type { ChatMessage as ChatMessageType } from '@/data/mockChat';
import { Leaf, AlertCircle, Sprout } from 'lucide-react';
import type { Language } from '@/data/i18n';
import { useMyCrops, computeStatus, getDaysToHarvest } from '@/hooks/useMyCrops';
import { useAuth } from '@/context/AuthContext';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';

interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ── Build a text block describing the farmer's active crops ──────────────────
function buildCropContext(crops: ReturnType<typeof useMyCrops>['crops']): string {
  if (crops.length === 0) return '';

  const activeCrops = crops.filter(c => computeStatus(c) !== 'harvested');
  const harvestedCrops = crops.filter(c => computeStatus(c) === 'harvested');

  const lines: string[] = ['== FARMER\'S CURRENT CROPS (tracked in AgriShield) =='];

  if (activeCrops.length > 0) {
    lines.push('\nACTIVE / GROWING:');
    activeCrops.forEach((crop, i) => {
      const status = computeStatus(crop);
      const days = getDaysToHarvest(crop);
      const statusLabel =
        status === 'planted' ? 'Just planted'
        : status === 'growing' ? 'Growing'
        : 'Ready to harvest';
      lines.push(
        `${i + 1}. ${crop.cropName} (${crop.category})\n` +
        `   • Field size: ${crop.fieldSize} acres\n` +
        `   • Status: ${statusLabel}\n` +
        `   • Planted: ${new Date(crop.plantingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}\n` +
        `   • Expected harvest: ${new Date(crop.expectedHarvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}` +
        (status !== 'harvested' ? `\n   • Days to harvest: ${days > 0 ? `${days} days` : days === 0 ? 'TODAY' : `${Math.abs(days)} days overdue`}` : '') +
        (crop.notes ? `\n   • Farmer's notes: ${crop.notes}` : '')
      );
    });
  }

  if (harvestedCrops.length > 0) {
    lines.push('\nRECENTLY HARVESTED:');
    harvestedCrops.forEach((crop, i) => {
      lines.push(
        `${i + 1}. ${crop.cropName} — harvested on ${new Date(crop.actualHarvestDate || crop.expectedHarvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
      );
    });
  }

  return lines.join('\n');
}

// ── System prompt with injected farmer context ────────────────────────────────
function buildSystemPrompt(
  lang: Language,
  farmerName: string,
  farmerState: string,
  cropContext: string,
): string {
  const langInstruction =
    lang === 'hi'
      ? 'IMPORTANT: You MUST respond ONLY in Hindi (Devanagari script). Do not write anything in English.'
      : 'IMPORTANT: You MUST respond ONLY in English. Do not use Hindi.';

  const farmerSection = `== FARMER PROFILE ==
Name: ${farmerName}
State/Region: ${farmerState || 'India'}
`;

  const cropSection = cropContext
    ? `${cropContext}

INSTRUCTIONS FOR USING CROP CONTEXT:
- You already know this farmer's crops — never ask "what crop are you growing?"
- When the farmer asks about "my crops", "my field", or "my farm", refer to the tracked crops above.
- Proactively mention relevant advice based on their current crop status and days to harvest.
- If a crop is within 14 days of harvest, remind them about timely harvesting.
- If a crop is overdue, urgently recommend immediate action.
`
    : `== CROPS ==
This farmer has not yet added any crops to AgriShield. Encourage them to add crops in the "My Crops" tab for personalized advice.
`;

  return `You are AgriShield, an expert AI farming assistant built for Indian farmers. You specialize in:
- Flood-resistant and climate-resilient crop varieties suited to Indian agro-climatic zones
- Indian government agricultural schemes (PM-KISAN, PMFBY, KCC, PMKSY, RKVY, NFSM, etc.)
- Crop management, sowing seasons (Kharif / Rabi / Zaid), pest control, and best practices
- Market prices, MSP guidance, and selling strategies
- Weather impact analysis on farming decisions
- Soil health, fertilizers, pesticides, and organic farming

${farmerSection}
${cropSection}
${langInstruction}

Guidelines:
- Keep responses concise, practical, and farmer-friendly — avoid excessive technical jargon.
- Use markdown: **bold** for key terms, numbered lists for steps, bullet points for options.
- For crop recommendations, include yield estimate, flood tolerance level, and recommended states/regions.
- For government schemes, state the key benefit amount and the application process.
- Be empathetic — farming is the livelihood of these families.
- Address the farmer by name (${farmerName}) when appropriate.`;
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
  const { user } = useAuth();
  const { crops } = useMyCrops();

  const farmerName = user?.fullName || 'Farmer';
  const farmerState = user?.state || '';

  // Recompute crop context whenever crops change
  const cropContext = useMemo(() => buildCropContext(crops), [crops]);

  // Personalized welcome message
  const welcomeMessage: ChatMessageType = useMemo(() => {
    const activeCrops = crops.filter(c => computeStatus(c) !== 'harvested');
    const readyCrops = crops.filter(c => computeStatus(c) === 'ready');

    let text = `Namaste, **${farmerName}**! 🌾 I'm your AgriShield AI farming expert.`;

    if (activeCrops.length > 0) {
      const cropNames = activeCrops.map(c => c.cropName).join(', ');
      text += `\n\nI can see you're currently growing **${cropNames}**`;
      if (farmerState) text += ` in ${farmerState}`;
      text += '.';

      if (readyCrops.length > 0) {
        text += ` ⚠️ Your **${readyCrops.map(c => c.cropName).join(', ')}** ${readyCrops.length === 1 ? 'is' : 'are'} ready to harvest — ask me about the best time to harvest or post-harvest storage!`;
      } else {
        text += ' Ask me anything about your crops — care tips, pest control, fertilizer schedule, or market prices.';
      }
    } else {
      text += '\n\nYou haven\'t added any crops yet. Head to the **My Crops** tab to add what you\'re growing, and I\'ll give you personalized advice!';
    }

    return {
      id: 'welcome',
      sender: 'ai' as const,
      text,
      textHi: `नमस्ते, **${farmerName}**! 🌾 मैं आपका AgriShield AI कृषि विशेषज्ञ हूं। ${activeCrops.length > 0 ? `मुझे पता है आप ${activeCrops.map(c => c.cropName).join(', ')} उगा रहे हैं। कुछ भी पूछें!` : 'अपनी फसलें "My Crops" में जोड़ें और मुझसे व्यक्तिगत सलाह लें!'}`,
      timestamp: '',
    };
  }, [farmerName, farmerState, crops]);

  const [messages, setMessages] = useState<ChatMessageType[]>([welcomeMessage]);
  const [apiHistory, setApiHistory] = useState<ApiMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortCtrl = useRef<AbortController | null>(null);

  const hasApiKey = !!GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here';

  // Update welcome message when crops change (without resetting conversation)
  useEffect(() => {
    setMessages(prev =>
      prev.map(m => m.id === 'welcome' ? welcomeMessage : m)
    );
  }, [welcomeMessage]);

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
      setMessages(prev => [...prev, userMsg]);

      // Demo fallback — no API key
      if (!hasApiKey) {
        setIsStreaming(true);
        setTimeout(() => {
          setMessages(prev => [
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
      setMessages(prev => [
        ...prev,
        { id: aiId, sender: 'ai', text: '', timestamp: timestamp() },
      ]);
      setIsStreaming(true);

      const ctrl = new AbortController();
      abortCtrl.current = ctrl;

      let fullText = '';
      try {
        await callGroq(
          buildSystemPrompt(language, farmerName, farmerState, cropContext),
          nextHistory,
          token => {
            fullText += token;
            setMessages(prev =>
              prev.map(m => m.id === aiId ? { ...m, text: fullText } : m),
            );
          },
          ctrl.signal,
        );
        setApiHistory(prev => [...prev, { role: 'assistant', content: fullText }]);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to connect to Groq AI');
        setMessages(prev => prev.filter(m => m.id !== aiId));
      } finally {
        setIsStreaming(false);
        abortCtrl.current = null;
      }
    },
    [isStreaming, hasApiKey, apiHistory, language, farmerName, farmerState, cropContext],
  );

  // ── Context-aware quick chips ─────────────────────────────────────────────
  const chips = useMemo(() => {
    const activeCrops = crops.filter(c => computeStatus(c) !== 'harvested');
    const readyCrops = crops.filter(c => computeStatus(c) === 'ready');
    const growingCrops = crops.filter(c => computeStatus(c) === 'growing');

    if (activeCrops.length === 0) {
      // No crops — show generic chips
      return [
        { key: 'flood', text: t('chipFloodCrops') },
        { key: 'weather', text: t('chipWeather') },
        { key: 'schemes', text: t('chipSchemes') },
        { key: 'risk', text: t('chipFloodRisk') },
      ];
    }

    // Crop-aware chips
    const dynamic: { key: string; text: string }[] = [];

    if (readyCrops.length > 0) {
      dynamic.push({ key: 'harvest', text: `When to harvest my ${readyCrops[0].cropName}?` });
      dynamic.push({ key: 'storage', text: `Post-harvest storage for ${readyCrops[0].cropName}` });
    }
    if (growingCrops.length > 0) {
      dynamic.push({ key: 'pest', text: `Pest control for my ${growingCrops[0].cropName}` });
      dynamic.push({ key: 'fertilizer', text: `Fertilizer tips for my ${growingCrops[0].cropName}` });
    }
    if (dynamic.length < 4) {
      dynamic.push({ key: 'market', text: `Market price for ${activeCrops[0].cropName}` });
    }
    if (dynamic.length < 4) {
      dynamic.push({ key: 'schemes', text: t('chipSchemes') });
    }

    return dynamic.slice(0, 4);
  }, [crops, t]);

  const activeCropsCount = crops.filter(c => computeStatus(c) !== 'harvested').length;

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

        <div className="flex items-center gap-2">
          {/* Crop context indicator */}
          {activeCropsCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Sprout className="w-3.5 h-3.5" />
              {activeCropsCount} crop{activeCropsCount > 1 ? 's' : ''} in context
            </div>
          )}
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
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Typing dots */}
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

      {/* Context-aware quick chips */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto border-t border-border">
        {chips.map(chip => (
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
