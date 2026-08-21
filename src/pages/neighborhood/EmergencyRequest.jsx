import { useState, useEffect } from 'react';
import { Zap, MapPin, AlertTriangle, CheckCircle, Loader2, Wrench, Thermometer, Lock, Home, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';

const EMERGENCY_CATEGORIES = [
    { id: 'plumbing',   label: 'Plumbing',    Icon: Wrench       },
    { id: 'electrical', label: 'Electrical',  Icon: Zap          },
    { id: 'hvac',       label: 'HVAC',        Icon: Thermometer  },
    { id: 'locksmith',  label: 'Locksmith',   Icon: Lock         },
    { id: 'structural', label: 'Structural',  Icon: Home         },
    { id: 'appliance',  label: 'Appliance',   Icon: Package      },
];

const URGENCY_LEVELS = [
    { id: 'immediate', label: 'Right Now',      sub: 'Within 1 hour'  },
    { id: 'urgent',    label: 'Within 4 Hours', sub: 'Same day'       },
    { id: 'today',     label: 'Today',          sub: 'Within 8 hours' },
];

const STATUS_STEPS = ['open', 'matched', 'in_progress', 'resolved'];
const STATUS_LABELS = {
    open: 'Submitted', matched: 'Matched', in_progress: 'In Progress', resolved: 'Resolved',
};

export default function EmergencyRequest() {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ category: '', urgency: 'immediate', description: '' });
    const [locating, setLocating] = useState(false);
    const [loc, setLoc] = useState(null);
    const [activeReq, setActiveReq] = useState(null);

    const load = async () => {
        if (!user) { setLoading(false); return; }
        setLoading(true);
        const { data } = await supabase.from('emergency_requests').select('*').eq('customer_id', user.id).order('created_at', { ascending: false });
        if (data) {
            setRequests(data);
            const active = data.find(r => !['resolved', 'cancelled'].includes(r.status));
            if (active) setActiveReq(active);
        }
        setLoading(false);
    };

    useEffect(() => { load(); }, [user]);

    const getLocation = () => {
        if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            p => { setLoc({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocating(false); toast.success('Location captured'); },
            () => { toast.error('Could not get location'); setLocating(false); }
        );
    };

    const submit = async () => {
        if (!form.category) { toast.error('Select a category'); return; }
        if (!form.description.trim()) { toast.error('Describe the issue'); return; }
        if (!user) { toast.error('Sign in first'); return; }
        setSubmitting(true);
        // Get default zone
        const { data: zones } = await supabase.from('neighborhood_zones').select('id').limit(1);
        const zoneId = zones?.[0]?.id || null;
        const { data, error } = await supabase.from('emergency_requests').insert([{
            customer_id: user.id,
            category: form.category,
            urgency: form.urgency,
            description: form.description.trim(),
            lat: loc?.lat ?? null,
            lng: loc?.lng ?? null,
            zone_id: zoneId
        }]).select().single();
        if (!error && data) {
            setActiveReq(data);
            setRequests(p => [data, ...p]);
            setForm({ category: '', urgency: 'immediate', description: '' });
            setLoc(null);
            toast.success('Emergency request submitted — matching providers now');
        } else { toast.error(error?.message || 'Failed to submit'); }
        setSubmitting(false);
    };

    const cancel = async () => {
        if (!activeReq) return;
        const { error } = await supabase.from('emergency_requests').update({ status: 'cancelled' }).eq('id', activeReq.id);
        if (!error) {
            setActiveReq(null);
            load();
            toast.success('Request cancelled');
        } else {
            toast.error('Failed to cancel request');
        }
    };

    const stepIdx = s => STATUS_STEPS.indexOf(s);

    if (loading) {
        return (
            <div className="space-y-4 max-w-2xl">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton-wave h-24 rounded-2xl" />)}
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8 max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-error),0.12)' }}>
                    <Zap className="h-5 w-5" style={{ color: 'var(--color-error)' }} />
                </div>
                <div>
                    <h1 className="font-bold text-2xl tracking-tight" style={{ color: 'var(--color-primary)' }}>Emergency Request</h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>On-demand urgent service dispatch</p>
                </div>
            </div>

            {/* Safety notice */}
            <div className="rounded-2xl p-4 flex items-start gap-3 card-premium hover-lift" style={{ backgroundColor: 'var(--color-error-bg)', border: '1px solid rgba(var(--color-error),0.18)' }}>
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: 'var(--color-error)' }} />
                <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-error)' }}>For life-threatening emergencies call 911</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        This service covers home emergencies — burst pipes, power outages, lockouts, HVAC failures.
                    </p>
                </div>
            </div>

            {/* Active request tracker */}
            {activeReq && (
                <div className="rounded-2xl p-5 card-premium hover-lift">
                    <div className="flex items-center justify-between mb-4">
                        <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>Active Request</p>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase" style={{
                            backgroundColor: activeReq.status === 'resolved' ? 'rgba(var(--color-success),0.12)' : 'rgba(var(--color-warning),0.12)',
                            color: activeReq.status === 'resolved' ? 'var(--color-success)' : 'var(--color-warning)'
                        }}>
                            {activeReq.status.replace('_', ' ')}
                        </span>
                    </div>
                    <p className="text-sm mb-5 capitalize" style={{ color: 'var(--color-text-muted)' }}>
                        {activeReq.category} — {activeReq.description}
                    </p>

                    {/* Status stepper */}
                    <div className="flex items-start">
                        {STATUS_STEPS.map((step, i) => {
                            const done = i <= stepIdx(activeReq.status);
                            const isLast = i === STATUS_STEPS.length - 1;
                            return (
                                <div key={step} className="flex items-start flex-1 last:flex-none">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                            done
                                                ? ''
                                                : 'bg-transparent'
                                        }`} style={{
                                            borderColor: done ? 'var(--color-primary)' : 'var(--color-border-strong)',
                                            backgroundColor: done ? 'var(--color-primary)' : 'transparent'
                                        }}>
                                            {done && <CheckCircle className="h-3.5 w-3.5" style={{ color: 'var(--color-surface)' }} />}
                                        </div>
                                        <p className="text-[9px] text-center w-16 leading-tight" style={{ color: 'var(--color-text-muted)' }}>{STATUS_LABELS[step]}</p>
                                    </div>
                                    {!isLast && (
                                        <div className="h-0.5 flex-1 mx-1 mt-3 rounded-full transition-all" style={{
                                            backgroundColor: i < stepIdx(activeReq.status) ? 'var(--color-primary)' : 'var(--color-border-strong)'
                                        }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {activeReq.matched_provider_id && activeReq.status === 'matched' && (
                        <div className="mt-4 p-3 rounded-xl card-success">
                            <p className="text-xs font-semibold">Provider matched — on their way</p>
                        </div>
                    )}

                    {!['resolved', 'cancelled'].includes(activeReq.status) && (
                        <Button variant="outline" size="sm" className="mt-5 rounded-xl text-xs" onClick={cancel}>
                            Cancel Request
                        </Button>
                    )}
                </div>
            )}

            {/* Request form */}
            {!activeReq && (
                <div className="rounded-2xl p-6 card-premium hover-lift space-y-5">
                    <h2 className="font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>New Emergency Request</h2>

                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>What type of emergency?</p>
                        <div className="grid grid-cols-3 gap-2">
                            {EMERGENCY_CATEGORIES.map(cat => (
                                <button key={cat.id} onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                                    className={`p-3 rounded-xl border text-center transition-all ${
                                        form.category === cat.id
                                            ? 'card-lightning-subtle'
                                            : 'hover-lift'
                                    }`} style={{
                                        borderColor: form.category === cat.id ? 'var(--color-primary)' : 'var(--color-border-strong)',
                                        backgroundColor: form.category === cat.id ? 'rgba(var(--color-primary),0.12)' : 'transparent'
                                    }}>
                                    <cat.Icon className="h-5 w-5 mx-auto mb-1" style={{ color: 'var(--color-primary)' }} />
                                    <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{cat.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>How urgent?</p>
                        <div className="grid grid-cols-3 gap-2">
                            {URGENCY_LEVELS.map(u => (
                                <button key={u.id} onClick={() => setForm(f => ({ ...f, urgency: u.id }))}
                                    className={`p-3 rounded-xl border text-center transition-all ${
                                        form.urgency === u.id
                                            ? 'card-lightning-subtle'
                                            : 'hover-lift'
                                    }`} style={{
                                        borderColor: form.urgency === u.id ? 'var(--color-primary)' : 'var(--color-border-strong)',
                                        backgroundColor: form.urgency === u.id ? 'var(--color-primary)' : 'transparent'
                                    }}>
                                    <p className="font-bold text-xs" style={{ color: form.urgency === u.id ? 'var(--color-surface)' : 'var(--color-primary)' }}>
                                        {u.label}
                                    </p>
                                    <p className="text-[10px] mt-0.5" style={{ color: form.urgency === u.id ? 'var(--color-surface)' : 'var(--color-text-muted)', opacity: form.urgency === u.id ? 0.7 : 1 }}>
                                        {u.sub}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Describe the issue</p>
                        <Textarea
                            placeholder="e.g. Kitchen pipe burst, water flooding the floor..."
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            className="input-lightning resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="rounded-xl gap-2 h-9 text-sm" onClick={getLocation} disabled={locating}>
                            {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}
                            {loc ? 'Location Captured' : 'Share Location'}
                        </Button>
                        {loc && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</p>}
                    </div>

                    <Button
                        className="w-full h-11 rounded-xl gap-2"
                        onClick={submit}
                        disabled={submitting || !form.category || !form.description.trim()}>
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                        {submitting ? 'Submitting...' : 'Submit Emergency Request'}
                    </Button>

                    {!user && (
                        <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>You must be logged in to submit a request</p>
                    )}
                </div>
            )}

            {/* Past requests */}
            {requests.filter(r => ['resolved', 'cancelled'].includes(r.status)).length > 0 && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Past Requests</p>
                    <div className="space-y-2">
                        {requests.filter(r => ['resolved', 'cancelled'].includes(r.status)).map(r => (
                            <div key={r.id} className="rounded-2xl p-4 flex items-center gap-3 card-premium hover-lift">
                                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: r.status === 'resolved' ? 'var(--color-success)' : 'var(--color-border-strong)' }} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium capitalize" style={{ color: 'var(--color-primary)' }}>{r.category}</p>
                                    <p className="text-xs line-clamp-1" style={{ color: 'var(--color-text-muted)' }}>{r.description}</p>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{
                                    backgroundColor: r.status === 'resolved' ? 'rgba(var(--color-success),0.12)' : 'rgba(var(--color-text-muted),0.12)',
                                    color: r.status === 'resolved' ? 'var(--color-success)' : 'var(--color-text-muted)'
                                }}>
                                    {r.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
