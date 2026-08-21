import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Image, AlertTriangle, ChevronRight, Loader2, Save, X, Upload, EyeOff, CheckCircle2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY = { name: '', description: '', category_slug: '', type: 'appointment', price: '', duration_minutes: 30, is_active: true, image_url: '' };

const CATEGORIES = [
    { slug: 'cleaning', name: 'Cleaning' },
    { slug: 'hvac', name: 'HVAC' },
    { slug: 'landscaping', name: 'Landscaping' },
    { slug: 'plumbing', name: 'Plumbing' },
    { slug: 'electrical', name: 'Electrical' },
    { slug: 'windows', name: 'Windows' },
    { slug: 'appliance', name: 'Appliance Repair' },
    { slug: 'handyman', name: 'Handyman' },
    { slug: 'painting', name: 'Painting' },
    { slug: 'flooring', name: 'Flooring' },
    { slug: 'roofing', name: 'Roofing' },
    { slug: 'pest-control', name: 'Pest Control' },
];

const MOCK_SERVICES = [
    { id: '1', name: 'Deep House Cleaning', description: 'Complete deep cleaning for your home', category_slug: 'cleaning', type: 'appointment', price: '150', duration_minutes: 120, is_active: true, image_url: '' },
    { id: '2', name: 'AC Repair & Maintenance', description: 'Air conditioning repair and routine maintenance', category_slug: 'hvac', type: 'appointment', price: '200', duration_minutes: 90, is_active: true, image_url: '' },
    { id: '3', name: 'Lawn Mowing', description: 'Weekly or bi-weekly lawn mowing service', category_slug: 'landscaping', type: 'slot', price: '85', duration_minutes: 60, is_active: true, image_url: '' },
    { id: '4', name: 'Plumbing Inspection', description: 'Complete plumbing system inspection', category_slug: 'plumbing', type: 'appointment', price: '120', duration_minutes: 60, is_active: false, image_url: '' },
];

