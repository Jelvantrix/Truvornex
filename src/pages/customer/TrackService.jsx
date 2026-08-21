import { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle2, Phone, MessageSquare, Truck } from 'lucide-react';
import { toast } from 'sonner';

const TRACKING_STEPS = [
    { key: 'confirmed', label: 'Booking Confirmed', desc: 'Provider accepted your booking', icon: CheckCircle2 },
    { key: 'en_route', label: 'Provider En Route', desc: 'On the way to your location', icon: MapPin },
    { key: 'arrived', label: 'Provider Arrived', desc: 'Service is starting', icon: CheckCircle2 },
    { key: 'in_progress', label: 'Service In Progress', desc: 'Your service is being completed', icon: Clock },
    { key: 'completed', label: 'Service Complete', desc: 'All done! Please leave a review', icon: CheckCircle2 },
];

const MOCK_BOOKINGS = [
    { id: '1', service_name: 'Deep House Cleaning', provider_name: 'Sparkle Clean Co.', date: '2025-01-20', time_slot: '9:00 AM', status: 'in_progress', price: 150, provider_id: 'p1' },
    { id: '2', service_name: 'AC Repair', provider_name: 'CoolAir HVAC', date: '2025-01-21', time_slot: '2:00 PM', status: 'confirmed', price: 200, provider_id: 'p2' },
];

export default function TrackService() {
    const [bookings, setBookings] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const active = MOCK_BOOKINGS.filter(bk => ['confirmed', 'in_progress', 'pending'].includes(bk.status));
        setBookings(active);
        if (active.length > 0) setSelected(active[0]);
        setLoading(false);
    }, []);

    const getStep = (status) => {
        const map = { confirmed: 0, en_route: 1, arrived: 2, in_progress: 3, completed: 4 };
        return map[status] ?? 0;
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Track Service</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Live status of your active bookings</p>
            </div>

            {bookings.length === 0 ? (
                <div className="rounded-2xl p-12 text-center shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <MapPin className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--color-text-subtle)' }} />
                    <h2 className="font-bold text-lg mb-1" style={{ color: 'var(--color-primary)' }}>No active bookings</h2>
                    <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>You don't have any services currently in progress or scheduled</p>
                    <a href="/services" className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold transition-all"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                        <Truck className="h-4 w-4" />
                        Book a Service
                    </a>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sidebar - Active Bookings */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-subtle)' }}>Active Bookings</p>
                        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            {bookings.map(b => (
                                <button key={b.id} onClick={() => setSelected(b)}
                                    className={`w-full text-left p-4 transition-all ${selected?.id === b.id ? 'bg-primary/5' : ''}`}
                                    style={{ borderBottom: b.id !== bookings[bookings.length - 1].id ? '1px solid var(--color-border)' : 'none' }}>
                                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-primary)' }}>{b.service_name}</p>
                                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>{b.provider_name} · {b.date} at {b.time_slot}</p>
                                    <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        b.status === 'confirmed' ? 'bg-primary/10 text-primary border border-primary/20' :
                                        b.status === 'in_progress' ? 'bg-accent/10 text-accent border border-accent/20' :
                                        'bg-warning/10 text-warning border border-warning/20'
                                    }`}>
                                        {b.status === 'in_progress' ? 'In Progress' : b.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main - Selected Booking Details */}
                    {selected && (
                        <div className="lg:col-span-2 space-y-6">
                            {/* Service Header */}
                            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                                <div className="flex items-start justify-between mb-5">
                                    <div>
                                        <h2 className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>{selected.service_name}</h2>
                                        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{selected.provider_name} · {selected.date} at {selected.time_slot}</p>
                                    </div>
                                    <span className="font-black text-xl" style={{ color: 'var(--color-primary)' }}>${selected.price || 0}</span>
                                </div>

                                {/* Tracking Steps */}
                                <div className="relative">
                                    <div className="absolute left-4 top-4 bottom-4 w-0.5" style={{ backgroundColor: 'var(--color-border)' }} />
                                    {TRACKING_STEPS.map((step, i) => {
                                        const currentStep = getStep(selected.status);
                                        const done = i <= currentStep;
                                        const active = i === currentStep;
                                        const Icon = step.icon;
                                        return (
                                            <div key={step.key} className="relative flex items-start gap-4 pb-6 last:pb-0">
                                                <div className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-primary' : 'bg-surface-high border border-border'}`}>
                                                    <Icon className={`h-3.5 w-3.5 ${done ? 'text-on-primary' : 'text-text-subtle'}`} />
                                                </div>
                                                <div className={`pt-1 ${done ? '' : 'opacity-60'}`}>
                                                    <p className={`font-semibold text-sm ${active ? 'text-primary' : ''}`}>{step.label}</p>
                                                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{step.desc}</p>
                                                    {active && <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(var(--color-success),0.15)', color: 'var(--color-success)' }}>Current Status</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Provider Info Card */}
                            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-subtle)' }}>Provider Details</p>
                                    <div className="flex items-center gap-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(var(--color-success),0.15)', color: 'var(--color-success)' }}>
                                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--color-success)' }} />
                                        Available
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                                        <Truck className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>{selected.provider_name}</p>
                                        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Professional service provider · ⭐ 4.9 (127 reviews)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                <button className="h-11 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                                    style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                                    <MessageSquare className="h-4 w-4" />
                                    Message Provider
                                </button>
                                <button className="h-11 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                                    style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                                    onClick={() => toast.info('Calling provider...')}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                                    <Phone className="h-4 w-4" />
                                    Call Provider
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}