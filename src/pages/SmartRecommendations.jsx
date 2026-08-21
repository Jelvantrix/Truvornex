import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { rankProviders, predictDemand, predictRepeatBookings, findBundleOpportunities, TRUST_TIER_STYLE } from '@/lib/ai/engine';
import useGeolocation from '@/hooks/useGeolocation';
import {
    Sparkles, TrendingUp, TrendingDown, ArrowRight, Star, CheckCircle, Zap, RefreshCw, Layers, RotateCcw, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';

const DEMAND_STYLES = {
    high:   { varColor: 'var(--color-error)',   bgVar: 'var(--color-error-bg)',   borderVar: 'rgba(252,165,165,0.15)',   icon: TrendingUp, label: 'High Demand' },
    rising: { varColor: 'var(--color-warning)', bgVar: 'var(--color-warning-bg)', borderVar: 'rgba(252,211,77,0.15)',   icon: TrendingUp, label: 'Rising' },
    normal: { varColor: 'var(--color-primary)', bgVar: 'var(--color-surface-high)', borderVar: 'var(--color-border)', icon: ArrowRight,  label: 'Normal' },
    low:    { varColor: 'var(--color-text-muted)', bgVar: 'var(--color-surface-high)', borderVar: 'var(--color-border)', icon: TrendingDown, label: 'Low Season' },
};

const CONFIDENCE_STYLE = {
    high:   { bg: 'var(--color-success-bg)',  color: 'var(--color-success)' },
    medium: { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)' },
    low:    { bg: 'var(--color-surface-high)', color: 'var(--color-text-muted)' },
};

function ProviderAICard({ provider, rank }) {
    const ts = TRUST_TIER_STYLE[provider.trustTier] || TRUST_TIER_STYLE.new;
    const tierMap = {
        'bg-amber-100': 'var(--color-warning-bg)',
        'bg-emerald-100': 'var(--color-success-bg)',
        'bg-blue-100': 'rgba(147,197,253,0.12)',
        'bg-violet-100': 'rgba(167,139,250,0.12)',
        'bg-zinc-100': 'var(--color-surface-high)',
    };
    const tierTextMap = {
        'text-amber-800': 'var(--color-warning)',
        'text-emerald-800': 'var(--color-success)',
        'text-blue-800': 'var(--color-info)',
        'text-violet-800': 'rgba(167,139,250,0.95)',
        'text-zinc-600': 'var(--color-text-muted)',
    };
    const tierBorderMap = {
        'border-amber-200': 'rgba(252,211,77,0.2)',
        'border-emerald-200': 'rgba(110,231,183,0.2)',
        'border-blue-200': 'rgba(147,197,253,0.2)',
        'border-violet-200': 'rgba(167,139,250,0.2)',
        'border-zinc-200': 'var(--color-border)',
    };
    return (
        <Link to={`/providers/${provider.id}`} className="card-premium p-4 block group hover-lift transition-all">
            <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                    {provider.logo_url ? (
                        <img src={provider.logo_url} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    ) : (
                        <div className="h-12 w-12 rounded-xl flex items-center justify-center font-black text-xl"
                            style={{ backgroundColor: 'var(--color-surface-high)', color: 'var(--color-text-subtle)' }}>
                            {provider.business_name?.[0]}
                        </div>
                    )}
                    <span className="absolute -top-1.5 -left-1.5 h-5 w-5 rounded-full text-[10px] font-black flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                        {rank}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-sm truncate transition-colors" style={{ color: 'var(--color-primary)' }}>{provider.business_name}</h3>
                        {provider.verified && <CheckCircle className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--color-info)' }} />}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ts.bg} ${ts.text} ${ts.border}`}
                            style={{
                                backgroundColor: tierMap[ts.bg] || 'var(--color-surface-high)',
                                color: tierTextMap[ts.text] || 'var(--color-text-muted)',
                                borderColor: tierBorderMap[ts.border] || 'var(--color-border)',
                            }}>
                            {provider.trustLabel}
                        </span>
                        {provider.rating > 0 && (
                            <span className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                <Star className="h-3 w-3" style={{ color: 'var(--color-warning)', fill: 'var(--color-warning)' }} />
                                {provider.rating?.toFixed(1)}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-subtle)' }}>
                        <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />{provider.completionRate || 0}% completion</span>
                        <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" />{provider.completedJobs || 0} jobs</span>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-lg font-black" style={{ color: 'var(--color-primary)' }}>{provider.aiScore}</div>
                    <div className="text-[10px] font-medium" style={{ color: 'var(--color-text-subtle)' }}>AI Score</div>
                    <div className="h-1.5 w-12 rounded-full mt-1 overflow-hidden" style={{ backgroundColor: 'var(--color-surface-high)' }}>
                        <div className="h-full rounded-full" style={{ width: `${provider.aiScore}%`, background: 'linear-gradient(90deg, var(--color-primary), var(--color-text-muted))' }} />
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function SmartRecommendations() {
    const [providers, setProviders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [userEmail, setUserEmail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [catFilter, setCatFilter] = useState('all');
    const { location: userLoc } = useGeolocation();

    useEffect(() => {
        setUserEmail(null);
        setProviders([]);
        setCategories([]);
        setBookings([]);
        setLoading(false);
        toast.success('Recommendations loaded');
    }, []);

    const rankedProviders = useMemo(() =>
        rankProviders(providers, bookings, userLoc?.[0], userLoc?.[1], catFilter === 'all' ? null : catFilter),
        [providers, bookings, userLoc, catFilter]
    );

    const demandForecast = useMemo(() =>
        predictDemand(categories, bookings).slice(0, 8),
        [categories, bookings]
    );

    const repeatPredictions = useMemo(() => {
        if (!userEmail) return [];
        return predictRepeatBookings(bookings.filter(b => b.status === 'completed' && b.customer_email === userEmail));
    }, [bookings, userEmail]);

    const bundleOpportunities = useMemo(() => findBundleOpportunities(bookings).slice(0, 3), [bookings]);

    if (loading) return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton-wave h-20 rounded-2xl" />)}
        </div>
    );

    return (
        <div className="space-y-10 pb-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)', boxShadow: 'var(--shadow-float)' }}>
                    <Sparkles className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                    <h1 className="font-inter font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)' }}>Smart Recommendations</h1>
                    <p className="text-sm" style={{ color: 'var(--color-text-subtle)' }}>AI-ranked providers · demand forecast · repeat predictions</p>
                </div>
            </div>

            {/* Repeat booking predictions */}
            {repeatPredictions.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <RotateCcw className="h-4.5 w-4.5" style={{ color: 'var(--color-primary)' }} />
                        <h2 className="font-inter font-bold text-lg" style={{ color: 'var(--color-primary)' }}>Predicted for You</h2>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>AI Prediction</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {repeatPredictions.slice(0, 3).map((p, i) => (
                            <div key={i} className="rounded-2xl p-4 shimmer card-lightning-subtle" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                                <div className="flex items-start justify-between mb-2">
                                    <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                                        <RefreshCw className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                                        backgroundColor: CONFIDENCE_STYLE[p.confidence]?.bg || 'var(--color-surface-high)',
                                        color: CONFIDENCE_STYLE[p.confidence]?.color || 'var(--color-text-muted)',
                                    }}>
                                        {p.confidence} confidence
                                    </span>
                                </div>
                                <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--color-primary)' }}>{p.service}</p>
                                <p className="text-xs mb-3" style={{ color: 'var(--color-text-subtle)' }}>
                                    Every ~{p.avgIntervalDays} days · booked {p.bookingCount}×
                                </p>
                                <div className="text-sm font-bold" style={{ color: p.daysUntil <= 3 ? 'var(--color-error)' : p.daysUntil <= 7 ? 'var(--color-warning)' : 'var(--color-primary)' }}>
                                    {p.daysUntil <= 0 ? 'Due now' : p.daysUntil === 1 ? 'Due tomorrow' : `Due in ${p.daysUntil} days`}
                                </div>
                                <div className="text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>{format(new Date(p.nextDate + 'T12:00:00'), 'MMM d, yyyy')}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Demand forecast */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-4.5 w-4.5" style={{ color: 'var(--color-warning)' }} />
                    <h2 className="font-inter font-bold text-lg" style={{ color: 'var(--color-primary)' }}>Seasonal Demand Forecast</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold capitalize" style={{ backgroundColor: 'rgba(252,211,77,0.12)', color: 'var(--color-warning)' }}>
                        {new Date().toLocaleString('default', { month: 'long' })}
                    </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {demandForecast.map(cat => {
                        const ds = DEMAND_STYLES[cat.demandLevel] || DEMAND_STYLES.normal;
                        const Icon = ds.icon;
                        return (
                            <Link key={cat.id} to={`/category/${cat.slug}`} className="rounded-2xl p-4 border shimmer card-lightning-subtle hover-lift transition-all"
                                style={{ backgroundColor: ds.bgVar, borderColor: ds.borderVar }}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: ds.varColor }}>{ds.label}</span>
                                    <Icon className="h-3.5 w-3.5" style={{ color: ds.varColor }} />
                                </div>
                                <p className="font-bold text-sm" style={{ color: ds.varColor }}>{cat.name}</p>
                                <div className="mt-2">
                                    <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-high)' }}>
                                        <div className="h-full rounded-full" style={{
                                            width: `${Math.min(cat.multiplier, 200) / 2}%`,
                                            backgroundColor: cat.demandLevel === 'high' ? 'var(--color-error)' : cat.demandLevel === 'rising' ? 'var(--color-warning)' : 'var(--color-info)',
                                        }} />
                                    </div>
                                </div>
                                <p className="text-xs mt-1 opacity-70 font-medium" style={{ color: ds.varColor }}>{cat.multiplier}% of avg</p>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* AI-ranked providers */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Zap className="h-4.5 w-4.5" style={{ color: 'var(--color-primary)' }} />
                        <h2 className="font-inter font-bold text-lg" style={{ color: 'var(--color-primary)' }}>AI-Ranked Providers</h2>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)', color: 'var(--color-primary)' }}>Trust × Distance × Availability</span>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                        {[['all', 'All'], ...categories.slice(0, 4).map(c => [c.slug, c.name.split(' ')[0]])].map(([v, l]) => (
                            <button key={v} onClick={() => setCatFilter(v)}
                                className="h-7 px-3 rounded-xl text-xs font-semibold transition-all"
                                style={{
                                    backgroundColor: catFilter === v ? 'var(--color-primary)' : 'var(--color-surface-high)',
                                    color: catFilter === v ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
                                    border: 'none', fontFamily: 'inherit', cursor: 'pointer',
                                }}>
                                {l}
                            </button>
                        ))}
                    </div>
                </div>

                {rankedProviders.length === 0 ? (
                    <div className="rounded-2xl p-10 text-center shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <p className="text-sm" style={{ color: 'var(--color-text-subtle)' }}>No providers found for this category.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {rankedProviders.slice(0, 8).map((p, i) => <ProviderAICard key={p.id} provider={p} rank={i + 1} />)}
                    </div>
                )}

                {rankedProviders.length > 8 && (
                    <Button asChild variant="outline" className="w-full mt-3 rounded-xl input-lightning">
                        <Link to="/nearby">View all {rankedProviders.length} providers on map</Link>
                    </Button>
                )}
            </section>

            {/* Bundle opportunities */}
            {bundleOpportunities.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Layers className="h-4.5 w-4.5" style={{ color: 'var(--color-info)' }} />
                        <h2 className="font-inter font-bold text-lg" style={{ color: 'var(--color-primary)' }}>Bundle Opportunities</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {bundleOpportunities.map((b, i) => (
                            <Link key={i} to="/bundles" className="rounded-2xl p-4 border shimmer card-lightning-subtle hover-lift transition-all"
                                style={{ backgroundColor: 'rgba(147,197,253,0.10)', borderColor: 'rgba(147,197,253,0.2)' }}>
                                <p className="font-bold text-sm mb-1" style={{ color: 'var(--color-info)' }}>{b.service}</p>
                                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{b.count} similar requests in your area</p>
                                <p className="text-xs font-black mt-2" style={{ color: 'var(--color-info)' }}>Save up to {b.estimatedSaving}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
