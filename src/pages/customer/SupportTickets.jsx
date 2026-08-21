import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Clock, CheckCircle2, AlertTriangle, ChevronRight, HelpCircle, Search, RefreshCw, Loader2, Send, X, CalendarDays, CreditCard, User, Shield } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_ICONS = { open: Clock, in_progress: AlertTriangle, resolved: CheckCircle2 };
const STATUS_STYLES = {
    open: { bg: 'rgba(var(--color-warning),0.12)', color: 'var(--color-warning)', border: 'rgba(var(--color-warning),0.25)' },
    in_progress: { bg: 'rgba(var(--color-info),0.12)', color: 'var(--color-info)', border: 'rgba(var(--color-info),0.25)' },
    resolved: { bg: 'rgba(var(--color-success),0.12)', color: 'var(--color-success)', border: 'rgba(var(--color-success),0.25)' },
};

const CATEGORIES = [
    { value: 'booking', label: 'Booking Issues', icon: CalendarDays },
    { value: 'payment', label: 'Payments & Billing', icon: CreditCard },
    { value: 'provider', label: 'Provider Concerns', icon: User },
    { value: 'account', label: 'Account & Profile', icon: Shield },
    { value: 'other', label: 'Other', icon: HelpCircle },
];

const PRIORITIES = [
    { value: 'low', label: 'Low', color: 'var(--color-success)' },
    { value: 'normal', label: 'Normal', color: 'var(--color-primary)' },
    { value: 'high', label: 'High', color: 'var(--color-warning)' },
    { value: 'urgent', label: 'Urgent', color: 'var(--color-error)' },
];

const MOCK_TICKETS = [
    { id: 'TKT-2025-001', subject: 'Booking confirmation not received', category: 'booking', priority: 'high', status: 'resolved', description: 'Booked deep cleaning for Jan 15 but never received confirmation email.', created_at: '2025-01-15T10:30:00Z', updated_at: '2025-01-15T14:20:00Z' },
    { id: 'TKT-2025-002', subject: 'Incorrect charge on invoice', category: 'payment', priority: 'normal', status: 'in_progress', description: 'Invoice INV-2025-003 shows $200 but quoted price was $150.', created_at: '2025-01-18T09:15:00Z', updated_at: '2025-01-18T11:30:00Z' },
    { id: 'TKT-2025-003', subject: 'Provider arrived 2 hours late', category: 'provider', priority: 'high', status: 'open', description: 'AC repair technician was scheduled for 2 PM but arrived at 4 PM without notice.', created_at: '2025-01-20T16:45:00Z', updated_at: '2025-01-20T16:45:00Z' },
];

