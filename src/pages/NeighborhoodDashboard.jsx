import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    AreaChart, Area
} from 'recharts';
import {
    Activity, AlertCircle, Layers, TrendingUp, TrendingDown,
    ArrowRight, ShieldCheck, CheckCircle, MapPin, Calendar,
    MessageSquare, Vote, Zap, Package, Star,
    Heart, Wrench, RefreshCw
} from 'lucide-react';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { format, subDays } from 'date-fns';
import { toast } from 'sonner';

const OS_MODULES = [
    { icon: MessageSquare, label: 'Community Feed',  href: '/community',         desc: 'Posts & skill swaps' },
    { icon: Calendar,      label: 'Local Events',    href: '/events',            desc: 'Concerts & meetups' },
    { icon: Vote,          label: 'Polls',           href: '/community',         desc: 'Neighborhood votes' },
    { icon: Zap,           label: 'Emergency',       href: '/neighborhood/emergency', desc: 'Urgent dispatch' },
    { icon: Layers,        label: 'Group Deals',     href: '/neighborhood/group-buy', desc: 'Save with neighbors' },
    { icon: RefreshCw,     label: 'Skill Swap',      href: '/neighborhood/skill-swap', desc: 'Trade skills & time' },
    { icon: ShieldCheck,   label: 'Jury',            href: '/neighborhood/jury', desc: 'Resolve disputes' },
    { icon: Package,       label: 'Services',        href: '/services',          desc: 'Book any service' },
    { icon: Star,          label: 'Recommendations', href: '/recommendations',   desc: 'AI picks for you' },
    { icon: Heart,         label: 'Loyalty',         href: '/loyalty',           desc: 'Points & rewards' },
];

const QUICK_ACTIONS = [
    { label: 'Report issue', icon: AlertCircle, action: 'report', color: 'var(--color-warning)' },
    { label: 'Request help',  icon: Heart,      action: 'help',    color: 'var(--color-error)'   },
    { label: 'Share update',  icon: MessageSquare, action: 'post', color: 'var(--color-primary)' },
    { label: 'Book service',  icon: Wrench,     action: 'book',    color: 'var(--color-info)'    },
];

function StatCard({ label, value, sub, icon: Icon, trend }) {
    return (
        <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-subtle)' }}>{label}</span>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                    <Icon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                </div>
            </div>
            <div className="font-black text-3xl tracking-tight" style={{ color: 'var(--color-primary)' }}>{value}</div>
            {sub && <div className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>{sub}</div>}
            {trend != null && (
                <div className="flex items-center gap-1 mt-2 text-xs font-semibold" style={{ color: trend >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                    {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(trend).toFixed(0)}% this week
                </div>
            )}
        </div>
    );
}

function PulseBar({ label, value, max }) {
    const pct = max > 0 ? Math.round(value / max * 100) : 0;
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs w-24 shrink-0 truncate" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-high)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: 'var(--color-primary)' }} />
            </div>
            <span className="text-xs font-semibold w-6 text-right" style={{ color: 'var(--color-text)' }}>{value}</span>
        </div>
    );
}

function GapBadge({ category, demand, supply }) {
    const ratio = supply === 0 ? 99 : demand / supply;
    const level = ratio > 3 ? 'critical' : ratio > 2 ? 'high' : 'moderate';
    const styles = {
        critical: { bg: 'var(--color-error-bg)',   border: 'var(--color-error)',   color: 'var(--color-error)' },
        high:     { bg: 'var(--color-warning-bg)', border: 'var(--color-warning)', color: 'var(--color-warning)' },
        moderate: { bg: 'var(--color-info-bg)',    border: 'var(--color-info)',    color: 'var(--color-info)' },
    };
    const labels = { critical: 'Critical Gap', high: 'High Demand', moderate: 'Moderate Gap' };
    const s = styles[level];
    return (
        <div className="rounded-xl px-4 py-3 hover-lift" style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
            <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm capitalize">{category.replace('_', ' ')}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">{labels[level]}</span>
            </div>
            <div className="flex items-center gap-4 text-xs opacity-80">
                <span>{demand} pending requests</span>
                <span>{supply} available providers</span>
            </div>
        </div>
    );
}

