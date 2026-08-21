import { useState, useEffect, useMemo } from 'react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { DollarSign, TrendingUp, Package, Loader2, RefreshCw, Sparkles, BarChart3, PieChart as PieChartIcon, FileText } from 'lucide-react';
import { chatOpenRouter as chatDeepSeek, isConfigured } from '@/lib/openrouter';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

const CHART_COLORS = ['var(--color-primary)', 'var(--color-warning)', 'var(--color-success)', 'var(--color-error)', 'var(--color-accent)'];

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="px-3 py-2 rounded-xl text-xs font-semibold shadow-lg"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-strong)', color: 'var(--color-primary)' }}>
            <div style={{ color: 'var(--color-text-muted)' }}>{label}</div>
            <div>${payload[0].value.toFixed(0)}</div>
        </div>
    );
}

export default function SpendingAnalytics() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiInsight, setAiInsight] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiStreaming, setAiStreaming] = useState('');

    useEffect(() => {
        // Mock data - replace with actual Supabase fetch
        setBookings([
            { id: '1', service_name: 'House Cleaning', date: '2024-11-15', price: 150 },
            { id: '2', service_name: 'AC Repair', date: '2024-11-20', price: 200 },
            { id: '3', service_name: 'Lawn Mowing', date: '2024-12-01', price: 85 },
            { id: '4', service_name: 'House Cleaning', date: '2024-12-15', price: 150 },
            { id: '5', service_name: 'Plumbing', date: '2024-12-20', price: 180 },
            { id: '6', service_name: 'House Cleaning', date: '2025-01-05', price: 150 },
            { id: '7', service_name: 'Window Cleaning', date: '2025-01-10', price: 120 },
        ]);
        setLoading(false);
    }, []);

    const stats = useMemo(() => {
        const total = bookings.reduce((s, b) => s + (b.price || 0), 0);
        const byCategory = {};
        bookings.forEach(b => {
            const cat = b.service_name?.split(' ')[0] || 'Other';
            byCategory[cat] = (byCategory[cat] || 0) + (b.price || 0);
        });
        const byMonth = {};
        bookings.forEach(b => {
            if (b.date) {
                const m = b.date.slice(0, 7);
                byMonth[m] = (byMonth[m] || 0) + (b.price || 0);
            }
        });
        return {
            total,
            avg: bookings.length ? (total / bookings.length).toFixed(2) : 0,
            count: bookings.length,
            byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5),
            byMonth: Object.entries(byMonth).map(([name, value]) => ({ name: name.slice(5), value })).slice(-6),
        };
    }, [bookings]);

    const getAiInsight = async () => {
        if (!isConfigured()) {
            setAiInsight('**OpenRouter not configured** — Add `OPENROUTER_API_KEY` to your environment variables to unlock Simon AI spending insights.');
            return;
        }
        setAiLoading(true);
        setAiInsight('');
        setAiStreaming('');
        try {
            const prompt = `Analyze my service spending data and give personalized savings advice:
- Total spent: $${stats.total.toFixed(2)}
- Number of bookings: ${stats.count}
- Average per booking: $${stats.avg}
- Top categories: ${stats.byCategory.map(c => `${c.name} ($${c.value})`).join(', ') || 'none yet'}
- Monthly trend: ${stats.byMonth.map(m => `${m.name}: $${m.value}`).join(', ') || 'no data yet'}

Provide:
1. **Spending health score** (0-100) with explanation
2. **Top 3 savings opportunities** with specific dollar amounts
3. **Optimal booking timing** based on seasonal patterns
4. **Bundle recommendation** if applicable
5. **Next month forecast** with suggested budget

Be specific, data-driven, and actionable. Use markdown formatting.`;

            await chatDeepSeek({
                messages: [{ role: 'user', content: prompt }],
                systemPrompt: 'You are Simon, Truvornex\'s AI financial advisor for home services. Analyze spending patterns and give hyper-personalized, actionable savings advice. Be specific with numbers.',
                temperature: 0.65,
                maxTokens: 1200,
                onChunk: (delta, full) => setAiStreaming(full),
            });
            setAiInsight(aiStreaming || '');
        } catch (e) {
            setAiInsight(`**Error:** ${e.message}`);
        }
        setAiLoading(false);
        setAiStreaming('');
    };

    const displayInsight = aiLoading ? aiStreaming : aiInsight;

    if (loading) return (
        <div className="space-y-6 max-w-4xl">
            <div className="skeleton-wave h-7 w-56 rounded-xl" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton-wave h-28 rounded-2xl" />)}
            </div>
            <div className="skeleton-wave h-64 rounded-2xl" />
            <div className="skeleton-wave h-64 rounded-2xl" />
            <div className="skeleton-wave h-64 rounded-2xl" />
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-primary),0.15)', border: '1px solid rgba(var(--color-primary),0.25)' }}>
                        <DollarSign className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                        <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Spending Analytics</h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>AI-powered insights into your service spending</p>
                    </div>
                </div>
                <button onClick={getAiInsight} disabled={aiLoading}
                    className="h-11 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                    {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    {aiLoading ? 'Analyzing...' : aiInsight ? 'Refresh' : 'Get AI Advice'}
                </button>
            </div>

            {/* Stats Overview */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Total Spent', value: `$${stats.total.toFixed(0)}`, icon: DollarSign, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)' },
                        { label: 'Avg per Booking', value: `$${stats.avg}`, icon: TrendingUp, color: 'var(--color-warning)', bg: 'rgba(var(--color-warning),0.12)' },
                        { label: 'Completed', value: stats.count, icon: Package, color: 'var(--color-success)', bg: 'rgba(var(--color-success),0.12)' },
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

            {/* Monthly Chart */}
            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-semibold" style={{ color: 'var(--color-primary)' }}>Monthly Spending</h2>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Area chart view</span>
                    </div>
                </div>
                {stats.byMonth.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={stats.byMonth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-subtle)' }} axisLine={false} tickLine={false} tickMargin={8} />
                            <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-subtle)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} fill="url(#spendGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center py-12">
                        <div className="h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--color-surface-high)' }}>
                            <TrendingUp className="h-6 w-6" style={{ color: 'var(--color-text-subtle)' }} />
                        </div>
                        <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-primary)' }}>No spending data yet</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Book services to see your spending analytics</p>
                    </div>
                )}
            </div>

            {/* Category Breakdown */}
            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-semibold" style={{ color: 'var(--color-primary)' }}>Spending by Category</h2>
                    <PieChartIcon className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                </div>
                {stats.byCategory.length > 0 ? (
                    <div className="flex items-center gap-6">
                        <PieChart width={140} height={140}>
                            <Pie data={stats.byCategory} cx={55} cy={55} innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={2} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                {stats.byCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                            </Pie>
                        </PieChart>
                        <div className="flex-1 space-y-3">
                            {stats.byCategory.map((c, i) => (
                                <div key={c.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                                        <span className="text-sm" style={{ color: 'var(--color-text)' }}>{c.name}</span>
                                    </div>
                                    <span className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>${c.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <BarChart3 className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--color-text-subtle)' }} />
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No category data yet</p>
                    </div>
                )}
            </div>

            {/* Simon AI Insight */}
            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                        <Sparkles className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                        <h2 className="font-semibold" style={{ color: 'var(--color-primary)' }}>Simon's Savings Advice</h2>
                        <p className="text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>Powered by OpenRouter AI</p>
                    </div>
                </div>
                {displayInsight ? (
                    <div className="prose prose-sm max-w-none rounded-xl p-4 text-sm leading-relaxed"
                        style={{ backgroundColor: 'var(--color-surface-low)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
                        <ReactMarkdown>{displayInsight}</ReactMarkdown>
                        {aiLoading && <span className="inline-block h-3 w-0.5 ml-0.5 bg-current animate-pulse" />}
                    </div>
                ) : (
                    <div className="rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                        <Sparkles className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--color-text-subtle)' }} />
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            Click "Get AI Advice" for personalized savings recommendations from Simon — powered by OpenRouter AI.
                        </p>
                    </div>
                )}
            </div>

            {/* Export & Actions */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Export & Reports</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button className="h-11 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                    style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                    onClick={() => toast.info('Exporting CSV...')}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                    <FileText className="h-4 w-4" />
                    Export CSV
                </button>
                <button className="h-11 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                    style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                    onClick={() => toast.info('Generating PDF report...')}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                    <FileText className="h-4 w-4" />
                    PDF Report
                </button>
            </div>
        </div>
    );
}