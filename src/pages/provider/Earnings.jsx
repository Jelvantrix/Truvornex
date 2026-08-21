import { useState, useEffect, useMemo } from 'react';
import { DollarSign, TrendingUp, CalendarDays, CheckCircle2, XCircle, AlertTriangle, ArrowUpRight, Download, Clock, Sparkles, Loader2, PieChart } from 'lucide-react';
import { format, startOfWeek, startOfMonth, subDays, subMonths } from 'date-fns';
import { chatOpenRouter as chatDeepSeek, isConfigured } from '@/lib/openrouter';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

const TABS = ['Overview', 'By Service', 'Loss Tracker', 'Trends'];
const PIE_COLORS = ['#7c6fcd', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];

const MOCK_BOOKINGS = [
    { id: '1', service_name: 'Deep House Cleaning', price: 150, date: '2025-01-15', status: 'completed' },
    { id: '2', service_name: 'AC Repair & Maintenance', price: 200, date: '2025-01-18', status: 'completed' },
    { id: '3', service_name: 'Lawn Mowing', price: 85, date: '2025-01-20', status: 'completed' },
    { id: '4', service_name: 'Plumbing Inspection', price: 120, date: '2025-01-22', status: 'completed' },
    { id: '5', service_name: 'Window Cleaning', price: 95, date: '2025-01-10', status: 'cancelled' },
    { id: '6', service_name: 'Electrical Work', price: 350, date: '2024-12-08', status: 'completed' },
    { id: '7', service_name: 'Gutter Cleaning', price: 180, date: '2024-11-15', status: 'completed' },
    { id: '8', service_name: 'House Cleaning', price: 150, date: '2024-11-10', status: 'no_show' },
];

function fmt(n) { return `$${(n || 0).toLocaleString()}`; }

function KPICard({ label, value, sub, icon: Icon, accent, trend }) {
    return (
        <div className="rounded-2xl p-5 shimmer transition-all"
            style={{ 
                backgroundColor: accent ? 'var(--color-primary)' : 'var(--color-surface)', 
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)'
            }}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: accent ? 'var(--color-on-primary)' : 'var(--color-text-subtle)', opacity: accent ? 0.7 : 1 }}>
                    {label}
                </span>
                <div className="h-8 w-8 rounded-xl flex items-center justify-center card-lightning-subtle"
                    style={{ backgroundColor: accent ? 'rgba(255,255,255,0.1)' : 'var(--color-surface-high)' }}>
                    <Icon className="h-4 w-4" style={{ color: accent ? 'var(--color-on-primary)' : 'var(--color-text-subtle)', opacity: accent ? 0.7 : 1 }} />
                </div>
            </div>
            <div className="font-black text-2xl tracking-tight"
                style={{ color: accent ? 'var(--color-on-primary)' : 'var(--color-primary)' }}>
                {value}
            </div>
            {sub && <div className="text-[10px] mt-1.5" style={{ color: accent ? 'var(--color-on-primary)' : 'var(--color-text-muted)', opacity: accent ? 0.7 : 1 }}>{sub}</div>}
            {trend != null && (
                <div className={`flex items-center gap-1 mt-2 text-[10px] font-semibold ${trend >= 0 ? 'text-success' : 'text-error'}`}>
                    <ArrowUpRight className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
                    {Math.abs(trend).toFixed(1)}% vs last month
                </div>
            )}
        </div>
    );
}

