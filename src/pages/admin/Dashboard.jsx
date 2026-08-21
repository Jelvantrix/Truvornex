import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { detectAnomalies, findBundleOpportunities, predictDemand, rankProviders } from '@/lib/ai/engine';
import { simonAnalyzePlatform, simonExplainAnomaly, simonStatus } from '@/lib/ai/simon';
import { ShieldCheck, CalendarDays, AlertTriangle, TrendingUp,
    Zap, CheckCircle2, Layers, Sparkles, Brain, DollarSign } from 'lucide-react';
import { format, subDays, startOfMonth } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

const KPI = ({ label, value, sub, icon: Icon, accent, delta }) => (
    <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: accent ? 'var(--color-primary)' : 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accent ? 'rgba(255,255,255,0.55)' : 'var(--color-text-subtle)' }}>{label}</span>
            <div className="h-8 w-8 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: accent ? 'rgba(255,255,255,0.12)' : 'var(--color-surface-high)' }}>
                <Icon className="h-4 w-4" style={{ color: accent ? 'rgba(255,255,255,0.7)' : 'var(--color-text-subtle)' }} />
            </div>
        </div>
        <div className="font-black text-2xl tracking-tight" style={{ color: accent ? 'var(--color-on-primary)' : 'var(--color-primary)' }}>{value}</div>
        {sub && <div className="text-[10px] mt-1.5" style={{ color: accent ? 'rgba(255,255,255,0.5)' : 'var(--color-text-subtle)' }}>{sub}</div>}
    </div>
);

const SEVERITY_CONFIG = {
    high:   { bg: 'rgba(var(--color-error),0.12)',   border: 'rgba(var(--color-error),0.3)',   text: 'var(--color-error)',   label: 'High' },
    medium: { bg: 'rgba(var(--color-warning),0.12)', border: 'rgba(var(--color-warning),0.3)', text: 'var(--color-warning)', label: 'Medium' },
    low:    { bg: 'var(--color-surface-high)', border: 'var(--color-border)',  text: 'var(--color-text-muted)', label: 'Low' },
};

const MOCK_PROVIDERS = [
    { id: 'p1', business_name: 'Sparkle Clean Co.', status: 'approved', rating: 4.9, review_count: 127, city: 'San Francisco' },
    { id: 'p2', business_name: 'CoolAir HVAC', status: 'approved', rating: 4.8, review_count: 89, city: 'Oakland' },
    { id: 'p3', business_name: 'Green Thumb Landscaping', status: 'approved', rating: 4.7, review_count: 56, city: 'Berkeley' },
    { id: 'p4', business_name: 'Emergency Plumbing Co.', status: 'pending', rating: 4.6, review_count: 203, city: 'Daly City' },
    { id: 'p5', business_name: 'ClearView Windows', status: 'approved', rating: 4.9, review_count: 34, city: 'San Mateo' },
    { id: 'p6', business_name: 'Pro Painters Inc.', status: 'pending', rating: 4.5, review_count: 67, city: 'Redwood City' },
];

const MOCK_BOOKINGS = [
    { id: '1', service_name: 'Deep House Cleaning', provider_id: 'p1', price: 150, date: '2025-01-15', status: 'completed' },
    { id: '2', service_name: 'AC Repair & Maintenance', provider_id: 'p2', price: 200, date: '2025-01-18', status: 'completed' },
    { id: '3', service_name: 'Lawn Mowing', provider_id: 'p3', price: 85, date: '2025-01-20', status: 'completed' },
    { id: '4', service_name: 'Plumbing Inspection', provider_id: 'p4', price: 120, date: '2025-01-22', status: 'completed' },
    { id: '5', service_name: 'Window Cleaning', provider_id: 'p5', price: 95, date: '2025-01-10', status: 'cancelled' },
    { id: '6', service_name: 'Electrical Work', provider_id: 'p1', price: 350, date: '2024-12-08', status: 'completed' },
    { id: '7', service_name: 'Gutter Cleaning', provider_id: 'p3', price: 180, date: '2024-11-15', status: 'completed' },
    { id: '8', service_name: 'House Cleaning', provider_id: 'p1', price: 150, date: '2024-11-10', status: 'no_show' },
];

const MOCK_CATEGORIES = [
    { slug: 'cleaning', name: 'Cleaning' },
    { slug: 'hvac', name: 'HVAC' },
    { slug: 'landscaping', name: 'Landscaping' },
    { slug: 'plumbing', name: 'Plumbing' },
    { slug: 'electrical', name: 'Electrical' },
    { slug: 'windows', name: 'Windows' },
];

