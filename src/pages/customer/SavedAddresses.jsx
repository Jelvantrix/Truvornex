import { useState, useEffect } from 'react';
import { MapPin, Plus, Pencil, Trash2, Home, Briefcase, Check, CheckCircle2, Loader2, Shield, MapPin as MapPinIcon, Building2, Star, Zap, Heart, Eye, Shield as ShieldIcon, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const ADDR_TYPES = [
    { value: 'home',  label: 'Home',  icon: Home, color: 'var(--color-primary)' },
    { value: 'work',  label: 'Work',  icon: Briefcase, color: 'var(--color-accent)' },
    { value: 'other', label: 'Other', icon: MapPinIcon, color: 'var(--color-text-muted)' },
];

export default function SavedAddresses() {
    const [addresses, setAddresses] = useState([]);
    const [dialog, setDialog] = useState(false);
    const [form, setForm] = useState({ label: 'home', address: '', notes: '' });
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [showDetails, setShowDetails] = useState({});

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('saved_addresses') || '[]');
        setAddresses(stored);
    }, []);

    const save = async () => {
        if (!form.address.trim()) { toast.error('Address is required'); return; }
        setSaving(true);
        await new Promise(r => setTimeout(r, 300));
        
        let updated;
        if (editId) {
            updated = addresses.map(a => a.id === editId ? { ...a, ...form } : a);
        } else {
            updated = [...addresses, { ...form, id: Date.now().toString() }];
        }
        setAddresses(updated);
        localStorage.setItem('saved_addresses', JSON.stringify(updated));
        toast.success(editId ? 'Address updated' : 'Address saved');
        setDialog(false); setEditId(null);
        setForm({ label: 'home', address: '', notes: '' });
        setSaving(false);
    };

    const del = async (id) => {
        setDeletingId(id);
        await new Promise(r => setTimeout(r, 300));
        const updated = addresses.filter(a => a.id !== id);
        setAddresses(updated);
        localStorage.setItem('saved_addresses', JSON.stringify(updated));
        toast.success('Address removed');
        setDeletingId(null);
    };

    const openEdit = (a) => {
        setForm({ label: a.label, address: a.address, notes: a.notes || '' });
        setEditId(a.id); setDialog(true);
    };

    const openAdd = () => {
        setEditId(null); 
        setForm({ label: 'home', address: '', notes: '' });
        setDialog(true);
    };

    const typeInfo = (label) => ADDR_TYPES.find(t => t.value === label) || ADDR_TYPES[2];

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Saved Addresses</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Quick-fill your addresses when booking services</p>
            </div>

            {/* Stats Overview */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { value: addresses.length, label: 'Total Saved', icon: MapPin, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)' },
                        { value: addresses.filter(a => a.is_default).length || 0, label: 'Default Set', icon: CheckCircle2, color: 'var(--color-success)', bg: 'rgba(var(--color-success),0.12)' },
                        { value: new Set(addresses.map(a => a.label)).size, label: 'Types Used', icon: Building2, color: 'var(--color-accent)', bg: 'rgba(var(--color-accent),0.12)' },
                        { value: 'Unlimited', label: 'Storage', icon: Star, color: 'var(--color-warning)', bg: 'rgba(var(--color-warning),0.12)' },
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

            {/* Addresses List or Empty State */}
            {addresses.length === 0 ? (
                <div className="rounded-2xl p-8 text-center shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 card-lightning-subtle"
                        style={{ backgroundColor: 'rgba(var(--color-primary), 0.12)' }}>
                        <MapPin className="h-7 w-7" style={{ color: 'var(--color-text-subtle)' }} />
                    </div>
                    <h2 className="font-bold text-lg mb-1" style={{ color: 'var(--color-primary)' }}>No saved addresses yet</h2>
                    <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>Add your first address to speed up future bookings</p>
                    <button 
                        onClick={openAdd}
                        className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold transition-all"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                        <Plus className="h-4 w-4" />
                        Add Your First Address
                    </button>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {addresses.map((a, _index) => {
                            const t = typeInfo(a.label);
                            const Icon = t.icon;
                            const isDeleting = deletingId === a.id;
                            const showDetail = showDetails[a.id];
                            
                            return (
                                <div key={a.id} className="rounded-xl p-5 transition-all hover-lift card-lightning-subtle"
                                    style={{ 
                                        backgroundColor: 'var(--color-surface)', 
                                        border: `1px solid var(--color-border)`,
                                        boxShadow: 'var(--shadow-sm)'
                                    }}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                                                style={{ backgroundColor: t.color + '15', border: `1px solid ${t.color}30` }}>
                                                <Icon className="h-5 w-5" style={{ color: t.color }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className="font-semibold text-base" style={{ color: 'var(--color-primary)' }}>
                                                        {t.label}
                                                    </span>
                                                    {a.is_default && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                                                            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                                                            <Check className="h-3 w-3" /> Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm truncate" style={{ color: 'var(--color-text-muted)' }}>{a.address}</p>
                                                {a.notes && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-subtle)' }}>{a.notes}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button 
                                                className="h-9 w-9 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                                style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                                                onClick={() => setShowDetails(prev => ({ ...prev, [a.id]: !showDetail }))}
                                                aria-label={showDetail ? 'Hide details' : 'Show details'}>
                                                <Eye className="h-4 w-4" style={{ color: showDetail ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                                            </button>
                                            <button 
                                                className="h-9 w-9 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                                style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                                                onClick={() => openEdit(a)}
                                                aria-label="Edit address">
                                                <Pencil className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                                            </button>
                                            <button 
                                                className="h-9 w-9 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                                style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                                                onClick={() => del(a.id)}
                                                disabled={isDeleting}
                                                aria-label="Delete address">
                                                {isDeleting ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--color-error)' }} />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" style={{ color: 'var(--color-error)' }} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {showDetail && (
                                        <div className="mt-4 pt-4 border-t animate-fade-in" style={{ borderColor: 'var(--color-border)' }}>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <div className="rounded-xl p-3 card-lightning-subtle"
                                                    style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Type</p>
                                                    <div className="flex items-center gap-2">
                                                        <Icon className="h-4 w-4" style={{ color: t.color }} />
                                                        <span className="font-medium" style={{ color: 'var(--color-primary)' }}>{t.label}</span>
                                                    </div>
                                                </div>
                                                <div className="rounded-xl p-3 card-lightning-subtle"
                                                    style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Default</p>
                                                    <div className="flex items-center gap-2">
                                                        {a.is_default ? (
                                                            <>
                                                                <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
                                                                <span className="font-medium" style={{ color: 'var(--color-success)' }}>Yes</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <RotateCcw className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                                                                <span className="font-medium" style={{ color: 'var(--color-text-muted)' }}>No</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="rounded-xl p-3 card-lightning-subtle"
                                                    style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Usage</p>
                                                    <div className="flex items-center gap-2">
                                                        <ShieldIcon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                                                        <span className="font-medium" style={{ color: 'var(--color-primary)' }}>Booking ready</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Add New Address Button */}
                    <button 
                        onClick={openAdd}
                        className="w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                        style={{ backgroundColor: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-border-strong)', cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.backgroundColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-on-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-primary)'; }}>
                        <Plus className="h-4 w-4" />
                        Add Another Address
                    </button>
                </>
            )}

            {/* Tips & Benefits */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Tips & Benefits</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: Zap, title: 'Faster Bookings', desc: 'Pre-filled addresses save 30+ seconds per booking' },
                        { icon: Shield, title: 'Accurate Dispatch', desc: 'Providers get exact location for quicker arrival' },
                        { icon: Heart, title: 'Multiple Types', desc: 'Save home, work, and other frequent locations' },
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

            {/* Dialog */}
            {dialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
                    onClick={e => e.target === e.currentTarget && setDialog(false)}>
                    <div className="w-full max-w-md rounded-2xl p-6 space-y-5 animate-scale-in"
                        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}>
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>
                                {editId ? 'Edit' : 'Add'} Address
                            </h2>
                            <button 
                                onClick={() => { setDialog(false); setEditId(null); setForm({ label: 'home', address: '', notes: '' }); }}
                                className="h-8 w-8 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                style={{ color: 'var(--color-text-subtle)', backgroundColor: 'transparent', border: 'none' }}
                                aria-label="Close dialog">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-text-subtle)' }}>Type</label>
                            <div className="flex gap-2" role="radiogroup">
                                {ADDR_TYPES.map(t => {
                                    const active = form.label === t.value;
                                    return (
                                        <button 
                                            key={t.value} 
                                            onClick={() => setForm(p => ({ ...p, label: t.value }))}
                                            role="radio"
                                            aria-checked={active}
                                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all card-lightning-subtle"
                                            style={{
                                                backgroundColor: active ? t.color : 'var(--color-surface-high)',
                                                color: active ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
                                                border: `1px solid ${active ? t.color : 'var(--color-border-strong)'}`,
                                                cursor: 'pointer',
                                            }}>
                                            <span className="flex items-center justify-center gap-2">
                                                <t.icon className="h-4 w-4" />
                                                {t.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <input 
                            placeholder="Full address *" 
                            value={form.address}
                            onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
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
                        <input 
                            placeholder="Notes (optional - e.g. 'Apartment 4B', 'Gate code 1234')" 
                            value={form.notes}
                            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                            className="input-lightning w-full px-4 py-3.5 rounded-xl text-base outline-none"
                            style={{ 
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border-strong)',
                                color: 'var(--color-text)',
                                fontSize: '15px',
                                fontFamily: 'Inter,sans-serif',
                            }}
                            onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-accent)')}
                            onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')} />

                        <div className="flex gap-3 pt-2">
                            <button 
                                className="flex-1 h-10 rounded-xl font-semibold transition-all"
                                style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                                onClick={() => { setDialog(false); setEditId(null); setForm({ label: 'home', address: '', notes: '' }); }}>
                                Cancel
                            </button>
                            <button 
                                className="flex-1 h-10 rounded-xl font-semibold transition-all"
                                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                                onClick={save} 
                                disabled={saving || !form.address.trim()}>
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : editId ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Update Address
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        Save Address
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