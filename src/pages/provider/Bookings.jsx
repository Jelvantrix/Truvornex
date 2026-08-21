import { useState, useMemo } from 'react';
import { CalendarDays, Clock, CheckCircle2, XCircle, AlertTriangle, ChevronRight, Filter, Search, DollarSign, MessageSquare, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
    pending: { label: 'Pending', bg: 'rgba(var(--color-warning),0.12)', color: 'var(--color-warning)', border: 'rgba(var(--color-warning),0.25)' },
    confirmed: { label: 'Confirmed', bg: 'rgba(var(--color-success),0.12)', color: 'var(--color-success)', border: 'rgba(var(--color-success),0.25)' },
    in_progress: { label: 'In Progress', bg: 'rgba(var(--color-info),0.12)', color: 'var(--color-info)', border: 'rgba(var(--color-info),0.25)' },
    completed: { label: 'Completed', bg: 'var(--color-surface-high)', color: 'var(--color-text-muted)', border: 'var(--color-border)' },
    cancelled: { label: 'Cancelled', bg: 'rgba(var(--color-error),0.12)', color: 'var(--color-error)', border: 'rgba(var(--color-error),0.25)' },
    no_show: { label: 'No Show', bg: 'rgba(var(--color-error),0.12)', color: 'var(--color-error)', border: 'rgba(var(--color-error),0.25)' },
};

const MOCK_BOOKINGS = [
    { id: '1', service_name: 'Deep House Cleaning', customer_email: 'sarah@email.com', customer_name: 'Sarah Johnson', date: '2025-01-20', time_slot: '9:00 AM', status: 'confirmed', price: 150, address: '123 Main St, San Francisco' },
    { id: '2', service_name: 'AC Repair & Maintenance', customer_email: 'mike@email.com', customer_name: 'Mike Chen', date: '2025-01-20', time_slot: '2:00 PM', status: 'pending', price: 200, address: '456 Oak Ave, Oakland' },
    { id: '3', service_name: 'Lawn Mowing', customer_email: 'emma@email.com', customer_name: 'Emma Wilson', date: '2025-01-21', time_slot: '10:00 AM', status: 'confirmed', price: 85, address: '789 Pine Rd, Berkeley' },
    { id: '4', service_name: 'Plumbing Inspection', customer_email: 'john@email.com', customer_name: 'John Davis', date: '2025-01-22', time_slot: '11:00 AM', status: 'in_progress', price: 120, address: '321 Elm St, Daly City' },
    { id: '5', service_name: 'Window Cleaning', customer_email: 'lisa@email.com', customer_name: 'Lisa Brown', date: '2025-01-18', time_slot: '1:00 PM', status: 'completed', price: 95, address: '654 Maple Dr, San Mateo' },
    { id: '6', service_name: 'Electrical Work', customer_email: 'david@email.com', customer_name: 'David Lee', date: '2025-01-15', time_slot: '9:30 AM', status: 'cancelled', price: 350, address: '987 Cedar Ln, Redwood City' },
];

