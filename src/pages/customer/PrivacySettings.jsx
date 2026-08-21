import { useState } from 'react';
import { Shield, Download, Trash2, User, MapPin, Database, Brain, Mail, Share2, Lock, Eye, AlertCircle, CheckCircle2, Loader2, RefreshCw, Globe, Key, Bell, ChevronRight, BarChart3, Zap, CreditCard, MessageSquare, Target, Wifi, Fingerprint, FileText, RotateCcw, Layers, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

const PRIVACY_ITEMS = [
    { key: 'show_profile', label: 'Show profile to providers', desc: 'Providers can see your name and profile photo when you book', icon: User, category: 'visibility' },
    { key: 'share_location', label: 'Share location for nearby', desc: 'Allow the app to detect your location for nearby providers', icon: MapPin, category: 'visibility' },
    { key: 'analytics_tracking', label: 'Analytics tracking', desc: 'Help improve the app with anonymous usage data', icon: Database, category: 'data' },
    { key: 'personalized_recs', label: 'Personalized recommendations', desc: 'Use your booking history to suggest relevant services', icon: Brain, category: 'data' },
    { key: 'marketing_emails', label: 'Marketing communications', desc: 'Receive promotional offers and platform news', icon: Mail, category: 'communication' },
    { key: 'data_to_providers', label: 'Share data with providers', desc: 'Allow providers to see your booking patterns for better service', icon: Share2, category: 'data' },
];

const CATEGORIES = [
    { id: 'visibility', label: 'Profile Visibility', icon: Eye, color: 'var(--color-primary)' },
    { id: 'data', label: 'Data & Analytics', icon: Database, color: 'var(--color-accent)' },
    { id: 'communication', label: 'Communications', icon: Mail, color: 'var(--color-success)' },
];

const THIRD_PARTY_SERVICES = [
    { name: 'Google Analytics', desc: 'Anonymous usage analytics', enabled: true, category: 'analytics', icon: Globe },
    { name: 'Mixpanel', desc: 'Product analytics & events', enabled: false, category: 'analytics', icon: BarChart3 },
    { name: 'Intercom', desc: 'Customer support chat', enabled: true, category: 'support', icon: MessageSquare },
    { name: 'Stripe', desc: 'Payment processing', enabled: true, category: 'payments', icon: CreditCard },
    { name: 'SendGrid', desc: 'Transactional emails', enabled: true, category: 'emails', icon: Mail },
    { name: 'Firebase', desc: 'Push notifications & auth', enabled: true, category: 'infrastructure', icon: Zap },
];

const COOKIE_CATEGORIES = [
    { key: 'essential', label: 'Essential Cookies', desc: 'Required for the website to function properly (always enabled)', icon: Shield, color: 'var(--color-success)', bg: 'rgba(var(--color-success), 0.12)', required: true },
    { key: 'analytics', label: 'Analytics Cookies', desc: 'Help us understand how visitors interact with our website', icon: BarChart3, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary), 0.12)', required: false, settingKey: 'analytics_tracking' },
    { key: 'marketing', label: 'Marketing Cookies', desc: 'Used to deliver personalized advertisements', icon: Target, color: 'var(--color-warning)', bg: 'rgba(var(--color-warning), 0.12)', required: false, settingKey: 'marketing_emails' },
    { key: 'functional', label: 'Functional Cookies', desc: 'Enable enhanced functionality and personalization', icon: Zap, color: 'var(--color-accent)', bg: 'rgba(var(--color-accent), 0.12)', required: false, settingKey: 'personalized_recs' },
];