export default function ManageServices() {
    const navigate = useNavigate();
    const [services] = useState(MOCK_SERVICES);
    const [categories] = useState(CATEGORIES);
    const [provider] = useState({ business_name: 'Sparkle Clean Co.', status: 'approved' });
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const imgRef = useRef();

    const handleImageUpload = async (file) => {
        setUploadingImg(true);
        await new Promise(r => setTimeout(r, 800));
        const reader = new FileReader();
        reader.onload = (e) => { setForm(p => ({ ...p, image_url: e.target.result })); setUploadingImg(false); toast.success('Image uploaded!'); };
        reader.readAsDataURL(file);
    };

    const save = async () => {
        if (!form.name || !form.price || !form.category_slug) { toast.error('Name, price, and category are required'); return; }
        setSaving(true);
        await new Promise(r => setTimeout(r, 500));
        toast.success(editId ? 'Service updated' : 'Service created');
        setOpen(false); setForm(EMPTY); setEditId(null);
        setSaving(false);
    };

    const del = async (id) => {
        setDeletingId(id);
        await new Promise(r => setTimeout(r, 300));
        toast.success('Deleted');
        setDeletingId(null);
    };

    const openEdit = (s) => { setForm({...s}); setEditId(s.id); setOpen(true); };

    const closeDialog = () => { setOpen(false); setForm(EMPTY); setEditId(null); };

    if (loading) return (
        <div className="space-y-6 max-w-4xl">
            <div className="skeleton-wave h-7 w-56 rounded-xl" />
            <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton-wave h-20 rounded-xl" />)}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>My Services</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Manage your service offerings and pricing</p>
                </div>
                <button className="h-11 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                    onClick={() => { setForm(EMPTY); setEditId(null); setOpen(true); }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                    <Plus className="h-4 w-4" />
                    Add Service
                </button>
            </div>

            {/* Provider Check */}
            {!provider && (
                <div className="flex items-start gap-3 rounded-xl p-4 shimmer" style={{ backgroundColor: 'rgba(var(--color-warning),0.08)', border: '1px solid rgba(var(--color-warning),0.2)' }}>
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
                    <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--color-warning)' }}>Profile Required</p>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>You need to set up your provider profile first before adding services.</p>
                    </div>
                </div>
            )}

            {/* Stats Overview */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Services', value: services.length, icon: Image, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)' },
                        { label: 'Active', value: services.filter(s => s.is_active).length, icon: CheckCircle2, color: 'var(--color-success)', bg: 'rgba(var(--color-success),0.12)' },
                        { label: 'Inactive', value: services.filter(s => !s.is_active).length, icon: EyeOff, color: 'var(--color-text-muted)', bg: 'var(--color-surface-high)' },
                        { label: 'Avg Price', value: `$${services.length ? Math.round(services.reduce((s, v) => s + Number(v.price || 0), 0) / services.length) : 0}`, icon: DollarSign, color: 'var(--color-accent)', bg: 'rgba(var(--color-accent),0.12)' },
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

            {/* Services List */}
            {services.length === 0 ? (
                <div className="rounded-2xl p-12 text-center shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <Image className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--color-text-subtle)' }} />
                    <h2 className="font-bold text-lg mb-1" style={{ color: 'var(--color-primary)' }}>No services yet</h2>
                    <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>Add your first service to start receiving bookings</p>
                    <button className="inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold transition-all"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                        onClick={() => { setForm(EMPTY); setEditId(null); setOpen(true); }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                        <Plus className="h-4 w-4" />
                        Add Your First Service
                    </button>
                </div>
            ) : (
                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    {services.map((s, i) => (
                        <div key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-high/50"
                            style={{ borderBottom: i < services.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                {s.image_url ? (
                                    <img src={s.image_url} alt="" className="h-12 w-12 rounded-lg object-cover shrink-0" />
                                ) : (
                                    <div className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                                        <Image className="h-4.5 w-4.5" style={{ color: 'var(--color-text-muted)' }} />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--color-primary)' }}>{s.name}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.is_active ? 'bg-success/10 text-success border border-success/20' : 'bg-surface-high text-text-muted border border-border'}`}>
                                            {s.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                        ${s.price} · {s.duration_minutes} min · {CATEGORIES.find(c => c.slug === s.category_slug)?.name || s.category_slug} · {s.type}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button className="h-9 w-9 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                    style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                                    onClick={() => navigate(`/provider/services/${s.id}/variants`)}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.backgroundColor = 'var(--color-surface-high)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.backgroundColor = 'transparent'; }}>
                                    <ChevronRight className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                                </button>
                                <button className="h-9 w-9 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                    style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                                    onClick={() => openEdit(s)}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.backgroundColor = 'var(--color-surface-high)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.backgroundColor = 'transparent'; }}>
                                    <Pencil className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                                </button>
                                <button className="h-9 w-9 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                    style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                                    onClick={() => del(s.id)}
                                    disabled={deletingId === s.id}
                                    onMouseEnter={e => { if (!deletingId) { e.currentTarget.style.borderColor = 'var(--color-error)'; e.currentTarget.style.backgroundColor = 'rgba(var(--color-error),0.05)'; }}}
                                    onMouseLeave={e => { if (!deletingId) { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.backgroundColor = 'transparent'; }}}>
                                    {deletingId === s.id ? <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--color-error)' }} /> : <Trash2 className="h-3.5 w-3.5" style={{ color: 'var(--color-error)' }} />}
                                </button>
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
                    <div className="w-full max-w-lg rounded-2xl p-6 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto"
                        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}>
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>{editId ? 'Edit Service' : 'Add Service'}</h2>
                            <button onClick={closeDialog}
                                className="h-8 w-8 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                style={{ color: 'var(--color-text-subtle)', backgroundColor: 'transparent', border: 'none' }}
                                aria-label="Close dialog">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-text-subtle)' }}>Service Photo (optional)</label>
                            <div className="h-32 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-colors relative"
                                style={{ borderColor: 'var(--color-border-strong)', backgroundColor: 'var(--color-surface-high)' }}
                                onClick={() => imgRef.current.click()}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-border-accent)')}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}>
                                {form.image_url ? (
                                    <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                                ) : uploadingImg ? (
                                    <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-border-strong)', borderTopColor: 'var(--color-primary)' }} />
                                ) : (
                                    <div className="text-center">
                                        <Upload className="h-7 w-7 mx-auto mb-1" style={{ color: 'var(--color-text-subtle)' }} />
                                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Click to upload photo</p>
                                    </div>
                                )}
                            </div>
                            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleImageUpload(e.target.files[0])} />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-text-subtle)' }}>Service Name *</label>
                            <input 
                                placeholder="e.g. Deep House Cleaning"
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
                                placeholder="Describe what this service includes..."
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--color-text-subtle)' }}>Category *</label>
                                <select value={form.category_slug} onChange={e => setForm(p => ({ ...p, category_slug: e.target.value }))}
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
                                    {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                                </select>
                            </div>
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
                                    <option value="appointment">Appointment</option>
                                    <option value="slot">Time Slot</option>
                                    <option value="pickup">Pickup</option>
                                    <option value="reservation">Reservation</option>
                                    <option value="on_demand">On Demand</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--color-text-subtle)' }}>Price ($) *</label>
                                <input 
                                    type="number" min="0" step="1"
                                    placeholder="0"
                                    value={form.price}
                                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
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
                                <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--color-text-subtle)' }}>Duration (min) *</label>
                                <input 
                                    type="number" min="15" step="15"
                                    placeholder="30"
                                    value={form.duration_minutes}
                                    onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))}
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
                                    aria-checked={form.is_active}
                                    onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                                    className={`relative h-5 w-9 rounded-full flex items-center transition-all ${form.is_active ? 'bg-primary' : 'bg-surface-high border border-border'}`}
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
                            <button className="flex-1 h-10 rounded-xl font-semibold transition-all"
                                style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                                onClick={closeDialog}>
                                Cancel
                            </button>
                            <button className="flex-1 h-10 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                                onClick={save} 
                                disabled={saving || !form.name || !form.price || !form.category_slug}>
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : editId ? (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Update Service
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        Create Service
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