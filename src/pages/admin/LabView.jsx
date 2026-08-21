import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Briefcase, CalendarCheck, Coins, TrendingUp, Activity, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const TIER_COLORS = { champion: '#f59e0b', trusted: '#10b981', verified: '#3b82f6', rising: '#8b5cf6', new: '#6b7280' };

async function apiFetch(path) {
    const r = await fetch(path, { credentials: 'include' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
}

function SectionHeader({ title }) {
    return (
        <div className="section-title" style={{ marginTop: 28, marginBottom: 14 }}>{title}</div>
    );
}

function ChartContainer({ title, children, height = 220 }) {
    return (
        <div className="card-premium p-5 shimmer">
            {title && <h2 className="font-bold text-base mb-4" style={{ color: 'var(--color-text)' }}>{title}</h2>}
            <div style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    {children}
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function KPI({ label, value, sub, icon: Icon, color }) {
    return (
        <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                <Icon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
            </div>
            <p className="font-black text-2xl mt-3" style={{ color: color || 'var(--color-primary)' }}>{value ?? '—'}</p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
            {sub && <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-subtle)' }}>{sub}</p>}
        </div>
    );
}

export default function LabView() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(null);

    const load = async () => {
        try {
            const d = await apiFetch('/api/admin/lab-data');
            setData(d);
            setLastRefresh(new Date().toLocaleTimeString());
        } catch (err) {
            console.error('Lab data error:', err.message);
            toast.error('Failed to load lab data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        const iv = setInterval(load, 30000);
        return () => clearInterval(iv);
    }, []);

    const tooltipStyle = {
        contentStyle: {
            background: 'var(--color-surface-high)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            color: 'var(--color-text)',
            fontSize: 12,
        },
    };

    if (loading) {
        return (
            <div className="rounded-2xl p-12 text-center shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Loading Lab View…</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="rounded-2xl p-12 text-center shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="font-bold text-base mb-2" style={{ color: 'var(--color-text)' }}>Lab data unavailable</div>
                <button onClick={load} className="btn-lightning-subtle rounded-xl px-4 py-2 text-sm font-semibold"
                    style={{ color: 'var(--color-primary)', background: 'var(--color-surface-high)', border: '1px solid var(--color-border-strong)' }}>
                    <RefreshCw className="h-3.5 w-3.5 inline mr-1.5" /> Retry
                </button>
            </div>
        );
    }

    const trustDist = data.trust_distribution || [];
    const bnpl = data.bnpl_risk || {};
    const loyalty = data.loyalty_economy || {};
    const zones = data.zones || [];
    const platformStats = data.platform_stats || {};

    const zoneStatus = (score) => {
        if ((score || 0) >= 70) return { label: 'Active', color: 'var(--color-success)', bg: 'var(--color-success-bg)' };
        if ((score || 0) >= 40) return { label: 'Moderate', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' };
        return { label: 'Quiet', color: 'var(--color-error)', bg: 'var(--color-error-bg)' };
    };

    return (
        <div className="space-y-2 pb-8" style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
                <div>
                    <h1 className="font-black text-2xl" style={{ color: 'var(--color-text)' }}>Admin Lab View</h1>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-subtle)' }}>Research layer — live platform metrics{lastRefresh ? ` · Last updated ${lastRefresh}` : ''} · auto-refreshes every 30s</p>
                </div>
                <button onClick={load} className="btn-lightning-subtle rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-1.5"
                    style={{ color: 'var(--color-primary)', background: 'var(--color-surface-high)', border: '1px solid var(--color-border-strong)' }}>
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPI label="Total Users" value={platformStats.total_users?.toLocaleString()} icon={Users} />
                <KPI label="Providers" value={platformStats.total_providers?.toLocaleString()} icon={Briefcase} />
                <KPI label="Total Bookings" value={platformStats.total_bookings?.toLocaleString()} icon={CalendarCheck} />
                <KPI label="Bookings Today" value={platformStats.bookings_today?.toLocaleString()} icon={Activity} color="var(--color-primary)" />
                <KPI label="Active BNPL" value={bnpl.active_count?.toLocaleString()} icon={TrendingUp} />
                <KPI label="BNPL Exposure" value={bnpl.total_exposure != null ? `PKR ${parseInt(bnpl.total_exposure).toLocaleString()}` : '—'} icon={Coins} color="var(--color-warning)" />
                <KPI label="Coins Issued" value={loyalty.total_coins_issued != null ? parseInt(loyalty.total_coins_issued).toLocaleString() : '—'} icon={Coins} />
                <KPI label="Coin Liability" value={loyalty.outstanding_balance != null ? parseInt(loyalty.outstanding_balance).toLocaleString() : '—'} sub="coins outstanding" icon={ShieldCheck} />
            </div>

            <SectionHeader title="Trust Distribution" />
            {trustDist.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                    <ChartContainer title="Providers by Trust Tier" height={200}>
                        <BarChart data={trustDist} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <XAxis dataKey="tier" tick={{ fill: 'var(--color-text-subtle)', fontSize: 11 }} />
                            <YAxis tick={{ fill: 'var(--color-text-subtle)', fontSize: 11 }} />
                            <Tooltip {...tooltipStyle} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {trustDist.map((entry, i) => (
                                    <Cell key={i} fill={TIER_COLORS[entry.tier] || '#6b7280'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                    <ChartContainer title="Tier Share" height={200}>
                        <PieChart>
                            <Pie data={trustDist} dataKey="count" nameKey="tier" cx="50%" cy="50%" outerRadius={80} label={({ tier, percent }) => `${tier} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                {trustDist.map((entry, i) => (
                                    <Cell key={i} fill={TIER_COLORS[entry.tier] || '#6b7280'} />
                                ))}
                            </Pie>
                            <Tooltip {...tooltipStyle} formatter={(v, n) => [v, n]} />
                        </PieChart>
                    </ChartContainer>
                </div>
            ) : (
                <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No provider trust data yet. Trust scores are computed after bookings complete.</p>
                </div>
            )}

            <SectionHeader title="Zone Health Grid" />
            {zones.length > 0 ? (
                <div className="space-y-2">
                    {zones.map((z, i) => {
                        const s = zoneStatus(z.health_score);
                        return (
                            <div key={z.id || i} className="card-premium p-4 flex items-center gap-4 flex-wrap">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>{z.name || z.id?.slice(0, 8)}</p>
                                </div>
                                <div className="flex items-center gap-2" style={{ minWidth: 140 }}>
                                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                                        <div className="h-full rounded-full" style={{ width: `${z.health_score || 0}%`, backgroundColor: s.color }} />
                                    </div>
                                    <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>{z.health_score || 0}</span>
                                </div>
                                <div className="w-20 text-center">
                                    <span className="text-[10px] font-bold rounded-md px-2 py-1" style={{ backgroundColor: s.bg, color: s.color }}>{s.label}</span>
                                </div>
                                <div className="w-28 text-right text-xs" style={{ color: 'var(--color-text-subtle)' }}>
                                    Demand {z.demand_index || 0}
                                </div>
                                <div className="w-40 text-right text-xs" style={{ color: 'var(--color-text-subtle)' }}>
                                    {z.updated_at ? new Date(z.updated_at).toLocaleString() : '—'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No neighborhood zones configured yet.</p>
                </div>
            )}

            <SectionHeader title="BNPL Risk Dashboard" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPI label="Active Agreements" value={bnpl.active_count} icon={TrendingUp} />
                <KPI label="Total Exposure" value={bnpl.total_exposure != null ? `PKR ${parseInt(bnpl.total_exposure).toLocaleString()}` : '—'} icon={Coins} color="var(--color-warning)" />
                <KPI label="Overdue" value={bnpl.overdue_count} icon={AlertTriangle} color={bnpl.overdue_count > 0 ? 'var(--color-error)' : undefined} />
                <KPI label="Defaulted" value={bnpl.defaulted_count} icon={AlertTriangle} color={bnpl.defaulted_count > 0 ? 'var(--color-error)' : undefined} />
            </div>

            <SectionHeader title="Loyalty Economy" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPI label="Total Coins Issued" value={loyalty.total_coins_issued != null ? parseInt(loyalty.total_coins_issued).toLocaleString() : '—'} icon={Coins} />
                <KPI label="Total Redeemed" value={loyalty.total_coins_redeemed != null ? parseInt(Math.abs(loyalty.total_coins_redeemed)).toLocaleString() : '—'} icon={Coins} />
                <KPI label="Outstanding Balance" value={loyalty.outstanding_balance != null ? parseInt(loyalty.outstanding_balance).toLocaleString() : '—'} sub="coins in circulation" icon={ShieldCheck} color="var(--color-primary)" />
                <KPI label="Users with Coins" value={loyalty.users_with_coins} icon={Users} />
            </div>
        </div>
    );
}
