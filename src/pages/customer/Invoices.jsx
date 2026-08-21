import { useState, useMemo } from 'react';
import { FileText, Download, Search, ChevronRight, Clock, DollarSign, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_STYLES = {
    paid: { bg: 'rgba(var(--color-success),0.12)', color: 'var(--color-success)', border: 'rgba(var(--color-success),0.25)', label: 'Paid' },
    pending: { bg: 'rgba(var(--color-warning),0.12)', color: 'var(--color-warning)', border: 'rgba(var(--color-warning),0.25)', label: 'Pending' },
    overdue: { bg: 'rgba(var(--color-error),0.12)', color: 'var(--color-error)', border: 'rgba(var(--color-error),0.25)', label: 'Overdue' },
    refunded: { bg: 'rgba(var(--color-info),0.12)', color: 'var(--color-info)', border: 'rgba(var(--color-info),0.25)', label: 'Refunded' },
    cancelled: { bg: 'var(--color-surface-high)', color: 'var(--color-text-muted)', border: 'var(--color-border)', label: 'Cancelled' },
};

const MOCK_INVOICES = [
    { id: 'INV-2025-001', booking_id: '1', service_name: 'Deep House Cleaning', provider_name: 'Sparkle Clean Co.', date: '2025-01-15', amount: 150, status: 'paid', due_date: '2025-01-15', items: [{ desc: 'Standard cleaning (3 hrs)', qty: 1, price: 120 }, { desc: 'Eco-friendly products', qty: 1, price: 30 }] },
    { id: 'INV-2025-002', booking_id: '2', service_name: 'AC Repair & Maintenance', provider_name: 'CoolAir HVAC', date: '2025-01-18', amount: 200, status: 'paid', due_date: '2025-01-18', items: [{ desc: 'AC diagnostic', qty: 1, price: 80 }, { desc: 'Refrigerant refill', qty: 1, price: 120 }] },
    { id: 'INV-2025-003', booking_id: '3', service_name: 'Lawn Mowing', provider_name: 'Green Thumb Landscaping', date: '2025-01-20', amount: 85, status: 'pending', due_date: '2025-01-22', items: [{ desc: 'Lawn mowing (1/4 acre)', qty: 1, price: 85 }] },
    { id: 'INV-2025-004', booking_id: '4', service_name: 'Plumbing Inspection', provider_name: 'Emergency Plumbing Co.', date: '2025-01-22', amount: 120, status: 'overdue', due_date: '2025-01-20', items: [{ desc: 'Camera inspection', qty: 1, price: 120 }] },
    { id: 'INV-2025-005', booking_id: '5', service_name: 'Window Cleaning', provider_name: 'ClearView Windows', date: '2025-01-10', amount: 95, status: 'cancelled', due_date: '2025-01-10', items: [{ desc: 'Interior + exterior (10 windows)', qty: 1, price: 95 }] },
    { id: 'INV-2024-056', booking_id: '6', service_name: 'Electrical Work', provider_name: 'PowerFix Electrical', date: '2024-12-08', amount: 350, status: 'paid', due_date: '2024-12-08', items: [{ desc: 'Outlet installation (4)', qty: 1, price: 200 }, { desc: 'Circuit breaker check', qty: 1, price: 150 }] },
    { id: 'INV-2024-045', booking_id: '7', service_name: 'Gutter Cleaning', provider_name: 'ProClean Services', date: '2024-11-15', amount: 180, status: 'paid', due_date: '2024-11-15', items: [{ desc: 'Gutter cleaning (2 stories)', qty: 1, price: 180 }] },
];

export default function Invoices() {
    const [invoices] = useState(MOCK_INVOICES);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedId, setExpandedId] = useState(null);

    const filtered = useMemo(() => {
        let result = invoices;
        if (search) {
            const query = search.toLowerCase();
            result = result.filter(inv => 
                inv.id.toLowerCase().includes(query) || 
                inv.service_name?.toLowerCase().includes(query) || 
                inv.provider_name?.toLowerCase().includes(query)
            );
        }
        if (statusFilter !== 'all') {
            result = result.filter(inv => inv.status === statusFilter);
        }
        return result;
    }, [search, statusFilter]);

    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
    const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
    const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Invoices</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        {invoices.length} invoices · ${totalPaid.toLocaleString()} paid · ${(totalPending + totalOverdue).toLocaleString()} outstanding
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Paid', value: `$${totalPaid.toLocaleString()}`, icon: CheckCircle2, color: 'var(--color-success)', bg: 'rgba(var(--color-success),0.12)', count: invoices.filter(i => i.status === 'paid').length },
                        { label: 'Pending', value: `$${totalPending.toLocaleString()}`, icon: Clock, color: 'var(--color-warning)', bg: 'rgba(var(--color-warning),0.12)', count: invoices.filter(i => i.status === 'pending').length },
                        { label: 'Overdue', value: `$${totalOverdue.toLocaleString()}`, icon: AlertCircle, color: 'var(--color-error)', bg: 'rgba(var(--color-error),0.12)', count: invoices.filter(i => i.status === 'overdue').length },
                        { label: 'Total Invoices', value: invoices.length, icon: FileText, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)' },
                    ].map((stat, i) => (
                        <div key={i} className="rounded-xl p-4 text-center shimmer"
                            style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xs)' }}>
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-2 card-lightning-subtle"
                                style={{ backgroundColor: stat.bg }}>
                                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                            </div>
                            <p className="font-black text-2xl" style={{ color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>{stat.value}</p>
                            <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</p>
                            {stat.count !== undefined && (
                                <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-subtle)' }}>{stat.count} invoice{stat.count !== 1 ? 's' : ''}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: 'var(--color-text-subtle)' }} />
                    <input 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        placeholder="Search invoices…"
                        className="input-lightning w-full h-11 pl-10 pr-4 text-sm outline-none"
                        style={{ 
                            backgroundColor: 'var(--color-surface-high)', 
                            borderColor: 'var(--color-border-strong)', 
                            color: 'var(--color-text)',
                            fontFamily: 'Inter,sans-serif',
                            fontSize: '15px'
                        }} 
                    />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="h-11 rounded-xl px-4 text-sm outline-none shrink-0"
                    style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text)', fontFamily: 'Inter,sans-serif' }}>
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                    <option value="refunded">Refunded</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Invoices Table */}
            {filtered.length === 0 ? (
                <div className="rounded-2xl p-12 text-center shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <FileText className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--color-text-subtle)' }} />
                    <h2 className="font-bold text-lg mb-1" style={{ color: 'var(--color-primary)' }}>{search || statusFilter !== 'all' ? 'No invoices found' : 'No invoices yet'}</h2>
                    <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                        {search || statusFilter !== 'all' 
                            ? 'Try adjusting your search or filter' 
                            : 'Your invoices will appear here after booking services'}
                    </p>
                    <a href="/services" className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold transition-all"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                        {search || statusFilter !== 'all' ? 'Clear Filters' : 'Browse Services'}
                        <HelpCircle className="h-4 w-4" />
                    </a>
                </div>
            ) : (
                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    {/* Table Header */}
                    <div className="grid grid-cols-12 px-5 py-3.5 text-xs font-bold uppercase tracking-wider"
                        style={{ 
                            color: 'var(--color-text-subtle)', 
                            borderBottom: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-surface-high)'
                        }}>
                        <div className="col-span-2">Invoice</div>
                        <div className="col-span-2 hidden sm:block">Service</div>
                        <div className="col-span-2 hidden md:block">Provider</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-2 text-right">Amount</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-1 text-center">Actions</div>
                    </div>

                    {/* Table Rows */}
                    {filtered.map((inv, i) => {
                        const st = STATUS_STYLES[inv.status] || STATUS_STYLES.cancelled;
                        const isExpanded = expandedId === inv.id;
                        return (
                            <>
                                <div key={inv.id} className="grid grid-cols-12 px-5 py-4 transition-colors hover:bg-surface-high/50"
                                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                                    onClick={() => setExpandedId(isExpanded ? null : inv.id)}>
                                    <div className="col-span-2 flex items-center min-w-0">
                                        <span className="font-mono text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>{inv.id}</span>
                                    </div>
                                    <div className="col-span-2 hidden sm:block truncate">
                                        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{inv.service_name}</p>
                                    </div>
                                    <div className="col-span-2 hidden md:block truncate">
                                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{inv.provider_name}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm" style={{ color: 'var(--color-text)' }}>{new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <p className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>${inv.amount}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                                            {st.label}
                                        </span>
                                    </div>
                                    <div className="col-span-1 text-center">
                                        <ChevronRight className={`h-4 w-4 mx-auto transition-transform ${isExpanded ? 'rotate-90' : ''}`} style={{ color: 'var(--color-text-subtle)' }} />
                                    </div>
                                </div>

                                {/* Expanded Row */}
                                {isExpanded && (
                                    <div className="col-span-12 px-5 pb-5 animate-slide-down"
                                        style={{ backgroundColor: 'var(--color-surface-high)', borderTop: '1px solid var(--color-border)' }}>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                                                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Due Date</p>
                                                <p className="font-medium" style={{ color: 'var(--color-primary)' }}>{new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                                                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Booking ID</p>
                                                <p className="font-medium font-mono text-sm" style={{ color: 'var(--color-primary)' }}>{inv.booking_id}</p>
                                            </div>
                                            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                                                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Provider</p>
                                                <p className="font-medium text-sm truncate" style={{ color: 'var(--color-primary)' }}>{inv.provider_name}</p>
                                            </div>
                                            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                                                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Total</p>
                                                <p className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>${inv.amount}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4">
                                            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-subtle)' }}>Line Items</p>
                                            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                                                {inv.items.map((item, idx) => (
                                                    <div key={idx} className="grid grid-cols-4 px-4 py-3 text-sm"
                                                        style={{ borderBottom: idx < inv.items.length - 1 ? '1px solid var(--color-border)' : 'none', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--color-surface-low)' }}>
                                                        <div className="col-span-2 truncate" style={{ color: 'var(--color-text)' }}>{item.desc}</div>
                                                        <div className="text-center" style={{ color: 'var(--color-text-muted)' }}>×{item.qty}</div>
                                                        <div className="text-right font-medium" style={{ color: 'var(--color-primary)' }}>${item.price}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                            <button className="h-10 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                                style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                                                onClick={() => toast.info('Downloading PDF...')}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                                                <Download className="h-3.5 w-3.5" />
                                                Download PDF
                                            </button>
                                            <button className="h-10 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                                                onClick={() => toast.info('Resending invoice email...')}>
                                                <FileText className="h-3.5 w-3.5" />
                                                Resend Email
                                            </button>
                                            {inv.status === 'pending' && (
                                                <button className="h-10 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                                    style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                                                    onClick={() => toast.info('Opening payment...')}>
                                                    <DollarSign className="h-3.5 w-3.5" />
                                                    Pay Now
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        );
                    })}
                </div>
            )}

            {/* Export Actions */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Bulk Actions</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button className="h-11 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                    style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                    onClick={() => toast.info('Exporting all invoices as CSV...')}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                    <Download className="h-4 w-4" />
                    Export All (CSV)
                </button>
                <button className="h-11 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                    style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                    onClick={() => toast.info('Generating annual summary...')}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                    <FileText className="h-4 w-4" />
                    Annual Summary
                </button>
                <button className="h-11 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                    style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                    onClick={() => toast.info('Opening tax documents...')}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                    <FileText className="h-4 w-4" />
                    Tax Documents
                </button>
            </div>
        </div>
    );
}