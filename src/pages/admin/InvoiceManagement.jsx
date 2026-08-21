import { useState, useEffect } from 'react';
import { FileText, Search, Download, DollarSign, Clock, AlertTriangle, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const STATUS_STYLES = {
    paid: { bg: 'rgba(var(--color-success),0.12)', color: 'var(--color-success)' },
    issued: { bg: 'rgba(var(--color-info),0.12)', color: 'var(--color-info)' },
    overdue: { bg: 'rgba(var(--color-error),0.12)', color: 'var(--color-error)' },
    draft: { bg: 'rgba(var(--color-text-muted),0.12)', color: 'var(--color-text-muted)' },
    void: { bg: 'rgba(var(--color-text-subtle),0.12)', color: 'var(--color-text-subtle)' },
    refunded: { bg: 'rgba(var(--color-warning),0.12)', color: 'var(--color-warning)' },
};

export default function InvoiceManagement() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        setInvoices([]);
        setLoading(false);
    }, []);

    const filtered = invoices.filter(inv => {
        const matchSearch = !search || inv.customer_email?.toLowerCase().includes(search.toLowerCase()) || inv.invoice_number?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total_amount || 0), 0);
    const outstanding = invoices.filter(i => ['issued', 'overdue'].includes(i.status)).reduce((s, i) => s + (i.total_amount || 0), 0);

    const markPaid = async (id) => {
        setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: 'paid' } : i));
        toast.success('Invoice marked as paid');
    };

    return (
        <div className="space-y-6 pb-8">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)' }}>Invoice Management</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>All platform invoices and billing records</p>
                </div>
                <Button className="rounded-xl gap-2"><Plus className="h-4 w-4" /> Create Invoice</Button>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'TOTAL INVOICES', value: invoices.length, icon: FileText, color: 'var(--color-primary)', tint: 'rgba(var(--color-primary),0.12)' },
                    { label: 'REVENUE COLLECTED', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'var(--color-success)', tint: 'rgba(var(--color-success),0.12)' },
                    { label: 'OUTSTANDING', value: `$${outstanding.toLocaleString()}`, icon: Clock, color: 'var(--color-info)', tint: 'rgba(var(--color-info),0.12)' },
                    { label: 'OVERDUE', value: invoices.filter(i => i.status === 'overdue').length, icon: AlertTriangle, color: 'var(--color-error)', tint: 'rgba(var(--color-error),0.12)' },
                ].map(k => (
                    <div key={k.label} className="rounded-2xl p-5 shimmer card-lightning-subtle" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: k.tint }}>
                            <k.icon className="h-5 w-5" style={{ color: k.color }} />
                        </div>
                        <p className="font-black text-2xl mt-3" style={{ color: 'var(--color-primary)' }}>{k.value}</p>
                        <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices…" className="input-lightning pl-9" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="input-lightning w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {['all', 'paid', 'issued', 'overdue', 'draft', 'void', 'refunded'].map(s => <SelectItem key={s} value={s} className="capitalize">{s === 'all' ? 'All Status' : s}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton-wave h-16 rounded-2xl" />)}</div>
            ) : (
                <div className="card-premium">
                    <div className="space-y-2">
                        {filtered.map(inv => {
                            const statusStyle = STATUS_STYLES[inv.status] || STATUS_STYLES.draft;
                            return (
                                <div key={inv.id} className="hover-lift flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 transition-colors" style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)', color: 'var(--color-primary)' }}>
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-mono text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{inv.invoice_number || `INV-${inv.id?.slice(0, 6)}`}</p>
                                            <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{inv.customer_email}</p>
                                            <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{inv.due_date || '—'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>{inv.status}</span>
                                        <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>${(inv.total_amount || 0).toFixed(2)}</span>
                                        <div className="flex items-center gap-1">
                                            {inv.status === 'issued' && <Button size="sm" variant="outline" className="rounded-lg h-7 text-xs" onClick={() => markPaid(inv.id)}>Mark Paid</Button>}
                                            <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg"><Download className="h-3 w-3" /></Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {filtered.length === 0 && <p className="text-sm text-center py-10" style={{ color: 'var(--color-text-muted)' }}>No invoices found</p>}
                </div>
            )}
        </div>
    );
}
