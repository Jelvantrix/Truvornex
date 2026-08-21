import { useState, useEffect } from 'react';
import { Clock, Settings2, CalendarOff, Plus, Trash2, Loader2, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = [
    { key: 'monday', label: 'Monday', short: 'Mon' },
    { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { key: 'thursday', label: 'Thursday', short: 'Thu' },
    { key: 'friday', label: 'Friday', short: 'Fri' },
    { key: 'saturday', label: 'Saturday', short: 'Sat' },
    { key: 'sunday', label: 'Sunday', short: 'Sun' },
];

const DEFAULT_HOURS = DAYS.reduce((a, d) => ({
    ...a, [d.key]: { open: '09:00', close: '18:00', closed: d.key === 'sunday' }
}), {});

export default function Availability() {
    const [provider, setProvider] = useState(null);
    const [hours, setHours] = useState(DEFAULT_HOURS);
    const [bufferTime, setBufferTime] = useState(0);
    const [slotInterval, setSlotInterval] = useState(30);
    const [advanceDays, setAdvanceDays] = useState(30);
    const [autoConfirm, setAutoConfirm] = useState(false);
    const [cancellationHours, setCancellationHours] = useState(24);
    const [blackouts, setBlackouts] = useState([]);
    const [blackoutDate, setBlackoutDate] = useState(null);
    const [blackoutReason, setBlackoutReason] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('hours');

    useEffect(() => {
        // Mock provider data
        setProvider({ id: 'prov1', business_name: 'Sparkle Clean Co.' });
        setLoading(false);
    }, []);

    const update = (day, field, val) =>
        setHours(prev => ({ ...prev, [day]: { ...prev[day], [field]: val } }));

    const saveHours = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 500));
        toast.success('Working hours saved');
        setSaving(false);
    };

    const saveSettings = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 500));
        toast.success('Schedule settings saved');
        setSaving(false);
    };

    const addBlackout = async () => {
        if (!blackoutDate) return;
        const dateStr = blackoutDate.toISOString().split('T')[0];
        if (blackouts.find(b => b.date === dateStr)) { toast.error('Date already blocked'); return; }
        const rec = { id: Date.now(), provider_id: provider?.id, type: 'blackout', date: dateStr, reason: blackoutReason || 'Unavailable' };
        setBlackouts(prev => [...prev, rec]);
        setBlackoutDate(null);
        setBlackoutReason('');
        toast.success('Date blocked');
    };

    const removeBlackout = async (id) => {
        setBlackouts(prev => prev.filter(b => b.id !== id));
        toast.success('Date unblocked');
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
        </div>
    );

    if (!provider) return (
        <div className="max-w-lg">
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'rgba(var(--color-warning),0.08)', border: '1px solid rgba(var(--color-warning),0.2)' }}>
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
                    <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--color-warning)' }}>Profile Required</p>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Set up your provider profile before managing availability.</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const TABS = [
        { key: 'hours', label: 'Working Hours', icon: Clock },
        { key: 'settings', label: 'Schedule Rules', icon: Settings2 },
        { key: 'blackouts', label: 'Blackout Dates', icon: CalendarOff },
    ];

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Availability</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Manage working hours, schedule rules, and blocked dates</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="rounded-xl p-1.5 flex gap-1" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => setTab(key)}
                        className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${tab === key ? '' : 'hover:bg-surface-high'}`}
                        style={{
                            backgroundColor: tab === key ? 'var(--color-primary)' : 'transparent',
                            color: tab === key ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                        }}>
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Working Hours Tab */}
            {tab === 'hours' && (
                <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <h2 className="font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>Weekly Schedule</h2>
                    <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>Set your regular working hours for each day. Closed days won't show availability.</p>
                    
                    <div className="space-y-3">
                        {DAYS.map(d => (
                            <div key={d.key} className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-4 transition-all hover-lift card-lightning-subtle"
                                style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                            <div className="w-20 shrink-0 sm:w-24">
                                <span className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>{d.label}</span>
                            </div>
                            
                            <div className="flex items-center justify-between flex-1 gap-4">
                                <button 
                                    role="switch"
                                    aria-checked={!hours[d.key]?.closed}
                                    onClick={() => update(d.key, 'closed', !hours[d.key]?.closed)}
                                    className={`relative h-6 w-11 rounded-full flex items-center transition-all shrink-0 ${hours[d.key]?.closed ? '' : 'bg-primary'}`}
                                    style={{
                                        backgroundColor: hours[d.key]?.closed ? 'var(--color-surface-high)' : 'var(--color-primary)',
                                        border: hours[d.key]?.closed ? '1px solid var(--color-border)' : 'none',
                                    }}>
                                    <span className={`absolute h-4 w-4 rounded-full transition-transform flex items-center justify-center ${hours[d.key]?.closed ? 'translate-x-0.5' : 'translate-x-6'}`}
                                        style={{
                                            backgroundColor: hours[d.key]?.closed ? 'var(--color-text-muted)' : 'var(--color-on-primary)',
                                            border: hours[d.key]?.closed ? '1px solid var(--color-border)' : 'none',
                                        }}>
                                        {!hours[d.key]?.closed && <CheckCircle2 className="h-2.5 w-2.5" />}
                                    </span>
                                </button>
                                
                                {!hours[d.key]?.closed ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className="flex-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: 'var(--color-text-subtle)' }}>Open</label>
                                            <input 
                                                type="time" 
                                                value={hours[d.key]?.open || '09:00'} 
                                                onChange={e => update(d.key, 'open', e.target.value)}
                                                className="input-lightning w-full px-3 py-2 rounded-xl text-sm outline-none"
                                                style={{ 
                                                    backgroundColor: 'var(--color-surface)',
                                                    border: '1px solid var(--color-border-strong)',
                                                    color: 'var(--color-text)',
                                                    fontSize: '13px',
                                                    fontFamily: 'Inter,sans-serif',
                                                }}
                                                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-accent)')}
                                                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
                                            />
                                        </div>
                                        <span className="text-xs font-medium" style={{ color: 'var(--color-text-subtle)' }}>–</span>
                                        <div className="flex-1">
                                            <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: 'var(--color-text-subtle)' }}>Close</label>
                                            <input 
                                                type="time" 
                                                value={hours[d.key]?.close || '18:00'} 
                                                onChange={e => update(d.key, 'close', e.target.value)}
                                                className="input-lightning w-full px-3 py-2 rounded-xl text-sm outline-none"
                                                style={{ 
                                                    backgroundColor: 'var(--color-surface)',
                                                    border: '1px solid var(--color-border-strong)',
                                                    color: 'var(--color-text)',
                                                    fontSize: '13px',
                                                    fontFamily: 'Inter,sans-serif',
                                                }}
                                                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-accent)')}
                                                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Closed</span>
                                )}
                            </div>
                        </div>
                        ))}
                    </div>
                    
                    <button className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all mt-4"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none' }}
                        onClick={saveHours} 
                        disabled={saving}
                        onMouseEnter={e => { if (!saving) e.currentTarget.style.opacity = '0.88'; }}
                        onMouseLeave={e => { if (!saving) e.currentTarget.style.opacity = '1'; }}>
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save Working Hours
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Settings Tab */}
            {tab === 'settings' && (
                <div className="space-y-6">
                    <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <h2 className="font-semibold mb-5" style={{ color: 'var(--color-primary)' }}>Appointment Slot Settings</h2>
                        <div className="space-y-4">
                            {[
                                { label: 'Buffer Time', sub: 'Extra time between appointments', value: bufferTime, setter: setBufferTime, options: [0, 5, 10, 15, 30].map(v => ({ value: v, label: v === 0 ? 'None' : `${v} min` })) },
                                { label: 'Slot Interval', sub: 'Time between bookable slots', value: slotInterval, setter: setSlotInterval, options: [15, 30, 45, 60].map(v => ({ value: v, label: `${v} min` })) },
                                { label: 'Advance Booking', sub: 'How far ahead customers can book', value: advanceDays, setter: setAdvanceDays, options: [7, 14, 30, 60, 90].map(v => ({ value: v, label: `${v} days` })) },
                                { label: 'Cancellation Window', sub: 'Minimum hours notice for cancellation', value: cancellationHours, setter: setCancellationHours, options: [1, 2, 6, 12, 24, 48].map(v => ({ value: v, label: `${v}h` })) },
                            ].map(({ label, sub, value, setter, options }) => (
                                <div key={label} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm" style={{ color: 'var(--color-primary)' }}>{label}</p>
                                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>
                                    </div>
                                    <select value={String(value)} onChange={e => setter(Number(e.target.value))}
                                        className="w-full sm:w-32 h-10 rounded-xl px-3 text-sm outline-none shrink-0"
                                        style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text)', fontFamily: 'Inter,sans-serif' }}
                                        onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-accent)')}
                                        onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}>
                                        {options.map(o => <option key={o.value} value={String(o.value)}>{o.label}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <h2 className="font-semibold mb-5" style={{ color: 'var(--color-primary)' }}>Booking Behavior</h2>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2">
                            <div className="flex-1">
                                <p className="font-medium text-sm" style={{ color: 'var(--color-primary)' }}>Auto-Confirm Bookings</p>
                                <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Skip manual approval — instantly confirm new bookings</p>
                            </div>
                            <button 
                                role="switch" 
                                aria-checked={autoConfirm}
                                onClick={() => setAutoConfirm(!autoConfirm)}
                                className={`relative h-6 w-11 rounded-full flex items-center transition-all shrink-0 ${autoConfirm ? 'bg-primary' : 'bg-surface-high border border-border'}`}
                                style={{
                                    backgroundColor: autoConfirm ? 'var(--color-primary)' : 'var(--color-surface-high)',
                                    border: autoConfirm ? 'none' : '1px solid var(--color-border)',
                                }}>
                                <span className={`absolute h-4 w-4 rounded-full transition-transform flex items-center justify-center ${autoConfirm ? 'translate-x-6' : 'translate-x-1'}`}
                                    style={{
                                        backgroundColor: autoConfirm ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
                                        border: autoConfirm ? 'none' : '1px solid var(--color-border)',
                                    }}>
                                    {autoConfirm && <CheckCircle2 className="h-2.5 w-2.5" />}
                                </span>
                            </button>
                        </div>
                    </div>

                    <button className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none' }}
                        onClick={saveSettings} 
                        disabled={saving}
                        onMouseEnter={e => { if (!saving) e.currentTarget.style.opacity = '0.88'; }}
                        onMouseLeave={e => { if (!saving) e.currentTarget.style.opacity = '1'; }}>
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save Schedule Rules
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Blackouts Tab */}
            {tab === 'blackouts' && (
                <div className="space-y-6">
                    <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <h2 className="font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>Block a Date</h2>
                        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>Select dates when you're unavailable. Customers won't be able to book these days.</p>
                        
                        {/* Simple calendar using date input for now */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-text-subtle)' }}>Select Date</label>
                                <input 
                                    type="date"
                                    value={blackoutDate ? blackoutDate.toISOString().split('T')[0] : ''}
                                    onChange={e => setBlackoutDate(e.target.value ? new Date(e.target.value) : null)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="input-lightning w-full px-4 py-3.5 rounded-xl text-base outline-none"
                                    style={{ 
                                        backgroundColor: 'var(--color-surface)',
                                        border: '1px solid var(--color-border-strong)',
                                        color: 'var(--color-text)',
                                        fontSize: '15px',
                                        fontFamily: 'Inter,sans-serif',
                                    }}
                                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-accent)')}
                                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-text-subtle)' }}>Reason</label>
                                <input 
                                    placeholder="e.g. Holiday, Personal Day"
                                    value={blackoutReason}
                                    onChange={e => setBlackoutReason(e.target.value)}
                                    className="input-lightning w-full px-4 py-3.5 rounded-xl text-base outline-none"
                                    style={{ 
                                        backgroundColor: 'var(--color-surface)',
                                        border: '1px solid var(--color-border-strong)',
                                        color: 'var(--color-text)',
                                        fontSize: '15px',
                                        fontFamily: 'Inter,sans-serif',
                                    }}
                                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-accent)')}
                                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
                                />
                            </div>
                        </div>
                        
                        <button className="w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all mt-4"
                            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none' }}
                            onClick={addBlackout} 
                            disabled={!blackoutDate}
                            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '0.88'; }}
                            onMouseLeave={e => { if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '1'; }}>
                            <Plus className="h-4 w-4" />
                            Block This Date
                        </button>
                    </div>

                    {blackouts.length > 0 && (
                        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
                                <h2 className="font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>Blocked Dates</h2>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface-high)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                                    {blackouts.length}
                                </span>
                            </div>
                            <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                                {[...blackouts].sort((a, b) => a.date > b.date ? 1 : -1).map(b => (
                                    <div key={b.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3 transition-colors hover:bg-surface-high/50">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(var(--color-error),0.12)' }}>
                                                <CalendarOff className="h-4.5 w-4.5" style={{ color: 'var(--color-error)' }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-primary)' }}>
                                                    {new Date(b.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{b.reason || 'Unavailable'}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => removeBlackout(b.id)}
                                            className="h-9 w-9 rounded-xl flex items-center justify-center transition-all card-lightning-subtle shrink-0"
                                            style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-error)'; e.currentTarget.style.backgroundColor = 'rgba(var(--color-error),0.05)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.backgroundColor = 'transparent'; }}>
                                            <Trash2 className="h-4 w-4" style={{ color: 'var(--color-error)' }} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}