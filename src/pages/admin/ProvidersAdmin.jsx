import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Shield, Search, MapPin, Star, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/api/supabaseClient';

const STATUS_STYLES = {
    pending: { bg: 'rgba(245, 158, 11, 0.12)', color: 'rgb(217, 119, 6)' },
    approved: { bg: 'rgba(16, 185, 129, 0.12)', color: 'rgb(5, 150, 105)' },
    rejected: { bg: 'rgba(239, 68, 68, 0.12)', color: 'rgb(220, 38, 38)' },
    suspended: { bg: 'rgba(var(--color-text-muted),0.12)', color: 'var(--color-text-muted)' },
};

export default function ProvidersAdmin() {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);

    const load = async () => {
        setLoading(true);
        const { data } = await supabase.from('providers').select('*').order('created_date', { ascending: false });
        if (data) setProviders(data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const update = async (id, data) => {
        const action = data.status ? `Status → ${data.status}` : data.verified ? 'Verified' : 'Updated';
        toast.success(action);
        setProviders(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
        if (selected?.id === id) setSelected(p => ({ ...p, ...data }));
    };

    const filtered = providers.filter(p => {
        const matchStatus = filter === 'all' || p.status === filter;
        const term = search.toLowerCase();
        const matchSearch = !term ||
            p.business_name?.toLowerCase().includes(term) ||
            p.user_email?.toLowerCase().includes(term) ||
            p.city?.toLowerCase().includes(term);
        return matchStatus && matchSearch;
    });

    const counts = {
        pending: providers.filter(p => p.status === 'pending').length,
        approved: providers.filter(p => p.status === 'approved').length,
        rejected: providers.filter(p => p.status === 'rejected').length,
        suspended: providers.filter(p => p.status === 'suspended').length,
    };

    if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }} /></div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h1 className="font-bold text-2xl" style={{ color: 'var(--color-primary)' }}>Providers <span className="font-normal text-lg" style={{ color: 'var(--color-text-muted)' }}>({providers.length})</span></h1>
                <div className="flex gap-2 flex-wrap">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                        <Input placeholder="Search..." className="input-lightning pl-9 h-9 w-48 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-36 h-9 text-xs" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All ({providers.length})</SelectItem>
                            <SelectItem value="pending">Pending ({counts.pending})</SelectItem>
                            <SelectItem value="approved">Approved ({counts.approved})</SelectItem>
                            <SelectItem value="rejected">Rejected ({counts.rejected})</SelectItem>
                            <SelectItem value="suspended">Suspended ({counts.suspended})</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)' }}>
                        <AlertTriangle className="h-5 w-5" style={{ color: 'rgb(217, 119, 6)' }} />
                    </div>
                    <p className="font-black text-2xl" style={{ color: 'var(--color-primary)' }}>{counts.pending}</p>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Pending</p>
                </div>
                <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)' }}>
                        <CheckCircle className="h-5 w-5" style={{ color: 'rgb(5, 150, 105)' }} />
                    </div>
                    <p className="font-black text-2xl" style={{ color: 'var(--color-primary)' }}>{counts.approved}</p>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Approved</p>
                </div>
                <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)' }}>
                        <XCircle className="h-5 w-5" style={{ color: 'rgb(220, 38, 38)' }} />
                    </div>
                    <p className="font-black text-2xl" style={{ color: 'var(--color-primary)' }}>{counts.rejected}</p>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Rejected</p>
                </div>
                <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-text-muted),0.12)' }}>
                        <Shield className="h-5 w-5" style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                    <p className="font-black text-2xl" style={{ color: 'var(--color-primary)' }}>{counts.suspended}</p>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Suspended</p>
                </div>
            </div>

            {counts.pending > 0 && (
                <div className="rounded-xl p-3 mb-4 flex items-center gap-2 text-sm" style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', color: 'rgb(217, 119, 6)' }}>
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <strong>{counts.pending} provider{counts.pending !== 1 ? 's' : ''} waiting for approval</strong>
                </div>
            )}

            <div className="space-y-2">
                {filtered.map(p => {
                    const st = STATUS_STYLES[p.status] || {};
                    return (
                        <div key={p.id} onClick={() => setSelected(p)}
                            className="card-premium rounded-2xl p-4 hover-lift transition-colors cursor-pointer"
                            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-black card-lightning-subtle" style={{ backgroundColor: 'var(--color-surface-high)', color: 'var(--color-text-muted)' }}>
                                        {p.business_name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{p.business_name}</h3>
                                            {p.verified && <Shield className="h-3.5 w-3.5" style={{ color: 'var(--color-primary)' }} />}
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: st.bg, color: st.color }}>{p.status}</span>
                                        </div>
                                        <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{p.user_email}</p>
                                        <div className="flex items-center gap-2 text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                            {p.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{p.city}</span>}
                                            {p.rating > 0 && <span className="flex items-center gap-1"><Star className="h-3 w-3" />{p.rating?.toFixed(1)} ({p.review_count})</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1.5 shrink-0 flex-wrap" onClick={e => e.stopPropagation()}>
                                    {p.status === 'pending' && (
                                        <>
                                            <Button size="sm" className="h-7 text-xs rounded-lg" onClick={() => update(p.id, { status: 'approved' })}>
                                                <CheckCircle className="h-3.5 w-3.5 mr-1" />Approve
                                            </Button>
                                            <Button size="sm" variant="destructive" className="h-7 text-xs rounded-lg" onClick={() => update(p.id, { status: 'rejected' })}>
                                                <XCircle className="h-3.5 w-3.5 mr-1" />Reject
                                            </Button>
                                        </>
                                    )}
                                    {p.status === 'approved' && !p.verified && (
                                        <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg" onClick={() => update(p.id, { verified: true })}>
                                            <Shield className="h-3.5 w-3.5 mr-1" />Verify
                                        </Button>
                                    )}
                                    {p.status === 'approved' && (
                                        <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg" style={{ color: 'rgb(220, 38, 38)', borderColor: 'var(--color-border)' }} onClick={() => update(p.id, { status: 'suspended' })}>
                                            Suspend
                                        </Button>
                                    )}
                                    {p.status === 'suspended' && (
                                        <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg" style={{ color: 'rgb(5, 150, 105)', borderColor: 'var(--color-border)' }} onClick={() => update(p.id, { status: 'approved' })}>
                                            Reactivate
                                        </Button>
                                    )}
                                    {p.status === 'rejected' && (
                                        <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg" onClick={() => update(p.id, { status: 'pending' })}>
                                            Re-review
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && <p className="text-sm text-center py-10" style={{ color: 'var(--color-text-muted)' }}>No providers found.</p>}
            </div>

            <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
                <DialogContent className="max-w-md" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <DialogHeader><DialogTitle style={{ color: 'var(--color-text)' }}>{selected?.business_name}</DialogTitle></DialogHeader>
                    {selected && (() => {
                        const st = STATUS_STYLES[selected.status] || {};
                        return (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div><p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Email</p><p className="font-medium truncate" style={{ color: 'var(--color-text)' }}>{selected.user_email}</p></div>
                                    <div><p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Status</p>
                                        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: st.bg, color: st.color }}>{selected.status}</span>
                                    </div>
                                    {selected.phone && <div><p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Phone</p><p className="font-medium" style={{ color: 'var(--color-text)' }}>{selected.phone}</p></div>}
                                    {selected.city && <div><p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>City</p><p className="font-medium" style={{ color: 'var(--color-text)' }}>{selected.city}</p></div>}
                                    {selected.address && <div className="col-span-2"><p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Address</p><p className="font-medium" style={{ color: 'var(--color-text)' }}>{selected.address}</p></div>}
                                    {selected.description && <div className="col-span-2"><p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>About</p><p className="text-sm" style={{ color: 'var(--color-text)' }}>{selected.description}</p></div>}
                                    <div><p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Rating</p><p className="font-medium" style={{ color: 'var(--color-text)' }}>{selected.rating?.toFixed(1) || 'N/A'} ({selected.review_count || 0} reviews)</p></div>
                                    <div><p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Verified</p><p className="font-medium" style={{ color: 'var(--color-text)' }}>{selected.verified ? '✓ Yes' : 'No'}</p></div>
                                </div>
                                <div className="border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
                                    <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Actions</p>
                                    <div className="flex flex-wrap gap-2">
                                        {!selected.verified && selected.status === 'approved' && (
                                            <Button size="sm" className="rounded-xl" onClick={() => update(selected.id, { verified: true })}>
                                                <Shield className="h-3.5 w-3.5 mr-1.5" /> Grant Verification
                                            </Button>
                                        )}
                                        {selected.verified && (
                                            <Button size="sm" variant="outline" className="rounded-xl" onClick={() => update(selected.id, { verified: false })}>
                                                Revoke Verification
                                            </Button>
                                        )}
                                        {selected.status !== 'approved' && (
                                            <Button size="sm" variant="outline" className="rounded-xl" style={{ color: 'rgb(5, 150, 105)', borderColor: 'var(--color-border)' }} onClick={() => update(selected.id, { status: 'approved' })}>
                                                Approve
                                            </Button>
                                        )}
                                        {selected.status !== 'suspended' && selected.status !== 'rejected' && (
                                            <Button size="sm" variant="outline" className="rounded-xl" style={{ color: 'rgb(220, 38, 38)', borderColor: 'var(--color-border)' }} onClick={() => update(selected.id, { status: 'suspended' })}>
                                                Suspend
                                            </Button>
                                        )}
                                        {selected.status !== 'rejected' && (
                                            <Button size="sm" variant="destructive" className="rounded-xl" onClick={() => update(selected.id, { status: 'rejected' })}>
                                                Reject
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    );
}
