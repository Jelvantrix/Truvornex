import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Package, Star, DollarSign, ArrowRight, TrendingUp, Clock, Users, Zap, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';

const STATUS_CONFIG = {
    pending:     { label: 'Pending',     bg: 'rgba(var(--color-warning),0.12)',  color: 'var(--color-warning)', border: 'rgba(var(--color-warning),0.25)' },
    confirmed:   { label: 'Confirmed',   bg: 'rgba(var(--color-success),0.12)', color: 'var(--color-success)', border: 'rgba(var(--color-success),0.25)' },
    in_progress: { label: 'In Progress', bg: 'rgba(var(--color-info),0.12)', color: 'var(--color-info)',    border: 'rgba(var(--color-info),0.25)' },
    completed:   { label: 'Completed',   bg: 'var(--color-surface-high)', color: 'var(--color-text-muted)', border: 'var(--color-border)' },
    cancelled:   { label: 'Cancelled',   bg: 'rgba(var(--color-error),0.12)', color: 'var(--color-error)',   border: 'rgba(var(--color-error),0.25)' },
    no_show:     { label: 'No Show',     bg: 'rgba(var(--color-error),0.12)', color: 'var(--color-error)',   border: 'rgba(var(--color-error),0.25)' },
};

const MOCK_BOOKINGS = [
    { id: '1', service_name: 'Deep House Cleaning', customer_email: 'sarah@email.com', customer_name: 'Sarah J.', date: '2025-01-20', time_slot: '9:00 AM', status: 'confirmed', price: 150 },
    { id: '2', service_name: 'AC Repair & Maintenance', customer_email: 'mike@email.com', customer_name: 'Mike C.', date: '2025-01-20', time_slot: '2:00 PM', status: 'pending', price: 200 },
    { id: '3', service_name: 'Lawn Mowing', customer_email: 'emma@email.com', customer_name: 'Emma W.', date: '2025-01-21', time_slot: '10:00 AM', status: 'confirmed', price: 85 },
    { id: '4', service_name: 'Plumbing Inspection', customer_email: 'john@email.com', customer_name: 'John D.', date: '2025-01-22', time_slot: '11:00 AM', status: 'in_progress', price: 120 },
    { id: '5', service_name: 'Window Cleaning', customer_email: 'lisa@email.com', customer_name: 'Lisa B.', date: '2025-01-18', time_slot: '1:00 PM', status: 'completed', price: 95 },
    { id: '6', service_name: 'Electrical Work', customer_email: 'david@email.com', customer_name: 'David L.', date: '2025-01-15', time_slot: '9:30 AM', status: 'cancelled', price: 350 },
];

