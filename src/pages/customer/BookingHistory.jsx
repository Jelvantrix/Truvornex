import { useState, useMemo } from 'react';
import { CalendarDays, Search, Star, CheckCircle2, Clock, DollarSign, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_STYLES = {
    completed: { bg: 'rgba(var(--color-success),0.12)', color: 'var(--color-success)', border: 'rgba(var(--color-success),0.25)' },
    confirmed: { bg: 'rgba(var(--color-info),0.12)', color: 'var(--color-info)', border: 'rgba(var(--color-info),0.25)' },
    pending: { bg: 'rgba(var(--color-warning),0.12)', color: 'var(--color-warning)', border: 'rgba(var(--color-warning),0.25)' },
    cancelled: { bg: 'rgba(var(--color-error),0.12)', color: 'var(--color-error)', border: 'rgba(var(--color-error),0.25)' },
    no_show: { bg: 'var(--color-surface-high)', color: 'var(--color-text-muted)', border: 'var(--color-border)' },
};

const MOCK_BOOKINGS = [
    { id: '1', service_name: 'Deep House Cleaning', provider_name: 'Sparkle Clean Co.', provider_id: 'p1', date: '2025-01-15', time_slot: '9:00 AM', status: 'completed', price: 150 },
    { id: '2', service_name: 'AC Repair & Maintenance', provider_name: 'CoolAir HVAC', provider_id: 'p2', date: '2025-01-18', time_slot: '2:00 PM', status: 'completed', price: 200 },
    { id: '3', service_name: 'Lawn Mowing', provider_name: 'Green Thumb Landscaping', provider_id: 'p3', date: '2025-01-20', time_slot: '10:00 AM', status: 'confirmed', price: 85 },
    { id: '4', service_name: 'Plumbing Inspection', provider_name: 'Emergency Plumbing Co.', provider_id: 'p4', date: '2025-01-22', time_slot: '11:00 AM', status: 'pending', price: 120 },
    { id: '5', service_name: 'Window Cleaning', provider_name: 'ClearView Windows', provider_id: 'p5', date: '2025-01-10', time_slot: '1:00 PM', status: 'cancelled', price: 95 },
    { id: '6', service_name: 'Electrical Work', provider_name: 'PowerFix Electrical', provider_id: 'p6', date: '2025-01-08', time_slot: '9:30 AM', status: 'completed', price: 350 },
];

export default function BookingHistory() {
    const [bookings] = useState(MOCK_BOOKINGS);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filtered = useMemo(() => {
        let result = bookings;
        if (search) {
            const query = search.toLowerCase();
            result = result.filter(b => 
                b.service_name?.toLowerCase().includes(query) || 
                b.provider_name?.toLowerCase().includes(query)
            );
        }
        if (statusFilter !== 'all') {
            result = result.filter(b => b.status === statusFilter);
        }
        return result;
    }, [search, statusFilter]);

    const totalSpent = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + (b.price || 0), 0);

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Booking History</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        {bookings.length} total bookings · ${totalSpent.toLocaleString()} spent
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Total', value: bookings.length, sub: 'bookings', icon: CalendarDays, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)' },
                        { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, sub: 'services done', icon: CheckCircle2, color: 'var(--color-success)', bg: 'rgba(var(--color-success),0.12)' },
                        { label: 'Upcoming', value: bookings.filter(b => ['pending','confirmed'].includes(b.status)).length, sub: 'scheduled', icon: Clock, color: 'var(--color-accent)', bg: 'rgba(var(--color-accent),0.12)' },
                        { label: 'Spent', value: `$${totalSpent.toLocaleString()}`, sub: 'lifetime', icon: DollarSign, color: 'var(--color-warning)', bg: 'rgba(var(--color-warning),0.12)' },
                    ].map((stat, i) => (
                        <div key={i} className="rounded-xl p-4 text-center shimmer"
                            style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xs)' }}>
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-2 card-lightning-subtle"
                                style={{ backgroundColor: stat.bg }}>
                                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                            </div>
                            <p className="font-black text-2xl" style={{ color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>{stat.value}</p>
                            <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-subtle)' }}>{stat.sub}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: 'var(--color-text-subtle)' }} />
                    <input 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        placeholder="Search bookings…"
                        className="input-lightning w-full h-11 pl-10 pr-4 text-sm outline-none"
                        style={{ 
                            backgroundColor: 'var(--color-surface-high)', 
                            borderColor: 'var(--color-border-strong)', 
                            color: 'var(--color-text)',
                            fontFamily: 'Inter,sans-serif',
                            fontSize: '15px'
                        }} 
                    />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="h-11 rounded-xl px-4 text-sm outline-none shrink-0"
                    style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text)', fontFamily: 'Inter,sans-serif' }}>
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Bookings List */}
            {filtered.length === 0 ? (
                <div className="rounded-2xl p-12 text-center shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <CalendarDays className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--color-text-subtle)' }} />
                    <h2 className="font-bold text-lg mb-1" style={{ color: 'var(--color-primary)' }}>{search || statusFilter !== 'all' ? 'No bookings found' : 'No bookings yet'}</h2>
                    <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                        {search || statusFilter !== 'all' 
                            ? 'Try adjusting your search or filter' 
                            : 'Your booking history will appear here'}
                    </p>
                    <a href="/services" className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold transition-all"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                        {search || statusFilter !== 'all' ? 'Clear Filters' : 'Browse Services'}
                        <HelpCircle className="h-4 w-4" />
                    </a>
                </div>
            ) : (
                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    {filtered.map((b, i) => {
                        const st = STATUS_STYLES[b.status] || STATUS_STYLES.no_show;
                        return (
                            <div key={b.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-high/50"
                                style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                            <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: 'var(--color-surface-high)' }}>
                                <CalendarDays className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-primary)' }}>{b.service_name}</p>
                                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{b.provider_name} · {b.date} at {b.time_slot}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>${b.price || 0}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                                    {b.status.charAt(0).toUpperCase() + b.status.slice(1).replace('_', ' ')}
                                </span>
                                {b.status === 'completed' && (
                                    <button 
                                        className="h-8 w-8 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                        style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-subtle)' }}
                                        onClick={() => toast.info('Opening provider profile...')}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-subtle)'; }}
                                        aria-label="View provider">
                                        <Star className="h-4 w-4 fill-current" style={{ color: 'var(--color-warning)' }} />
                                    </button>
                                )}
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}