export default function ProviderBookings() {
    const [bookings] = useState(MOCK_BOOKINGS);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedId, setExpandedId] = useState(null);

    const filtered = useMemo(() => {
        let result = bookings;
        if (search) {
            const query = search.toLowerCase();
            result = result.filter(b => 
                b.service_name?.toLowerCase().includes(query) || 
                b.customer_name?.toLowerCase().includes(query) ||
                b.customer_email?.toLowerCase().includes(query)
            );
        }
        if (statusFilter !== 'all') {
            result = result.filter(b => b.status === statusFilter);
        }
        return result;
    }, [search, statusFilter]);

    const stats = useMemo(() => {
        const pending = bookings.filter(b => b.status === 'pending').length;
        const confirmed = bookings.filter(b => b.status === 'confirmed').length;
        const inProgress = bookings.filter(b => b.status === 'in_progress').length;
        const completed = bookings.filter(b => b.status === 'completed').length;
        const earnings = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + (b.price || 0), 0);
        return { pending, confirmed, inProgress, completed, earnings };
    }, [bookings]);

    if (loading) return (
        <div className="space-y-6 max-w-4xl">
            <div className="skeleton-wave h-7 w-56 rounded-xl" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton-wave h-28 rounded-2xl" />)}
            </div>
            <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton-wave h-20 rounded-xl" />)}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-primary),0.15)', border: '1px solid rgba(var(--color-primary),0.25)' }}>
                        <CalendarDays className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                        <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Bookings</h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Manage your incoming bookings</p>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Pending', value: stats.pending, icon: Clock, color: 'var(--color-warning)', bg: 'rgba(var(--color-warning),0.12)' },
                        { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle2, color: 'var(--color-success)', bg: 'rgba(var(--color-success),0.12)' },
                        { label: 'In Progress', value: stats.inProgress, icon: AlertTriangle, color: 'var(--color-info)', bg: 'rgba(var(--color-info),0.12)' },
                        { label: 'Earnings', value: `$${stats.earnings.toLocaleString()}`, icon: DollarSign, color: 'var(--color-accent)', bg: 'rgba(var(--color-accent),0.12)' },
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
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                </select>
            </div>

            {/* Bookings List */}
            {filtered.length === 0 ? (
                <div className="rounded-2xl p-12 text-center shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <CalendarDays className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--color-text-subtle)' }} />
                    <h2 className="font-bold text-lg mb-1" style={{ color: 'var(--color-primary)' }}>{bookings.length === 0 ? 'No bookings yet' : 'No bookings found'}</h2>
                    <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                        {bookings.length === 0 
                            ? 'Your bookings will appear here once customers start booking your services'
                            : 'Try adjusting your search or filter'}
                    </p>
                    <button className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold transition-all"
                        style={{ backgroundColor: bookings.length === 0 ? 'var(--color-primary)' : 'transparent', color: bookings.length === 0 ? 'var(--color-on-primary)' : 'var(--color-text-muted)', border: bookings.length === 0 ? 'none' : '1px solid var(--color-border-strong)' }}
                        onClick={() => { if (bookings.length === 0) toast.info('Navigate to provider profile to set up services'); else { setSearch(''); setStatusFilter('all'); }}}
                        onMouseEnter={e => { if (bookings.length === 0) e.currentTarget.style.opacity = '0.88'; else { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}}
                        onMouseLeave={e => { if (bookings.length === 0) e.currentTarget.style.opacity = '1'; else { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}}>
                        {bookings.length === 0 ? <HelpCircle className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                        {bookings.length === 0 ? 'Set Up Profile' : 'Clear Filters'}
                    </button>
                </div>
            ) : (
                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    {filtered.map((b, i) => {
                        const st = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                        const isExpanded = expandedId === b.id;
                        return (
                            <>
                                <div key={b.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-high/50"
                                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                                    onClick={() => setExpandedId(isExpanded ? null : b.id)}>
                                    <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-surface-high)' }}>
                                        <CalendarDays className="h-4.5 w-4.5" style={{ color: 'var(--color-text-muted)' }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-primary)' }}>{b.service_name}</p>
                                        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{b.customer_name} · {b.customer_email}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="hidden sm:flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                            <CalendarDays className="h-3 w-3" />{new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                            <Clock className="h-3 w-3" />{b.time_slot}
                                        </div>
                                        <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>${b.price}</span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                                            {st.label}
                                        </span>
                                        <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} style={{ color: 'var(--color-text-subtle)' }} />
                                    </div>
                                </div>

                                {/* Expanded Row */}
                                {isExpanded && (
                                    <div className="col-span-12 px-5 pb-5 animate-slide-down"
                                        style={{ backgroundColor: 'var(--color-surface-high)', borderTop: '1px solid var(--color-border)' }}>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                                                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Date</p>
                                                <p className="font-medium" style={{ color: 'var(--color-primary)' }}>{new Date(b.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                                                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Time</p>
                                                <p className="font-medium" style={{ color: 'var(--color-primary)' }}>{b.time_slot}</p>
                                            </div>
                                            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                                                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Customer</p>
                                                <p className="font-medium text-sm truncate" style={{ color: 'var(--color-primary)' }}>{b.customer_name} ({b.customer_email})</p>
                                            </div>
                                            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                                                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Amount</p>
                                                <p className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>${b.price}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4">
                                            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-subtle)' }}>Service Address</p>
                                            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                                                <p className="text-sm" style={{ color: 'var(--color-text)' }}>{b.address}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                            <button className="h-10 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                                                onClick={() => toast.info('Opening chat with customer...')}>
                                                <MessageSquare className="h-3.5 w-3.5" />
                                                Message Customer
                                            </button>
                                            {b.status === 'pending' && (
                                                <>
                                                    <button className="h-10 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                                        style={{ backgroundColor: 'var(--color-success)', color: 'var(--color-on-primary)' }}
                                                        onClick={() => toast.success('Booking confirmed!')}>
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Confirm
                                                    </button>
                                                    <button className="h-10 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                                        style={{ backgroundColor: 'transparent', color: 'var(--color-error)', border: '1px solid var(--color-error)' }}
                                                        onClick={() => toast.info('Booking cancelled')}>
                                                        <XCircle className="h-3.5 w-3.5" />
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                            {b.status === 'confirmed' && (
                                                <button className="h-10 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                                    style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-on-primary)' }}
                                                    onClick={() => toast.success('Marked as in progress!')}>
                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                    Start Service
                                                </button>
                                            )}
                                            {b.status === 'in_progress' && (
                                                <button className="h-10 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                                    style={{ backgroundColor: 'var(--color-success)', color: 'var(--color-on-primary)' }}
                                                    onClick={() => toast.success('Service marked complete!')}>
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Complete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        );
                    })}
                </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Quick Actions</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button className="h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-left p-4"
                    style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    onClick={() => toast.info('Opening calendar...')}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}>
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                        <CalendarDays className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--color-primary)' }}>View Calendar</p>
                        <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Weekly & monthly views</p>
                    </div>
                </button>
                <button className="h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-left p-4"
                    style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    onClick={() => toast.info('Opening earnings...')}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}>
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-success),0.12)' }}>
                        <DollarSign className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                    </div>
                    <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--color-primary)' }}>View Earnings</p>
                        <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Track your income</p>
                    </div>
                </button>
                <button className="h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-left p-4"
                    style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    onClick={() => toast.info('Opening availability...')}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}>
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-accent),0.12)' }}>
                        <Clock className="h-4 w-4" style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--color-primary)' }}>Set Availability</p>
                        <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Manage your schedule</p>
                    </div>
                </button>
            </div>
        </div>
    );
}