function KPICard({ icon: Icon, label, value, trend, color }) {
    return (
        <div className="rounded-2xl p-5 shimmer"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle"
                    style={{ backgroundColor: color + '15' }}>
                    <Icon className="h-5 w-5" style={{ color: color }} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-success">
                        <TrendingUp className="h-3 w-3" />{trend}
                    </div>
                )}
            </div>
            <div className="font-black text-2xl mb-1" style={{ color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>{value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
        </div>
    );
}

const BookingItem = ({ booking, last }) => {
    const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
    return (
        <div className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-high/50"
            style={{ borderBottom: last ? 'none' : '1px solid var(--color-border)' }}>
            <div className="h-9 w-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                style={{ backgroundColor: 'var(--color-surface-high)', color: 'var(--color-text-muted)' }}>
                {booking.customer_name?.[0] || 'C'}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-primary)' }}>{booking.service_name}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
                        {status.label}
                    </span>
                </div>
                <div className="flex items-center gap-3 flex-wrap text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                    <span className="truncate">{booking.customer_name} ({booking.customer_email})</span>
                    <span className="flex items-center gap-1 shrink-0"><CalendarDays className="h-3 w-3" />{new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span className="flex items-center gap-1 shrink-0"><Clock className="h-3 w-3" />{booking.time_slot}</span>
                    {booking.price > 0 && <span className="ml-auto font-bold shrink-0" style={{ color: 'var(--color-primary)' }}>${booking.price}</span>}
                </div>
            </div>
        </div>
    );
};

export default function Dashboard() {
    const [provider, setProvider] = useState(null);
    const [bookings] = useState(MOCK_BOOKINGS);
    const [loading, setLoading] = useState(true);

    useEffect(() => { 
        setProvider({ 
            business_name: 'Sparkle Clean Co.', 
            status: 'approved',
            rating: 4.9,
            review_count: 127
        });
        setLoading(false); 
    }, []);

    const pending  = bookings.filter(b => b.status === 'pending');
    const confirmed = bookings.filter(b => b.status === 'confirmed');
    const inProgress = bookings.filter(b => b.status === 'in_progress');
    const earnings = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + (b.price || 0), 0);

    if (loading) return (
        <div className="space-y-6 max-w-4xl">
            <div className="skeleton-wave h-7 w-56 rounded-xl" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton-wave h-28 rounded-2xl" />)}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>{provider.business_name}</h1>
                    <p className="text-sm mt-1 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: provider.status === 'approved' ? 'var(--color-success)' : 'var(--color-warning)' }} />
                            {provider.status === 'approved' ? 'Active & Visible' : `Status: ${provider.status}`}
                        </span>
                        <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" style={{ color: 'var(--color-warning)' }} />
                            {provider.rating?.toFixed(1) || '—'} ({provider.review_count} reviews)
                        </span>
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link to="/provider/bookings"
                        className="h-10 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                        style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)', textDecoration: 'none' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                        <CalendarDays className="h-4 w-4" />
                        All Bookings
                    </Link>
                    <Link to="/provider/services"
                        className="h-10 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                        <Plus className="h-4 w-4" />
                        Manage Services
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <KPICard icon={Clock} label="Pending Requests" value={pending.length} color="var(--color-warning)" />
                    <KPICard icon={CheckCircle2} label="Confirmed Today" value={confirmed.length} color="var(--color-success)" />
                    <KPICard icon={AlertTriangle} label="In Progress" value={inProgress.length} color="var(--color-info)" />
                    <KPICard icon={DollarSign} label="Total Earnings" value={`$${earnings.toLocaleString()}`} color="var(--color-accent)" />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold" style={{ color: 'var(--color-primary)' }}>Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { to: '/provider/bookings', label: 'View All Bookings', icon: CalendarDays, color: 'var(--color-primary)' },
                    { to: '/provider/services', label: 'Manage Services', icon: Package, color: 'var(--color-accent)' },
                    { to: '/provider/availability', label: 'Set Availability', icon: Clock, color: 'var(--color-info)' },
                    { to: '/provider/earnings', label: 'See Earnings', icon: TrendingUp, color: 'var(--color-success)' },
                ].map(item => (
                    <Link key={item.to} to={item.to}
                        className="rounded-xl p-4 transition-all hover-lift card-lightning-subtle flex flex-col items-center gap-2 text-center"
                        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', textDecoration: 'none' }}>
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle"
                            style={{ backgroundColor: item.color + '15' }}>
                            <item.icon className="h-5 w-5" style={{ color: item.color }} />
                        </div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>{item.label}</p>
                    </Link>
                ))}
            </div>

            {/* Recent Bookings */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold" style={{ color: 'var(--color-primary)' }}>Recent Bookings</h2>
                <Link to="/provider/bookings"
                    className="text-sm font-medium flex items-center gap-1 transition-all"
                    style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                    View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            {bookings.length === 0 ? (
                <div className="rounded-2xl p-12 text-center shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <Users className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--color-text-subtle)' }} />
                    <h2 className="font-bold text-lg mb-1" style={{ color: 'var(--color-primary)' }}>No bookings yet</h2>
                    <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>Share your profile to start receiving bookings</p>
                    <Link to="/provider/profile"
                        className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold transition-all"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                        <Plus className="h-4 w-4" />
                        Set Up Profile
                    </Link>
                </div>
            ) : (
                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    {bookings.slice(0, 8).map((b, i) => <BookingItem key={b.id} booking={b} last={i === Math.min(bookings.length, 8) - 1} />)}
                </div>
            )}

            {/* Tips */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-[10px] font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Tips</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: Zap, title: 'Keep Profile Updated', desc: 'Updated profiles with photos and descriptions get 3x more bookings' },
                        { icon: CalendarDays, title: 'Set Availability', desc: 'Define your working hours so customers can book instantly' },
                        { icon: TrendingUp, title: 'Track Performance', desc: 'Monitor your earnings and trust score to grow your business' },
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