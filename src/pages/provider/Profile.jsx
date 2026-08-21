import { useState, useRef } from 'react';
import { Camera, MapPin, Navigation, CheckCircle2, Image, X, Info, Loader2, Shield, Star, MapPin as MapPinIcon, Save, Upload, Building2, AlertTriangle, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function ProviderProfile() {
    const [provider, setProvider] = useState(null);
    const [form, setForm] = useState({ 
        business_name: '', 
        description: '', 
        phone: '', 
        address: '', 
        city: '', 
        latitude: 40.7128, 
        longitude: -74.0060, 
        service_radius_km: 10,
        category_slugs: [],
        chat_enabled: false,
        logo_url: '',
        cover_image: '',
        verified: false
    });
    const [saving, setSaving] = useState(false);
    const [creating, setCreating] = useState(true);
    const [categories] = useState([
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
    ]);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const logoRef = useRef();
    const coverRef = useRef();

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const toggleCategory = (slug) => {
        const current = form.category_slugs || [];
        set('category_slugs', current.includes(slug) ? current.filter(s => s !== slug) : [...current, slug]);
    };

    const getMyLocation = () => {
        if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                set('latitude', latitude); set('longitude', longitude);
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                    const data = await res.json();
                    const city = data.address?.city || data.address?.town || data.address?.village || '';
                    const address = data.display_name?.split(',').slice(0, 3).join(',') || '';
                    if (city) set('city', city);
                    if (address) set('address', address);
                } catch (_) { }
                setGeoLoading(false);
                toast.success('Location updated!');
            },
            () => { setGeoLoading(false); toast.error('Could not get location'); },
            { enableHighAccuracy: true }
        );
    };

    const save = async () => {
        if (!form.business_name) { toast.error('Business name is required'); return; }
        if ((form.category_slugs || []).length === 0) { toast.error('Select at least one category'); return; }
        setSaving(true);
        await new Promise(r => setTimeout(r, 600));
        if (creating) {
            setProvider({ ...form, status: 'pending', created_at: new Date().toISOString() });
            setCreating(false);
            toast.success('Profile created! Pending admin approval.');
        } else {
            setProvider({ ...provider, ...form });
            toast.success('Profile saved!');
        }
        setSaving(false);
    };

    const handleImageUpload = async (file, field, setUploading) => {
        setUploading(true);
        await new Promise(r => setTimeout(r, 1000));
        const reader = new FileReader();
        reader.onload = (e) => { set(field, e.target.result); setUploading(false); toast.success(`${field === 'logo_url' ? 'Logo' : 'Cover photo'} uploaded!`); };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>
                        {creating ? 'Set Up Your Business' : 'Business Profile'}
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        {creating ? 'Fill in your details to start receiving bookings' : 'Manage your business profile and settings'}
                    </p>
                </div>
            </div>

            {/* Creating Info Banner */}
            {creating && (
                <div className="rounded-xl p-4 shimmer" style={{ backgroundColor: 'rgba(var(--color-info),0.08)', border: '1px solid rgba(var(--color-info),0.2)' }}>
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 shrink-0 mt-0.5" style={{ color: 'var(--color-info)' }} />
                        <div>
                            <p className="font-semibold text-sm" style={{ color: 'var(--color-info)' }}>Welcome to Truvornex!</p>
                            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                Once submitted, our team will review and approve your profile within 24 hours. 
                                You can edit your profile anytime after approval.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Overview (when not creating) */}
            {!creating && provider && (
                <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Status', value: provider.status || 'pending', icon: Shield, color: provider.status === 'approved' ? 'var(--color-success)' : 'var(--color-warning)', bg: provider.status === 'approved' ? 'rgba(var(--color-success),0.12)' : 'rgba(var(--color-warning),0.12)' },
                            { label: 'Categories', value: (form.category_slugs || []).length, icon: Building2, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)' },
                            { label: 'Service Radius', value: `${form.service_radius_km || 10} km`, icon: MapPinIcon, color: 'var(--color-accent)', bg: 'rgba(var(--color-accent),0.12)' },
                            { label: 'Chat', value: form.chat_enabled ? 'Enabled' : 'Disabled', icon: Star, color: form.chat_enabled ? 'var(--color-success)' : 'var(--color-text-muted)', bg: form.chat_enabled ? 'rgba(var(--color-success),0.12)' : 'rgba(var(--color-text-muted),0.12)' },
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
            )}

            {/* Cover Photo & Logo */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                {/* Cover Photo */}
                <div className="relative h-36 cursor-pointer group"
                    style={{ backgroundColor: 'var(--color-surface-high)' }}
                    onClick={() => coverRef.current.click()}>
                    {form.cover_image ? (
                        <img src={form.cover_image} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            <Image className="h-7 w-7" style={{ color: 'var(--color-text-subtle)' }} />
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Click to add cover photo</span>
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                        {uploadingCover
                            ? <Loader2 className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <Upload className="h-6 w-6 text-white" />}
                        <span className="sr-only">{uploadingCover ? 'Uploading...' : 'Upload cover photo'}</span>
                    </div>
                    <input ref={coverRef} type="file" accept="image/*" className="hidden"
                        onChange={e => e.target.files[0] && handleImageUpload(e.target.files[0], 'cover_image', setUploadingCover)} />
                </div>

                {/* Logo */}
                <div className="px-5 pb-5 -mt-9 relative">
                    <div className="relative inline-block">
                        <div className="h-18 w-18 rounded-2xl overflow-hidden cursor-pointer group"
                            style={{ width: 72, height: 72, border: '3px solid var(--color-surface)', backgroundColor: 'var(--color-surface-high)', boxShadow: 'var(--shadow-md)' }}
                            onClick={() => logoRef.current.click()}>
                            {form.logo_url ? (
                                <img src={form.logo_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="font-black text-2xl" style={{ color: 'var(--color-text-muted)' }}>
                                        {form.business_name?.[0]?.toUpperCase() || '?'}
                                    </span>
                                </div>
                            )}
                            <div className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                                {uploadingLogo
                                    ? <Loader2 className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : <Upload className="h-4 w-4 text-white" />}
                            </div>
                        </div>
                        {form.verified && (
                            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: 'var(--color-success)', border: '2px solid var(--color-surface)' }}>
                                <CheckCircle2 className="h-3 w-3" style={{ color: 'var(--color-on-primary)' }} />
                            </div>
                        )}
                        <input ref={logoRef} type="file" accept="image/*" className="hidden"
                            onChange={e => e.target.files[0] && handleImageUpload(e.target.files[0], 'logo_url', setUploadingLogo)} />
                    </div>
                    
                    <div className="mt-4 ml-24 flex items-center gap-4">
                        <h2 className="font-bold text-xl" style={{ color: 'var(--color-primary)' }}>{form.business_name || 'Your Business Name'}</h2>
                        <button className="h-9 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                            style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                            onClick={() => logoRef.current.click()}
                            disabled={uploadingLogo}
                            onMouseEnter={e => { if (!uploadingLogo) { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}}
                            onMouseLeave={e => { if (!uploadingLogo) { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}}>
                            <Camera className="h-3.5 w-3.5" />
                            Update Logo
                        </button>
                        <button className="h-9 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                            style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                            onClick={() => coverRef.current.click()}
                            disabled={uploadingCover}
                            onMouseEnter={e => { if (!uploadingCover) { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}}
                            onMouseLeave={e => { if (!uploadingCover) { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}} >
                            <Image className="h-3.5 w-3.5" />
                            Update Cover
                        </button>
                    </div>
                </div>
            </div>

            {/* Business Info */}
            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <h2 className="font-semibold mb-5" style={{ color: 'var(--color-primary)' }}>Business Information</h2>
                <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-text-subtle)' }}>Business Name *</label>
                            <input 
                                type="text" 
                                value={form.business_name}
                                onChange={e => set('business_name', e.target.value)}
                                placeholder="e.g. John's Plumbing"
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
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-text-subtle)' }}>Phone Number</label>
                            <input 
                                type="tel" 
                                value={form.phone}
                                onChange={e => set('phone', e.target.value)}
                                placeholder="+1 (555) 000-0000"
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
                    
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-text-subtle)' }}>Description</label>
                        <textarea 
                            value={form.description}
                            onChange={e => set('description', e.target.value)}
                            placeholder="Tell customers what makes your business special — services offered, years of experience, specialties..."
                            rows={4}
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
                </div>
            </div>

            {/* Location */}
            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-semibold" style={{ color: 'var(--color-primary)' }}>Service Location</h2>
                    <button 
                        className="h-9 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                        style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                        onClick={getMyLocation} 
                        disabled={geoLoading}
                        onMouseEnter={e => { if (!geoLoading) { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}}
                        onMouseLeave={e => { if (!geoLoading) { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}} >
                        <Navigation className={`h-3.5 w-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
                        {geoLoading ? 'Getting...' : 'Use My Location'}
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-text-subtle)' }}>Address *</label>
                        <input 
                            type="text" 
                            value={form.address}
                            onChange={e => set('address', e.target.value)}
                            placeholder="123 Main Street"
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
                            required
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-text-subtle)' }}>City</label>
                        <input 
                            type="text" 
                            value={form.city}
                            onChange={e => set('city', e.target.value)}
                            placeholder="New York"
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block flex items-center gap-1" style={{ color: 'var(--color-text-subtle)' }}>
                            <MapPin className="h-3 w-3" /> Latitude
                        </label>
                        <input 
                            type="number" step="any" 
                            value={form.latitude}
                            onChange={e => set('latitude', Number(e.target.value))}
                            className="input-lightning w-full px-4 py-3.5 rounded-xl text-base outline-none font-mono text-sm"
                            style={{ 
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border-strong)',
                                color: 'var(--color-text)',
                                fontSize: '14px',
                                fontFamily: 'monospace',
                            }}
                            onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-accent)')}
                            onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block flex items-center gap-1" style={{ color: 'var(--color-text-subtle)' }}>
                            <MapPin className="h-3 w-3" /> Longitude
                        </label>
                        <input 
                            type="number" step="any" 
                            value={form.longitude}
                            onChange={e => set('longitude', Number(e.target.value))}
                            className="input-lightning w-full px-4 py-3.5 rounded-xl text-base outline-none font-mono text-sm"
                            style={{ 
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border-strong)',
                                color: 'var(--color-text)',
                                fontSize: '14px',
                                fontFamily: 'monospace',
                            }}
                            onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-accent)')}
                            onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-text-subtle)' }}>Service Radius (km)</label>
                    <input 
                        type="number" min="1" max="100"
                        value={form.service_radius_km}
                        onChange={e => set('service_radius_km', Math.max(1, Math.min(100, Number(e.target.value)) || 10))}
                        className="input-lightning w-full max-w-xs px-4 py-3.5 rounded-xl text-base outline-none"
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

            {/* Service Categories */}
            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <h2 className="font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>Service Categories</h2>
                <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
                    Select all categories that describe your services. This determines where you appear in searches.
                </p>
                <div className="flex flex-wrap gap-2">
                    {categories.map(c => {
                        const sel = (form.category_slugs || []).includes(c.slug);
                        return (
                            <button key={c.slug} onClick={() => toggleCategory(c.slug)}
                                className="px-4 py-2 rounded-xl text-sm font-medium transition-all card-lightning-subtle whitespace-nowrap"
                                style={{
                                    backgroundColor: sel ? 'var(--color-primary)' : 'var(--color-surface-high)',
                                    color: sel ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
                                    border: `1px solid ${sel ? 'transparent' : 'var(--color-border)'}`,
                                }}
                                onMouseEnter={e => { if (!sel) { e.currentTarget.style.backgroundColor = 'var(--color-surface)'; e.currentTarget.style.borderColor = 'var(--color-border-strong)'; }}}
                                onMouseLeave={e => { if (!sel) { e.currentTarget.style.backgroundColor = 'var(--color-surface-high)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}} >
                                {sel && <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                                {c.name}
                            </button>
                        );
                    })}
                </div>
                {(form.category_slugs || []).length === 0 && (
                    <div className="flex items-start gap-2 rounded-xl p-3 mt-3"
                        style={{ backgroundColor: 'rgba(var(--color-warning),0.1)', border: '1px solid rgba(var(--color-warning),0.2)' }}>
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-warning)' }}>
                            Please select at least one category so customers can find you.
                        </span>
                    </div>
                )}
            </div>

            {/* Settings */}
            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <h2 className="font-semibold mb-5" style={{ color: 'var(--color-primary)' }}>Settings</h2>
                <div className="flex items-center justify-between gap-4 py-3">
                    <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--color-primary)' }}>Enable Chat</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Allow customers to message you directly through the platform</p>
                    </div>
                    <button 
                        role="switch" 
                        aria-checked={form.chat_enabled}
                        onClick={() => set('chat_enabled', !form.chat_enabled)}
                        className={`relative h-6 w-11 rounded-full flex items-center transition-all ${
                            form.chat_enabled ? 'bg-primary' : 'bg-surface-high border border-border'
                        }`}
                        style={{
                            backgroundColor: form.chat_enabled ? 'var(--color-primary)' : 'var(--color-surface-high)',
                            border: form.chat_enabled ? 'none' : '1px solid var(--color-border)',
                        }}
                    >
                        <span className={`absolute h-4 w-4 rounded-full transition-transform flex items-center justify-center ${form.chat_enabled ? 'translate-x-6' : 'translate-x-1'}`}
                            style={{
                                backgroundColor: form.chat_enabled ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
                                border: form.chat_enabled ? 'none' : '1px solid var(--color-border)',
                            }}>
                            {form.chat_enabled && <CheckCircle2 className="h-2.5 w-2.5" />}
                        </span>
                    </button>
                </div>
            </div>

            {/* Status Banner */}
            {provider && provider.status !== 'approved' && (
                <div className="rounded-xl p-4 shimmer" style={{ 
                    backgroundColor: provider.status === 'pending' ? 'rgba(var(--color-warning),0.08)' : 
                                   provider.status === 'rejected' ? 'rgba(var(--color-error),0.08)' : 
                                   'var(--color-surface-high)',
                    border: `1px solid ${provider.status === 'pending' ? 'rgba(var(--color-warning),0.2)' : 
                                  provider.status === 'rejected' ? 'rgba(var(--color-error),0.2)' : 
                                  'var(--color-border)'}`
                }}>
                    <div className="flex items-start gap-3">
                        <div className={`h-5 w-5 shrink-0 mt-0.5 ${provider.status === 'pending' ? 'text-warning' : provider.status === 'rejected' ? 'text-error' : 'text-text-muted'}`}>
                            {provider.status === 'pending' && <Loader2 className="animate-spin" />}
                            {provider.status === 'rejected' && <X />}
                            {provider.status === 'suspended' && <Shield />}
                        </div>
                        <div>
                            <p className="text-sm font-medium" style={{ 
                                color: provider.status === 'pending' ? 'var(--color-warning)' : 
                                       provider.status === 'rejected' ? 'var(--color-error)' : 
                                       'var(--color-text-muted)' 
                            }}>
                                {provider.status === 'pending' && '⏳ Profile Under Review'}
                                {provider.status === 'rejected' && '❌ Profile Rejected'}
                                {provider.status === 'suspended' && '⚠️ Profile Suspended'}
                            </p>
                            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                {provider.status === 'pending' && 'Your profile is pending admin review. Usually takes 24 hours.'}
                                {provider.status === 'rejected' && 'Your profile was rejected. Please update your information and save again.'}
                                {provider.status === 'suspended' && 'Your profile is suspended. Contact support for assistance.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <button className="w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                style={{ 
                    backgroundColor: (saving || !form.business_name || (form.category_slugs || []).length === 0) ? 'var(--color-surface-high)' : 'var(--color-primary)', 
                    color: (saving || !form.business_name || (form.category_slugs || []).length === 0) ? 'var(--color-text-muted)' : 'var(--color-on-primary)', 
                    border: (saving || !form.business_name || (form.category_slugs || []).length === 0) ? '1px solid var(--color-border)' : 'none',
                    cursor: (saving || !form.business_name || (form.category_slugs || []).length === 0) ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit'
                }}
                onClick={save} 
                disabled={saving || !form.business_name || (form.category_slugs || []).length === 0}
                onMouseEnter={e => { if (!saving && form.business_name && (form.category_slugs || []).length > 0) e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={e => { if (!saving && form.business_name && (form.category_slugs || []).length > 0) e.currentTarget.style.opacity = '1'; }}>
                {saving ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : creating ? (
                    <>
                        <Save className="h-4 w-4" />
                        Submit Profile for Review
                    </>
                ) : (
                    <>
                        <Save className="h-4 w-4" />
                        Save Changes
                    </>
                )}
            </button>
        </div>
    );
}