export default function PrivacySettings() {
    const [settings, setSettings] = useState(() => ({
        show_profile: true, 
        share_location: true, 
        analytics_tracking: false,
        personalized_recs: true, 
        marketing_emails: false, 
        data_to_providers: true,
        ...JSON.parse(localStorage.getItem('privacy_settings') || '{}'),
    }));
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [exporting, setExporting] = useState(false);

    const toggle = (key) => setSettings(p => ({ ...p, [key]: !p[key] }));

    const save = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 800));
        localStorage.setItem('privacy_settings', JSON.stringify(settings));
        toast.success('Privacy settings saved');
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const exportData = async () => {
        setExporting(true);
        await new Promise(r => setTimeout(r, 1500));
        setExporting(false);
        toast.success('Your data export is ready for download');
    };

    const filteredItems = activeCategory === 'all' 
        ? PRIVACY_ITEMS 
        : PRIVACY_ITEMS.filter(item => item.category === activeCategory);

    const enabledCount = Object.values(settings).filter(Boolean).length;
    const totalCount = Object.keys(settings).length;

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Privacy Settings</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Control what data you share and who can see it</p>
                </div>
                <button 
                    className="h-11 px-5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}
                    onClick={save} 
                    disabled={saving}>
                    {saving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : saved ? (
                        <>
                            <CheckCircle2 className="h-4 w-4" />
                            Saved
                        </>
                    ) : (
                        <>
                            <Shield className="h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            {/* Stats Overview */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { value: `${enabledCount}/${totalCount}`, label: 'Settings Enabled', icon: CheckCircle2, color: 'var(--color-success)', bg: 'rgba(var(--color-success), 0.12)', trend: 'Protected', trendUp: true },
                        { value: '3', label: 'Categories', icon: Shield, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary), 0.12)' },
                        { value: 'Active', label: 'Protection Status', icon: Lock, color: 'var(--color-accent)', bg: 'rgba(var(--color-accent), 0.12)' },
                        { value: 'Full', label: 'GDPR/CCPA Compliance', icon: AlertCircle, color: 'var(--color-warning)', bg: 'rgba(var(--color-warning), 0.12)' },
                    ].map((stat, i) => (
                        <div key={i} className="rounded-xl p-4 text-center shimmer"
                            style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xs)' }}>
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-2 card-lightning-subtle"
                                style={{ backgroundColor: stat.bg }}>
                                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                            </div>
                            <p className="font-black text-2xl" style={{ color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>{stat.value}</p>
                            <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</p>
                            {stat.trend && (
                                <p className={`text-[10px] mt-1 flex items-center justify-center gap-1 ${stat.trendUp ? 'text-success' : 'text-error'}`}>
                                    {stat.trendUp && <CheckCircle2 className="h-3 w-3" />}
                                    {stat.trend}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6 card-lightning-subtle p-1 rounded-xl"
                style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeCategory === 'all' 
                            ? 'btn-lightning' 
                            : 'text-text-muted hover:text-text hover:bg-surface-high'
                    }`}
                    style={{
                        color: activeCategory === 'all' ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
                        backgroundColor: activeCategory === 'all' ? 'var(--color-primary)' : 'transparent'
                    }}
                >
                    All Settings
                </button>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeCategory === cat.id 
                                ? 'btn-lightning-ai' 
                                : 'text-text-muted hover:text-text hover:bg-surface-high'
                        }`}
                        style={{
                            color: activeCategory === cat.id ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
                            backgroundColor: activeCategory === cat.id ? cat.color : 'transparent'
                        }}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Privacy Settings Table */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--color-surface-high)' }}>
                                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider sticky left-0 z-10"
                                    style={{ 
                                        color: 'var(--color-text-subtle)', 
                                        borderBottom: '1px solid var(--color-border)',
                                        backgroundColor: 'var(--color-surface-high)',
                                        width: '40%'
                                    }}>
                                    Privacy Setting
                                </th>
                                <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider sticky left-0 z-10"
                                    style={{ 
                                        color: 'var(--color-text-subtle)', 
                                        borderBottom: '1px solid var(--color-border)',
                                        backgroundColor: 'var(--color-surface-high)',
                                        width: '40%'
                                    }}>
                                    Description
                                </th>
                                <th className="text-center px-5 py-3.5 text-xs font-bold uppercase tracking-wider sticky left-0 z-10"
                                    style={{ 
                                        color: 'var(--color-text-subtle)', 
                                        borderBottom: '1px solid var(--color-border)',
                                        backgroundColor: 'var(--color-surface-high)',
                                        width: '120px'
                                    }}>
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item, i) => (
                                <tr key={item.key} className="hover:bg-surface-high/50 transition-colors duration-150"
                                    style={{ 
                                        backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--color-surface-low)',
                                        borderBottom: '1px solid var(--color-border)'
                                    }}>
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                                            style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                                            <item.icon className="h-4.5 w-4.5" style={{ color: 'var(--color-text-muted)' }} />
                                        </div>
                                        <div>
                                            <p className="font-medium" style={{ color: 'var(--color-primary)' }}>{item.label}</p>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                style={{ 
                                                    backgroundColor: 'var(--color-surface-high)', 
                                                    color: 'var(--color-text-muted)',
                                                    border: '1px solid var(--color-border)'
                                                }}>
                                                {item.category}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{item.desc}</p>
                                </td>
                                <td className="px-5 py-4 text-center">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!settings[item.key]}
                                            onChange={() => toggle(item.key)}
                                            disabled={saving}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2 peer-focus:ring-offset-surface"
                                            style={{ 
                                                backgroundColor: settings[item.key] ? 'var(--color-primary)' : 'var(--color-border-strong)' 
                                            }}>
                                            <span className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                                                style={{ 
                                                    transform: settings[item.key] ? 'translateX(20px)' : 'translateX(0)' 
                                                }} />
                                        </div>
                                    </label>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredItems.length === 0 && (
                    <div className="text-center py-12">
                        <Shield className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--color-text-subtle)' }} />
                        <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>No settings in this category</p>
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>All privacy controls are organized by category</p>
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Data Management</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            {/* Data Export & Deletion */}
            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="mb-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Your Data</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Download or delete your personal data — you're in control</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl p-5 transition-all hover-lift card-lightning-subtle relative h-full"
                        style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                        <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}>
                            <Download className="h-3 w-3" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <div className="flex items-start gap-4 mb-4">
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                                style={{ backgroundColor: 'rgba(var(--color-primary), 0.12)' }}>
                                <Download className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold" style={{ color: 'var(--color-primary)' }}>Download Your Data</h3>
                                <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                    Get a complete copy of your personal data in JSON format including bookings, messages, preferences, and account info.
                                </p>
                            </div>
                        </div>
                        <button 
                            className="w-full h-11 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                            style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)', cursor: 'pointer' }}
                            onClick={exportData}
                            disabled={exporting}
                            onMouseEnter={e => { if (!exporting) { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }} }
                            onMouseLeave={e => { if (!exporting) { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }} }>
                            {exporting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Preparing Export…
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4" />
                                    Export Data (JSON)
                                </>
                            )}
                        </button>
                        <p className="text-xs mt-3 text-center" style={{ color: 'var(--color-text-subtle)' }}>
                            Includes: Profile, Bookings, Messages, Preferences, Payment History, Addresses
                        </p>
                    </div>

                    <div className="rounded-xl p-5 transition-all hover-lift card-lightning-subtle relative h-full"
                        style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid rgba(var(--color-error), 0.3)' }}>
                        <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-error)', opacity: 0.1 }}>
                            <Trash2 className="h-3 w-3" style={{ color: 'var(--color-error)' }} />
                        </div>
                        <div className="flex items-start gap-4 mb-4">
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                                style={{ backgroundColor: 'rgba(var(--color-error), 0.12)' }}>
                                <Trash2 className="h-6 w-6" style={{ color: 'var(--color-error)' }} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold" style={{ color: 'var(--color-error)' }}>Delete Account</h3>
                                <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                    Permanently delete your account and all associated data. This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <button 
                            className="w-full h-11 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                            style={{ backgroundColor: 'var(--color-error)', color: '#ffffff', border: 'none', cursor: deleting ? 'not-allowed' : 'pointer' }}
                            onClick={() => toast.error('Account deletion requires email confirmation. Contact support.')}
                            disabled={deleting}>
                            {deleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Deleting…
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4" />
                                    Delete My Account
                                </>
                            )}
                        </button>
                        <p className="text-xs mt-3 text-center" style={{ color: 'var(--color-text-subtle)' }}>
                            This will erase all your data within 30 days per GDPR requirements
                        </p>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Third-Party Access</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            {/* Third Party Access */}
            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="mb-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Connected Services</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Manage which external services have access to your data</p>
                </div>
                <div className="space-y-3">
                    {THIRD_PARTY_SERVICES.map((service, i) => (
                        <div key={service.name} className="rounded-xl p-4 transition-all hover-lift card-lightning-subtle"
                            style={{ backgroundColor: i % 2 === 0 ? 'var(--color-surface-high)' : 'transparent', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                                        style={{ backgroundColor: 'var(--color-surface)' }}>
                                        <service.icon className="h-5 w-5" style={{ color: 'var(--color-text-muted)' }} />
                                    </div>
                                    <div>
                                        <p className="font-medium" style={{ color: 'var(--color-primary)' }}>{service.name}</p>
                                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{service.desc}</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={service.enabled}
                                        onChange={() => toast.info(`${service.name} ${service.enabled ? 'disconnected' : 'connected'}`)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2 peer-focus:ring-offset-surface"
                                        style={{ 
                                            backgroundColor: service.enabled ? 'var(--color-primary)' : 'var(--color-border-strong)' 
                                        }}>
                                        <span className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                                            style={{ 
                                                transform: service.enabled ? 'translateX(20px)' : 'translateX(0)' 
                                            }} />
                                    </div>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(var(--color-warning), 0.12)' }}>
                            <AlertCircle className="h-4 w-4" style={{ color: 'var(--color-warning)' }} />
                        </div>
                        <div>
                            <p className="font-medium text-sm" style={{ color: 'var(--color-primary)' }}>Data Processing Agreement</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                We only share data with processors who have signed DPAs and comply with GDPR/CCPA. 
                                <a href="#" className="underline hover:text-primary">View our processors list</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Security</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            {/* Security Settings */}
            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="mb-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Account Security</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Protect your account with additional security measures</p>
                </div>
                <div className="space-y-4">
                    <div className="rounded-xl p-4 transition-all hover-lift card-lightning-subtle"
                        style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                                    style={{ backgroundColor: 'rgba(var(--color-primary), 0.12)' }}>
                                    <Key className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                                </div>
                                <div>
                                    <h3 className="font-semibold" style={{ color: 'var(--color-primary)' }}>Two-Factor Authentication</h3>
                                    <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Add an extra layer of security with authenticator app or SMS</p>
                                </div>
                            </div>
                            <button className="h-10 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shrink-0"
                                style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)', cursor: 'pointer' }}
                                onClick={() => toast.info('2FA setup coming soon')}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                                <Key className="h-3.5 w-3.5" />
                                Set Up 2FA
                            </button>
                        </div>
                    </div>

                    <div className="rounded-xl p-4 transition-all hover-lift card-lightning-subtle"
                        style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                                    style={{ backgroundColor: 'rgba(var(--color-warning), 0.12)' }}>
                                    <Bell className="h-5 w-5" style={{ color: 'var(--color-warning)' }} />
                                </div>
                                <div>
                                    <h3 className="font-semibold" style={{ color: 'var(--color-primary)' }}>Security Alerts</h3>
                                    <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Get notified of suspicious login attempts and account changes</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    checked={true}
                                    onChange={() => toast.info('Security alerts cannot be disabled')}
                                    disabled
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2 peer-focus:ring-offset-surface"
                                    style={{ backgroundColor: 'var(--color-primary)' }}>
                                    <span className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                                        style={{ transform: 'translateX(22px)' }} />
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="rounded-xl p-4 transition-all hover-lift card-lightning-subtle"
                        style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                                    style={{ backgroundColor: 'rgba(var(--color-accent), 0.12)' }}>
                                    <RefreshCw className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
                                </div>
                                <div>
                                    <h3 className="font-semibold" style={{ color: 'var(--color-primary)' }}>Session Management</h3>
                                    <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>View and revoke active sessions on other devices</p>
                                </div>
                            </div>
                            <button className="h-10 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shrink-0"
                                style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)', cursor: 'pointer' }}
                                onClick={() => toast.info('Session management coming soon')}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                                View Sessions
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Cookie Preferences</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            {/* Cookie Settings */}
            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="mb-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Cookie Preferences</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Control how we use cookies and similar technologies</p>
                </div>
                <div className="space-y-4">
                    {COOKIE_CATEGORIES.map((cookie, i) => (
                        <div key={cookie.key} className="rounded-xl p-4 transition-all hover-lift card-lightning-subtle"
                            style={{ backgroundColor: i % 2 === 0 ? 'var(--color-surface-high)' : 'transparent', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                                        style={{ backgroundColor: cookie.bg }}>
                                        <cookie.icon className="h-5 w-5" style={{ color: cookie.color }} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold" style={{ color: 'var(--color-primary)' }}>{cookie.label}</h3>
                                        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{cookie.desc}</p>
                                        {cookie.required && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                style={{ backgroundColor: 'rgba(var(--color-success),0.15)', color: 'var(--color-success)' }}>
                                                Always Enabled
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {cookie.required ? (
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={true}
                                            onChange={() => {}}
                                            disabled
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2 peer-focus:ring-offset-surface"
                                            style={{ backgroundColor: 'var(--color-primary)' }}>
                                            <span className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                                                style={{ transform: 'translateX(22px)' }} />
                                        </div>
                                    </label>
                                ) : (
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={!!settings[cookie.settingKey]}
                                            onChange={() => toggle(cookie.settingKey)}
                                            disabled={saving}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 rounded-full transition-colors peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2 peer-focus:ring-offset-surface"
                                            style={{ 
                                                backgroundColor: settings[cookie.settingKey] ? 'var(--color-primary)' : 'var(--color-border-strong)' 
                                            }}>
                                            <span className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                                                style={{ 
                                                    transform: settings[cookie.settingKey] ? 'translateX(20px)' : 'translateX(0)' 
                                                }} />
                                        </div>
                                    </label>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Additional Privacy Controls</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            {/* Additional Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                    { icon: Fingerprint, title: 'Biometric Login', desc: 'Use Face ID or fingerprint to unlock the app', action: 'Configure', color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)' },
                    { icon: FileText, title: 'Data Processing Log', desc: 'View a log of all data processing activities', action: 'View Log', color: 'var(--color-accent)', bg: 'rgba(var(--color-accent),0.12)' },
                    { icon: RotateCcw, title: 'Consent History', desc: 'See when and how you gave consent for data use', action: 'View History', color: 'var(--color-success)', bg: 'rgba(var(--color-success),0.12)' },
                    { icon: Layers, title: 'Privacy Layers', desc: 'Set different privacy levels for different contexts', action: 'Configure', color: 'var(--color-warning)', bg: 'rgba(var(--color-warning),0.12)' },
                    { icon: Wifi, title: 'Network Privacy', desc: 'Control data sharing on public vs private networks', action: 'Settings', color: 'var(--color-info)', bg: 'rgba(var(--color-info),0.12)' },
                    { icon: UserCheck, title: 'Provider Data Access', desc: 'Review what each provider can see about you', action: 'Review', color: 'var(--color-text-muted)', bg: 'rgba(var(--color-text-muted),0.12)' },
                ].map((item, i) => (
                    <div key={i} className="rounded-xl p-4 transition-all hover-lift card-lightning-subtle"
                        style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                                style={{ backgroundColor: item.bg }}>
                                <item.icon className="h-5 w-5" style={{ color: item.color }} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold" style={{ color: 'var(--color-primary)' }}>{item.title}</h3>
                                <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{item.desc}</p>
                            </div>
                        </div>
                        <button className="mt-3 h-8 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-all"
                            style={{ backgroundColor: 'transparent', color: item.color, border: `1px solid ${item.color}30`, cursor: 'pointer' }}
                            onClick={() => toast.info(`${item.action} coming soon`)}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = item.color; e.currentTarget.style.color = 'var(--color-on-primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = item.color; }}>
                            {item.action}
                        </button>
                    </div>
                ))}
            </div>

            {/* Footer Note */}
            <div className="mt-8 p-5 rounded-xl text-center" style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Shield className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                    <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>Your Privacy Matters</span>
                </div>
                <p className="text-sm max-w-2xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                    We're committed to protecting your data. Read our <a href="#" className="underline hover:text-primary">Privacy Policy</a> and 
                    <a href="#" className="underline hover:text-primary">Terms of Service</a> for full details. 
                    Questions? <a href="/help" className="underline hover:text-primary">Contact our privacy team</a>.
                </p>
            </div>
        </div>
    );
}