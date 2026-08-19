import { useState } from 'react';
import { Shield, Download, Trash2, User, MapPin, Database, Brain, Mail, Share2, Lock, Eye, ExternalLink, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    PageWrapper,
    PageHeader,
    SectionCard,
    SettingRow,
    Divider,
    PremiumSwitch,
    PremiumButton,
    Badge,
    StatCard,
    EmptyState
} from '@/components/premium/PremiumLayout';

const PRIVACY_ITEMS = [
    { 
        key: 'show_profile', 
        label: 'Show profile to providers', 
        desc: 'Providers can see your name and profile photo when you book',
        icon: User,
        category: 'visibility'
    },
    { 
        key: 'share_location', 
        label: 'Share location for nearby', 
        desc: 'Allow the app to detect your location for nearby providers',
        icon: MapPin,
        category: 'visibility'
    },
    { 
        key: 'analytics_tracking', 
        label: 'Analytics tracking', 
        desc: 'Help improve the app with anonymous usage data',
        icon: Database,
        category: 'data'
    },
    { 
        key: 'personalized_recs', 
        label: 'Personalized recommendations', 
        desc: 'Use your booking history to suggest relevant services',
        icon: Brain,
        category: 'data'
    },
    { 
        key: 'marketing_emails', 
        label: 'Marketing communications', 
        desc: 'Receive promotional offers and platform news',
        icon: Mail,
        category: 'communication'
    },
    { 
        key: 'data_to_providers', 
        label: 'Share data with providers', 
        desc: 'Allow providers to see your booking patterns for better service',
        icon: Share2,
        category: 'data'
    },
];

