import { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Star, Lightbulb, Loader2, RefreshCw, Cpu, Shield, Zap, Target } from 'lucide-react';
import { chatOpenRouter as chatDeepSeek, isConfigured } from '@/lib/openrouter';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

const INSIGHT_TYPES = [
    {
        id: 'revenue',
        label: 'Revenue Optimization',
        icon: DollarSign,
        color: 'var(--color-success)',
        prompt: (data) => `Analyze this service provider's data and give 5 specific revenue optimization strategies:
${JSON.stringify(data, null, 2)}
Focus on pricing, upselling, and capacity utilization. Include estimated revenue impact for each.`,
    },
    {
        id: 'customers',
        label: 'Customer Retention',
        icon: Users,
        color: 'var(--color-primary)',
        prompt: (data) => `Analyze booking patterns and give 5 customer retention strategies:
${JSON.stringify(data, null, 2)}
Focus on repeat customers, loyalty building, and reducing churn. Include specific action steps.`,
    },
    {
        id: 'pricing',
        label: 'Dynamic Pricing',
        icon: TrendingUp,
        color: 'var(--color-warning)',
        prompt: (data) => `Suggest an optimal dynamic pricing strategy for this provider:
${JSON.stringify(data, null, 2)}
Give specific price points for peak/off-peak, seasonal adjustments, and bundle pricing.`,
    },
    {
        id: 'scheduling',
        label: 'Schedule Optimization',
        icon: Star,
        color: 'var(--color-info)',
        prompt: (data) => `Optimize this provider's schedule for maximum efficiency and earnings:
${JSON.stringify(data, null, 2)}
Recommend best working hours, slot intervals, day-of-week patterns, and how to reduce gaps.`,
    },
];

const MOCK_BOOKINGS = [
    { id: '1', service_name: 'Deep House Cleaning', price: 150, date: '2025-01-15', status: 'completed' },
    { id: '2', service_name: 'AC Repair & Maintenance', price: 200, date: '2025-01-18', status: 'completed' },
    { id: '3', service_name: 'Lawn Mowing', price: 85, date: '2025-01-20', status: 'completed' },
    { id: '4', service_name: 'Plumbing Inspection', price: 120, date: '2025-01-22', status: 'completed' },
    { id: '5', service_name: 'Window Cleaning', price: 95, date: '2025-01-10', status: 'cancelled' },
    { id: '6', service_name: 'Electrical Work', price: 350, date: '2024-12-08', status: 'completed' },
];

