import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowLeft, Layers, PlusCircle, Clock, DollarSign, X, Loader2, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY = { name: '', description: '', type: 'addon', category: '', price_modifier: 0, duration_modifier: 0, is_active: true, sort_order: 0 };

const TYPE_INFO = {
    addon: { label: 'Add-on', color: 'var(--color-info)', bg: 'rgba(var(--color-info),0.12)', desc: 'Stackable extras customers can add to their booking' },
    variant: { label: 'Variant', color: 'var(--color-accent)', bg: 'rgba(var(--color-accent),0.12)', desc: 'Mutually exclusive options (pick one)' },
};

const MOCK_SERVICE = { id: 'svc1', name: 'Deep House Cleaning', provider_id: 'prov1' };
const MOCK_VARIANTS = [
    { id: 'v1', service_id: 'svc1', name: 'Eco-Friendly Products', description: 'Non-toxic, biodegradable cleaning supplies', type: 'addon', category: 'extra', price_modifier: 25, duration_modifier: 0, is_active: true, sort_order: 1 },
    { id: 'v2', service_id: 'svc1', name: 'Deep Clean Add-on', description: 'Includes inside appliances, baseboards, and windows', type: 'addon', category: 'extra', price_modifier: 50, duration_modifier: 60, is_active: true, sort_order: 2 },
    { id: 'v3', service_id: 'svc1', name: 'Standard Cleaning', description: 'Regular maintenance cleaning', type: 'variant', category: 'haircut_style', price_modifier: 0, duration_modifier: 0, is_active: true, sort_order: 1 },
    { id: 'v4', service_id: 'svc1', name: 'Move-In/Move-Out Deep Clean', description: 'Comprehensive cleaning for vacant properties', type: 'variant', category: 'haircut_style', price_modifier: 100, duration_modifier: 120, is_active: true, sort_order: 2 },
];