export default function NeighborhoodDashboard() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [providers, setProviders] = useState([]);
    const [bundles, setBundles] = useState([]);
    const [posts, setPosts] = useState([]);
    const [events, setEvents] = useState([]);
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alertDismissed, setAlertDismissed] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const [bookRes, provRes, bundleRes, postRes, evtRes, pollRes] = await Promise.allSettled([
                supabase.from('bookings').select('id,status,date,time_slot,service_name,created_at').order('created_at', { ascending: false }).limit(100),
                supabase.from('providers').select('id,category_slugs,is_active,rating').eq('is_active', true).limit(200),
                supabase.from('service_bundles').select('id,title,status,zone_name,current_participants,max_participants,discount_percentage').limit(20),
                supabase.from('community_posts').select('id,type,title,body,author_name,created_date,upvotes,reply_count').order('created_date', { ascending: false }).limit(10),
                supabase.from('events').select('id,title,date,category,venue_name,is_free,ticket_price,tickets_sold,total_tickets').order('date', { ascending: true }).limit(5),
                supabase.from('neighborhood_polls').select('id,question,options,created_by_name,created_at').order('created_at', { ascending: false }).limit(3),
            ]);
            if (bookRes.value?.data) setBookings(bookRes.value.data);
            if (provRes.value?.data) setProviders(provRes.value.data);
            if (bundleRes.value?.data) setBundles(bundleRes.value.data);
            if (postRes.value?.data) setPosts(postRes.value.data);
            if (evtRes.value?.data) setEvents(evtRes.value.data);
            if (pollRes.value?.data) setPolls(pollRes.value.data);
            setLoading(false);
        };
        load();
    }, []);

    const metrics = useMemo(() => {
        const pending = bookings.filter(b => b.status === 'pending');
        const confirmed = bookings.filter(b => b.status === 'confirmed');
        const completed = bookings.filter(b => b.status === 'completed');
        const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
        const today = new Date().toISOString().split('T')[0];
        const prevWeekStart = format(subDays(new Date(), 14), 'yyyy-MM-dd');
        const prevWeekEnd = format(subDays(new Date(), 7), 'yyyy-MM-dd');

        const demandMap = {};
        pending.concat(confirmed).forEach(b => {
            const cat = b.service_name?.split(' ')[0]?.toLowerCase() || 'other';
            demandMap[cat] = (demandMap[cat] || 0) + 1;
        });
        const supplyMap = {};
        providers.forEach(p => (p.category_slugs || []).forEach(slug => { supplyMap[slug] = (supplyMap[slug] || 0) + 1; }));

        const demandChartData = Object.entries(demandMap).sort((a,b) => b[1]-a[1]).slice(0,8)
            .map(([name, demand]) => ({ name: name.charAt(0).toUpperCase()+name.slice(1), demand, supply: supplyMap[name]||0 }));

        const gaps = Object.entries(demandMap)
            .filter(([cat,demand]) => demand > 1 && demand > (supplyMap[cat]||0)*2)
            .sort((a,b) => b[1]-a[1]).slice(0,5)
            .map(([cat,demand]) => ({ category:cat, demand, supply:supplyMap[cat]||0 }));

        const dailyMap = {};
        for (let i=13; i>=0; i--) {
            const d = format(subDays(new Date(),i),'yyyy-MM-dd');
            dailyMap[d] = { date: format(subDays(new Date(),i),'MMM d'), count:0 };
        }
        bookings.forEach(b => { if (dailyMap[b.date]) dailyMap[b.date].count++; });

        const thisWeek = bookings.filter(b => b.date >= weekAgo && b.date <= today).length;
        const prevWeek = bookings.filter(b => b.date >= prevWeekStart && b.date <= prevWeekEnd).length;
        const trend = prevWeek > 0 ? (thisWeek - prevWeek) / prevWeek * 100 : null;

        const avgRating = providers.length > 0
            ? (providers.reduce((s,p) => s + (p.rating || 0), 0) / providers.length).toFixed(1)
            : '—';

        const categoryActivity = Object.entries(demandMap).sort((a,b)=>b[1]-a[1]).slice(0,6);
        const maxDemand = categoryActivity[0]?.[1] || 1;

        return {
            totalProviders: providers.length,
            pending: pending.length, confirmed: confirmed.length,
            formingBundles: bundles.filter(b => b.status === 'forming').length,
            completedTotal: completed.length,
            demandChartData, gaps,
            dailyTrend: Object.values(dailyMap),
            trend, avgRating, categoryActivity, maxDemand,
            recent: [...bookings].slice(0,8),
        };
    }, [bookings, providers, bundles]);

    const upcomingEvents = events.filter(e => !e.date || new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)));
    const totalPollVotes = polls.reduce((s,p) => s + (p.options||[]).reduce((ss,o) => ss+(o.votes||0),0), 0);

    if (loading) return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{Array.from({length:4}).map((_,i) => <div key={i} className="skeleton-wave h-28 rounded-2xl" />)}</div>
            <div className="skeleton-wave h-48 rounded-2xl" />
            <div className="grid grid-cols-2 gap-3">{Array.from({length:4}).map((_,i) => <div key={i} className="skeleton-wave h-20 rounded-xl" />)}</div>
        </div>
    );

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="relative h-2.5 w-2.5">
                            <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: 'var(--color-success)' }} />
                            <div className="relative h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'var(--color-success)' }} />
                        </div>
                        <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)' }}>Neighborhood OS</h1>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Your neighborhood's operating system — live intelligence & community hub</p>
                </div>
                <button onClick={() => window.location.reload()} className="h-8 w-8 rounded-xl flex items-center justify-center transition-colors card-lightning-subtle" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                    <RefreshCw className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* OS Pulse Banner */}
            {!alertDismissed && metrics.gaps.length > 0 && (
                <div className="rounded-2xl p-4 flex items-start gap-3 hover-lift" style={{ backgroundColor: 'var(--color-warning-bg)', border: '1px solid var(--color-warning)', color: 'var(--color-warning)' }}>
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-semibold text-sm">Neighborhood Alert</p>
                        <p className="text-xs mt-0.5">
                            {metrics.gaps.length} service gap{metrics.gaps.length>1?'s':''} detected — high demand with low provider supply. Consider sharing this with local pros.
                        </p>
                    </div>
                    <button onClick={() => { setAlertDismissed(true); toast.success('Alert dismissed'); }} className="text-lg leading-none transition-colors" style={{ color: 'var(--color-warning)' }}>×</button>
                </div>
            )}

            {/* KPI Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Active Providers" value={metrics.totalProviders || '—'} sub="Verified & live" icon={ShieldCheck} />
                <StatCard label="Open Requests" value={metrics.pending} sub="Awaiting match" icon={Activity} trend={metrics.trend} />
                <StatCard label="Group Deals" value={metrics.formingBundles} sub="Forming now" icon={Layers} />
                <StatCard label="Jobs Completed" value={metrics.completedTotal} sub="Platform-wide" icon={CheckCircle} />
            </div>

            {/* OS Modules Grid */}
            <div>
                <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--color-primary)' }}>Neighborhood Modules</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {OS_MODULES.map(m => (
                        <Link key={m.href+m.label} to={m.href}
                            className="flex flex-col items-start gap-2 p-3.5 rounded-2xl border card-lightning-subtle hover-lift transition-all group">
                            <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                                <m.icon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <div>
                                <p className="text-xs font-bold leading-tight" style={{ color: 'var(--color-primary)' }}>{m.label}</p>
                                <p className="text-[10px] mt-0.5 leading-tight" style={{ color: 'var(--color-text-muted)' }}>{m.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* 3-column live widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Recent Community Activity */}
                <div className="lg:col-span-1 rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-3.5 w-3.5" style={{ color: 'var(--color-primary)' }} />
                            <span className="text-xs font-bold">Community Pulse</span>
                        </div>
                        <Link to="/community" className="text-[10px] flex items-center gap-0.5 transition-colors" style={{ color: 'var(--color-text-muted)' }}>View all <ArrowRight className="h-3 w-3" /></Link>
                    </div>
                    <div className="divide-y divide-[var(--color-border)]">
                        {posts.length === 0 ? (
                            <div className="px-4 py-8 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>No posts yet</div>
                        ) : posts.slice(0,5).map(p => (
                            <div key={p.id} className="px-4 py-2.5 transition-colors hover:bg-[var(--color-surface-high)]">
                                <p className="text-xs font-medium line-clamp-1" style={{ color: 'var(--color-primary)' }}>{p.title || p.body}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{p.author_name}</span>
                                    {p.upvotes > 0 && <span className="text-[10px]" style={{ color: 'var(--color-error)' }}>♥ {p.upvotes}</span>}
                                    {p.reply_count > 0 && <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{p.reply_count} replies</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="lg:col-span-1 rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" style={{ color: 'var(--color-primary)' }} />
                            <span className="text-xs font-bold">Upcoming Events</span>
                        </div>
                        <Link to="/events" className="text-[10px] flex items-center gap-0.5 transition-colors" style={{ color: 'var(--color-text-muted)' }}>See all <ArrowRight className="h-3 w-3" /></Link>
                    </div>
                    <div className="divide-y divide-[var(--color-border)]">
                        {upcomingEvents.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <Calendar className="h-6 w-6 mx-auto mb-2" strokeWidth={1.5} style={{ color: 'var(--color-text-subtle)' }} />
                                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>No events yet</p>
                                <Link to="/events" className="text-[10px] font-semibold underline underline-offset-2 mt-1 inline-block" style={{ color: 'var(--color-primary)' }}>Create one</Link>
                            </div>
                        ) : upcomingEvents.slice(0,5).map(ev => (
                            <div key={ev.id} className="px-4 py-2.5 flex items-center gap-2.5">
                                <Calendar className="h-5 w-5 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium line-clamp-1" style={{ color: 'var(--color-primary)' }}>{ev.title}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        {ev.date && <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{ev.date}</span>}
                                        <span className="text-[10px] font-semibold" style={{ color: 'var(--color-success)' }}>{ev.is_free || !ev.ticket_price ? 'Free' : `$${ev.ticket_price}`}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active Polls */}
                <div className="lg:col-span-1 rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <div className="flex items-center gap-2">
                            <Vote className="h-3.5 w-3.5" style={{ color: 'var(--color-primary)' }} />
                            <span className="text-xs font-bold">Active Polls</span>
                            {totalPollVotes > 0 && <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{totalPollVotes} votes</span>}
                        </div>
                        <Link to="/community" className="text-[10px] flex items-center gap-0.5 transition-colors" style={{ color: 'var(--color-text-muted)' }}>Vote <ArrowRight className="h-3 w-3" /></Link>
                    </div>
                    <div className="p-3 space-y-2">
                        {polls.length === 0 ? (
                            <div className="py-6 text-center">
                                <Vote className="h-6 w-6 mx-auto mb-2" strokeWidth={1.5} style={{ color: 'var(--color-text-subtle)' }} />
                                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>No polls yet</p>
                                <Link to="/community" className="text-[10px] font-semibold underline underline-offset-2 mt-1 inline-block" style={{ color: 'var(--color-primary)' }}>Create a poll</Link>
                            </div>
                        ) : polls.map(poll => {
                            const total = (poll.options||[]).reduce((s,o) => s+(o.votes||0), 0);
                            const top = (poll.options||[]).reduce((a,b) => (a.votes||0)>=(b.votes||0)?a:b, {});
                            return (
                                <Link to="/community" key={poll.id}
                                    className="block p-2.5 rounded-xl transition-colors hover:bg-[var(--color-surface-high)]">
                                    <p className="text-xs font-medium line-clamp-2 mb-1.5" style={{ color: 'var(--color-primary)' }}>{poll.question}</p>
                                    {(poll.options||[]).slice(0,2).map((opt,i) => {
                                        const pct = total > 0 ? Math.round((opt.votes||0)/total*100) : 0;
                                        return (
                                            <div key={i} className="mb-1">
                                                <div className="flex justify-between text-[10px] mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                                    <span className="truncate">{opt.text}</span>
                                                    <span className="font-semibold ml-1">{pct}%</span>
                                                </div>
                                                <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-high)' }}>
                                                    <div className="h-full rounded-full" style={{ width:`${pct}%`, backgroundColor: 'var(--color-primary)' }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{total} votes · tap to vote</p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Service Activity by Category */}
            {metrics.categoryActivity.length > 0 && (
                <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>Service Demand by Category</h2>
                        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Active requests</span>
                    </div>
                    <div className="space-y-3">
                        {metrics.categoryActivity.map(([cat,count]) => (
                            <PulseBar key={cat} label={cat.charAt(0).toUpperCase()+cat.slice(1)} value={count} max={metrics.maxDemand} />
                        ))}
                    </div>
                </div>
            )}

            {/* Booking Trend Chart */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>Booking Activity — Last 14 Days</h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: metrics.trend != null && metrics.trend >= 0 ? 'var(--color-success-bg)' : 'var(--color-error-bg)', color: metrics.trend != null && metrics.trend >= 0 ? 'var(--color-success)' : 'var(--color-error)', border: `1px solid ${metrics.trend != null && metrics.trend >= 0 ? 'var(--color-success)' : 'var(--color-error)'}` }}>
                        {metrics.trend != null ? `${metrics.trend >= 0 ? '+' : ''}${metrics.trend.toFixed(0)}% vs prev week` : 'Tracking…'}
                    </span>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={metrics.dailyTrend} margin={{ left:-10 }}>
                        <defs>
                            <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.12} />
                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="date" tick={{ fontSize:10, fill: 'var(--color-text-subtle)' }} interval={3} />
                        <YAxis tick={{ fontSize:10, fill: 'var(--color-text-subtle)' }} allowDecimals={false} />
                        <Tooltip formatter={v => [v, 'Bookings']} />
                        <Area type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2} fill="url(#actGrad)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Demand vs Supply */}
            {metrics.demandChartData.length > 0 && (
                <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>Demand vs Supply by Service</h2>
                        <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm inline-block" style={{ backgroundColor: 'var(--color-primary)' }} /> Demand</span>
                            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm inline-block" style={{ backgroundColor: 'var(--color-text-subtle)' }} /> Supply</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={metrics.demandChartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize:10, fill: 'var(--color-text-subtle)' }} allowDecimals={false} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill: 'var(--color-text-subtle)' }} width={80} />
                            <Tooltip />
                            <Bar dataKey="demand" fill="var(--color-primary)" radius={[0,4,4,0]} />
                            <Bar dataKey="supply" fill="var(--color-text-subtle)" radius={[0,4,4,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Service Gap Alerts */}
            {metrics.gaps.length > 0 && (
                <div>
                    <div className="flex items-center gap-2.5 mb-4">
                        <AlertCircle className="h-5 w-5" style={{ color: 'var(--color-warning)' }} />
                        <h2 className="font-bold text-lg tracking-tight" style={{ color: 'var(--color-primary)' }}>Service Gap Alerts</h2>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)', border: '1px solid var(--color-warning)' }}>{metrics.gaps.length} gaps</span>
                    </div>
                    <div className="space-y-2.5">
                        {metrics.gaps.map((gap,i) => <GapBadge key={i} category={gap.category} demand={gap.demand} supply={gap.supply} />)}
                    </div>
                    <div className="mt-4 rounded-2xl p-4" style={{ backgroundColor: 'var(--color-warning-bg)', border: '1px solid var(--color-warning)', color: 'var(--color-warning)' }}>
                        <p className="text-xs font-medium">
                            These gaps represent <strong>provider opportunities</strong>. Share this with local professionals to grow supply in underserved categories.
                        </p>
                    </div>
                </div>
            )}

            {/* Active Bundles */}
            {bundles.filter(b => ['forming','confirmed'].includes(b.status)).length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-lg tracking-tight" style={{ color: 'var(--color-primary)' }}>Active Group Deals</h2>
                        <Link to="/bundles" className="flex items-center gap-1.5 text-sm font-medium transition-colors" style={{ color: 'var(--color-text-muted)' }}>
                            Manage <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {bundles.filter(b => ['forming','confirmed'].includes(b.status)).slice(0,3).map(b => (
                            <Link key={b.id} to="/bundles" className="card-premium p-4 block group hover-lift">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={b.status==='confirmed'
                                        ? { backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid var(--color-success)' }
                                        : { backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info)', border: '1px solid var(--color-info)' }}>{b.status}</span>
                                    <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>Save {b.discount_percentage||20}%</span>
                                </div>
                                <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--color-primary)' }}>{b.title}</h3>
                                {b.zone_name && <p className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}><MapPin className="h-3 w-3" />{b.zone_name}</p>}
                                <div className="mt-3">
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-high)' }}>
                                        <div className="h-full rounded-full" style={{ width:`${((b.current_participants||1)/(b.max_participants||5))*100}%`, backgroundColor: 'var(--color-primary)' }} />
                                    </div>
                                    <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{b.current_participants||1}/{b.max_participants} participants</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Platform Activity */}
            {metrics.recent.length > 0 && (
                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <Activity className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                        <h2 className="font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>Recent Platform Activity</h2>
                    </div>
                    <div className="divide-y divide-[var(--color-border)]">
                        {metrics.recent.map((b,i) => {
                            const statusStyles = {
                                pending:     { color: 'var(--color-warning)',  bg: 'var(--color-warning-bg)',  border: 'var(--color-warning)' },
                                confirmed:   { color: 'var(--color-info)',     bg: 'var(--color-info-bg)',     border: 'var(--color-info)' },
                                completed:   { color: 'var(--color-success)',  bg: 'var(--color-success-bg)',  border: 'var(--color-success)' },
                                cancelled:   { color: 'var(--color-text-muted)', bg: 'var(--color-surface-high)', border: 'var(--color-border)' },
                                in_progress: { color: 'var(--color-primary)',  bg: 'var(--color-surface-high)', border: 'var(--color-border)' },
                            };
                            const sc = statusStyles[b.status] || statusStyles.cancelled;
                            return (
                                <div key={b.id||i} className="flex items-center gap-3 px-5 py-3">
                                    <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: 'var(--color-surface-high)', color: 'var(--color-text-muted)' }}>
                                        {b.service_name?.[0] || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: 'var(--color-primary)' }}>{b.service_name || 'Service'}</p>
                                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{b.date}{b.time_slot && ` at ${b.time_slot}`}</p>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize" style={{ color: sc.color, backgroundColor: sc.bg, border: `1px solid ${sc.border}` }}>{b.status}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
