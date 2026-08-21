import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, MapPin, Star, Plus, Search, Filter, ChevronRight, CheckCircle2, Share2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const MOCK_FAVORITES = [
    { id: 'p1', business_name: 'Sparkle Clean Co.', city: 'San Francisco', rating: 4.9, category: 'Cleaning', services: ['Deep Cleaning', 'Regular Cleaning'], review_count: 127 },
    { id: 'p2', business_name: 'CoolAir HVAC', city: 'Oakland', rating: 4.8, category: 'HVAC', services: ['AC Repair', 'Maintenance'], review_count: 89 },
    { id: 'p3', business_name: 'Green Thumb Landscaping', city: 'Berkeley', rating: 4.7, category: 'Landscaping', services: ['Lawn Care', 'Garden Design'], review_count: 56 },
    { id: 'p4', business_name: 'Emergency Plumbing Co.', city: 'Daly City', rating: 4.6, category: 'Plumbing', services: ['Emergency Repair', 'Installation'], review_count: 203 },
    { id: 'p5', business_name: 'ClearView Windows', city: 'San Mateo', rating: 4.9, category: 'Windows', services: ['Window Cleaning', 'Screen Repair'], review_count: 34 },
];

const CATEGORIES = ['All', 'Cleaning', 'HVAC', 'Landscaping', 'Plumbing', 'Windows'];

export default function WishlistFavorites() {
    const [favorites] = useState(MOCK_FAVORITES);
    const [loading, setLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const [search, setSearch] = useState('');
    const [removingId, setRemovingId] = useState(null);

    const filtered = favorites.filter(p => {
        const matchCat = activeCategory === 'All' || p.category === activeCategory;
        const matchSearch = !search || p.business_name.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    const uniqueCategories = [...new Set(favorites.map(p => p.category))];

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                        <Heart className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                        <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Favorites</h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Your saved providers & services for quick access</p>
                    </div>
                </div>
                <Link to="/nearby" className="h-11 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                    <Plus className="h-4 w-4" />
                    Browse More
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Saved Providers', value: favorites.length, icon: Heart, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)' },
                        { label: 'Categories', value: uniqueCategories.length, icon: Filter, color: 'var(--color-accent)', bg: 'rgba(var(--color-accent),0.12)' },
                        { label: 'Avg Rating', value: favorites.length ? (favorites.reduce((s, p) => s + (p.rating || 0), 0) / favorites.length).toFixed(1) : '—', icon: Star, color: 'var(--color-warning)', bg: 'rgba(var(--color-warning),0.12)' },
                        { label: 'Total Reviews', value: favorites.reduce((s, p) => s + (p.review_count || 0), 0), icon: MessageSquare, color: 'var(--color-success)', bg: 'rgba(var(--color-success),0.12)' },
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
                        placeholder="Search favorites…"
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
                <div className="flex flex-wrap gap-2 shrink-0">
                    {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                                activeCategory === cat 
                                    ? '' 
                                    : 'text-text-muted hover:text-text hover:bg-surface-high'
                            }`}
                            style={{
                                color: activeCategory === cat ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
                                backgroundColor: activeCategory === cat ? 'var(--color-primary)' : 'transparent',
                                border: activeCategory === cat ? 'none' : '1px solid var(--color-border)'
                            }}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Favorites Grid */}
            {filtered.length === 0 ? (
                <div className="rounded-2xl p-12 text-center shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <Heart className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--color-text-subtle)' }} />
                    <h2 className="font-bold text-lg mb-1" style={{ color: 'var(--color-primary)' }}>{favorites.length === 0 ? 'No favorites yet' : 'No matches found'}</h2>
                    <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                        {favorites.length === 0 
                            ? 'Browse providers and save your favorites for quick access'
                            : 'Try adjusting your search or filter'}
                    </p>
                    <button className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold transition-all"
                        style={{ 
                            backgroundColor: favorites.length === 0 ? 'var(--color-primary)' : 'transparent', 
                            color: favorites.length === 0 ? 'var(--color-on-primary)' : 'var(--color-text-muted)', 
                            border: favorites.length === 0 ? 'none' : '1px solid var(--color-border-strong)' 
                        }}
                        onClick={() => { if (favorites.length === 0) window.location.href = '/nearby'; else { setSearch(''); setActiveCategory('All'); }}}
                        onMouseEnter={e => { if (favorites.length === 0) e.currentTarget.style.opacity = '0.88'; else { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}}
                        onMouseLeave={e => { if (favorites.length === 0) e.currentTarget.style.opacity = '1'; else { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}} >
                        {favorites.length === 0 ? <Plus className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                        {favorites.length === 0 ? 'Browse Providers' : 'Clear Filters'}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((p, index) => {
                        const isRemoving = removingId === p.id;
                        return (
                            <div key={p.id} className="rounded-xl p-4 transition-all hover-lift card-lightning-subtle"
                                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                                            style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                                            <span className="font-black text-lg" style={{ color: 'var(--color-text-muted)' }}>{p.business_name[0]}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-primary)' }}>{p.business_name}</p>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                                <span className="flex items-center gap-1">
                                                    <Star className="h-3 w-3 fill-current" style={{ color: 'var(--color-warning)' }} />
                                                    {p.rating}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {p.city}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-medium"
                                                    style={{ backgroundColor: 'var(--color-surface-high)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                                                    {p.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Link to={`/providers/${p.id}`}
                                            className="h-9 px-3 rounded-xl text-xs font-semibold flex items-center transition-all"
                                            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', textDecoration: 'none' }}
                                            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                                            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                                            Book
                                        </Link>
                                        <button 
                                            className="h-9 w-9 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                            style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                                            onClick={() => { setRemovingId(p.id); setTimeout(() => { setFavorites(prev => prev.filter(f => f.id !== p.id)); toast.success('Removed from favorites'); setRemovingId(null); }, 300); }}
                                            disabled={isRemoving}
                                            aria-label="Remove from favorites">
                                            {isRemoving ? (
                                                <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--color-error)' }} />
                                            ) : (
                                                <Trash2 className="h-3.5 w-3.5" style={{ color: 'var(--color-error)' }} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
                                    <span className="text-[10px] font-medium" style={{color: 'var(--color-text-subtle)'}}>
                                        {p.services.slice(0, 3).join(' . ')}
                                    </span>
                                    <button 
                                        className="h-8 w-8 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                        style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                                        onClick={() => toast.info('Sharing provider...')}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                                        <Share2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Tips */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Tips</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: Heart, title: 'Save for Later', desc: 'Bookmark providers you like — they\'ll be here whenever you need them' },
                        { icon: ChevronRight, title: 'Quick Booking', desc: 'Jump straight to booking from your favorites without searching again' },
                        { icon: CheckCircle2, title: 'Track Changes', desc: 'Get notified if a favorite provider updates availability or pricing' },
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