import { useState, useMemo } from 'react';
import { TrendingUp, Package, Star, CalendarDays, DollarSign, ChevronRight, Download, Filter, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

const MOCK_BOOKINGS = [
    { id: '1', service_name: 'Deep House Cleaning', provider_name: 'Sparkle Clean Co.', provider_id: 'p1', date: '2025-01-15', price: 150, rating: 5 },
    { id: '2', service_name: 'AC Repair & Maintenance', provider_name: 'CoolAir HVAC', provider_id: 'p2', date: '2025-01-10', price: 200, rating: 5 },
    { id: '3', service_name: 'Lawn Mowing', provider_name: 'Green Thumb Landscaping', provider_id: 'p3', date: '2025-01-05', price: 85, rating: 4 },
    { id: '4', service_name: 'Plumbing Inspection', provider_name: 'Emergency Plumbing Co.', provider_id: 'p4', date: '2024-12-28', price: 120, rating: 5 },
    { id: '5', service_name: 'Window Cleaning', provider_name: 'ClearView Windows', provider_id: 'p5', date: '2024-12-20', price: 95, rating: 4 },
    { id: '6', service_name: 'Electrical Work', provider_name: 'PowerFix Electrical', provider_id: 'p6', date: '2024-12-15', price: 350, rating: 5 },
    { id: '7', service_name: 'Gutter Cleaning', provider_name: 'ProClean Services', provider_id: 'p7', date: '2024-11-20', price: 180, rating: 4 },
    { id: '8', service_name: 'House Cleaning', provider_name: 'Sparkle Clean Co.', provider_id: 'p1', date: '2024-11-10', price: 150, rating: 5 },
];

export default function ServiceHistory() {
    const [bookings] = useState(MOCK_BOOKINGS);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [providerFilter, setProviderFilter] = useState('all');

    const stats = useMemo(() => {
        const totalSpent = bookings.reduce((s, b) => s + (b.price || 0), 0);
        const avgSpend = bookings.length ? (totalSpent / bookings.length).toFixed(0) : 0;
        const uniqueProviders = new Set(bookings.map(b => b.provider_id)).size;
        const categoryMap = {};
        bookings.forEach(b => {
            const cat = b.service_name?.split(' ')[0] || 'Other';
            categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });
        const chartData = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));
        return { totalSpent, avgSpend, uniqueProviders, chartData };
    }, [bookings]);

    const providers = useMemo(() => [...new Set(bookings.map(b => b.provider_name))], [bookings]);

    const filtered = useMemo(() => {
        let result = bookings;
        if (search) {
            const query = search.toLowerCase();
            result = result.filter(b => 
                b.service_name?.toLowerCase().includes(query) || 
                b.provider_name?.toLowerCase().includes(query)
            );
        }
        if (providerFilter !== 'all') {
            result = result.filter(b => b.provider_name === providerFilter);
        }
        return result;
    }, [search, providerFilter]);

    if (loading) return (
        <div className="space-y-6 max-w-4xl">
            <div className="skeleton-wave h-7 w-56 rounded-xl" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton-wave h-28 rounded-2xl" />)}
            </div>
            <div className="skeleton-wave h-64 rounded-2xl" />
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Service History</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Your completed services and spending patterns</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Services Completed', value: bookings.length, icon: Package, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)' },
                        { label: 'Total Spent', value: `$${stats.totalSpent.toLocaleString()}`, icon: DollarSign, color: 'var(--color-success)', bg: 'rgba(var(--color-success),0.12)' },
                        { label: 'Avg per Booking', value: `$${stats.avgSpend}`, icon: TrendingUp, color: 'var(--color-warning)', bg: 'rgba(var(--color-warning),0.12)' },
                        { label: 'Unique Providers', value: stats.uniqueProviders, icon: Star, color: 'var(--color-accent)', bg: 'rgba(var(--color-accent),0.12)' },
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
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: 'var(--color-text-subtle)' }} />
                    <input 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        placeholder="Search services…"
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
                <select value={providerFilter} onChange={e => setProviderFilter(e.target.value)}
                    className="h-11 rounded-xl px-4 text-sm outline-none shrink-0"
                    style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text)', fontFamily: 'Inter,sans-serif' }}>
                    <option value="all">All Providers</option>
                    {providers.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            {/* Category Chart */}
            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-semibold" style={{ color: 'var(--color-primary)' }}>Services by Category</h2>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{stats.chartData.length} categories</span>
                </div>
                {stats.chartData.length > 0 ? (
                    <div style={{ height: 220 }}>
                        <svg viewBox="0 0 100% 220" preserveAspectRatio="none" className="w-full h-full">
                            <defs>
                                <linearGradient id="barGrad" x1="0" y1="1" x2="0" y2="0">
                                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={1} />
                                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                </linearGradient>
                            </defs>
                            {stats.chartData.map((item, i) => {
                                const maxCount = Math.max(...stats.chartData.map(d => d.count));
                                const barHeight = (item.count / maxCount) * 160;
                                const barWidth = 100 / stats.chartData.length * 0.7;
                                const x = 100 / stats.chartData.length * i + 100 / stats.chartData.length * 0.15;
                                const y = 200 - barHeight;
                                return (
                                    <g key={item.name}>
                                        <rect x={`${x}%`} y={y} width={`${barWidth}%`} height={barHeight} fill="url(#barGrad)" rx={3} ry={3} />
                                        <text x={`${x + barWidth/2}%`} y={215} textAnchor="middle" fontSize="8" fill="var(--color-text-subtle)" style={{ fontFamily: 'Inter,sans-serif' }}>
                                            {item.name.length > 8 ? item.name.slice(0, 8) + '…' : item.name}
                                        </text>
                                        <text x={`${x + barWidth/2}%`} y={y - 5} textAnchor="middle" fontSize="9" fill="var(--color-primary)" fontWeight="bold" style={{ fontFamily: 'Inter,sans-serif' }}>
                                            {item.count}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Package className="h-10 w-10 mx-auto mb-2" style={{ color: 'var(--color-text-subtle)' }} />
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No service data yet</p>
                    </div>
                )}
            </div>

            {/* Service History Table */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>Completed Services</h2>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{filtered.length} of {bookings.length} services</span>
            </div>

            {filtered.length === 0 ? (
                <div className="rounded-2xl p-12 text-center shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <CalendarDays className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--color-text-subtle)' }} />
                    <h2 className="font-bold text-lg mb-1" style={{ color: 'var(--color-primary)' }}>{search || providerFilter !== 'all' ? 'No services found' : 'No completed services yet'}</h2>
                    <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                        {search || providerFilter !== 'all' 
                            ? 'Try adjusting your search or filter' 
                            : 'Your completed services will appear here'}
                    </p>
                    <a href="/services" className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold transition-all"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                        {search || providerFilter !== 'all' ? 'Clear Filters' : 'Browse Services'}
                        <HelpCircle className="h-4 w-4" />
                    </a>
                </div>
            ) : (
                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    {filtered.map((b, i) => (
                        <div key={b.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-high/50"
                            style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-surface-high)' }}>
                                <Package className="h-4.5 w-4.5" style={{ color: 'var(--color-text-muted)' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-primary)' }}>{b.service_name}</p>
                                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{b.provider_name} · {new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>${b.price}</span>
                                <div className="flex items-center gap-1" style={{ color: 'var(--color-warning)' }}>
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-3.5 w-3.5 fill-current" style={{ color: i < (b.rating || 0) ? 'var(--color-warning)' : 'var(--color-border)' }} />
                                    ))}
                                </div>
                                <ChevronRight className="h-4 w-4" style={{ color: 'var(--color-text-subtle)' }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Export Actions */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Export</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button className="h-11 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                    style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                    onClick={() => toast.info('Exporting service history as CSV...')}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                    <Download className="h-4 w-4" />
                    Export History (CSV)
                </button>
                <button className="h-11 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                    style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                    onClick={() => toast.info('Generating annual summary...')}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                    <CalendarDays className="h-4 w-4" />
                    Year in Review
                </button>
            </div>
        </div>
    );
}