import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const STATUS_STYLES = {
    pending: { bg: 'rgba(var(--color-warning),0.12)', color: 'var(--color-warning)', border: 'rgba(var(--color-warning),0.25)' },
    confirmed: { bg: 'rgba(var(--color-success),0.12)', color: 'var(--color-success)', border: 'rgba(var(--color-success),0.25)' },
    in_progress: { bg: 'rgba(var(--color-info),0.12)', color: 'var(--color-info)', border: 'rgba(var(--color-info),0.25)' },
    completed: { bg: 'var(--color-surface-high)', color: 'var(--color-text-muted)', border: 'var(--color-border)' },
    cancelled: { bg: 'rgba(var(--color-error),0.12)', color: 'var(--color-error)', border: 'rgba(var(--color-error),0.25)' },
    no_show: { bg: 'rgba(var(--color-error),0.12)', color: 'var(--color-error)', border: 'rgba(var(--color-error),0.25)' },
};

const STATUS_LABEL = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show',
};

const MetricCard = ({ icon: Icon, label, value, sub }) => (
    <div className="rounded-2xl p-5 shimmer hover-lift" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                <Icon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
            </div>
        </div>
        <div className="text-3xl font-black leading-none mb-1" style={{ color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>{value}</div>
        <div className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
        {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-subtle)' }}>{sub}</div>}
    </div>
);

const BookingRow = ({ booking, onClick }) => {
    const status = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
    return (
        <button
            onClick={() => onClick(booking)}
            className="rounded-2xl p-4 w-full text-left flex items-center gap-4 shimmer hover-lift transition-all"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}
        >
            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg font-black shrink-0" style={{ backgroundColor: 'var(--color-surface-high)', color: 'var(--color-text-muted)' }}>
                {booking.provider_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-primary)' }}>{booking.service_name}</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: status.bg, color: status.color, border: `1px solid ${status.border}` }}>{STATUS_LABEL[booking.status] || STATUS_LABEL.pending}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <span>{booking.provider_name}</span>
                    <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{booking.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{booking.time_slot}</span>
                    {booking.price > 0 && <span className="ml-auto font-bold" style={{ color: 'var(--color-primary)' }}>${booking.price}</span>}
                </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0" style={{ color: 'var(--color-text-subtle)' }} />
        </button>
    );
};

export default function CustomerDashboard() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        setBookings([]);
        setLoading(false);
    }, []);

    const cancel = async (b) => {
        setBookings(prev => prev.map(x => x.id === b.id ? { ...x, status: 'cancelled' } : x));
        setSelected(null);
        toast.success('Booking cancelled');
    };

    const upcoming = bookings.filter(b => ['pending', 'confirmed'].includes(b.status));
    const completed = bookings.filter(b => b.status === 'completed');
    const cancelled = bookings.filter(b => b.status === 'cancelled');

    const filters = [
        { id: 'all', label: 'All', count: bookings.length },
        { id: 'upcoming', label: 'Upcoming', count: upcoming.length },
        { id: 'completed', label: 'Completed', count: completed.length },
        { id: 'cancelled', label: 'Cancelled', count: cancelled.length },
    ];

    const filtered = activeFilter === 'all' ? bookings
        : activeFilter === 'upcoming' ? upcoming
            : activeFilter === 'completed' ? completed
                : cancelled;

    return (
        <div className="pb-24 md:pb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-inter font-black text-3xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>My Bookings</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Track and manage your reservations</p>
                </div>
                <Button asChild className="rounded-xl hidden md:flex" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                    <Link to="/services">+ New Booking</Link>
                </Button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                <MetricCard icon={CalendarDays} label="Upcoming" value={upcoming.length} />
                <MetricCard icon={CheckCircle} label="Completed" value={completed.length} />
                <MetricCard icon={Clock} label="Total Booked" value={bookings.length} />
                <MetricCard icon={XCircle} label="Cancelled" value={cancelled.length} />
            </div>

            {/* Filter tabs */}
            <div className="glass rounded-2xl p-1.5 flex gap-1 mb-5 shadow-premium">
                {filters.map(f => (
                    <button
                        key={f.id}
                        onClick={() => setActiveFilter(f.id)}
                        className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl text-xs font-semibold transition-all"
                        style={activeFilter === f.id
                            ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }
                            : { color: 'var(--color-text-muted)' }}
                        onMouseEnter={e => { if (activeFilter !== f.id) e.currentTarget.style.color = 'var(--color-primary)'; }}
                        onMouseLeave={e => { if (activeFilter !== f.id) e.currentTarget.style.color = 'var(--color-text-muted)'; }}
                    >
                        {f.label}
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={activeFilter === f.id ? { backgroundColor: 'rgba(255,255,255,0.2)' } : { backgroundColor: 'var(--color-surface-high)', color: 'var(--color-text-muted)' }}>
                            {f.count}
                        </span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-2xl p-4 flex items-center gap-4 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                            <div className="skeleton-wave h-10 w-10 rounded-xl shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="skeleton-wave h-4 rounded w-1/2" />
                                <div className="skeleton-wave h-3 rounded w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-2xl p-16 text-center shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <CalendarDays className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--color-text-subtle)' }} />
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>No bookings here</h3>
                    <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
                        {activeFilter === 'all' ? "You haven't made any bookings yet." : `No ${activeFilter} bookings.`}
                    </p>
                    <Button asChild className="rounded-xl" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}><Link to="/services">Browse Services</Link></Button>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(b => <BookingRow key={b.id} booking={b} onClick={setSelected} />)}
                </div>
            )}

            <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
                <DialogContent className="rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <DialogHeader>
                        <DialogTitle className="font-black text-xl" style={{ color: 'var(--color-primary)' }}>{selected?.service_name}</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-4 mt-2">
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Provider', value: selected.provider_name },
                                    { label: 'Date', value: selected.date },
                                    { label: 'Time', value: selected.time_slot },
                                    { label: 'Status', value: selected.status?.replace('_', ' ') },
                                    { label: 'Price', value: `$${selected.price}` },
                                ].map(({ label, value }) => (
                                    <div key={label} className="rounded-xl p-3" style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                                        <div className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
                                        <div className="text-sm font-semibold capitalize" style={{ color: 'var(--color-primary)' }}>{value}</div>
                                    </div>
                                ))}
                            </div>
                            {selected.notes && (
                                <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                                    <div className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Notes</div>
                                    <div className="text-sm" style={{ color: 'var(--color-text)' }}>{selected.notes}</div>
                                </div>
                            )}
                            {['pending', 'confirmed'].includes(selected.status) && (
                                <Button variant="destructive" className="w-full rounded-xl" onClick={() => cancel(selected)}>
                                    Cancel Booking
                                </Button>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
