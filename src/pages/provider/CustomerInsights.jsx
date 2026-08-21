import { useState, useMemo } from 'react';
import { Users, Star, MessageSquare, DollarSign, CheckCircle2, ChevronRight, Plus, Search, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { chatOpenRouter as chatDeepSeek, isConfigured } from '@/lib/openrouter';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

const MOCK_BOOKINGS = [
    { id: '1', service_name: 'Deep House Cleaning', customer_email: 'sarah@email.com', customer_name: 'Sarah Johnson', date: '2025-01-15', status: 'completed', price: 150, address: '123 Main St, San Francisco' },
    { id: '2', service_name: 'AC Repair & Maintenance', customer_email: 'mike@email.com', customer_name: 'Mike Chen', date: '2025-01-18', status: 'completed', price: 200, address: '456 Oak Ave, Oakland' },
    { id: '3', service_name: 'Lawn Mowing', customer_email: 'emma@email.com', customer_name: 'Emma Wilson', date: '2025-01-20', status: 'completed', price: 85, address: '789 Pine Rd, Berkeley' },
    { id: '4', service_name: 'Deep House Cleaning', customer_email: 'sarah@email.com', customer_name: 'Sarah Johnson', date: '2025-02-15', status: 'completed', price: 150, address: '123 Main St, San Francisco' },
    { id: '5', service_name: 'Plumbing Inspection', customer_email: 'john@email.com', customer_name: 'John Davis', date: '2025-01-22', status: 'completed', price: 120, address: '321 Elm St, Daly City' },
    { id: '6', service_name: 'Window Cleaning', customer_email: 'lisa@email.com', customer_name: 'Lisa Brown', date: '2025-01-10', status: 'cancelled', price: 95, address: '654 Maple Dr, San Mateo' },
    { id: '7', service_name: 'Lawn Mowing', customer_email: 'emma@email.com', customer_name: 'Emma Wilson', date: '2025-02-20', status: 'completed', price: 85, address: '789 Pine Rd, Berkeley' },
    { id: '8', service_name: 'Electrical Work', customer_email: 'david@email.com', customer_name: 'David Lee', date: '2024-12-08', status: 'completed', price: 350, address: '987 Cedar Ln, Redwood City' },
];

export default function CustomerInsights() {
    const [bookings] = useState(MOCK_BOOKINGS);
    const [loading, setLoading] = useState(false);
    const [aiSummary, setAiSummary] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiStream, setAiStream] = useState('');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const customerMap = useMemo(() => {
        return bookings.reduce((acc, b) => {
            const email = b.customer_email;
            if (!acc[email]) acc[email] = { email, name: b.customer_name, bookings: [], spent: 0, firstBooking: b.date, lastBooking: b.date, city: b.address?.split(',').pop()?.trim() };
            acc[email].bookings.push(b);
            acc[email].spent += b.price || 0;
            if (b.date < acc[email].firstBooking) acc[email].firstBooking = b.date;
            if (b.date > acc[email].lastBooking) acc[email].lastBooking = b.date;
            return acc;
        }, {});
    }, [bookings]);

    const customers = useMemo(() => {
        let arr = Object.values(customerMap);
        if (search) {
            const q = search.toLowerCase();
            arr = arr.filter(c => c.email.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
        }
        if (filter === 'repeat') arr = arr.filter(c => c.bookings.length > 1);
        if (filter === 'vip') arr = arr.filter(c => c.spent > 300);
        if (filter === 'new') arr = arr.filter(c => c.bookings.length === 1);
        return arr.sort((a, b) => b.spent - a.spent);
    }, [customerMap, search, filter]);

    const repeatCustomers = customers.filter(c => c.bookings.length > 1).length;
    const avgValue = customers.length ? Math.round(customers.reduce((s, c) => s + c.spent, 0) / customers.length) : 0;
    const totalRevenue = customers.reduce((s, c) => s + c.spent, 0);
    const vipCount = customers.filter(c => c.spent > 300).length;

    const getAiSummary = async () => {
        if (!isConfigured()) {
            setAiSummary('**OpenRouter not configured** — Add `OPENROUTER_API_KEY` to unlock Simon AI customer insights.');
            toast.info('OpenRouter API key required for AI insights');
            return;
        }
        setAiLoading(true);
        setAiSummary('');
        setAiStream('');
        
        const data = {
            totalCustomers: customers.length,
            repeatCustomers,
            avgValue,
            totalRevenue,
            topCustomers: customers.slice(0, 5).map(c => ({ name: c.name, email: c.email, bookings: c.bookings.length, spent: c.spent })),
            services: [...new Set(bookings.map(b => b.service_name))],
        };
        
        try {
            let full = '';
            await chatDeepSeek({
                messages: [{
                    role: 'user',
                    content: `Analyze my customer base and give actionable insights:
- Total customers: ${data.totalCustomers}
- Repeat customers: ${data.repeatCustomers} (${data.totalCustomers ? Math.round(data.repeatCustomers/data.totalCustomers*100) : 0}%)
- Average customer value: $${data.avgValue}
- Total revenue: $${data.totalRevenue}
- Top 5 customers: ${data.topCustomers.map(c => `${c.name} ($${c.spent}, ${c.bookings} bookings)`).join('; ')}
- Services offered: ${data.services.join(', ')}

Give:
1. **Customer health score** (A-F) with explanation
2. **Top 3 retention strategies** for your specific customer mix
3. **How to convert one-time customers to repeat** (with specific tactics)
4. **VIP customer program recommendations** for your top ${data.vipCount || 'few'} high-value customers
5. **Customer acquisition suggestions** based on your current profile`
                }],
                systemPrompt: 'You are Simon, an elite AI customer analyst for Truvornex service providers. Give precise, data-driven, actionable insights. Use markdown with headers and bullet points.',
                temperature: 0.65,
                maxTokens: 1200,
                onChunk: (delta, acc) => { full = acc; setAiStream(acc); },
            });
            setAiSummary(full);
        } catch (e) {
            setAiSummary(`**Error:** ${e.message}`);
        }
        setAiLoading(false);
        setAiStream('');
    };

    if (loading) return (
        <div className="space-y-6 max-w-4xl">
            <div className="skeleton-wave h-7 w-56 rounded-xl" />
            <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton-wave h-28 rounded-2xl" />)}
            </div>
            <div className="skeleton-wave h-24 rounded-2xl" />
            <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton-wave h-16 rounded-xl" />)}
            </div>
        </div>
    );

    const displayInsight = aiLoading ? aiStream : aiSummary;

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-primary),0.15)', border: '1px solid rgba(var(--color-primary),0.25)' }}>
                        <Users className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                        <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Customer Insights</h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Know your customers deeply with Simon AI</p>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Unique Customers', value: customers.length, icon: Users, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)' },
                        { label: 'Repeat Customers', value: repeatCustomers, icon: CheckCircle2, color: 'var(--color-success)', bg: 'rgba(var(--color-success),0.12)' },
                        { label: 'VIP Customers', value: vipCount, icon: Star, color: 'var(--color-warning)', bg: 'rgba(var(--color-warning),0.12)' },
                        { label: 'Avg Customer Value', value: `$${avgValue.toLocaleString()}`, icon: DollarSign, color: 'var(--color-accent)', bg: 'rgba(var(--color-accent),0.12)' },
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
                        placeholder="Search customers…"
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
                <select value={filter} onChange={e => setFilter(e.target.value)}
                    className="h-11 rounded-xl px-4 text-sm outline-none shrink-0"
                    style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text)', fontFamily: 'Inter,sans-serif' }}>
                    <option value="all">All Customers</option>
                    <option value="repeat">Repeat Customers</option>
                    <option value="vip">VIP ($300+)</option>
                    <option value="new">One-Time Only</option>
                </select>
            </div>

            {/* Simon AI Summary */}
            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-success),0.12)' }}>
                            <Sparkles className="h-5 w-5" style={{ color: 'var(--color-success)' }} />
                        </div>
                        <div>
                            <h2 className="font-semibold" style={{ color: 'var(--color-primary)' }}>Simon's Customer Analysis</h2>
                            <p className="text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>Powered by OpenRouter AI</p>
                        </div>
                    </div>
                    <button onClick={getAiSummary} disabled={aiLoading}
                        className="h-10 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                        {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        {aiLoading ? 'Analyzing...' : aiSummary ? 'Refresh' : 'Analyze'}
                    </button>
                </div>
                {displayInsight ? (
                    <div className="rounded-xl p-5 prose prose-sm max-w-none text-sm leading-relaxed"
                        style={{ backgroundColor: 'var(--color-surface-high)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
                        <ReactMarkdown>{displayInsight}</ReactMarkdown>
                        {aiLoading && <span className="inline-block h-3 w-0.5 ml-0.5 bg-current animate-pulse" />}
                    </div>
                ) : (
                    <div className="rounded-xl p-6 text-center" style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                        <Sparkles className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--color-text-subtle)' }} />
                        <h3 className="font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>Get AI-Powered Customer Insights</h3>
                        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                            Click "Analyze" for Simon's AI analysis of your customer patterns, retention strategies, 
                            VIP recommendations, and acquisition suggestions.
                        </p>
                        <button onClick={getAiSummary} disabled={aiLoading}
                            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold transition-all"
                            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                            <Sparkles className="h-4 w-4" />
                            Analyze My Customers
                        </button>
                    </div>
                )}
            </div>

            {/* Customer List */}
            {customers.length === 0 ? (
                <div className="rounded-2xl p-12 text-center shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <Users className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--color-text-subtle)' }} />
                    <h2 className="font-bold text-lg mb-1" style={{ color: 'var(--color-primary)' }}>{bookings.length === 0 ? 'No customers yet' : 'No customers match your filters'}</h2>
                    <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                        {bookings.length === 0 
                            ? 'Complete bookings to build your customer base'
                            : 'Try adjusting your search or filter'}
                    </p>
                    <button className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold transition-all"
                        style={{ backgroundColor: bookings.length === 0 ? 'var(--color-primary)' : 'transparent', color: bookings.length === 0 ? 'var(--color-on-primary)' : 'var(--color-text-muted)', border: bookings.length === 0 ? 'none' : '1px solid var(--color-border-strong)' }}
                        onClick={() => { if (bookings.length === 0) toast.info('Navigate to bookings'); else { setSearch(''); setFilter('all'); }}}
                        onMouseEnter={e => { if (bookings.length === 0) e.currentTarget.style.opacity = '0.88'; else { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}}
                        onMouseLeave={e => { if (bookings.length === 0) e.currentTarget.style.opacity = '1'; else { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}} >
                        {bookings.length === 0 ? <Plus className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                        {bookings.length === 0 ? 'Get First Booking' : 'Clear Filters'}
                    </button>
                </div>
            ) : (
                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    {customers.map((c, i) => (
                        <div key={c.email} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-high/50"
                            style={{ borderBottom: i < customers.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                                    <span className="font-black text-lg" style={{ color: 'var(--color-text-muted)' }}>{c.name?.[0] || c.email?.[0]?.toUpperCase()}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-primary)' }}>{c.name || c.email}</p>
                                    <p className="text-[10px] truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{c.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="text-right hidden sm:block">
                                    <p className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>${c.spent.toLocaleString()}</p>
                                    <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{c.bookings.length} booking{c.bookings.length !== 1 ? 's' : ''}</p>
                                </div>
                                {c.spent > 300 && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-warning)15', color: 'var(--color-warning)', border: '1px solid var(--color-warning)30' }}>
                                        VIP
                                    </span>
                                )}
                                {c.bookings.length > 1 && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-success)15', color: 'var(--color-success)', border: '1px solid var(--color-success)30' }}>
                                        Repeat
                                    </span>
                                )}
                                <ChevronRight className="h-4 w-4" style={{ color: 'var(--color-text-subtle)' }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tips */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-[10px] font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Tips</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: CheckCircle2, title: 'Follow Up After Service', desc: 'Message customers within 24 hours — increases repeat bookings by 40%' },
                        { icon: Star, title: 'Reward Loyalty', desc: 'Offer VIP discounts to customers with 3+ bookings to lock in retention' },
                        { icon: MessageSquare, title: 'Ask for Reviews', desc: 'Happy repeat customers are 5x more likely to leave 5-star reviews' },
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