export default function AIInsights() {
    const [provider, setProvider] = useState(null);
    const [bookings] = useState(MOCK_BOOKINGS);
    const [insights, setInsights] = useState({});
    const [streaming, setStreaming] = useState({});
    const [loading, setLoading] = useState({});
    const [pageLoading, setPageLoading] = useState(false);

    useEffect(() => {
        setProvider({ business_name: 'Sparkle Clean Co.', rating: 4.9, city: 'San Francisco' });
        setPageLoading(false);
    }, []);

    const getInsight = async (type) => {
        if (!isConfigured()) {
            setInsights(i => ({ ...i, [type.id]: '**OpenRouter not configured** — Add `OPENROUTER_API_KEY` to unlock Simon AI insights.' }));
            toast.info('OpenRouter API key required for AI insights');
            return;
        }
        setLoading(l => ({ ...l, [type.id]: true }));
        setStreaming(s => ({ ...s, [type.id]: '' }));
        
        const completedBookings = bookings.filter(b => b.status === 'completed');
        const data = {
            provider: { business_name: provider?.business_name || 'Demo Business', rating: provider?.rating || 4.5, city: provider?.city || 'Your City' },
            totalBookings: bookings.length,
            completed: completedBookings.length,
            revenue: completedBookings.reduce((s, b) => s + (b.price || 0), 0),
            avgPrice: bookings.length ? (bookings.reduce((s, b) => s + (b.price || 0), 0) / bookings.length).toFixed(2) : 0,
            cancellations: bookings.filter(b => b.status === 'cancelled').length,
            noShows: bookings.filter(b => b.status === 'no_show').length,
        };
        
        try {
            let full = '';
            await chatDeepSeek({
                messages: [{ role: 'user', content: type.prompt(data) }],
                systemPrompt: 'You are Simon, an elite AI business analyst for Truvornex service providers. Give precise, data-driven, actionable insights. Use markdown with headers and bullet points.',
                temperature: 0.65,
                maxTokens: 1200,
                onChunk: (delta, acc) => {
                    full = acc;
                    setStreaming(s => ({ ...s, [type.id]: acc }));
                },
            });
            setInsights(i => ({ ...i, [type.id]: full }));
        } catch (e) {
            setInsights(i => ({ ...i, [type.id]: `**Error:** ${e.message}` }));
        }
        setLoading(l => ({ ...l, [type.id]: false }));
        setStreaming(s => ({ ...s, [type.id]: '' }));
    };

    const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + (b.price || 0), 0);
    const completedCount = bookings.filter(b => b.status === 'completed').length;

    if (pageLoading) return (
        <div className="space-y-6 max-w-4xl">
            <div className="skeleton-wave h-7 w-56 rounded-xl" />
            <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton-wave h-28 rounded-2xl" />)}
            </div>
            {INSIGHT_TYPES.map(type => <div key={type.id} className="skeleton-wave h-24 rounded-2xl" />)}
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-primary),0.15)', border: '1px solid rgba(var(--color-primary),0.25)' }}>
                        <Cpu className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                        <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Simon Business Intelligence</h1>
                        <p className="text-sm mt-1 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                                <span className="text-[10px]">OpenRouter · Live</span>
                            </span>
                            AI-powered insights to grow your business
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total Bookings', value: bookings.length, icon: Users, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)' },
                        { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'var(--color-success)', bg: 'rgba(var(--color-success),0.12)' },
                        { label: 'Avg Rating', value: provider?.rating?.toFixed(1) || '—', icon: Star, color: 'var(--color-warning)', bg: 'rgba(var(--color-warning),0.12)' },
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

            {/* Insight Cards */}
            {INSIGHT_TYPES.map(type => {
                const display = loading[type.id] ? streaming[type.id] : insights[type.id];
                const Icon = type.icon;
                return (
                    <div key={type.id} className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: type.color + '15' }}>
                                    <Icon className="h-5 w-5" style={{ color: type.color }} />
                                </div>
                                <div>
                                    <h2 className="font-semibold" style={{ color: 'var(--color-primary)' }}>{type.label}</h2>
                                    <p className="text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>Simon AI · OpenRouter</p>
                                </div>
                            </div>
                            <button onClick={() => getInsight(type)} disabled={loading[type.id]}
                                className="h-9 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                                {loading[type.id] ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : insights[type.id] ? (
                                    <>
                                        <RefreshCw className="h-4 w-4" />
                                        Refresh
                                    </>
                                ) : (
                                    <>
                                        <Lightbulb className="h-4 w-4" />
                                        Get Insight
                                    </>
                                )}
                            </button>
                        </div>
                        {display ? (
                            <div className="rounded-xl p-5 prose prose-sm max-w-none text-sm leading-relaxed"
                                style={{ backgroundColor: 'var(--color-surface-high)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
                                <ReactMarkdown>{display}</ReactMarkdown>
                                {loading[type.id] && <span className="inline-block h-3 w-0.5 ml-0.5 bg-current animate-pulse" />}
                            </div>
                        ) : (
                            <div className="rounded-xl p-5 text-center" style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                                <Icon className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--color-text-subtle)' }} />
                                <h3 className="font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>Get AI Analysis</h3>
                                <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                                    Click "Get Insight" for Simon's AI analysis on {type.label.toLowerCase()} with specific, actionable recommendations.
                                </p>
                                <button onClick={() => getInsight(type)} disabled={loading[type.id]}
                                    className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold transition-all"
                                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                                    <Lightbulb className="h-4 w-4" />
                                    Get Insight
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Tips */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-[10px] font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Tips for Best Results</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: Target, title: 'Run After Busy Periods', desc: 'Get insights after completing 10+ bookings for more accurate analysis' },
                        { icon: Shield, title: 'Refresh Monthly', desc: 'Business conditions change — run fresh analyses each month for current advice' },
                        { icon: Zap, title: 'Implement & Track', desc: 'Apply Simon\'s recommendations and measure results to improve future insights' },
                    ].map((item, i) => (
                        <div key={i} className="rounded-xl p-4 transition-all hover-lift card-lightning-subtle"
                            style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3 card-lightning-subtle"
                                style={{ backgroundColor: 'rgba(var(--color-primary), 0.12)' }}>
                                <item.icon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <h3 className="font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>{item.title}</h3>
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}