const CATEGORIES = [
    { id: 'visibility', label: 'Profile Visibility', icon: Eye, color: 'var(--color-primary)' },
    { id: 'data', label: 'Data & Analytics', icon: Database, color: 'var(--color-accent)' },
    { id: 'communication', label: 'Communications', icon: Mail, color: 'var(--color-success)' },
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
    const [activeCategory, setActiveCategory] = useState('all');

    const toggle = (key) => setSettings(p => ({ ...p, [key]: !p[key] }));

    const save = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 800));
        localStorage.setItem('privacy_settings', JSON.stringify(settings));
        toast.success('Privacy settings saved');
        setSaving(false);
    };

    const filteredItems = activeCategory === 'all' 
        ? PRIVACY_ITEMS 
        : PRIVACY_ITEMS.filter(item => item.category === activeCategory);

    const enabledCount = Object.values(settings).filter(Boolean).length;
    const totalCount = Object.keys(settings).length;

    return (
        <PageWrapper>
            <PageHeader
                title="Privacy Settings"
                subtitle="Control what data you share and who can see it"
                icon={Shield}
                iconColor="var(--color-primary)"
                iconBg="rgba(var(--color-primary), 0.12)"
            />

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <StatCard 
                    value={`${enabledCount}/${totalCount}`} 
                    label="Settings Enabled" 
                    icon={CheckCircle2}
                    iconColor="var(--color-success)"
                    iconBg="rgba(var(--color-success), 0.12)"
                />
                <StatCard 
                    value="3" 
                    label="Categories" 
                    icon={Shield}
                    iconColor="var(--color-primary)"
                    iconBg="rgba(var(--color-primary), 0.12)"
                />
                <StatCard 
                    value="Active" 
                    label="Protection Status" 
                    trend="Secured"
                    trendUp={true}
                    icon={Lock}
                    iconColor="var(--color-accent)"
                    iconBg="rgba(var(--color-accent), 0.12)"
                />
                <StatCard 
                    value="GDPR" 
                    label="Compliance" 
                    icon={AlertCircle}
                    iconColor="var(--color-warning)"
                    iconBg="rgba(var(--color-warning), 0.12)"
                />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6 card-lightning-subtle p-1 rounded-xl">
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

            {/* Privacy Settings */}
            <SectionCard variant="elevated">
                <div className="space-y-1">
                    {filteredItems.map((item, i) => (
                        <SettingRow
                            key={item.key}
                            icon={item.icon}
                            iconColor="var(--color-text-muted)"
                            title={item.label}
                            description={item.desc}
                            children={
                                <PremiumSwitch
                                    checked={settings[item.key]}
                                    onChange={() => toggle(item.key)}
                                    label=""
                                    description=""
                                />
                            }
                        />
                    ))}
                </div>
                {filteredItems.length === 0 && (
                    <EmptyState
                        icon={Shield}
                        title="No settings in this category"
                        description="All privacy controls are organized by category"
                    />
                )}
            </SectionCard>

            {/* Divider */}
            <Divider label="Data Management" />

            {/* Data Export & Deletion */}
            <SectionCard 
                title="Your Data" 
                subtitle="Download or delete your personal data"
                icon={Database}
                iconColor="var(--color-accent)"
                variant="ai"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <PremiumCard variant="default" hover={false}>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                                style={{ backgroundColor: 'rgba(var(--color-primary), 0.12)' }}>
                                <Download className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <div>
                                <h3 className="font-semibold" style={{ color: 'var(--color-primary)' }}>Download Your Data</h3>
                                <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                    Get a complete copy of your personal data in JSON format
                                </p>
                            </div>
                        </div>
                        <PremiumButton 
                            variant="outline" 
                            size="sm" 
                            className="mt-4 w-full sm:w-auto"
                            onClick={() => toast.info('Preparing your data export...')}
                        >
                            <Download className="h-4 w-4" />
                            Export Data
                        </PremiumButton>
                    </PremiumCard>

                    <PremiumCard variant="default" hover={false} style={{ borderColor: 'rgba(var(--color-error), 0.3)' }}>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                                style={{ backgroundColor: 'rgba(var(--color-error), 0.12)' }}>
                                <Trash2 className="h-6 w-6" style={{ color: 'var(--color-error)' }} />
                            </div>
                            <div>
                                <h3 className="font-semibold" style={{ color: 'var(--color-error)' }}>Delete Account</h3>
                                <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                    Permanently delete your account and all associated data
                                </p>
                            </div>
                        </div>
                        <PremiumButton 
                            variant="destructive" 
                            size="sm" 
                            className="mt-4 w-full sm:w-auto"
                            onClick={() => toast.error('Account deletion requires confirmation')}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Account
                        </PremiumButton>
                    </PremiumCard>
                </div>
            </SectionCard>

            {/* Divider */}
            <Divider label="Third-Party Access" />

            {/* Third Party Access */}
            <SectionCard 
                title="Connected Services" 
                subtitle="Manage which external services have access to your data"
                icon={ExternalLink}
                iconColor="var(--color-text-muted)"
                variant="default"
            >
                <div className="space-y-3">
                    {[
                        { name: 'Google Analytics', desc: 'Anonymous usage analytics', enabled: true, category: 'analytics' },
                        { name: 'Mixpanel', desc: 'Product analytics & events', enabled: false, category: 'analytics' },
                        { name: 'Intercom', desc: 'Customer support chat', enabled: true, category: 'support' },
                        { name: 'Stripe', desc: 'Payment processing', enabled: true, category: 'payments' },
                    ].map((service, i) => (
                        <SettingRow
                            key={service.name}
                            icon={ExternalLink}
                            iconColor="var(--color-text-muted)"
                            title={service.name}
                            description={service.desc}
                            children={
                                <PremiumSwitch
                                    checked={service.enabled}
                                    onChange={() => toast.info(`${service.name} ${service.enabled ? 'disconnected' : 'connected'}`)}
                                />
                            }
                        />
                    ))}
                </div>
            </SectionCard>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
                <PremiumButton 
                    size="lg" 
                    onClick={save} 
                    disabled={saving}
                    className="w-full sm:w-auto min-w-[180px]"
                >
                    {saving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Shield className="h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </PremiumButton>
            </div>
        </PageWrapper>
    );
}