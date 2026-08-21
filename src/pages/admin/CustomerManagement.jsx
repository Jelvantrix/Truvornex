import { useState, useEffect } from 'react';
import { Search, Users, Crown, AlertTriangle, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const TIER_STYLES = {
    champion: { backgroundColor: 'rgba(var(--color-warning),0.12)', color: 'var(--color-warning)', border: '1px solid rgba(var(--color-warning),0.3)' },
    vip: { backgroundColor: 'rgba(var(--color-accent),0.12)', color: 'var(--color-primary)', border: '1px solid var(--color-border-accent)' },
    regular: { backgroundColor: 'rgba(var(--color-info),0.12)', color: 'var(--color-info)', border: '1px solid rgba(var(--color-info),0.3)' },
    new: { backgroundColor: 'var(--color-surface-high)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' },
};

export default function CustomerManagement() {
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [tierFilter, setTierFilter] = useState('all');

    useEffect(() => {
        setMemories([]);
        setLoading(false);
    }, []);

    const filtered = memories.filter(m => {
        const matchSearch = !search || m.customer_email?.toLowerCase().includes(search.toLowerCase());
        const matchTier = tierFilter === 'all' || m.loyalty_tier === tierFilter;
        return matchSearch && matchTier;
    });

    const totalLTV = memories.reduce((s, m) => s + (m.lifetime_value || 0), 0);
    const vipCount = memories.filter(m => ['vip', 'champion'].includes(m.loyalty_tier)).length;
    const atRisk = memories.filter(m => (m.risk_score || 0) > 70).length;

    return (
        <div className="space-y-6 pb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-inter font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)' }}>Customer Management</h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Customer insights and lifecycle management</p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Customers', value: memories.length, icon: Users },
                    { label: 'Total LTV', value: `$${totalLTV.toLocaleString()}`, icon: TrendingUp },
                    { label: 'VIP / Champion', value: vipCount, icon: Crown },
                    { label: 'At-Risk Customers', value: atRisk, icon: AlertTriangle },
                ].map(k => (
                    <div key={k.label} className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                            <k.icon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <p className="font-black text-2xl mt-3" style={{ color: 'var(--color-primary)' }}>{k.value}</p>
                        <p className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-subtle)' }} />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email…" className="input-lightning pl-9 rounded-xl" />
                </div>
                <Select value={tierFilter} onValueChange={(v) => { setTierFilter(v); toast.success('Tier filter updated'); }}>
                    <SelectTrigger className="input-lightning rounded-xl w-36"><SelectValue placeholder="Tier" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="champion">Champion</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton-wave h-16 rounded-2xl" />)}</div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(m => {
                        const tier = TIER_STYLES[m.loyalty_tier] || TIER_STYLES.new;
                        const risk = m.risk_score || 0;
                        const riskColor = risk > 70 ? 'var(--color-error)' : risk > 40 ? 'var(--color-warning)' : 'var(--color-success)';
                        return (
                            <div key={m.id} className="rounded-2xl p-5 flex items-center gap-4 flex-wrap hover-lift" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                                <div className="flex-1 min-w-[180px]">
                                    <p className="font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>{m.customer_email}</p>
                                    {m.last_booking_at && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Last: {m.last_booking_at?.slice(0, 10)}</p>}
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[10px] uppercase tracking-wider" >Bookings</p>
                                    <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{m.booking_count || 0}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-subtle)' }}>LTV</p>
                                    <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>${(m.lifetime_value || 0).toLocaleString()}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-subtle)' }}>Rating</p>
                                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{m.average_rating_given ? `⭐ ${m.average_rating_given.toFixed(1)}` : '—'}</p>
                                </div>
                                <div className="shrink-0 w-28">
                                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-subtle)' }}>Risk</p>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-high)' }}>
                                            <div className="h-full rounded-full" style={{ width: `${risk}%`, backgroundColor: riskColor }} />
                                        </div>
                                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{risk}</span>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize" style={tier}>{m.loyalty_tier || 'new'}</span>
                                </div>
                            </div>
                        );
                    })}
                    {filtered.length === 0 && (
                        <div className="rounded-2xl p-10 text-center text-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                            No customers found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
