import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, Search, CheckCircle, XCircle, PlayCircle, CircleCheck, Ban, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/api/supabaseClient';

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'var(--color-info)', bg: 'var(--color-info-bg)', icon: CheckCircle },
    in_progress: { label: 'In Progress', color: 'var(--color-primary)', bg: 'rgba(var(--color-text-muted),0.12)', icon: PlayCircle },
    completed: { label: 'Completed', color: 'var(--color-success)', bg: 'var(--color-success-bg)', icon: CircleCheck },
    cancelled: { label: 'Cancelled', color: 'var(--color-text-muted)', bg: 'rgba(var(--color-text-muted),0.12)', icon: Ban },
    no_show: { label: 'No Show', color: 'var(--color-error)', bg: 'var(--color-error-bg)', icon: AlertTriangle },
};

export default function BookingsAdmin() {
    const [bookings, setBookings] = useState([]);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [updating, setUpdating] = useState(false);

    const load = async () => {
        setLoading(true);
        const { data } = await supabase.from('bookings').select('*').order('created_date', { ascending: false });
        if (data) setBookings(data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const updateStatus = async (id, status) => {
        setUpdating(true);
        toast.success(`Booking marked as ${status.replace('_', ' ')}`);
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        if (selected?.id === id) setSelected(b => ({ ...b, status }));
        setUpdating(false);
    };

    const filtered = bookings.filter(b => {
        const matchStatus = filter === 'all' || b.status === filter;
        const term = search.toLowerCase();
        const matchSearch = !term ||
            b.service_name?.toLowerCase().includes(term) ||
            b.customer_email?.toLowerCase().includes(term) ||
            b.provider_name?.toLowerCase().includes(term);
        return matchStatus && matchSearch;
    });

    const counts = Object.fromEntries(
        Object.keys(STATUS_CONFIG).map(s => [s, bookings.filter(b => b.status === s).length])
    );

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }} />
        </div>
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h1 className="font-bold text-2xl" style={{ color: 'var(--color-primary)' }}>
                    All Bookings <span className="font-normal text-lg" style={{ color: 'var(--color-text-muted)' }}>({bookings.length})</span>
                </h1>
                <div className="flex gap-2 flex-wrap">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                        <Input placeholder="Search..." className="input-lightning pl-9 h-9 w-48 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-36 h-9 text-xs" style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text)' }}><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All ({bookings.length})</SelectItem>
                            {Object.entries(STATUS_CONFIG).map(([s, c]) => (
                                <SelectItem key={s} value={s}>{c.label} ({counts[s] || 0})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {Object.entries(STATUS_CONFIG).map(([s, c]) => {
                    const Icon = c.icon;
                    const active = filter === s;
                    return (
                        <button key={s} onClick={() => setFilter(active ? 'all' : s)}
                            className="rounded-2xl p-5 shimmer card-lightning-subtle text-left transition-all"
                            style={{ backgroundColor: 'var(--color-surface)', border: active ? '1px solid var(--color-primary)' : '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: c.bg }}>
                                <Icon className="h-5 w-5" style={{ color: c.color }} />
                            </div>
                            <p className="font-black text-2xl mt-3" style={{ color: 'var(--color-primary)' }}>{counts[s] || 0}</p>
                            <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{c.label.toUpperCase()}</p>
                        </button>
                    );
                })}
            </div>

            {filtered.length === 0 ? (
                <p className="text-sm text-center py-10" style={{ color: 'var(--color-text-muted)' }}>No bookings found.</p>
            ) : (
                <div className="card-premium">
                    <div className="space-y-2">
                        {filtered.map(b => {
                            const sc = STATUS_CONFIG[b.status] || { label: b.status, color: 'var(--color-text-muted)', bg: 'rgba(var(--color-text-muted),0.12)' };
                            return (
                                <div key={b.id}
                                    onClick={() => setSelected(b)}
                                    className="hover-lift flex flex-wrap items-start justify-between gap-3 rounded-xl p-4 transition-colors cursor-pointer"
                                    style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{b.service_name || 'Unknown Service'}</h4>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.color }}>
                                                {sc.label}
                                            </span>
                                        </div>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{b.provider_name} · {b.customer_email}</p>
                                        <div className="flex items-center gap-3 text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{b.date}</span>
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{b.time_slot}</span>
                                            {b.price > 0 && <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>${b.price}</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                                        {b.status === 'pending' && (
                                            <Button size="sm" className="h-7 text-xs rounded-lg" onClick={() => updateStatus(b.id, 'confirmed')}>
                                                <CheckCircle className="h-3.5 w-3.5 mr-1" />Confirm
                                            </Button>
                                        )}
                                        {(b.status === 'pending' || b.status === 'confirmed') && (
                                            <Button size="sm" variant="destructive" className="h-7 text-xs rounded-lg" onClick={() => updateStatus(b.id, 'cancelled')}>
                                                <XCircle className="h-3.5 w-3.5 mr-1" />Cancel
                                            </Button>
                                        )}
                                        {b.status === 'confirmed' && (
                                            <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg" onClick={() => updateStatus(b.id, 'completed')}>
                                                <CheckCircle className="h-3.5 w-3.5 mr-1" />Complete
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Detail Dialog */}
            <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
                <DialogContent className="max-w-md card-premium" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-strong)', boxShadow: 'var(--shadow-card-hover)' }}>
                    <DialogHeader>
                        <DialogTitle style={{ color: 'var(--color-primary)' }}>Booking Details</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-4 pt-1">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Service</p><p className="font-semibold" style={{ color: 'var(--color-text)' }}>{selected.service_name}</p></div>
                                <div><p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Status</p>
                                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: (STATUS_CONFIG[selected.status]?.bg) || 'rgba(var(--color-text-muted),0.12)', color: (STATUS_CONFIG[selected.status]?.color) || 'var(--color-text-muted)' }}>
                                        {STATUS_CONFIG[selected.status]?.label || selected.status}
                                    </span>
                                </div>
                                <div><p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Provider</p><p className="font-medium" style={{ color: 'var(--color-text)' }}>{selected.provider_name || '—'}</p></div>
                                <div><p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Customer</p><p className="font-medium truncate" style={{ color: 'var(--color-text)' }}>{selected.customer_email}</p></div>
                                <div><p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Date</p><p className="font-medium" style={{ color: 'var(--color-text)' }}>{selected.date}</p></div>
                                <div><p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Time</p><p className="font-medium" style={{ color: 'var(--color-text)' }}>{selected.time_slot}</p></div>
                                {selected.price > 0 && <div><p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Price</p><p className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>${selected.price}</p></div>}
                                {selected.notes && <div className="col-span-2"><p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Notes</p><p className="text-sm" style={{ color: 'var(--color-text)' }}>{selected.notes}</p></div>}
                            </div>
                            <div className="pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Update Status</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(STATUS_CONFIG).map(([s, c]) => (
                                        <Button key={s} size="sm" variant={selected.status === s ? 'default' : 'outline'}
                                            className="h-9 text-xs rounded-xl"
                                            disabled={selected.status === s || updating}
                                            onClick={() => updateStatus(selected.id, s)}>
                                            {c.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
