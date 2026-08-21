import { useState, useEffect, useRef, useMemo } from 'react';
import { computeTrustScore, optimizeSchedule } from '@/lib/ai/engine';
import { Send, Bot, User, Sparkles, Loader2, TrendingUp, CalendarDays, DollarSign, ArrowRight, RefreshCw, Shield } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { format, subDays, startOfMonth } from 'date-fns';
import { chatOpenRouter as chatDeepSeek, isConfigured } from '@/lib/openrouter';
import { toast } from 'sonner';

const QUICK_PROMPTS = [
    'What should I prioritize today to maximize earnings?',
    'How can I improve my trust score?',
    'Which time slots get the most bookings?',
    'How am I performing compared to last month?',
    'Give me tips to reduce cancellations.',
    'What services should I add to grow revenue?',
    'How should I price my services competitively?',
    'Create a 30-day growth plan for my business.',
];

function MessageBubble({ msg }) {
    const isUser = msg.role === 'user';
    return (
        <div className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : ''}`}>
            <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
                style={isUser
                    ? { backgroundColor: 'var(--color-primary)' }
                    : { background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
                {isUser
                    ? <User className="h-4 w-4" style={{ color: 'var(--color-on-primary)' }} />
                    : <Bot className="h-4 w-4" style={{ color: 'var(--color-on-primary)' }} />}
            </div>
            <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={isUser
                    ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', borderTopRightRadius: 4 }
                    : { backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)', borderTopLeftRadius: 4 }}>
                {isUser
                    ? <p>{msg.content}</p>
                    : <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                        style={{ color: 'var(--color-text)' }}>
                        {msg.content}
                    </ReactMarkdown>}
                {!isUser && (
                    <p className="text-[9px] mt-2 font-mono" style={{ color: 'var(--color-text-subtle)', opacity: 0.5 }}>
                        SIMON COPILOT · TRUVORNEX
                    </p>
                )}
            </div>
        </div>
    );
}

function TypingIndicator() {
    return (
        <div className="flex gap-3 items-start">
            <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
                <Bot className="h-4 w-4" style={{ color: 'var(--color-on-primary)' }} />
            </div>
            <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-1">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: 'var(--color-text-subtle)', animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite` }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function ProviderCopilot() {
    const [provider, setProvider] = useState(null);
    const [bookings] = useState([]);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const [dataLoading, setDataLoading] = useState(true);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const bottomRef = useRef(null);

    useEffect(() => {
        // Mock provider data for demo
        setProvider({
            business_name: 'Sparkle Clean Co.',
            rating: 4.9,
            review_count: 127,
            verified: true,
        });
        setDataLoading(false);
    }, []);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading, streamingContent]);

    const metrics = useMemo(() => {
        if (!provider) return null;
        const trust = computeTrustScore(provider, bookings);
        const { schedule, suggestions } = optimizeSchedule(bookings);
        const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
        const monthRevenue = bookings.filter(b => b.status === 'completed' && b.date >= monthStart).reduce((s, b) => s + (b.price || 0), 0);
        const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + (b.price || 0), 0);
        const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
        const weekBookings = bookings.filter(b => b.date >= weekAgo).length;
        return { trust, schedule: schedule.slice(0, 5), suggestions, monthRevenue, totalRevenue, weekBookings };
    }, [provider, bookings]);

    const buildSystemPrompt = () => {
        const ts = metrics?.trust;
        return `You are the AI Business Copilot for ${provider?.business_name || 'a Truvornex provider'}.

Provider profile:
- Business: ${provider?.business_name || 'Not set up yet'}
- Rating: ${provider?.rating?.toFixed(1) || 'N/A'}/5.0 (${provider?.review_count || 0} reviews)
- Verified: ${provider?.verified ? 'Yes' : 'No'}
- Trust Score: ${ts?.score || 'N/A'}/100 (${ts?.label || 'N/A'})
- Completion Rate: ${ts?.completionRate || 0}%

Business metrics:
- Total bookings: ${bookings.length}
- This month revenue: $${metrics?.monthRevenue?.toFixed(0) || 0}
- Total revenue: $${metrics?.totalRevenue?.toFixed(0) || 0}
- Bookings this week: ${metrics?.weekBookings || 0}
- Schedule optimizations: ${metrics?.suggestions?.map(s => s.message).join('; ') || 'none'}
- Upcoming jobs: ${metrics?.schedule?.map(b => `${b.service_name} on ${b.date}`).join(', ') || 'none'}

You are a proactive, data-driven business advisor. Give specific, numbered action steps. Use markdown. Focus on revenue growth, efficiency, and customer satisfaction.`;
    };

    const send = async (text) => {
        const content = text || input.trim();
        if (!content || loading) return;
        setInput('');
        setShowSuggestions(false);

        const newMsg = { role: 'user', content };
        const history = [...messages, newMsg];
        setMessages(history);
        setLoading(true);
        setStreamingContent('');

        if (!isConfigured()) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '**Simon Copilot needs OpenRouter configured.** Add `OPENROUTER_API_KEY` to your environment variables to activate AI responses.',
            }]);
            setLoading(false);
            return;
        }

        try {
            let full = '';
            await chatDeepSeek({
                messages: history.map(m => ({ role: m.role, content: m.content })),
                systemPrompt: buildSystemPrompt(),
                temperature: 0.7,
                maxTokens: 1500,
                onChunk: (delta, acc) => {
                    full = acc;
                    setStreamingContent(acc);
                },
            });
            setMessages(prev => [...prev, { role: 'assistant', content: full }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${e.message}` }]);
        }
        setLoading(false);
        setStreamingContent('');
    };

    const clearChat = () => {
        setMessages([]);
        setShowSuggestions(true);
        toast.info('Chat cleared');
    };

    const hasMessages = messages.length > 0;

    return (
        <div className="space-y-6 max-w-4xl h-[calc(100vh-7rem)] max-h-[900px] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-primary),0.15)', border: '1px solid rgba(var(--color-primary),0.25)' }}>
                        <Sparkles className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                        <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Simon Copilot</h1>
                        <p className="text-sm mt-1 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                            <span className="inline-flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                                <span className="text-[10px]">OpenRouter · Live</span>
                            </span>
                            <span className="text-[10px]">Your AI business advisor</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {hasMessages && (
                        <button onClick={clearChat}
                            className="h-9 w-9 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                            style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                            aria-label="Clear chat">
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Overview (when provider data available) */}
            {!dataLoading && metrics && (
                <div className="rounded-2xl p-5 shimmer shrink-0" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Trust Score', value: `${metrics.trust?.score || '—'}/100`, icon: Shield, color: metrics.trust?.score >= 80 ? 'var(--color-success)' : metrics.trust?.score >= 60 ? 'var(--color-warning)' : 'var(--color-error)', bg: metrics.trust?.score >= 80 ? 'rgba(var(--color-success),0.12)' : metrics.trust?.score >= 60 ? 'rgba(var(--color-warning),0.12)' : 'rgba(var(--color-error),0.12)' },
                            { label: 'This Month', value: `$${metrics.monthRevenue?.toLocaleString() || 0}`, icon: DollarSign, color: 'var(--color-success)', bg: 'rgba(var(--color-success),0.12)' },
                            { label: 'Total Revenue', value: `$${metrics.totalRevenue?.toLocaleString() || 0}`, icon: TrendingUp, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)' },
                            { label: 'This Week', value: metrics.weekBookings || 0, icon: CalendarDays, color: 'var(--color-accent)', bg: 'rgba(var(--color-accent),0.12)' },
                        ].map((stat, i) => (
                            <div key={i} className="rounded-xl p-4 text-center shimmer"
                                style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xs)' }}>
                                <div className="h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-2 card-lightning-subtle"
                                    style={{ backgroundColor: stat.bg }}>
                                    <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                                </div>
                                <p className="font-black text-2xl" style={{ color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>{stat.value}</p>
                                <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-0.5 min-h-0">
                {!hasMessages && showSuggestions && (
                    <div className="pt-4">
                        <div className="text-center mb-6">
                            <div className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)', border: '1px solid rgba(var(--color-primary),0.2)' }}>
                                <Sparkles className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <h2 className="font-bold text-lg mb-1" style={{ color: 'var(--color-primary)' }}>Hi, I'm Simon Copilot</h2>
                            <p className="text-sm max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                                Your AI business advisor. Ask me anything about growing your provider business.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {QUICK_PROMPTS.map(prompt => (
                                <button key={prompt} onClick={() => send(prompt)} disabled={dataLoading || loading}
                                    className="rounded-xl p-4 text-left text-sm transition-all group hover-lift card-lightning-subtle"
                                    style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
                                    <div className="flex items-start gap-3">
                                        <ArrowRight className="h-4 w-4 shrink-0 mt-0.5 transition-transform group-hover:translate-x-1" style={{ color: 'var(--color-accent)' }} />
                                        <span className="flex-1">{prompt}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
                
                {loading && !streamingContent && <TypingIndicator />}
                
                {loading && streamingContent && (
                    <div className="flex gap-3 items-start">
                        <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
                            <Bot className="h-4 w-4" style={{ color: 'var(--color-on-primary)' }} />
                        </div>
                        <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)', borderTopLeftRadius: 4 }}>
                            <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                                {streamingContent}
                            </ReactMarkdown>
                            <span className="inline-block h-3 w-0.5 ml-0.5 bg-current animate-pulse" />
                        </div>
                    </div>
                )}
                
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="shrink-0">
                <div className="rounded-xl p-2 transition-all" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                    <div className="flex items-center gap-2">
                        <input
                            type="text" 
                            value={input} 
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                            placeholder="Ask Simon anything about your business…"
                            disabled={dataLoading || loading}
                            className="flex-1 h-10 bg-transparent text-sm focus:outline-none px-3 rounded-lg"
                            style={{ 
                                color: 'var(--color-primary)', 
                                fontSize: '14px',
                                fontFamily: 'Inter,sans-serif',
                            }}
                        />
                        <button 
                            onClick={() => send()} 
                            disabled={!input.trim() || loading || dataLoading}
                            className="h-10 w-10 rounded-lg flex items-center justify-center transition-all card-lightning-subtle disabled:opacity-40"
                            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
                <p className="text-center text-[9px] mt-2 tracking-widest" style={{ color: 'var(--color-text-subtle)' }}>
                    SIMON AI · TRUVORNEX PROVIDER COPILOT · OPENROUTER
                </p>
            </div>
        </div>
    );
}