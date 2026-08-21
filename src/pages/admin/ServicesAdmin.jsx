import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Scissors, FolderTree } from 'lucide-react';
import { toast } from 'sonner';

export default function ServicesAdmin() {
    const [categories, setCategories] = useState([]);
    const [services, setServices] = useState([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: '', slug: '', description: '', icon: 'wrench' });
    const [loading, setLoading] = useState(true);

    const load = () => {
        setCategories([]); setServices([]); setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const addCat = async () => {
        toast.success('Category added');
        setOpen(false);
        setForm({ name: '', slug: '', description: '', icon: 'wrench' });
        load();
    };

    const delCat = async (id) => {
        toast.success('Deleted');
        load();
    };

    if (loading) return (
        <div className="space-y-6 max-w-4xl">
            <div className="skeleton-wave h-7 w-64 rounded-xl" />
            <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton-wave h-20 rounded-2xl" />)}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Services &amp; Categories</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Manage service categories and offerings</p>
                </div>
                <button className="h-11 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                    onClick={() => setOpen(true)}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                    <Plus className="h-4 w-4" />
                    Add Category
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                        <FolderTree className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <p className="font-black text-2xl" style={{ color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>{categories.length}</p>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>CATEGORIES</p>
                </div>
                <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-success),0.12)' }}>
                        <Scissors className="h-5 w-5" style={{ color: 'var(--color-success)' }} />
                    </div>
                    <p className="font-black text-2xl" style={{ color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>{services.length}</p>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>ALL SERVICES</p>
                </div>
            </div>

            {/* Categories */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>Categories ({categories.length})</h2>
                </div>
                <div className="space-y-2">
                    {categories.length === 0 ? (
                        <div className="rounded-xl p-8 text-center" style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                            <FolderTree className="h-10 w-10 mx-auto mb-2" style={{ color: 'var(--color-text-subtle)' }} />
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No categories yet</p>
                        </div>
                    ) : categories.map(c => (
                        <div key={c.id} className="rounded-xl p-3 flex items-center justify-between hover-lift transition-all"
                            style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                                    <Tag className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                                </div>
                                <div className="min-w-0">
                                    <span className="font-medium text-sm block truncate" style={{ color: 'var(--color-text)' }}>{c.name}</span>
                                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{c.slug}</span>
                                </div>
                            </div>
                            <button className="h-9 w-9 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                                onClick={() => delCat(c.id)}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-error)'; e.currentTarget.style.backgroundColor = 'rgba(var(--color-error),0.05)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.backgroundColor = 'transparent'; }}>
                                <Trash2 className="h-3.5 w-3.5" style={{ color: 'var(--color-error)' }} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* All Services */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>All Services ({services.length})</h2>
                </div>
                <div className="space-y-2">
                    {services.length === 0 ? (
                        <div className="rounded-xl p-8 text-center" style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                            <Scissors className="h-10 w-10 mx-auto mb-2" style={{ color: 'var(--color-text-subtle)' }} />
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No services yet</p>
                        </div>
                    ) : services.map(s => (
                        <div key={s.id} className="rounded-xl p-3 flex items-center justify-between hover-lift transition-all"
                            style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-success),0.12)' }}>
                                    <Scissors className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                                </div>
                                <div className="min-w-0">
                                    <span className="font-medium text-sm block truncate" style={{ color: 'var(--color-text)' }}>{s.name}</span>
                                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>${s.price} · {s.type}</span>
                                </div>
                            </div>
                            <span className="text-xs shrink-0 ml-2" style={{ color: 'var(--color-text-muted)' }}>{s.category_slug}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Category Dialog */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
                    onClick={e => e.target === e.currentTarget && setOpen(false)}>
                    <div className="w-full max-w-lg rounded-2xl p-6 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto"
                        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}>
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>Add Category</h2>
                            <button onClick={() => setOpen(false)}
                                className="h-8 w-8 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                style={{ color: 'var(--color-text-subtle)', backgroundColor: 'transparent', border: 'none' }}
                                aria-label="Close dialog">
                                <Plus className="h-4 w-4 rotate-45" />
                            </button>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-text-subtle)' }}>Name</label>
                            <input
                                placeholder="Name"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="input-lightning w-full px-4 py-3.5 rounded-xl text-base outline-none"
                                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text)', fontSize: '15px', fontFamily: 'Inter,sans-serif' }}
                                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-accent)')}
                                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-text-subtle)' }}>Slug (e.g. barber)</label>
                            <input
                                placeholder="Slug (e.g. barber)"
                                value={form.slug}
                                onChange={e => setForm({ ...form, slug: e.target.value })}
                                className="input-lightning w-full px-4 py-3.5 rounded-xl text-base outline-none"
                                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text)', fontSize: '15px', fontFamily: 'Inter,sans-serif' }}
                                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-accent)')}
                                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-text-subtle)' }}>Description</label>
                            <textarea
                                placeholder="Description"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                rows={3}
                                className="input-lightning w-full px-4 py-3.5 rounded-xl resize-none outline-none"
                                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text)', fontSize: '14px', fontFamily: 'Inter,sans-serif', lineHeight: 1.6 }}
                                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-accent)')}
                                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-text-subtle)' }}>Icon (scissors, wrench, etc)</label>
                            <input
                                placeholder="Icon (scissors, wrench, etc)"
                                value={form.icon}
                                onChange={e => setForm({ ...form, icon: e.target.value })}
                                className="input-lightning w-full px-4 py-3.5 rounded-xl text-base outline-none"
                                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text)', fontSize: '15px', fontFamily: 'Inter,sans-serif' }}
                                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-accent)')}
                                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button className="flex-1 h-10 rounded-xl font-semibold transition-all"
                                style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                                onClick={() => setOpen(false)}>
                                Cancel
                            </button>
                            <button className="flex-1 h-10 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                                onClick={addCat}
                                disabled={!form.name || !form.slug}>
                                <Plus className="h-4 w-4" />
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
