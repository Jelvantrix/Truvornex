import { useState } from 'react';
import { Bell, Mail, Smartphone, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const NOTIFICATION_GROUPS = [
    {
        title: 'Bookings',
        items: [
            { key: 'booking_confirmed', label: 'Booking confirmed', desc: 'When a provider confirms your booking' },
            { key: 'booking_reminder', label: 'Booking reminder', desc: '24h and 1h before your appointment' },
            { key: 'booking_cancelled', label: 'Booking cancelled', desc: 'When a booking is cancelled by provider' },
            { key: 'booking_completed', label: 'Service completed', desc: 'Confirmation when service is done' },
        ],
    },
    {
        title: 'Messages',
        items: [
            { key: 'new_message', label: 'New messages', desc: 'When a provider sends you a message' },
            { key: 'message_read', label: 'Message read receipts', desc: 'When your message is read' },
        ],
    },
    {
        title: 'Promotions',
        items: [
            { key: 'bundle_deals', label: 'Bundle deals', desc: 'When new group deals form in your area' },
            { key: 'seasonal_tips', label: 'Seasonal tips', desc: 'Timely home maintenance suggestions' },
            { key: 'loyalty_updates', label: 'Loyalty rewards', desc: 'Points, tier updates, and credits' },
        ],
    },
    {
        title: 'Account',
        items: [
            { key: 'review_requests', label: 'Review requests', desc: 'After completing a service' },
            { key: 'account_security', label: 'Security alerts', desc: 'Login and account change alerts' },
        ],
    },
];

const CHANNELS = [
    { key: 'in_app', label: 'In-App', icon: Bell, short: 'App' },
    { key: 'email', label: 'Email', icon: Mail, short: 'Email' },
    { key: 'push', label: 'Push', icon: Smartphone, short: 'Push' },
];

export default function NotificationSettings() {
    const [settings, setSettings] = useState(() => {
        const defaults = {};
        NOTIFICATION_GROUPS.forEach(g => g.items.forEach(i => {
            CHANNELS.forEach(c => { defaults[`${i.key}_${c.key}`] = c.key !== 'push'; });
        }));
        return { ...defaults, ...JSON.parse(localStorage.getItem('notification_settings') || '{}') };
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const toggle = (key) => setSettings(p => ({ ...p, [key]: !p[key] }));

    const save = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 500));
        localStorage.setItem('notification_settings', JSON.stringify(settings));
        setSaving(false);
        setSaved(true);
        toast.success('Notification preferences saved');
        setTimeout(() => setSaved(false), 3000);
    };

    const resetToDefaults = () => {
        const defaults = {};
        NOTIFICATION_GROUPS.forEach(g => g.items.forEach(i => {
            CHANNELS.forEach(c => { defaults[`${i.key}_${c.key}`] = c.key !== 'push'; });
        }));
        setSettings(defaults);
        toast.info('Reset to defaults');
    };

    const getEnabledCount = () => {
        let count = 0;
        NOTIFICATION_GROUPS.forEach(g => g.items.forEach(i => {
            CHANNELS.forEach(c => {
                if (settings[`${i.key}_${c.key}`]) count++;
            });
        }));
        return count;
    };

    const getTotalCount = () => {
        let count = 0;
        NOTIFICATION_GROUPS.forEach(g => g.items.forEach(i => {
            CHANNELS.forEach(c => { count++; });
        }));
        return count;
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Notification Settings</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Choose when and how you get notified across all channels</p>
            </div>

            {/* Stats Overview */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { value: getEnabledCount(), label: 'Enabled', icon: Bell, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)', trend: `${getTotalCount()} total`, trendUp: true },
                        { value: '3', label: 'Channels', icon: Mail, color: 'var(--color-accent)', bg: 'rgba(var(--color-accent),0.12)' },
                        { value: '4', label: 'Categories', icon: Smartphone, color: 'var(--color-success)', bg: 'rgba(var(--color-success),0.12)' },
                        { value: '24/7', label: 'Delivery', icon: CheckCircle2, color: 'var(--color-warning)', bg: 'rgba(var(--color-warning),0.12)' },
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

            {/* Channel Legend */}
            <div className="rounded-xl p-4 mb-6 card-lightning-subtle" style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                <div className="flex flex-wrap items-center gap-4">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-subtle)' }}>Delivery Channels:</span>
                    {CHANNELS.map(c => (
                        <div key={c.key} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <c.icon className="h-3.5 w-3.5" style={{ color: 'var(--color-primary)' }} />
                            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{c.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Notification Table */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--color-surface-high)' }}>
                                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider sticky left-0 z-10"
                                    style={{ 
                                        color: 'var(--color-text-subtle)', 
                                        borderBottom: '1px solid var(--color-border)',
                                        backgroundColor: 'var(--color-surface-high)'
                                    }}>
                                    Notification
                                </th>
                                {CHANNELS.map(c => (
                                    <th key={c.key} className="text-center px-3 py-3.5 text-xs font-bold uppercase tracking-wider sticky left-0 z-10"
                                        style={{ 
                                            color: 'var(--color-text-subtle)', 
                                            borderBottom: '1px solid var(--color-border)',
                                            backgroundColor: 'var(--color-surface-high)',
                                            width: '100px'
                                        }}>
                                        <c.icon className="h-3.5 w-3.5 mx-auto" style={{ color: 'var(--color-primary)' }} />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {NOTIFICATION_GROUPS.map((group, groupIndex) => (
                                <>
                                    <tr key={`group-${group.title}`} style={{ backgroundColor: 'var(--color-surface-low)' }}>
                                        <td colSpan={CHANNELS.length + 1} className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider"
                                            style={{ 
                                                color: 'var(--color-text-subtle)', 
                                                borderBottom: '1px solid var(--color-border)',
                                                backgroundColor: 'var(--color-surface-low)'
                                            }}>
                                            {group.title}
                                        </td>
                                    </tr>
                                    {group.items.map((item, itemIndex) => (
                                        <tr key={item.key} className="hover:bg-surface-high/50 transition-colors duration-150"
                                            style={{ 
                                                backgroundColor: itemIndex % 2 === 0 ? 'transparent' : 'var(--color-surface-low)',
                                                borderBottom: '1px solid var(--color-border)'
                                            }}>
                                            <td className="px-5 py-3.5">
                                                <div>
                                                    <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>{item.label}</p>
                                                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{item.desc}</p>
                                                </div>
                                            </td>
                                            {CHANNELS.map(c => (
                                                <td key={c.key} className="px-3 py-3.5 text-center">
                                                    <div className="flex justify-center">
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!settings[`${item.key}_${c.key}`]}
                                                                onChange={() => toggle(`${item.key}_${c.key}`)}
                                                                disabled={saving}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2 peer-focus:ring-offset-surface"
                                                                style={{ 
                                                                    backgroundColor: settings[`${item.key}_${c.key}`] ? 'var(--color-primary)' : 'var(--color-border-strong)' 
                                                                }}>
                                                                <span className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                                                                    style={{ 
                                                                        transform: settings[`${item.key}_${c.key}`] ? 'translateX(20px)' : 'translateX(0)' 
                                                                    }} />
                                                            </div>
                                                        </label>
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Channel Descriptions */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Channel Details</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {CHANNELS.map(c => (
                        <div key={c.key} className="rounded-xl p-4 transition-all hover-lift card-lightning-subtle"
                            style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle"
                                    style={{ backgroundColor: 'rgba(var(--color-primary), 0.12)' }}>
                                    <c.icon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                                </div>
                                <div>
                                    <h3 className="font-semibold" style={{ color: 'var(--color-primary)' }}>{c.label}</h3>
                                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                        {c.key === 'in_app' && 'Notifications appear in the app\'s notification center'}
                                        {c.key === 'email' && 'Sent to your registered email address'}
                                        {c.key === 'push' && 'Push notifications to your mobile device'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                {c.key === 'in_app' && 'Real-time, works offline'}
                                {c.key === 'email' && 'Delivery within minutes'}
                                {c.key === 'push' && 'Instant on mobile devices'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quiet Hours */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Quiet Hours</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-accent)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="mb-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Do Not Disturb</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Set hours when you don't want to receive notifications</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl p-4 card-lightning-subtle hover-lift transition-all"
                        style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle"
                                style={{ backgroundColor: 'rgba(var(--color-primary), 0.12)' }}>
                                <Bell className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <div>
                                <h3 className="font-semibold" style={{ color: 'var(--color-primary)' }}>Enable Quiet Hours</h3>
                                <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Suppress all non-emergency notifications during set hours</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer w-full">
                            <input
                                type="checkbox"
                                checked={false}
                                onChange={() => toast.info('Quiet hours feature coming soon')}
                                className="sr-only peer"
                            />
                            <div className="w-12 h-7 rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2 peer-focus:ring-offset-surface"
                                style={{ 
                                    backgroundColor: false ? 'var(--color-primary)' : 'var(--color-border-strong)' 
                                }}>
                                <span className="absolute left-0.5 top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform"
                                    style={{ 
                                        transform: false ? 'translateX(22px)' : 'translateX(0)' 
                                    }} />
                            </div>
                        </label>
                    </div>
                    <div className="rounded-xl p-4 card-lightning-subtle hover-lift transition-all"
                        style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle"
                                style={{ backgroundColor: 'rgba(var(--color-warning), 0.12)' }}>
                                <Clock className="h-5 w-5" style={{ color: 'var(--color-warning)' }} />
                            </div>
                            <div>
                                <h3 className="font-semibold" style={{ color: 'var(--color-primary)' }}>Schedule</h3>
                                <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Set your preferred quiet hours (e.g., 10 PM - 7 AM)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="time" defaultValue="22:00" className="input-lightning w-24 py-2 text-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border-strong)' }} />
                            <span style={{ color: 'var(--color-text-subtle)' }}>to</span>
                            <input type="time" defaultValue="07:00" className="input-lightning w-24 py-2 text-sm" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border-strong)' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Emergency Override */}
            <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid rgba(var(--color-error), 0.3)' }}>
                <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                        style={{ backgroundColor: 'rgba(var(--color-error), 0.12)' }}>
                        <AlertCircle className="h-5 w-5" style={{ color: 'var(--color-error)' }} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold" style={{ color: 'var(--color-error)' }}>Emergency Override</h3>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Always receive emergency and security alerts regardless of quiet hours or channel settings</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                            type="checkbox"
                            checked={true}
                            onChange={() => toast.info('Emergency alerts cannot be disabled')}
                            disabled
                            className="sr-only peer"
                        />
                        <div className="w-12 h-7 rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2 peer-focus:ring-offset-surface"
                            style={{ backgroundColor: 'var(--color-primary)' }}>
                            <span className="absolute left-0.5 top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform"
                                style={{ transform: 'translateX(22px)' }} />
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
}