export default function Dashboard() {
    const [providers] = useState(MOCK_PROVIDERS);
    const [bookings] = useState(MOCK_BOOKINGS);
    const [categories] = useState(MOCK_CATEGORIES);
    const [loading, setLoading] = useState(false);
    const [simonReport, setSimonReport] = useState('');
    const [simonLoading, setSimonLoading] = useState(false);
    const [explainedAnomaly, setExplainedAnomaly] = useState(null);
    const [anomalyExplanation, setAnomalyExplanation] = useState('');

    const metrics = useMemo(() => {
        const completed = bookings.filter(b => b.status === 'completed');
        const pending   = bookings.filter(b => b.status === 'pending');
        const cancelled = bookings.filter(b => b.status === 'cancelled');
        const approved  = providers.filter(p => p.status === 'approved');
        const pendingProvs = providers.filter(p => p.status === 'pending');

        const totalRevenue  = completed.reduce((s, b) => s + (b.price || 0), 0);
        const monthStart    = format(startOfMonth(new Date()), 'yyyy-MM-dd');
        const monthRevenue  = completed.filter(b => b.date >= monthStart).reduce((s, b) => s + (b.price || 0), 0);

        const daily = {};
        for (let i = 13; i >= 0; i--) {
            const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
            daily[d] = { date: format(subDays(new Date(), i), 'MMM d'), bookings: 0, revenue: 0 };
        }
        bookings.forEach(b => {
            if (daily[b.date]) {
                daily[b.date].bookings++;
                if (b.status === 'completed') daily[b.date].revenue += (b.price || 0);
            }
        });

        const demand    = predictDemand(categories, bookings).slice(0, 6);
        const anomalies = detectAnomalies(bookings, approved);
        const topProviders = rankProviders(approved, bookings, null, null, null).slice(0, 5);
        const bundles   = findBundleOpportunities(bookings);
        const total     = bookings.length;
        const completionRate   = total > 0 ? Math.round(completed.length / total * 100) : 0;
        const cancellationRate = total > 0 ? Math.round(cancelled.length / total * 100) : 0;

        return {
            totalBookings: bookings.length, completedCount: completed.length,
            pendingCount: pending.length, approvedProviders: approved.length,
            pendingProviders: pendingProvs.length, totalRevenue, monthRevenue,
            completionRate, cancellationRate,
            dailyData: Object.values(daily), demand, anomalies, topProviders, bundles,
        };
    }, [providers, bookings, categories]);

    const runSimonReport = async () => {
        if (!simonStatus().configured) {
            setSimonReport('**Simon AI is not configured.** Add `OPENROUTER_API_KEY` to your environment variables to activate hyper-intelligent platform analysis.');
            toast.info('OpenRouter API key required for Simon AI');
            return;
        }
        setSimonLoading(true);
        setSimonReport('');
        try {
            await simonAnalyzePlatform({
                providers: providers.length,
                approvedProviders: metrics.approvedProviders,
                pendingProviders: metrics.pendingProviders,
                bookings: bookings.length,
                completedBookings: metrics.completedCount,
                pendingBookings: metrics.pendingCount,
                revenue: metrics.totalRevenue,
                completionRate: metrics.completionRate,
                avgRating: providers.reduce((s, p) => s + (p.rating || 0), 0) / Math.max(providers.length, 1),
            }, (delta) => setSimonReport(prev => prev + delta));
        } catch (e) {
            setSimonReport('Simon encountered an error. Check your API key configuration.');
        }
        setSimonLoading(false);
    };

    const explainAnomaly = async (anomaly) => {
        if (!simonStatus().configured) return;
        setExplainedAnomaly(anomaly);
        setAnomalyExplanation('');
        try {
            await simonExplainAnomaly(anomaly, {}, (delta) => setAnomalyExplanation(prev => prev + delta));
        } catch (e) {
            setAnomalyExplanation('Unable to analyze anomaly.');
        }
    };

    if (loading) return (
        <div className="space-y-6 max-w-7xl">
            <div className="skeleton-wave h-7 w-56 rounded-xl" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton-wave h-28 rounded-2xl" />)}
            </div>
            <div className="skeleton-wave h-64 rounded-2xl" />
        </div>
    );

    return (
        <div className="space-y-6 max-w-7xl">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-primary),0.15)', border: '1px solid rgba(var(--color-primary),0.25)' }}>
                        <Sparkles className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                        <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Admin Intelligence</h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Simon AI-powered platform overview</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {metrics.anomalies.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: 'rgba(var(--color-error),0.12)', border: '1px solid rgba(var(--color-error),0.3)' }}>
                            <AlertTriangle className="h-4 w-4" style={{ color: 'var(--color-error)' }} />
                            <span className="text-sm font-semibold" style={{ color: 'var(--color-error)' }}>{metrics.anomalies.length} anomalies</span>
                        </div>
                    )}
                    <button onClick={runSimonReport} disabled={simonLoading}
                        className="h-10 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                        <Brain className="h-4 w-4" />
                        {simonLoading ? 'Simon analyzing…' : 'Simon Analysis'}
                    </button>
                </div>
            </div>

            {/* Simon Report */}
            {simonReport && (
                <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="flex items-center gap-2 mb-4">
                        <Brain className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                        <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>Simon's Platform Intelligence Report</span>
                    </div>
                    <div className="prose prose-sm max-w-none" style={{ color: 'var(--color-text)' }}>
                        <ReactMarkdown>{simonReport}</ReactMarkdown>
                    </div>
                </div>
            )}

            {/* KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <KPI accent label="Total Revenue" value={`$${metrics.totalRevenue.toLocaleString()}`} sub={`$${metrics.monthRevenue.toLocaleString()} this month`} icon={DollarSign} />
                <KPI label="Total Bookings" value={metrics.totalBookings} sub={`${metrics.completedCount} completed`} icon={CalendarDays} />
                <KPI label="Active Providers" value={metrics.approvedProviders} sub={`${metrics.pendingProviders} pending review`} icon={ShieldCheck} />
                <KPI label="Completion Rate" value={`${metrics.completionRate}%`} sub={`${metrics.cancellationRate}% cancelled`} icon={CheckCircle2} />
            </div>

            {/* Activity Chart */}
            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <h2 className="font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>Platform Activity — Last 14 Days</h2>
                <div style={{ height: 200 }}>
                    <svg viewBox="0 0 100% 200" preserveAspectRatio="none" className="w-full h-full">
                        <defs>
                            <linearGradient id="bkGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        {metrics.dailyData.map((item, i) => {
                            const maxValue = Math.max(...metrics.dailyData.map(d => d.bookings), 1);
                            const pointHeight = (item.bookings / maxValue) * 140;
                            const x = (100 / (metrics.dailyData.length - 1)) * i;
                            const y = 180 - pointHeight;
                            return (
                                <g key={item.date}>
                                    {i > 0 && (
                                        <path
                                            d={`M${(100 / (metrics.dailyData.length - 1)) * (i - 1)} ${180 - (metrics.dailyData[i - 1].bookings / maxValue) * 140} Q${(100 / (metrics.dailyData.length - 1)) * (i - 0.5)} ${180 - ((metrics.dailyData[i - 1].bookings + item.bookings) / 2 / maxValue) * 140} ${x} ${y}`}
                                            stroke="var(--color-primary)" strokeWidth="2" fill="none" strokeLinecap="round"
                                        />
                                    )}
                                    <circle cx={x} cy={y} r={3} fill="var(--color-primary)" stroke="var(--color-surface)" strokeWidth="1.5" />
                                    {i % 3 === 0 && <text x={x} y={195} textAnchor="middle" fontSize="8" fill="var(--color-text-subtle)" style={{ fontFamily: 'Inter,sans-serif' }}>{item.date}</text>}
                                </g>
                            );
                        })}
                    </svg>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Anomaly Alerts */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" style={{ color: 'var(--color-warning)' }} />
                            <h2 className="font-bold" style={{ color: 'var(--color-primary)' }}>Anomaly Alerts</h2>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(var(--color-warning),0.12)', color: 'var(--color-warning)', border: '1px solid rgba(var(--color-warning),0.3)' }}>{metrics.anomalies.length}</span>
                        </div>
                    </div>
                    {metrics.anomalies.length === 0 ? (
                        <div className="rounded-2xl p-6 shimmer text-center" style={{ backgroundColor: 'rgba(var(--color-success),0.08)', border: '1px solid rgba(var(--color-success),0.2)' }}>
                            <CheckCircle2 className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--color-success)' }} />
                            <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--color-success)' }}>No anomalies detected</h3>
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Platform is healthy</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {metrics.anomalies.slice(0, 5).map((a, i) => {
                                const s = SEVERITY_CONFIG[a.severity] || SEVERITY_CONFIG.medium;
                                return (
                                    <div key={i} className="rounded-xl p-4 transition-all hover-lift card-lightning-subtle cursor-pointer"
                                        style={{ backgroundColor: s.bg, border: `1px solid ${s.border}` }}
                                        onClick={() => explainAnomaly(a)}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-sm" style={{ color: s.text }}>{a.title}</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}` }}>{s.label}</span>
                                        </div>
                                        <p className="text-sm" style={{ color: s.text }}>{a.detail}</p>
                                        {simonStatus().configured && (
                                            <p className="text-[10px] mt-1.5 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                                                <Brain className="h-3 w-3" />
                                                Click for Simon's analysis
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Anomaly explanation panel */}
                    {explainedAnomaly && (
                        <div className="rounded-xl p-4 shimmer" style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Brain className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                                    <span className="font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>Simon's Analysis</span>
                                </div>
                                <button onClick={() => { setExplainedAnomaly(null); setAnomalyExplanation(''); }}
                                    className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Close</button>
                            </div>
                            <div className="prose prose-sm max-w-none text-sm leading-relaxed">
                                <ReactMarkdown>{anomalyExplanation || '⏳ Simon is analyzing…'}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>

                {/* Demand Forecast */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                            <h2 className="font-bold" style={{ color: 'var(--color-primary)' }}>Demand Forecast</h2>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)', color: 'var(--color-primary)', border: '1px solid rgba(var(--color-primary),0.2)' }}>
                            {new Date().toLocaleString('default', { month: 'long' })}
                        </span>
                    </div>
                    <div className="rounded-xl p-4 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <div style={{ height: 180 }}>
                            <svg viewBox="0 0 100% 180" preserveAspectRatio="none" className="w-full h-full">
                                {metrics.demand.map((d, i) => {
                                    const maxDemand = Math.max(...metrics.demand.map(x => x.demandForecast), 1);
                                    const barHeight = (d.demandForecast / maxDemand) * 130;
                                    const barWidth = 100 / metrics.demand.length * 0.7;
                                    const x = 100 / metrics.demand.length * i + 100 / metrics.demand.length * 0.15;
                                    const y = 160 - barHeight;
                                    const fill = d.demandLevel === 'high' ? 'var(--color-error)' : d.demandLevel === 'rising' ? 'var(--color-warning)' : 'var(--color-primary)';
                                    return (
                                        <g key={d.name}>
                                            <rect x={`${x}%`} y={y} width={`${barWidth}%`} height={barHeight} fill={fill} rx={3} ry={3} />
                                            <text x={`${x + barWidth/2}%`} y={175} textAnchor="middle" fontSize="8" fill="var(--color-text-subtle)" style={{ fontFamily: 'Inter,sans-serif' }}>{d.name}</text>
                                            <text x={`${x + barWidth/2}%`} y={y - 5} textAnchor="middle" fontSize="9" fill="var(--color-primary)" fontWeight="bold" style={{ fontFamily: 'Inter,sans-serif' }}>{d.demandForecast}</text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top AI-Ranked Providers */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                        <h2 className="font-bold" style={{ color: 'var(--color-primary)' }}>Top AI-Ranked Providers</h2>
                    </div>
                    <Link to="/admin/providers"
                        className="text-sm font-medium flex items-center gap-1 transition-all"
                        style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                        Manage all <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    {metrics.topProviders.length === 0 ? (
                        <div className="p-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>No approved providers yet.</div>
                    ) : (
                        <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                            {metrics.topProviders.map((p, i) => (
                                <div key={p.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[var(--color-surface-high)]">
                                    <span className="text-[10px] font-bold w-6 text-center" style={{ color: 'var(--color-text-subtle)' }}>{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-primary)' }}>{p.business_name}</p>
                                        <p className="text-[10px] truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{p.city || 'Unknown location'}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="w-24">
                                            <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-high)' }}>
                                                <div className="h-full rounded-full" style={{ width: `${p.aiScore}%`, background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }} />
                                            </div>
                                        </div>
                                        <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>{p.aiScore}</span>
                                    </div>
                                    <div className="text-right shrink-0 w-24">
                                        <p className="font-semibold text-sm" style={{ color: 'var(--color-text-muted)' }}>{p.trustScore}/100</p>
                                        <p className="text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>Trust Score</p>
                                    </div>
                                    <div className="text-right shrink-0 w-24">
                                        <p className="font-semibold text-sm" style={{ color: 'var(--color-text-muted)' }}>{p.completionRate}%</p>
                                        <p className="text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>Completion</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Bundle Opportunities */}
            {metrics.bundles.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4" style={{ color: 'var(--color-info)' }} />
                            <h2 className="font-bold" style={{ color: 'var(--color-primary)' }}>Bundle Opportunities</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {metrics.bundles.slice(0, 3).map((b, i) => (
                            <div key={i} className="rounded-xl p-5 shimmer transition-all hover-lift card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-info),0.08)', border: '1px solid rgba(var(--color-info),0.2)' }}>
                                <div className="h-8 w-8 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(var(--color-info),0.15)' }}>
                                    <Layers className="h-4 w-4" style={{ color: 'var(--color-info)' }} />
                                </div>
                                <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>{b.service}</p>
                                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{b.count} matching requests</p>
                                <p className="font-black text-lg mt-2" style={{ color: 'var(--color-info)' }}>Potential saving: {b.estimatedSaving}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}