export default function ServiceVariants() {
    const { serviceId } = useParams();
    const [service, setService] = useState(null);
    const [variants] = useState(MOCK_VARIANTS);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        setService(MOCK_SERVICE);
        setLoading(false);
    }, [serviceId]);

    const save = async () => {
        if (!form.name.trim()) { toast.error('Option name is required'); return; }
        setSaving(true);
        await new Promise(r => setTimeout(r, 500));
        
        const data = {
            ...form,
            service_id: serviceId,
            provider_id: service?.provider_id,
            price_modifier: Number(form.price_modifier) || 0,
            duration_modifier: Number(form.duration_modifier) || 0,
            sort_order: Number(form.sort_order) || 0,
        };
        
        toast.success(editId ? 'Option updated' : 'Option added');
        setOpen(false); 
        setForm(EMPTY); 
        setEditId(null);
        setSaving(false);
    };

    const del = async (id) => {
        setDeletingId(id);
        await new Promise(r => setTimeout(r, 300));
        setVariants(prev => prev.filter(v => v.id !== id));
        toast.success('Deleted');
        setDeletingId(null);
    };

    const openEdit = (v) => { 
        setForm({...v}); 
        setEditId(v.id); 
        setOpen(true); 
    };

    const closeDialog = () => {
        setOpen(false);
        setForm(EMPTY);
        setEditId(null);
    };

    const grouped = { variant: variants.filter(v => v.type === 'variant'), addon: variants.filter(v => v.type === 'addon') };

    if (loading) return (
        <div className="space-y-6 max-w-4xl">
            <div className="skeleton-wave h-7 w-56 rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton-wave h-28 rounded-2xl" />)}
            </div>
            <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton-wave h-16 rounded-xl" />)}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <Link to="/provider/services" className="inline-flex items-center gap-1.5 text-sm transition-all mb-4 block"
                        style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Services
                    </Link>
                    <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Service Options</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        <span className="font-medium" style={{ color: 'var(--color-primary)' }}>{service?.name}</span> · Configure add-ons and variants
                    </p>
                </div>
                <button className="h-11 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                    onClick={() => { setForm(EMPTY); setEditId(null); setOpen(true); }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                    <Plus className="h-4 w-4" />
                    Add Option
                </button>
            </div>

            {/* Stats Overview */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-2 gap-4">
                    {Object.entries(TYPE_INFO).map(([type, info]) => (
                        <div key={type} className="rounded-xl p-4 text-center shimmer"
                            style={{ backgroundColor: info.bg, border: `1px solid ${info.color}30` }}>
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-2 card-lightning-subtle"
                                style={{ backgroundColor: info.color }}>
                                <Layers className="h-5 w-5" style={{ color: 'var(--color-on-primary)' }} />
                            </div>
                            <p className="font-bold text-sm mb-1" style={{ color: 'var(--color-primary)' }}>{info.label}s</p>
                            <p className="text-2xl font-black" style={{ color: 'var(--color-primary)' }}>{grouped[type].length}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{info.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Variants List */}
            {variants.length === 0 ? (
                <div className="rounded-2xl p-12 text-center shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <Layers className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--color-text-subtle)' }} />
                    <h2 className="font-bold text-lg mb-1" style={{ color: 'var(--color-primary)' }}>No options yet</h2>
                    <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>Add variants like service tiers or add-ons like extra services</p>
                    <button className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold transition-all"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                        onClick={() => { setForm(EMPTY); setEditId(null); setOpen(true); }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                        <PlusCircle className="h-4 w-4" />
                        Add First Option
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([type, items]) => items.length === 0 ? null : (
                        <div key={type}>
                            <h2 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text-subtle)' }}>
                                {TYPE_INFO[type].label}s
                            </h2>
                            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                                {items.map((v, i) => (
                                    <div key={v.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-high/50"
                                        style={{ borderBottom: i < items.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>{v.name}</span>
                                                {!v.is_active && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface-high)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>Inactive</span>}
                                            </div>
                                            {v.description && <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{v.description}</p>}
                                            <div className="flex items-center gap-3 flex-wrap">
                                                {v.price_modifier !== 0 && (
                                                    <span className="flex items-center gap-1 text-xs font-medium" style={{ color: v.price_modifier > 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                                                        <DollarSign className="h-3 w-3" />
                                                        {v.price_modifier > 0 ? '+' : ''}{v.price_modifier}
                                                    </span>
                                                )}
                                                {v.duration_modifier !== 0 && (
                                                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                                        <Clock className="h-3 w-3" />
                                                        {v.duration_modifier > 0 ? '+' : ''}{v.duration_modifier} min
                                                    </span>
                                                )}
                                                {v.category && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface-high)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>{v.category}</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button 
                                                className="h-9 w-9 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                                style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                                                onClick={() => openEdit(v)}
                                                aria-label="Edit option">
                                                <Pencil className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                                            </button>
                                            <button 
                                                className="h-9 w-9 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                                style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                                                onClick={() => del(v.id)}
                                                disabled={deletingId === v.id}
                                                aria-label="Delete option">
                                                {deletingId === v.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--color-error)' }} />
                                                ) : (
                                                    <Trash2 className="h-3.5 w-3.5" style={{ color: 'var(--color-error)' }} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Dialog */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
                    onClick={e => e.target === e.currentTarget && closeDialog()}>
                    <div className="w-full max-w-md rounded-2xl p-6 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto"
                        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}>
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>{editId ? 'Edit Service Option' : 'Add Service Option'}</h2>
                            <button 
                                onClick={closeDialog}
                                className="h-8 w-8 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                style={{ color: 'var(--color-text-subtle)', backgroundColor: 'transparent', border: 'none' }}
                                aria-label="Close dialog">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-text-subtle)' }}>Option Name *</label>
                            <input 
                                placeholder="e.g. Deep Clean Add-on"
                                value={form.name}
                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
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

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--color-text-subtle)' }}>Description</label>
                            <textarea 
                                placeholder="Optional description for customers"
                                value={form.description}
                                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                rows={3}
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

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--color-text-subtle)' }}>Type</label>
                                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
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
                                    <option value="addon">Add-on (stackable extras)</option>
                                    <option value="variant">Variant (pick one)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--color-text-subtle)' }}>Category</label>
                                <select value={form.category || ''} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
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
                                    <option value="">Select category</option>
                                    <option value="extra">Extra Services</option>
                                    <option value="premium">Premium Options</option>
                                    <option value="eco">Eco-Friendly</option>
                                    <option value="express">Express Service</option>
                                    <option value="package">Package Deals</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--color-text-subtle)' }}>Price Modifier ($)</label>
                                <input 
                                    type="number" step="1"
                                    placeholder="0"
                                    value={form.price_modifier || ''}
                                    onChange={e => setForm(p => ({ ...p, price_modifier: e.target.value }))}
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
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--color-text-subtle)' }}>Duration Modifier (+min)</label>
                                <input 
                                    type="number" step="5"
                                    placeholder="0"
                                    value={form.duration_modifier || ''}
                                    onChange={e => setForm(p => ({ ...p, duration_modifier: e.target.value }))}
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
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-2.5">
                                <button 
                                    role="switch" 
                                    aria-checked={form.is_active !== false}
                                    onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                                    className={`relative h-5 w-9 rounded-full flex items-center transition-all ${
                                        form.is_active ? 'bg-primary' : 'bg-surface-high border border-border'
                                    }`}
                                    style={{
                                        backgroundColor: form.is_active ? 'var(--color-primary)' : 'var(--color-surface-high)',
                                        border: form.is_active ? 'none' : '1px solid var(--color-border)',
                                    }}
                                >
                                    <span className={`absolute h-3.5 w-3.5 rounded-full transition-transform flex items-center justify-center ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`}
                                        style={{
                                            backgroundColor: form.is_active ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
                                            border: form.is_active ? 'none' : '1px solid var(--color-border)',
                                        }}>
                                        {form.is_active && <CheckCircle2 className="h-2 w-2" />}
                                    </span>
                                </button>
                                <span className="text-sm" style={{ color: 'var(--color-text)' }}>Active (visible to customers)</span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button 
                                className="flex-1 h-10 rounded-xl font-semibold transition-all"
                                style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                                onClick={closeDialog}>
                                Cancel
                            </button>
                            <button 
                                className="flex-1 h-10 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                                onClick={save} 
                                disabled={saving || !form.name.trim()}>
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : editId ? (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Update Option
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        Add Option
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