export default function Earnings() {
    const [bookings] = useState(MOCK_BOOKINGS);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState('Overview');
    const [aiInsight, setAiInsight] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiStream, setAiStream] = useState('');

    useEffect(() => { setLoading(false); }, []);

    const metrics = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
        const lastMonthStart = format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd');
        const lastMonthEnd = format(subDays(startOfMonth(new Date()), 1), 'yyyy-MM-dd');

        const completed = bookings.filter(b => b.status === 'completed');
        const cancelled = bookings.filter(b => b.status === 'cancelled');
        const noShow = bookings.filter(b => b.status === 'no_show');
        const pending = bookings.filter(b => b.status === 'pending');

        const totalRevenue = completed.reduce((s, b) => s + (b.price || 0), 0);
        const todayRevenue = completed.filter(b => b.date === today).reduce((s, b) => s + (b.price || 0), 0);
        const weekRevenue = completed.filter(b => b.date >= weekStart).reduce((s, b) => s + (b.price || 0), 0);
        const monthRevenue = completed.filter(b => b.date >= monthStart).reduce((s, b) => s + (b.price || 0), 0);
        const lastMonthRevenue = completed.filter(b => b.date >= lastMonthStart && b.date <= lastMonthEnd).reduce((s, b) => s + (b.price || 0), 0);
        const trend = lastMonthRevenue > 0 ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : null;

        const cancelledLoss = cancelled.reduce((s, b) => s + (b.price || 0), 0);
        const noShowLoss = noShow.reduce((s, b) => s + (b.price || 0), 0);

        const byService = {};
        completed.forEach(b => {
            const s = b.service_name || 'Other';
            if (!byService[s]) byService[s] = { name: s, revenue: 0, count: 0 };
            byService[s].revenue += (b.price || 0);
            byService[s].count++;
        });

        const last6 = [];
        for (let i = 5; i >= 0; i--) {
            const d = subMonths(new Date(), i);
            const start = format(startOfMonth(d), 'yyyy-MM-dd');
            const end = format(startOfMonth(subMonths(d, -1)), 'yyyy-MM-dd');
            const rev = completed.filter(b => b.date >= start && b.date < end).reduce((s, b) => s + (b.price || 0), 0);
            last6.push({ name: format(d, 'MMM'), value: rev });
        }

        return {
            totalRevenue, todayRevenue, weekRevenue, monthRevenue, lastMonthRevenue, trend,
            cancelledLoss, noShowLoss, pending: pending.length,
            completionRate: bookings.length ? Math.round((completed.length / bookings.length) * 100) : 0,
            byService: Object.values(byService).sort((a, b) => b.revenue - a.revenue).slice(0, 6),
            lostRevenue: [...cancelled, ...noShow],
            trendData: last6,
        };
    }, [bookings]);

    const getAiInsight = async () => {
        if (!isConfigured()) {
            setAiInsight('**OpenRouter not configured** — Add `OPENROUTER_API_KEY` to unlock AI earning insights.');
            toast.info('OpenRouter API key required for AI insights');
            return;
        }
        setAiLoading(true);
        setAiInsight('');
        setAiStream('');
        try {
            let full = '';
            await chatDeepSeek({
                messages: [{
                    role: 'user',
                    content: `Analyze my provider earnings and give a business performance report:
- Total revenue: ${fmt(metrics.totalRevenue)}
- This month: ${fmt(metrics.monthRevenue)} (${metrics.trend != null ? `${metrics.trend >= 0 ? '+' : ''}${metrics.trend?.toFixed(1)}% vs last month` : 'first month'})
- Completion rate: ${metrics.completionRate}%
- Revenue lost to cancellations: ${fmt(metrics.cancelledLoss)}
- Revenue lost to no-shows: ${fmt(metrics.noShowLoss)}
- Top services: ${metrics.byService.slice(0, 3).map(s => `${s.name} ($${s.revenue})`).join(', ') || 'none yet'}

Give:
1. **Performance score** (A-F) with explanation
2. **Top 3 revenue growth opportunities**
3. **How to reduce the $${fmt(metrics.cancelledLoss + metrics.noShowLoss)} revenue loss**
4. **Pricing recommendations** based on performance
5. **30-day revenue target** with action plan`
                }],
                systemPrompt: 'You are Simon, an elite AI revenue analyst for Truvornex service providers. Give precise, actionable insights with specific dollar amounts and percentages.',
                temperature: 0.65,
                maxTokens: 1000,
                onChunk: (delta, acc) => { full = acc; setAiStream(acc); },
            });
            setAiInsight(full);
        } catch (e) {
            setAiInsight(`**Error:** ${e.message}`);
        }
        setAiLoading(false);
        setAiStream('');
    };

    const displayInsight = aiLoading ? aiStream : aiInsight;

    if (loading) return (
        <div className="space-y-6 max-w-4xl">
            <div className="skeleton-wave h-7 w-56 rounded-xl" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton-wave h-28 rounded-2xl" />)}
            </div>
            <div className="skeleton-wave h-64 rounded-2xl" />
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Earnings</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Revenue tracker & AI performance insights</p>
                </div>
                <button className="h-10 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                    style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                    onClick={() => toast.info('Exporting earnings data...')}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                    <Download className="h-4 w-4" />
                    Export
                </button>
            </div>

            {/* Tab selector */}
            <div className="flex gap-1 overflow-x-auto pb-1">
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0"
                        style={tab === t
                            ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }
                            : { backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                        {t}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {tab === 'Overview' && (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <KPICard label="Total Revenue" value={fmt(metrics.totalRevenue)} sub={`${metrics.completionRate}% completion rate`} icon={DollarSign} accent />
                        <KPICard label="This Month" value={fmt(metrics.monthRevenue)} sub="Calendar month" icon={CalendarDays} trend={metrics.trend} />
                        <KPICard label="This Week" value={fmt(metrics.weekRevenue)} sub="Mon–Sun" icon={TrendingUp} />
                        <KPICard label="Today" value={fmt(metrics.todayRevenue)} sub={`${metrics.pending} pending`} icon={Clock} />
                    </div>

                    <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <h2 className="font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>Revenue Trend (6 Months)</h2>
                        <div style={{ height: 200 }}>
                            <svg viewBox="0 0 100% 200" preserveAspectRatio="none" className="w-full h-full">
                                <defs>
                                    <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                {metrics.trendData.map((item, i) => {
                                    const maxValue = Math.max(...metrics.trendData.map(d => d.value), 1);
                                    const pointHeight = (item.value / maxValue) * 140;
                                    const x = (100 / (metrics.trendData.length - 1)) * i;
                                    const y = 180 - pointHeight;
                                    const prev = metrics.trendData[i - 1];
                                    const next = metrics.trendData[i + 1];
                                    return (
                                        <g key={item.name}>
                                            {i > 0 && (
                                                <path
                                                    d={`M${(100 / (metrics.trendData.length - 1)) * (i - 1)} ${180 - (prev.value / maxValue) * 140} Q${(100 / (metrics.trendData.length - 1)) * (i - 0.5)} ${180 - ((prev.value + item.value) / 2 / maxValue) * 140} ${x} ${y}`}
                                                    stroke="var(--color-success)" strokeWidth="2" fill="none" strokeLinecap="round"
                                                />
                                            )}
                                            <circle cx={x} cy={y} r={4} fill="var(--color-success)" stroke="var(--color-surface)" strokeWidth="2" />
                                            <text x={x} y={195} textAnchor="middle" fontSize="9" fill="var(--color-text-subtle)" style={{ fontFamily: 'Inter,sans-serif' }}>{item.name}</text>
                                            <text x={x} y={y - 8} textAnchor="middle" fontSize="8" fill="var(--color-primary)" fontWeight="bold" style={{ fontFamily: 'Inter,sans-serif' }}>{fmt(item.value)}</text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                    </div>
                </>
            )}

            {/* By Service Tab */}
            {tab === 'By Service' && (
                <div className="space-y-3">
                    {metrics.byService.length > 0 ? metrics.byService.map((s, i) => (
                        <div key={s.name} className="rounded-xl p-4 transition-all hover-lift card-lightning-subtle"
                            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                            <div className="flex items-center gap-4">
                                <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 card-lightning-subtle"
                                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] + '20' }}>
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm truncate" style={{ color: 'var(--color-primary)' }}>{s.name}</div>
                                    <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{s.count} booking{s.count !== 1 ? 's' : ''}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-black text-lg" style={{ color: 'var(--color-primary)' }}>{fmt(s.revenue)}</div>
                                    <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{(s.revenue / metrics.totalRevenue * 100).toFixed(1)}% of total</div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="rounded-2xl p-12 text-center shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                            <PieChart className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--color-text-subtle)' }} />
                            <h2 className="font-bold text-lg mb-1" style={{ color: 'var(--color-primary)' }}>No completed bookings yet</h2>
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Revenue by service will appear here once you complete bookings</p>
                        </div>
                    )}
                </div>
            )}

            {/* Loss Tracker Tab */}
            {tab === 'Loss Tracker' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-error),0.12)' }}>
                                    <XCircle className="h-4 w-4" style={{ color: 'var(--color-error)' }} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-subtle)' }}>Cancellations</span>
                            </div>
                            <div className="font-black text-3xl" style={{ color: 'var(--color-error)' }}>{fmt(metrics.cancelledLoss)}</div>
                            <div className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Lost revenue</div>
                        </div>
                        <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-warning),0.12)' }}>
                                    <AlertTriangle className="h-4 w-4" style={{ color: 'var(--color-warning)' }} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-subtle)' }}>No-Shows</span>
                            </div>
                            <div className="font-black text-3xl" style={{ color: 'var(--color-warning)' }}>{fmt(metrics.noShowLoss)}</div>
                            <div className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Lost revenue</div>
                        </div>
                    </div>

                    {metrics.lostRevenue.length > 0 ? (
                        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                            <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
                                <h2 className="font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>Lost Revenue Details</h2>
                            </div>
                            <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                                {metrics.lostRevenue.slice(0, 10).map((b, i) => (
                                    <div key={i} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-high/50">
                                        <div className={`h-2 w-2 rounded-full shrink-0 ${b.status === 'cancelled' ? 'bg-error' : 'bg-warning'}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate" style={{ color: 'var(--color-primary)' }}>
                                                {b.service_name || 'Service'} · {new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div className="text-[10px] capitalize mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{b.status?.replace('_', ' ')}</div>
                                        </div>
                                        <div className="font-semibold text-sm" style={{ color: b.status === 'cancelled' ? 'var(--color-error)' : 'var(--color-warning)' }}>{fmt(b.price)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl p-12 text-center shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgba(var(--color-success),0.12)' }}>
                                <CheckCircle2 className="h-6 w-6" style={{ color: 'var(--color-success)' }} />
                            </div>
                            <h2 className="font-bold text-lg mb-1" style={{ color: 'var(--color-primary)' }}>No losses yet!</h2>
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>All bookings completed successfully</p>
                        </div>
                    )}
                </div>
            )}

            {/* Trends Tab */}
            {tab === 'Trends' && (
                <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <h2 className="font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>Monthly Revenue</h2>
                    <div style={{ height: 220 }}>
                        <svg viewBox="0 0 100% 220" preserveAspectRatio="none" className="w-full h-full">
                            <defs>
                                <linearGradient id="barGrad" x1="0" y1="1" x2="0" y2="0">
                                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={1} />
                                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                </linearGradient>
                            </defs>
                            {metrics.trendData.map((item, i) => {
                                const maxValue = Math.max(...metrics.trendData.map(d => d.value), 1);
                                const barHeight = (item.value / maxValue) * 160;
                                const barWidth = 100 / metrics.trendData.length * 0.7;
                                const x = 100 / metrics.trendData.length * i + 100 / metrics.trendData.length * 0.15;
                                const y = 200 - barHeight;
                                return (
                                    <g key={item.name}>
                                        <rect x={`${x}%`} y={y} width={`${barWidth}%`} height={barHeight} fill="url(#barGrad)" rx={3} ry={3} />
                                        <text x={`${x + barWidth/2}%`} y={215} textAnchor="middle" fontSize="8" fill="var(--color-text-subtle)" style={{ fontFamily: 'Inter,sans-serif' }}>{item.name}</text>
                                        <text x={`${x + barWidth/2}%`} y={y - 5} textAnchor="middle" fontSize="9" fill="var(--color-primary)" fontWeight="bold" style={{ fontFamily: 'Inter,sans-serif' }}>{fmt(item.value)}</text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>
            )}

            {/* Simon AI Earnings Insight */}
            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-success),0.12)' }}>
                            <Sparkles className="h-5 w-5" style={{ color: 'var(--color-success)' }} />
                        </div>
                        <div>
                            <h2 className="font-semibold" style={{ color: 'var(--color-primary)' }}>Simon's Earnings Analysis</h2>
                            <p className="text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>Powered by OpenRouter AI</p>
                        </div>
                    </div>
                    <button onClick={getAiInsight} disabled={aiLoading}
                        className="h-10 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                        {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        {aiLoading ? 'Analyzing...' : aiInsight ? 'Refresh' : 'Analyze'}
                    </button>
                </div>
                {displayInsight ? (
                    <div className="rounded-xl p-5 prose prose-sm max-w-none text-sm leading-relaxed"
                        style={{ backgroundColor: 'var(--color-surface-high)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
                        <ReactMarkdown>{displayInsight}</ReactMarkdown>
                        {aiLoading && <span className="inline-block h-3 w-0.5 ml-0.5 bg-current animate-pulse" />}
                    </div>
                ) : (
                    <div className="rounded-xl p-6 text-center" style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                        <Sparkles className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--color-text-subtle)' }} />
                        <h3 className="font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>Get AI-Powered Insights</h3>
                        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                            Click "Analyze" for Simon's AI-powered earnings analysis, growth recommendations, 
                            and a personalized 30-day revenue action plan.
                        </p>
                        <button onClick={getAiInsight} disabled={aiLoading}
                            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold transition-all"
                            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                            <Sparkles className="h-4 w-4" />
                            Analyze My Earnings
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}