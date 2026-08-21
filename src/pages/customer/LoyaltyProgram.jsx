import { useState, useEffect } from 'react';
import { Star, Award, TrendingUp, Lock, CheckCircle2, ArrowRight, Gift, Shield, Zap as ZapIcon, Crown as CrownIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const TIERS = [
    { name: 'New', min: 0, max: 499, icon: Star, color: 'var(--color-text-muted)', bg: 'rgba(var(--color-text-muted),0.12)', perks: ['Access to all services', 'Basic support'], discount: 0 },
    { name: 'Regular', min: 500, max: 1999, icon: Award, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)', perks: ['5% discount on bookings', 'Priority booking slots', 'Early access to bundles'], discount: 5 },
    { name: 'VIP', min: 2000, max: 4999, icon: ZapIcon, color: 'var(--color-warning)', bg: 'rgba(var(--color-warning),0.12)', perks: ['10% discount on all services', 'Dedicated support', 'Free cancellation', 'VIP provider matching'], discount: 10 },
    { name: 'Champion', min: 5000, max: Infinity, icon: CrownIcon, color: 'var(--color-accent)', bg: 'rgba(var(--color-accent),0.12)', perks: ['15% discount on all services', 'Personal concierge', 'First access to new features', 'Exclusive provider relationships', 'Monthly perks credits'], discount: 15 },
];

export default function LoyaltyProgram() {
    const [memory, setMemory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMemory({ lifetime_value: 1250, loyalty_tier: 'regular', booking_count: 12, cancellation_count: 1 });
        setLoading(false);
    }, []);

    const ltv = memory?.lifetime_value || 0;
    const tier = TIERS.find(t => ltv >= t.min && ltv <= t.max) || TIERS[0];
    const nextTier = TIERS[TIERS.indexOf(tier) + 1];
    const progress = nextTier ? Math.min(((ltv - tier.min) / (nextTier.min - tier.min)) * 100, 100) : 100;

    if (loading) return (
        <div className="space-y-6 max-w-4xl">
            <div className="skeleton-wave h-7 w-56 rounded-xl" />
            <div className="skeleton-wave h-40 rounded-2xl" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton-wave h-28 rounded-2xl" />)}
            </div>
            <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton-wave h-24 rounded-xl" />)}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Loyalty Program</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Earn rewards every time you book — unlock exclusive perks</p>
                </div>
                <a href="/services" className="h-11 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                    <Gift className="h-4 w-4" />
                    Book & Earn
                </a>
            </div>

            {/* Stats Overview */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Lifetime Value', value: `$${ltv.toLocaleString()}`, icon: TrendingUp, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)', trend: `${progress.toFixed(0)}% to next tier`, trendUp: true },
                        { label: 'Total Bookings', value: memory?.booking_count || 0, icon: Star, color: 'var(--color-warning)', bg: 'rgba(var(--color-warning),0.12)' },
                        { label: 'Current Tier', value: tier.name, icon: CrownIcon, color: tier.color, bg: tier.bg },
                        { label: 'Cancellations', value: memory?.cancellation_count || 0, icon: Shield, color: 'var(--color-error)', bg: 'rgba(var(--color-error),0.12)' },
                    ].map((stat, i) => (
                        <div key={i} className="rounded-xl p-4 text-center shimmer"
                            style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xs)' }}>
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-2 card-lightning-subtle"
                                style={{ backgroundColor: stat.bg }}>
                                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                            </div>
                            <p className="font-black text-2xl" style={{ color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>{stat.value}</p>
                            <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</p>
                            {stat.trend && (
                                <p className={`text-[10px] mt-1 flex items-center justify-center gap-1 ${stat.trendUp ? 'text-success' : 'text-error'}`}>
                                    {stat.trendUp && <CheckCircle2 className="h-3 w-3" />}
                                    {stat.trend}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Current Tier Card */}
            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: `1px solid ${tier.color}40`, boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-text-subtle)' }}>Your Current Tier</p>
                        <div className="flex items-center gap-2.5">
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: tier.bg }}>
                                <tier.icon className="h-6 w-6" style={{ color: tier.color }} />
                            </div>
                            <div>
                                <h2 className="font-black text-3xl" style={{ color: tier.color, letterSpacing: '-0.04em' }}>{tier.name}</h2>
                                <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{tier.discount}% discount on all bookings</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Lifetime Value</p>
                        <p className="font-black text-3xl" style={{ color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>${ltv.toLocaleString()}</p>
                    </div>
                </div>
                {nextTier && (
                    <div className="rounded-xl p-4" style={{ backgroundColor: tier.bg, border: `1px solid ${tier.color}30` }}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold" style={{ color: tier.color }}>Progress to {nextTier.name}</span>
                            <span className="text-xs font-bold" style={{ color: tier.color }}>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: tier.color }} />
                        </div>
                        <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
                            ${(nextTier.min - ltv).toLocaleString()} more in bookings to reach {nextTier.name} 
                            <span className="font-semibold" style={{ color: tier.color }}>({nextTier.discount}% discount)</span>
                        </p>
                    </div>
                )}
                {!nextTier && (
                    <div className="rounded-xl p-4 text-center" style={{ backgroundColor: tier.bg, border: `1px solid ${tier.color}30` }}>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <CrownIcon className="h-5 w-5" style={{ color: tier.color }} />
                            <span className="text-sm font-semibold" style={{ color: tier.color }}>Maximum Tier Achieved!</span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>You've unlocked all exclusive Champion perks</p>
                    </div>
                )}
            </div>

            {/* Tier Benefits */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>All Tiers & Benefits</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="space-y-3">
                {TIERS.map((t, idx) => {
                    const isCurrentOrPast = ltv >= t.min;
                    const isCurrent = tier.name === t.name;
                    const Icon = t.icon;
                    return (
                        <div key={t.name} className="rounded-xl p-5 transition-all hover-lift card-lightning-subtle"
                            style={{
                                backgroundColor: isCurrent ? 'var(--color-surface)' : 'var(--color-surface-high)',
                                border: `2px solid ${isCurrent ? t.color : 'var(--color-border)'}`,
                                boxShadow: isCurrent ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                            }}>
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: isCurrentOrPast ? t.bg : 'var(--color-surface-low)', border: `1px solid ${isCurrentOrPast ? t.color + '30' : 'var(--color-border)'}` }}>
                                        <Icon className="h-5 w-5" style={{ color: isCurrentOrPast ? t.color : 'var(--color-text-subtle)' }} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-sm" style={{ color: isCurrentOrPast ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>{t.name} Tier</p>
                                            {isCurrent && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: t.color, color: 'var(--color-on-primary)' }}>Current</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-subtle)' }}>
                                            {t.max === Infinity ? `$${t.min.toLocaleString()}+ lifetime spending` : `$${t.min.toLocaleString()} – $${t.max.toLocaleString()}`}
                                        </p>
                                    </div>
                                </div>
                                {!isCurrentOrPast && (
                                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-surface-low)', border: '1px solid var(--color-border)' }}>
                                        <Lock className="h-4 w-4" style={{ color: 'var(--color-text-subtle)' }} />
                                    </div>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {t.perks.map((perk, pi) => (
                                    <div key={pi} className="flex items-center gap-2 text-sm"
                                        style={{ color: isCurrentOrPast ? 'var(--color-text-muted)' : 'var(--color-text-subtle)' }}>
                                        <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${isCurrentOrPast ? 'text-success' : 'text-text-subtle'}`} />
                                        <span>{perk}</span>
                                    </div>
                                ))}
                            </div>
                            
                            {isCurrent && (
                                <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: t.color + '30' }}>
                                    <span className="text-sm font-semibold" style={{ color: t.color }}>Your active discount: {t.discount}%</span>
                                    <Link to="/services" className="text-xs font-bold flex items-center gap-1" style={{ color: t.color, textDecoration: 'none' }}>
                                        Book now to maximize savings <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* How It Works */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>How It Works</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: Gift, title: 'Earn on Every Booking', desc: 'Every dollar spent adds to your lifetime value and progresses you toward the next tier' },
                        { icon: TrendingUp, title: 'Unlock Better Perks', desc: 'Higher tiers unlock bigger discounts, priority support, and exclusive provider access' },
                        { icon: Shield, title: 'Rewards Never Expire', desc: 'Your lifetime value and tier status are permanent — no reset periods or point expiration' },
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