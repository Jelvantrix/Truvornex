import { useState, useEffect } from 'react';
import { Send, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ProviderPayouts() {
    const [providers, setProviders] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        setProviders([]); setBookings([]); setLoading(false);
    }, []);

    const payoutData = providers.map(p => {
        const providerBookings = bookings.filter(b => b.provider_id === p.id);
        const totalEarnings = providerBookings.reduce((s, b) => s + (b.price || 0), 0);
        const platformFee = totalEarnings * 0.15;
        const netPayout = totalEarnings - platformFee;
        return { ...p, totalEarnings, platformFee, netPayout, bookingCount: providerBookings.length };
    });

    const filtered = payoutData.filter(p => !search || p.business_name?.toLowerCase().includes(search.toLowerCase()) || p.user_email?.toLowerCase().includes(search.toLowerCase()));

    const totalPlatformFees = payoutData.reduce((s, p) => s + p.platformFee, 0);
    const totalPayouts = payoutData.reduce((s, p) => s + p.netPayout, 0);

    const processPayout = (provider) => {
        toast.success(`Payout of $${provider.netPayout.toFixed(2)} initiated for ${provider.business_name}`);
    };

    return (
        <div className="space-y-6 pb-8">
            <div>
                <h1 className="font-inter font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)' }}>Provider Payouts</h1>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Manage earnings and disbursements</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Earnings', value: `$${(totalPlatformFees + totalPayouts).toLocaleString()}` },
                    { label: 'Platform Fees (15%)', value: `$${totalPlatformFees.toLocaleString()}` },
                    { label: 'Pending Payouts', value: `$${totalPayouts.toLocaleString()}` },
                    { label: 'Providers', value: providers.length },
                ].map(k => (
                    <div key={k.label} className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
                        <p className="font-black text-2xl" style={{ color: 'var(--color-primary)' }}>{k.value}</p>
                    </div>
                ))}
            </div>

            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search providers…" variant="lightning" className="pl-9 rounded-xl" />
            </div>

            {loading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton-wave h-16 rounded-2xl" />)}</div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(p => (
                        <div key={p.id} className="card-premium rounded-2xl p-4 hover-lift transition-colors" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-black card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)', color: 'var(--color-primary)' }}>
                                        {p.business_name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{p.business_name}</p>
                                        <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{p.user_email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Bookings</p>
                                        <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{p.bookingCount}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Earned</p>
                                        <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>${p.totalEarnings.toFixed(2)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Fee</p>
                                        <p className="font-semibold text-sm" style={{ color: 'var(--color-text-muted)' }}>${p.platformFee.toFixed(2)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Net</p>
                                        <p className="font-bold text-sm" style={{ color: 'var(--color-success)' }}>${p.netPayout.toFixed(2)}</p>
                                    </div>
                                    <div className="text-right">
                                        {p.netPayout > 0 ? (
                                            <Button size="sm" variant="outline" className="rounded-lg h-7 text-xs gap-1" style={{ color: 'var(--color-primary)', borderColor: 'var(--color-border)' }} onClick={() => processPayout(p)}>
                                                <Send className="h-3 w-3" /> Pay
                                            </Button>
                                        ) : (
                                            <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>—</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && <p className="text-sm text-center py-10" style={{ color: 'var(--color-text-muted)' }}>No providers found</p>}
                </div>
            )}
        </div>
    );
}