export default function SupportTickets() {
    const [tickets, setTickets] = useState([]);
    const [dialog, setDialog] = useState(false);
    const [form, setForm] = useState({ subject: '', category: 'booking', priority: 'normal', description: '' });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('support_tickets') || '[]');
        setTickets([...MOCK_TICKETS, ...stored]);
        setLoading(false);
    }, []);

    const submit = async () => {
        if (!form.subject || !form.description) { toast.error('Subject and description are required'); return; }
        setSubmitting(true);
        await new Promise(r => setTimeout(r, 800));
        const ticket = { 
            ...form, 
            id: `TKT-${Date.now()}`, 
            status: 'open', 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        setTickets(p => [ticket, ...p]);
        localStorage.setItem('support_tickets', JSON.stringify([ticket, ...tickets]));
        setSubmitting(false);
        setDialog(false);
        setForm({ subject: '', category: 'booking', priority: 'normal', description: '' });
        toast.success('Ticket submitted! We\'ll respond within 24 hours.');
    };

    const filtered = tickets.filter(t => {
        const matchSearch = !search || t.subject.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const openCount = tickets.filter(t => t.status === 'open').length;
    const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
    const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

    if (loading) return (
        <div className="space-y-6 max-w-4xl">
            <div className="skeleton-wave h-7 w-56 rounded-xl" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton-wave h-28 rounded-2xl" />)}
            </div>
            <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton-wave h-16 rounded-xl" />)}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Support Tickets</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Track and manage your support requests</p>
                </div>
                <button className="h-11 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                    onClick={() => setDialog(true)}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                    <Plus className="h-4 w-4" />
                    New Ticket
                </button>
            </div>

            {/* Stats Overview */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Open', value: openCount, icon: Clock, color: 'var(--color-warning)', bg: 'rgba(var(--color-warning),0.12)' },
                        { label: 'In Progress', value: inProgressCount, icon: AlertTriangle, color: 'var(--color-info)', bg: 'rgba(var(--color-info),0.12)' },
                        { label: 'Resolved', value: resolvedCount, icon: CheckCircle2, color: 'var(--color-success)', bg: 'rgba(var(--color-success),0.12)' },
                        { label: 'Total', value: tickets.length, icon: MessageSquare, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)' },
                    ].map((stat, i) => (
                        <div key={i} className="rounded-xl p-4 text-center shimmer"
                            style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xs)' }}>
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-2 card-lightning-subtle"
                                style={{ backgroundColor: stat.bg }}>
                                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                            </div>
                            <p className="font-black text-2xl" style={{ color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>{stat.value}</p>
                            <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</p>
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
                        placeholder="Search tickets…"
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
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                </select>
            </div>

            {/* Tickets List */}
            {filtered.length === 0 ? (
                <div className="rounded-2xl p-12 text-center shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <MessageSquare className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--color-text-subtle)' }} />
                    <h2 className="font-bold text-lg mb-1" style={{ color: 'var(--color-primary)' }}>{tickets.length === 0 ? 'No support tickets yet' : 'No tickets found'}</h2>
                    <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                        {tickets.length === 0 
                            ? 'Submit a ticket if you need help with anything'
                            : 'Try adjusting your search or filter'}
                    </p>
                    <button className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold transition-all"
                        style={{ backgroundColor: tickets.length === 0 ? 'var(--color-primary)' : 'transparent', color: tickets.length === 0 ? 'var(--color-on-primary)' : 'var(--color-text-muted)', border: tickets.length === 0 ? 'none' : '1px solid var(--color-border-strong)' }}
                        onClick={() => { if (tickets.length === 0) setDialog(true); else { setSearch(''); setStatusFilter('all'); }}}
                        onMouseEnter={e => { if (tickets.length === 0) e.currentTarget.style.opacity = '0.88'; else { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}}
                        onMouseLeave={e => { if (tickets.length === 0) e.currentTarget.style.opacity = '1'; else { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}} >
                        {tickets.length === 0 ? <Plus className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                        {tickets.length === 0 ? 'Submit a Ticket' : 'Clear Filters'}
                    </button>
                </div>
            ) : (
                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    {filtered.map((t, i) => {
                        const Icon = STATUS_ICONS[t.status] || Clock;
                        const st = STATUS_STYLES[t.status] || STATUS_STYLES.open;
                        const category = CATEGORIES.find(c => c.value === t.category) || CATEGORIES[4];
                        const priority = PRIORITIES.find(p => p.value === t.priority) || PRIORITIES[1];
                        return (
                            <div key={t.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-high/50"
                                style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                            <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: st.bg }}>
                                <Icon className="h-4.5 w-4.5" style={{ color: st.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-primary)' }}>{t.subject}</p>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: priority.color + '15', color: priority.color, border: `1px solid ${priority.color}30` }}>
                                        {priority.label}
                                    </span>
                                </div>
                                <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                                    {t.id} · {category.label} · {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                                    {t.status.replace('_', ' ')}
                                </span>
                                <ChevronRight className="h-4 w-4" style={{ color: 'var(--color-text-subtle)' }} />
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Other Ways to Get Help</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button className="h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-left p-4"
                    style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    onClick={() => toast.info('Opening live chat...')}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}>
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                        <MessageSquare className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--color-primary)' }}>Live Chat</p>
                        <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Avg response: 2 minutes</p>
                    </div>
                </button>
                <button className="h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-left p-4"
                    style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    onClick={() => toast.info('Opening email support...')}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}>
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-accent),0.12)' }}>
                        <Send className="h-4 w-4" style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--color-primary)' }}>Email Support</p>
                        <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Response within 4 hours</p>
                    </div>
                </button>
                <button className="h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-left p-4"
                    style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    onClick={() => toast.info('Opening help center...')}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}>
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-success),0.12)' }}>
                        <HelpCircle className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                    </div>
                    <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--color-primary)' }}>Help Center</p>
                        <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Browse articles & FAQs</p>
                    </div>
                </button>
            </div>

            {/* New Ticket Dialog */}
            {dialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
                    onClick={e => e.target === e.currentTarget && setDialog(false)}>
                    <div className="w-full max-w-md rounded-2xl p-6 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto"
                        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}>
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>New Support Ticket</h2>
                            <button 
                                onClick={() => { setDialog(false); setForm({ subject: '', category: 'booking', priority: 'normal', description: '' }); }}
                                className="h-8 w-8 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                style={{ color: 'var(--color-text-subtle)', backgroundColor: 'transparent', border: 'none' }}
                                aria-label="Close dialog">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-text-subtle)' }}>Subject *</label>
                            <input 
                                placeholder="Brief summary of your issue"
                                value={form.subject}
                                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
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
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--color-text-subtle)' }}>Category</label>
                                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                    className="input-lightning w-full px-4 py-3.5 rounded-xl text-base outline-none"
                                    style={{ 
                                        backgroundColor: 'var(--color-surface)',
                                        border: '1px solid var(--color-border-strong)',
                                        color: 'var(--color-text)',
                                        fontSize: '15px',
                                        fontFamily: 'Inter,sans-serif',
                                    }}
                                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-accent)')}
                                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}>
                                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--color-text-subtle)' }}>Priority</label>
                                <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                                    className="input-lightning w-full px-4 py-3.5 rounded-xl text-base outline-none"
                                    style={{ 
                                        backgroundColor: 'var(--color-surface)',
                                        border: '1px solid var(--color-border-strong)',
                                        color: 'var(--color-text)',
                                        fontSize: '15px',
                                        fontFamily: 'Inter,sans-serif',
                                    }}
                                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-accent)')}
                                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}>
                                    {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--color-text-subtile)' }}>Description *</label>
                            <textarea 
                                placeholder="Describe your issue in detail..."
                                value={form.description}
                                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                rows={5}
                                className="input-lightning w-full px-4 py-3.5 rounded-xl resize-none outline-none"
                                style={{ 
                                    backgroundColor: 'var(--color-surface)',
                                    border: '1px solid var(--color-border-strong)',
                                    color: 'var(--color-text)',
                                    fontSize: '14px',
                                    fontFamily: 'Inter,sans-serif',
                                    lineHeight: 1.6
                                }}
                                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-accent)')}
                                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')} 
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button 
                                className="flex-1 h-10 rounded-xl font-semibold transition-all"
                                style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                                onClick={() => { setDialog(false); setForm({ subject: '', category: 'booking', priority: 'normal', description: '' }); }}>
                                Cancel
                            </button>
                            <button 
                                className="flex-1 h-10 rounded-xl font-semibold transition-all"
                                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                                onClick={submit} 
                                disabled={submitting || !form.subject || !form.description}>
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Submit Ticket
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}