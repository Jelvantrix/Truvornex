import { useState } from 'react';
import { RefreshCw, Plus, Trash2, Calendar, Clock, CheckCircle2, Loader2, DollarSign, Star, AlertCircle, Settings } from 'lucide-react';
import { toast } from 'sonner';

const FREQ_LABELS = { weekly: 'Every week', biweekly: 'Every 2 weeks', monthly: 'Every month', quarterly: 'Every 3 months' };
const FREQ_ICONS = { weekly: RefreshCw, biweekly: Calendar, monthly: Clock, quarterly: AlertCircle };
const FREQ_COLORS = { 
    weekly: { bg: 'rgba(var(--color-primary), 0.12)', color: 'var(--color-primary)', border: 'rgba(var(--color-primary), 0.3)' },
    biweekly: { bg: 'rgba(var(--color-accent), 0.12)', color: 'var(--color-accent)', border: 'rgba(var(--color-accent), 0.3)' },
    monthly: { bg: 'rgba(var(--color-success), 0.12)', color: 'var(--color-success)', border: 'rgba(var(--color-success), 0.3)' },
    quarterly: { bg: 'rgba(var(--color-warning), 0.12)', color: 'var(--color-warning)', border: 'rgba(var(--color-warning), 0.3)' },
};

const MOCK_RECURRING = [
    { id: '1', service_name: 'Weekly House Cleaning', provider_name: 'Sparkle Clean Co.', frequency: 'weekly', day_of_week: 'Mondays', preferred_time: '9:00 AM', total_completed: 12, next_date: '2025-01-20', is_active: true, provider_rating: 4.9, price: 120 },
    { id: '2', service_name: 'Bi-weekly Lawn Maintenance', provider_name: 'Green Thumb Landscaping', frequency: 'biweekly', day_of_week: 'Wednesdays', preferred_time: '10:00 AM', total_completed: 8, next_date: '2025-01-22', is_active: true, provider_rating: 4.8, price: 85 },
    { id: '3', service_name: 'Monthly Deep Clean', provider_name: 'ProClean Services', frequency: 'monthly', day_of_week: 'First Saturday', preferred_time: '2:00 PM', total_completed: 5, next_date: '2025-02-01', is_active: false, provider_rating: 4.7, price: 200 },
    { id: '4', service_name: 'Quarterly HVAC Check', provider_name: 'Comfort Climate Systems', frequency: 'quarterly', day_of_week: 'As Scheduled', preferred_time: 'Flexible', total_completed: 2, next_date: '2025-03-15', is_active: true, provider_rating: 5.0, price: 150 },
];

