import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Shield, Store, CalendarDays, Tag, BarChart3, LogOut, CheckCircle, XCircle, Clock, RefreshCw, Trash2, Settings, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const OWNER_USER = 'truvornex_owner';
const OWNER_PASS = 'TX#Admin2024!@secure';

const STATUS_STYLES = {
    pending:     { bg: 'rgba(var(--color-warning),0.08)', color: 'var(--color-warning)' },
    approved:    { bg: 'rgba(var(--color-success),0.08)', color: 'var(--color-success)' },
    rejected:    { bg: 'rgba(var(--color-error),0.08)', color: 'var(--color-error)' },
    suspended:   { bg: 'rgba(var(--color-text-muted),0.12)', color: 'var(--color-text-muted)' },
    confirmed:   { bg: 'rgba(var(--color-info),0.08)', color: 'var(--color-info)' },
    completed:   { bg: 'rgba(var(--color-success),0.08)', color: 'var(--color-success)' },
    cancelled:   { bg: 'rgba(var(--color-error),0.08)', color: 'var(--color-error)' },
    in_progress: { bg: 'rgba(var(--color-info),0.08)', color: 'var(--color-info)' },
};

export default function OwnerAdmin() {
    const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem('owner_auth') === 'true');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [tab, setTab] = useState('dashboard');
    const [providers, setProviders] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const login = () => {
        if (username === OWNER_USER && password === OWNER_PASS) {
            sessionStorage.setItem('owner_auth', 'true');
            setLoggedIn(true);
        } else {
            toast.error('Invalid credentials');
        }
    };

    const logout = () => { sessionStorage.removeItem('owner_auth'); setLoggedIn(false); };

    const loadAll = () => {
        setLoading(true);
        setProviders([]); setBookings([]); setServices([]); setCategories([]);
        setLoading(false);
    };

    useEffect(() => {
        if (!loggedIn) return;
        loadAll();
    }, [loggedIn]);

    if (!loggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
                <div className="w-full max-w-sm">
                    <div className="flex flex-col items-center mb-8">
                        <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4 card-lightning-subtle" style={{ backgroundColor: 'var(--color-primary)' }}>
                            <Shield className="h-7 w-7" style={{ color: 'var(--color-on-primary)' }} />
                        </div>
                        <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)' }}>Owner Panel</h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-subtle)' }}>Restricted access — Truvornex</p>
                    </div>
                    <div className="rounded-2xl p-6 space-y-4 card-premium" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div>
                            <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Username</label>
                            <Input
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="input-lightning h-11 w-full rounded-xl"
                                placeholder="Enter username"
                                onKeyDown={e => e.key === 'Enter' && login()}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Password</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="input-lightning h-11 w-full rounded-xl"
                                placeholder="Enter password"
                                onKeyDown={e => e.key === 'Enter' && login()}
                            />
                        </div>
                        <Button onClick={login} className="w-full h-11 rounded-xl">
                            Sign In
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const stats = {
        totalProviders: providers.length,
        pendingProviders: providers.filter(p => p.status === 'pending').length,
        approvedProviders: providers.filter(p => p.status === 'approved').length,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        revenue: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.price || 0), 0),
        totalServices: services.length,
    };

    const TABS = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'providers', label: 'Providers', icon: Store },
        { id: 'bookings', label: 'Bookings', icon: CalendarDays },
        { id: 'services', label: 'Services', icon: Tag },
        { id: 'categories', label: 'Categories', icon: Settings },
    ];

    return (
        <div className="min-h-screen font-inter" style={{ backgroundColor: 'var(--color-bg)' }}>
            {/* Sidebar */}
            <div className="flex">
                <aside className="hidden md:flex w-56 min-h-screen flex-col" style={{ backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}>
                    <div className="p-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'var(--color-primary)' }}>
                                <Shield className="h-4 w-4" style={{ color: 'var(--color-on-primary)' }} />
                            </div>
                            <div>
                                <p className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>Owner Panel</p>
                                <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>Truvornex Admin</p>
                            </div>
                        </div>
                    </div>
                    <nav className="flex-1 p-3 space-y-1">
                        {TABS.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab === t.id ? '' : 'hover:scale-[1.02]'}`}
                                style={tab === t.id
                                    ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }
                                    : { color: 'var(--color-text-subtle)' }}
                                onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.color = 'var(--color-primary)'; }}
                                onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.color = 'var(--color-text-subtle)'; }}
                            >
                                <t.icon className="h-4 w-4" /> {t.label}
                            </button>
                        ))}
                    </nav>
                    <div className="p-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:scale-[1.02]" style={{ color: 'var(--color-text-subtle)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-subtle)'}>
                            <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                    </div>
                </aside>

                {/* Mobile top bar */}
                <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14" style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                        <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>Owner Panel</span>
                    </div>
                    <button onClick={logout} style={{ color: 'var(--color-text-subtle)' }}><LogOut className="h-4 w-4" /></button>
                </div>

                {/* Main */}
                <main className="flex-1 p-4 md:p-6 mt-14 md:mt-0">
                    {/* Mobile tabs */}
                    <div className="md:hidden flex gap-1 mb-4 overflow-x-auto pb-1">
                        {TABS.map(t => (
                            <button key={t.id} onClick={() => setTab(t.id)}
                                className="flex-shrink-0 px-3 h-8 rounded-lg text-xs font-semibold transition-colors"
                                style={tab === t.id
                                    ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }
                                    : { backgroundColor: 'var(--color-surface-high)', color: 'var(--color-text-subtle)' }}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        <h1 className="font-black text-2xl capitalize" style={{ color: 'var(--color-primary)' }}>{tab}</h1>
                        <button onClick={loadAll} className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: 'var(--color-text-subtle)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-subtle)'}>
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                        </button>
                    </div>

                    {tab === 'dashboard' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { label: 'Total Providers', value: stats.totalProviders, sub: `${stats.pendingProviders} pending`, icon: Store },
                                    { label: 'Approved', value: stats.approvedProviders, sub: 'active providers', icon: CheckCircle },
                                    { label: 'Total Bookings', value: stats.totalBookings, sub: `${stats.pendingBookings} pending`, icon: CalendarDays },
                                    { label: 'Revenue', value: `$${stats.revenue.toLocaleString()}`, sub: 'from completed', icon: TrendingUp },
                                ].map(s => (
                                    <div key={s.label} className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                                        <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                                            <s.icon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                                        </div>
                                        <p className="font-black text-2xl mt-3" style={{ color: 'var(--color-primary)' }}>{s.value}</p>
                                        <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
                                        <p className="text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>{s.sub}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Pending Providers */}
                            <div className="rounded-2xl p-4 card-premium" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                                <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                                    <Clock className="h-4 w-4" style={{ color: 'var(--color-warning)' }} /> Pending Provider Approvals ({stats.pendingProviders})
                                </h2>
                                {providers.filter(p => p.status === 'pending').length === 0 ? (
                                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>All providers reviewed ✓</p>
                                ) : (
                                    <div className="space-y-2">
                                        {providers.filter(p => p.status === 'pending').map(p => (
                                            <ProviderRow key={p.id} provider={p} onUpdate={loadAll} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Recent bookings */}
                            <div className="rounded-2xl p-4 card-premium" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                                <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                                    <CalendarDays className="h-4 w-4" style={{ color: 'var(--color-info)' }} /> Recent Bookings
                                </h2>
                                <div className="space-y-2">
                                    {bookings.slice(0, 8).map(b => (
                                        <BookingRow key={b.id} booking={b} onUpdate={loadAll} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'providers' && (
                        <div className="space-y-3">
                            {loading ? <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p> : providers.map(p => (
                                <ProviderRow key={p.id} provider={p} onUpdate={loadAll} showAll />
                            ))}
                        </div>
                    )}

                    {tab === 'bookings' && (
                        <div className="space-y-2">
                            {loading ? <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p> : bookings.map(b => (
                                <BookingRow key={b.id} booking={b} onUpdate={loadAll} showAll />
                            ))}
                        </div>
                    )}

                    {tab === 'services' && (
                        <div className="space-y-2">
                            {loading ? <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p> : services.map(s => {
                                const st = s.is_active
                                    ? { bg: 'rgba(var(--color-success),0.08)', color: 'var(--color-success)' }
                                    : { bg: 'rgba(var(--color-text-muted),0.12)', color: 'var(--color-text-muted)' };
                                return (
                                    <div key={s.id} className="rounded-2xl p-4 flex items-center justify-between gap-3 card-premium hover-lift" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>{s.name}</p>
                                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>${s.price} · {s.duration_minutes}min · {s.category_slug} · {s.type}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: st.bg, color: st.color }}>
                                                {s.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {tab === 'categories' && (
                        <CategoryManager categories={categories} onRefresh={loadAll} />
                    )}
                </main>
            </div>
        </div>
    );
}

function ProviderRow({ provider: p, onUpdate, showAll }) {

    const st = STATUS_STYLES[p.status] || { bg: 'rgba(var(--color-text-muted),0.12)', color: 'var(--color-text-muted)' };

    return (
        <div className="rounded-2xl p-4 flex flex-wrap items-center gap-3 card-premium hover-lift" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {p.logo_url ? (
                    <img src={p.logo_url} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" style={{ border: '1px solid var(--color-border)' }} />
                ) : (
                    <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 card-lightning-subtle" style={{ backgroundColor: 'var(--color-surface-high)' }}>
                        <span className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>{p.business_name?.[0]}</span>
                    </div>
                )}
                <div className="min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>{p.business_name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{p.user_email} · {p.city}</p>
                </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: st.bg, color: st.color }}>{p.status}</span>
            <div className="flex gap-1.5 flex-wrap">
                {p.status === 'pending' && <>
                    <Button size="sm" onClick={approve} className="h-7 text-xs rounded-lg"><CheckCircle className="h-3 w-3" />Approve</Button>
                    <Button size="sm" variant="destructive" onClick={reject} className="h-7 text-xs rounded-lg"><XCircle className="h-3 w-3" />Reject</Button>
                </>}
                {p.status === 'approved' && <Button size="sm" variant="outline" onClick={suspend} className="h-7 text-xs rounded-lg" style={{ color: 'var(--color-error)', borderColor: 'var(--color-border)' }}>Suspend</Button>}
                {p.status === 'suspended' && <Button size="sm" onClick={approve} className="h-7 text-xs rounded-lg"><CheckCircle className="h-3 w-3" />Reactivate</Button>}
                {showAll && <button onClick={del} className="transition-colors p-1.5" style={{ color: 'var(--color-text-subtle)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-error)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-subtle)'}><Trash2 className="h-4 w-4" /></button>}
            </div>
        </div>
    );
}

function BookingRow({ booking: b, onUpdate, showAll }) {
    const st = STATUS_STYLES[b.status] || { bg: 'rgba(var(--color-text-muted),0.12)', color: 'var(--color-text-muted)' };
    return (
        <div className="rounded-2xl p-4 flex flex-wrap items-center gap-3 card-premium hover-lift" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>{b.service_name} — {b.provider_name}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>{b.customer_email} · {b.date} {b.time_slot}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>${b.price || 0}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: st.bg, color: st.color }}>{b.status}</span>
                {showAll && <>
                    {b.status === 'pending' && <Button size="sm" onClick={() => updateStatus('confirmed')} className="h-7 text-xs rounded-lg" style={{ color: 'var(--color-info)', borderColor: 'var(--color-border)' }} variant="outline">Confirm</Button>}
                    {['pending', 'confirmed'].includes(b.status) && <Button size="sm" variant="outline" onClick={() => updateStatus('cancelled')} className="h-7 text-xs rounded-lg" style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>Cancel</Button>}
                    {b.status === 'confirmed' && <Button size="sm" onClick={() => updateStatus('completed')} className="h-7 text-xs rounded-lg"><CheckCircle className="h-3 w-3" />Complete</Button>}
                </>}
            </div>
        </div>
    );
}

function CategoryManager({ categories, onRefresh }) {
    const [form, setForm] = useState({ name: '', slug: '', description: '', icon: 'wrench', is_active: true, sort_order: 0 });
    const [saving, setSaving] = useState(false);

    const save = async () => {
        if (!form.name || !form.slug) { toast.error('Name and slug required'); return; }
        setSaving(true);
        toast.success('Category created');
        setForm({ name: '', slug: '', description: '', icon: 'wrench', is_active: true, sort_order: 0 });
        setSaving(false);
        onRefresh();
    };


    return (
        <div className="space-y-4">
            <div className="rounded-2xl p-5 card-premium" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <h2 className="font-bold mb-4" style={{ color: 'var(--color-text)' }}>Add New Category</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input placeholder="Name (e.g. Plumbing)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-lightning h-11 w-full rounded-xl" />
                    <Input placeholder="Slug (e.g. plumbing)" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="input-lightning h-11 w-full rounded-xl" />
                    <Input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-lightning h-11 w-full rounded-xl" />
                    <Input placeholder="Icon (wrench, scissors, etc)" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="input-lightning h-11 w-full rounded-xl" />
                    <Input type="number" placeholder="Sort Order" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} className="input-lightning h-11 w-full rounded-xl" />
                </div>
                <Button onClick={save} disabled={saving} className="mt-3">{saving ? 'Saving...' : 'Add Category'}</Button>
            </div>
            <div className="space-y-2">
                {categories.map(c => {
                    const st = c.is_active
                        ? { bg: 'rgba(var(--color-success),0.08)', color: 'var(--color-success)' }
                        : { bg: 'rgba(var(--color-text-muted),0.12)', color: 'var(--color-text-muted)' };
                    return (
                        <div key={c.id} className="rounded-2xl p-4 flex items-center gap-3 card-premium hover-lift" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <div className="flex-1">
                                <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{c.name} <span className="font-normal" style={{ color: 'var(--color-text-subtle)' }}>/{c.slug}</span></p>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{c.description || 'No description'} · order {c.sort_order}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: st.bg, color: st.color }}>{c.is_active ? 'Active' : 'Inactive'}</span>
                            <button onClick={() => toggle(c)} className="text-xs px-2 py-1 rounded transition-colors" style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>{c.is_active ? 'Disable' : 'Enable'}</button>
                            <button onClick={() => del(c.id)} className="transition-colors" style={{ color: 'var(--color-text-subtle)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--color-error)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-subtle)'}>
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