export default function RecurringServices() {
    const [recurring, setRecurring] = useState(MOCK_RECURRING);
    const [togglingId, setTogglingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const activeCount = recurring.filter(r => r.is_active).length;
    const totalMonthly = recurring.filter(r => r.is_active).reduce((sum, r) => {
        const mult = r.frequency === 'weekly' ? 4.33 : r.frequency === 'biweekly' ? 2.17 : r.frequency === 'monthly' ? 1 : 0.33;
        return sum + (r.price * mult);
    }, 0);

    const toggleActive = async (r) => {
        setTogglingId(r.id);
        await new Promise(res => setTimeout(res, 300));
        setRecurring(prev => prev.map(rb => rb.id === r.id ? { ...rb, is_active: !rb.is_active } : rb));
        toast.success(r.is_active ? 'Recurring service paused' : 'Recurring service resumed');
        setTogglingId(null);
    };

    const del = async (id) => {
        setDeletingId(id);
        await new Promise(res => setTimeout(res, 300));
        setRecurring(prev => prev.filter(r => r.id !== id));
        toast.success('Recurring service cancelled');
        setDeletingId(null);
    };

    const formatNextDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Recurring Services</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Manage your auto-scheduled services and subscriptions</p>
            </div>

            {/* Stats Overview */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { value: recurring.length, label: 'Total Services', icon: RefreshCw, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)', trend: `${activeCount} active`, trendUp: true },
                        { value: `$${totalMonthly.toFixed(0)}`, label: 'Est. Monthly', icon: DollarSign, color: 'var(--color-success)', bg: 'rgba(var(--color-success),0.12)' },
                        { value: recurring.reduce((sum, r) => sum + r.total_completed, 0), label: 'Completed', icon: CheckCircle2, color: 'var(--color-accent)', bg: 'rgba(var(--color-accent),0.12)' },
                        { value: Math.max(...recurring.map(r => r.provider_rating), 0).toFixed(1), label: 'Avg Rating', icon: Star, color: 'var(--color-warning)', bg: 'rgba(var(--color-warning),0.12)', trend: 'out of 5', trendUp: true },
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

            {/* Active Services Section */}
            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="mb-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Active Services</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Currently running recurring bookings</p>
                </div>

                {recurring.filter(r => r.is_active).length === 0 ? (
                    <div className="text-center py-10">
                        <RefreshCw className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--color-text-subtle)' }} />
                        <p className="font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>No active services</p>
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Start a recurring booking to save time</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recurring.filter(r => r.is_active).map(service => {
                            const freq = FREQ_COLORS[service.frequency] || FREQ_COLORS.weekly;
                            const FreqIcon = FREQ_ICONS[service.frequency] || RefreshCw;

                            return (
                                <div key={service.id} className="rounded-xl p-5 transition-all hover-lift card-lightning-subtle"
                                    style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xs)' }}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <h3 className="font-semibold" style={{ color: 'var(--color-primary)' }}>{service.service_name}</h3>
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                                                    style={{ backgroundColor: freq.bg, color: freq.color, border: `1px solid ${freq.border}` }}>
                                                    <FreqIcon className="h-3 w-3" />
                                                    {FREQ_LABELS[service.frequency] || service.frequency}
                                                </span>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                                                    style={{ backgroundColor: 'rgba(var(--color-success),0.15)', color: 'var(--color-success)' }}>
                                                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--color-success)' }} />
                                                    Active
                                                </span>
                                            </div>
                                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{service.provider_name} • ⭐ {service.provider_rating}</p>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--color-text-subtle)' }} />
                                                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{service.day_of_week}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--color-text-subtle)' }} />
                                                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{service.preferred_time}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--color-success)' }} />
                                                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{service.total_completed} done</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>${service.price}</span>
                                                    <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>/visit</span>
                                                </div>
                                            </div>

                                            {service.next_date && (
                                                <div className="flex items-center gap-2 text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                                                    <Clock className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--color-text-subtle)' }} />
                                                    <span>Next service: <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>{formatNextDate(service.next_date)}</span></span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={service.is_active}
                                                    onChange={() => toggleActive(service)}
                                                    disabled={togglingId === service.id}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2 peer-focus:ring-offset-surface"
                                                    style={{ backgroundColor: service.is_active ? 'var(--color-primary)' : 'var(--color-border-strong)' }}>
                                                    <span className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                                                        style={{ transform: service.is_active ? 'translateX(20px)' : 'translateX(0)' }} />
                                                </div>
                                            </label>
                                            <button
                                                className="h-9 w-9 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                                style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                                                onClick={() => del(service.id)}
                                                disabled={deletingId === service.id}
                                                aria-label="Cancel service">
                                                {deletingId === service.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--color-error)' }} />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" style={{ color: 'var(--color-error)' }} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Paused Services Section */}
            {recurring.filter(r => !r.is_active).length > 0 && (
                <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="mb-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Paused Services</p>
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Services currently on hold</p>
                    </div>

                    <div className="space-y-4">
                        {recurring.filter(r => !r.is_active).map(service => {
                            const freq = FREQ_COLORS[service.frequency] || FREQ_COLORS.weekly;
                            const FreqIcon = FREQ_ICONS[service.frequency] || RefreshCw;

                            return (
                                <div key={service.id} className="rounded-xl p-5 transition-all card-lightning-subtle opacity-60"
                                    style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <h3 className="font-semibold" style={{ color: 'var(--color-primary)' }}>{service.service_name}</h3>
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                                                    style={{ backgroundColor: freq.bg, color: freq.color, border: `1px solid ${freq.border}` }}>
                                                    <FreqIcon className="h-3 w-3" />
                                                    {FREQ_LABELS[service.frequency] || service.frequency}
                                                </span>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                                                    style={{ backgroundColor: 'rgba(var(--color-warning),0.15)', color: 'var(--color-warning)' }}>
                                                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--color-warning)' }} />
                                                    Paused
                                                </span>
                                            </div>
                                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{service.provider_name}</p>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={service.is_active}
                                                    onChange={() => toggleActive(service)}
                                                    disabled={togglingId === service.id}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2 peer-focus:ring-offset-surface"
                                                    style={{ backgroundColor: service.is_active ? 'var(--color-primary)' : 'var(--color-border-strong)' }}>
                                                    <span className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                                                        style={{ transform: service.is_active ? 'translateX(20px)' : 'translateX(0)' }} />
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Add New Service Button */}
            <div className="flex items-center justify-center">
                <button className="h-10 px-5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                    onClick={() => toast.info('Opening service browser...')}>
                    <Plus className="h-4 w-4" /> Add New Service
                </button>
            </div>

            {/* How It Works */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>How Recurring Services Work</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: Calendar, title: 'Flexible Scheduling', desc: 'Choose weekly, bi-weekly, monthly, or quarterly. Pick specific days and times that work for you.' },
                        { icon: RefreshCw, title: 'Auto-Booking', desc: 'We automatically book each appointment. You\'ll get reminders 24h and 1h before each service.' },
                        { icon: Settings, title: 'Easy Management', desc: 'Pause, resume, or cancel anytime. Modify individual occurrences or the entire series.' },
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