import { useState } from 'react';
import { Zap, AlertTriangle, Users, MapPin, Clock, Shield, CheckCircle2, Loader2, Send, Phone, MessageSquare, Star, Wrench, Droplet, Bolt, Home, Truck, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

const URGENCY_LEVELS = [
    { label: 'Right Now', sub: 'Within 1 hour', color: 'var(--color-error)', bg: 'rgba(var(--color-error), 0.12)', border: 'rgba(var(--color-error), 0.3)', icon: Zap, priority: 'Critical', responseTime: '< 1 hour' },
    { label: 'Within 4 Hours', sub: 'Same day', color: 'var(--color-warning)', bg: 'rgba(var(--color-warning), 0.12)', border: 'rgba(var(--color-warning), 0.3)', icon: Clock, priority: 'Urgent', responseTime: '< 4 hours' },
    { label: 'Today', sub: 'Within 8 hours', color: 'var(--color-primary)', bg: 'rgba(var(--color-primary), 0.12)', border: 'rgba(var(--color-primary), 0.3)', icon: MapPin, priority: 'Standard', responseTime: '< 8 hours' },
];

const EMERGENCY_CATEGORIES = [
    { id: 'plumbing', label: 'Plumbing', icon: Droplet, services: ['Burst pipes', 'Gas leaks', 'Water heater', 'Drainage', 'Sewer backup'], color: 'var(--color-primary)' },
    { id: 'electrical', label: 'Electrical', icon: Bolt, services: ['Power outages', 'Wiring issues', 'Panel repair', 'Outlet/switch', 'Generator'], color: 'var(--color-warning)' },
    { id: 'locksmith', label: 'Locksmith', icon: Shield, services: ['Home lockouts', 'Car lockouts', 'Key replacement', 'Lock repair', 'Security upgrade'], color: 'var(--color-accent)' },
    { id: 'hvac', label: 'HVAC', icon: Home, services: ['AC failure', 'Heating failure', 'Gas furnace', 'Refrigerant leak', 'Thermostat'], color: 'var(--color-success)' },
    { id: 'roofing', label: 'Roofing', icon: Truck, services: ['Storm damage', 'Active leaks', 'Emergency tarp', 'Tree damage', 'Hail damage'], color: 'var(--color-text-muted)' },
    { id: 'appliance', label: 'Appliance', icon: Wrench, services: ['Fridge/freezer', 'Washer/dryer', 'Oven/stove', 'Water heater', 'Dishwasher'], color: 'var(--color-info)' },
];

const MOCK_PROVIDERS = [
    { id: 1, business_name: 'Emergency Plumbing Co.', city: 'Downtown', rating: 4.9, review_count: 127, services: ['Burst pipes', 'Gas leaks', 'Water heater', 'Drainage', 'Sewer backup'], response_time: '23 min', available: true, categories: ['plumbing'], logo: null },
    { id: 2, business_name: '24/7 Locksmith Pro', city: 'Midtown', rating: 4.8, review_count: 89, services: ['Lockouts', 'Key replacement', 'Security', 'Lock repair', 'Rekey'], response_time: '18 min', available: true, categories: ['locksmith'], logo: null },
    { id: 3, business_name: 'PowerFix Electrical', city: 'Uptown', rating: 4.9, review_count: 156, services: ['Power outages', 'Wiring issues', 'Panel repair', 'Generator', 'Outlet/switch'], response_time: '31 min', available: true, categories: ['electrical'], logo: null },
    { id: 4, business_name: 'Rapid Roofing', city: 'Westside', rating: 4.7, review_count: 64, services: ['Storm damage', 'Active leaks', 'Emergency tarp', 'Tree damage', 'Hail damage'], response_time: '45 min', available: false, categories: ['roofing'], logo: null },
    { id: 5, business_name: 'CoolAir Emergency HVAC', city: 'Eastside', rating: 4.8, review_count: 92, services: ['AC failure', 'Heating failure', 'Gas furnace', 'Refrigerant leak', 'Thermostat'], response_time: '28 min', available: true, categories: ['hvac'], logo: null },
    { id: 6, business_name: 'QuickFix Appliance', city: 'Northside', rating: 4.6, review_count: 47, services: ['Fridge/freezer', 'Washer/dryer', 'Oven/stove', 'Water heater', 'Dishwasher'], response_time: '35 min', available: true, categories: ['appliance'], logo: null },
];

export default function EmergencyServices() {
    const [selectedUrgency, setSelectedUrgency] = useState(0);
    const [requesting, setRequesting] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showAllProviders, setShowAllProviders] = useState(false);
    const [providers] = useState(MOCK_PROVIDERS);

    const requestEmergency = async () => {
        setRequesting(true);
        await new Promise(r => setTimeout(r, 1500));
        setRequesting(false);
        setRequestSent(true);
        toast.success('Emergency request dispatched! Providers are being notified.');
        setTimeout(() => setRequestSent(false), 5000);
    };

    const urgency = URGENCY_LEVELS[selectedUrgency];
    const activeProviders = providers.filter(p => p.available);
    const filteredProviders = selectedCategory === 'all' 
        ? activeProviders 
        : activeProviders.filter(p => p.categories.includes(selectedCategory));
    const displayProviders = showAllProviders ? filteredProviders : filteredProviders.slice(0, 3);

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Emergency Services</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>On-demand urgent service dispatch for critical home situations</p>
            </div>

            {/* Emergency Warning Banner */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'rgba(var(--color-error), 0.04)', border: '2px solid rgba(var(--color-error), 0.4)' }}>
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-error), 0.15)' }}>
                        <AlertTriangle className="h-5 w-5" style={{ color: 'var(--color-error)' }} />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-base" style={{ color: 'var(--color-error)' }}>For life-threatening emergencies, call 911 immediately</p>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                            This service is for home emergencies like burst pipes, power outages, lockouts, gas leaks, and storm damage.
                            Response times are estimates and not guaranteed.
                        </p>
                    </div>
                    <a 
                        href="tel:911" 
                        className="shrink-0 h-10 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all card-lightning"
                        style={{ backgroundColor: 'var(--color-error)', color: '#ffffff', border: 'none', textDecoration: 'none' }}
                    >
                        <Phone className="h-4 w-4" />
                        Call 911
                    </a>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { value: '23 min', label: 'Avg Response', icon: Clock, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)' },
                        { value: '200+', label: 'Providers', icon: Users, color: 'var(--color-accent)', bg: 'rgba(var(--color-accent),0.12)' },
                        { value: '99.2%', label: 'Success Rate', icon: CheckCircle2, color: 'var(--color-success)', bg: 'rgba(var(--color-success),0.12)' },
                        { value: '24/7/365', label: 'Availability', icon: Shield, color: 'var(--color-warning)', bg: 'rgba(var(--color-warning),0.12)' },
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

            {/* Urgency Selector */}
            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>How urgent is it?</p>
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Select the urgency level that matches your situation</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: urgency.bg, color: urgency.color, border: `1px solid ${urgency.border}` }}>
                        {urgency.priority} Priority
                    </span>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                    {URGENCY_LEVELS.map((u, i) => {
                        const active = selectedUrgency === i;
                        const Icon = u.icon;
                        return (
                            <button 
                                key={i} 
                                onClick={() => setSelectedUrgency(i)}
                                className="relative rounded-xl p-5 text-center transition-all card-lightning-subtle overflow-hidden"
                                style={{
                                    backgroundColor: active ? u.bg : 'var(--color-surface)',
                                    border: `2px solid ${active ? u.border : 'var(--color-border)'}`,
                                    cursor: 'pointer',
                                    boxShadow: active ? '0 0 24px -4px ' + u.color : 'none'
                                }}
                            >
                                <div className="absolute inset-0" style={{ backgroundColor: active ? u.color + '10' : 'transparent' }} />
                                <div className="relative z-10">
                                    <div className="h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-3 card-lightning-subtle"
                                        style={{ backgroundColor: active ? u.color : 'var(--color-surface-high)' }}>
                                        <Icon className="h-5 w-5" style={{ color: active ? 'var(--color-on-primary)' : u.color }} />
                                    </div>
                                    <p className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>{u.label}</p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{u.sub}</p>
                                    <div className="mt-3 pt-3 border-t flex items-center justify-center gap-1.5 text-[10px] font-medium" style={{ borderColor: active ? u.border : 'var(--color-border)' }}>
                                        <Shield className="h-3 w-3" style={{ color: u.color }} />
                                        <span style={{ color: u.color }}>{u.priority}</span>
                                        <span style={{ color: 'var(--color-text-subtle)' }}>•</span>
                                        <Clock className="h-3 w-3" style={{ color: u.color }} />
                                        <span style={{ color: u.color }}>{u.responseTime}</span>
                                    </div>
                                </div>
                                {active && (
                                    <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: u.color }}>
                                        <CheckCircle2 className="h-3.5 w-3.5" style={{ color: 'var(--color-on-primary)' }} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* CTA Button */}
            <div className="space-y-4">
                <button 
                    className="w-full h-12 rounded-xl gap-2 card-lightning text-base font-semibold flex items-center justify-center transition-all"
                    style={{ backgroundColor: 'var(--color-error)', color: '#ffffff', border: 'none', cursor: requesting || requestSent ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: requesting || requestSent ? 0.7 : 1 }}
                    onClick={requestEmergency}
                    disabled={requesting || requestSent}
                    onMouseEnter={e => { if (!requesting && !requestSent) e.currentTarget.style.opacity = '0.88'; }}
                    onMouseLeave={e => { if (!requesting && !requestSent) e.currentTarget.style.opacity = '1'; }}>
                    {requesting ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="flex items-center gap-2">Dispatching Emergency Request…</span>
                        </>
                    ) : requestSent ? (
                        <>
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="flex items-center gap-2">Request Sent! Help is on the way</span>
                        </>
                    ) : (
                        <>
                            <Zap className="h-5 w-5" />
                            <span className="flex items-center gap-2">Request Emergency Service Now</span>
                        </>
                    )}
                </button>

                {requestSent && (
                    <div className="text-center text-sm" style={{ color: 'var(--color-success)' }}>
                        <p>We've notified <strong>{activeProviders.length} available providers</strong> in your area.</p>
                        <p className="mt-1">Average response time: <strong>{urgency.responseTime}</strong></p>
                    </div>
                )}

                {/* Alternative Contact */}
                <div className="flex items-center justify-center gap-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <span>Or contact directly:</span>
                    <a href="tel:+1-800-TRUVORNEX" className="flex items-center gap-1.5 hover:text-primary transition-colors" style={{ color: 'var(--color-primary)' }}>
                        <Phone className="h-4 w-4" />
                        1-800-TRUVORNEX
                    </a>
                    <span style={{ color: 'var(--color-text-subtle)' }}>•</span>
                    <button className="h-10 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                        style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)', cursor: 'pointer' }}
                        onClick={() => toast.info('Opening emergency chat...')}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                        <MessageSquare className="h-3.5 w-3.5" />
                        Emergency Chat
                    </button>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Emergency Categories</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex flex-wrap gap-2 mb-4">
                    <button 
                        onClick={() => setSelectedCategory('all')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedCategory === 'all' ? 'btn-lightning' : 'text-text-muted hover:text-text hover:bg-surface-high'}`}
                        style={{
                            color: selectedCategory === 'all' ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
                            backgroundColor: selectedCategory === 'all' ? 'var(--color-primary)' : 'transparent',
                            border: 'none', cursor: 'pointer',
                        }}>
                        All Categories
                    </button>
                    {EMERGENCY_CATEGORIES.map(cat => (
                        <button 
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat.id ? 'btn-lightning-ai' : 'text-text-muted hover:text-text hover:bg-surface-high'}`}
                            style={{
                                color: selectedCategory === cat.id ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
                                backgroundColor: selectedCategory === cat.id ? cat.color : 'transparent',
                                border: 'none', cursor: 'pointer',
                            }}>
                            <cat.icon className="h-3.5 w-3.5" />
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Available Providers */}
                <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                    {filteredProviders.length === 0 ? (
                        <div className="text-center py-10">
                            <Users className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--color-text-subtle)' }} />
                            <p className="font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>No providers available</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Try a different category or check back soon</p>
                        </div>
                    ) : (
                        <>
                            <div className="divide-y divide-border">
                                {displayProviders.map((p, index) => (
                                    <a 
                                        key={p.id} 
                                        href={`/providers/${p.id}`}
                                        className="group flex items-center gap-4 p-4 transition-all hover-lift"
                                        style={{ 
                                            backgroundColor: 'transparent', 
                                            textDecoration: 'none',
                                            borderBottom: index < displayProviders.length - 1 ? '1px solid var(--color-border)' : 'none'
                                        }}
                                    >
                                        <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                                            style={{ backgroundColor: 'var(--color-surface)' }}>
                                            {p.logo
                                                ? <img src={p.logo} alt="" className="h-full w-full object-cover rounded-xl" />
                                                : <span className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>{p.business_name.charAt(0)}</span>}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-base" style={{ color: 'var(--color-primary)' }}>{p.business_name}</h3>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                                                    style={{ backgroundColor: 'rgba(var(--color-success),0.15)', color: 'var(--color-success)' }}>
                                                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--color-success)' }} />
                                                    Available Now
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {p.city}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Star className="h-3 w-3 fill-current" style={{ color: 'var(--color-warning)' }} />
                                                    {p.rating} ({p.review_count})
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {p.response_time} avg response
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {p.services.slice(0, 3).map((s, si) => (
                                                    <span key={si} className="text-[10px] px-2 py-0.5 rounded-full"
                                                        style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                                                        {s}
                                                    </span>
                                                ))}
                                                {p.services.length > 3 && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full"
                                                        style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-subtle)', border: '1px solid var(--color-border)' }}>
                                                        +{p.services.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="text-right shrink-0">
                                            <div className="flex items-center justify-end gap-1.5 mb-1">
                                                <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-success)' }} />
                                                <span className="text-xs font-semibold" style={{ color: 'var(--color-success)' }}>Ready</span>
                                            </div>
                                            <div className="h-5 w-5 rounded-lg flex items-center justify-center mx-auto group-hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--color-surface)' }}>
                                                <svg width="10" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-text-subtle)' }}>
                                                    <polyline points="9 18 15 12 9 6"></polyline>
                                                </svg>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                            
                            {filteredProviders.length > 3 && (
                                <button 
                                    onClick={() => setShowAllProviders(!showAllProviders)}
                                    className="w-full py-4 text-center text-sm font-semibold transition-all"
                                    style={{ backgroundColor: 'transparent', color: 'var(--color-primary)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                                    {showAllProviders ? 'Show Less' : `Show ${filteredProviders.length - 3} More Providers`}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* How It Works */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>How Emergency Dispatch Works</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { step: '1', icon: Send, title: 'Submit Request', desc: 'Select urgency level and describe the emergency' },
                        { step: '2', icon: Zap, title: 'Instant Dispatch', desc: 'We notify all qualified providers in your area simultaneously' },
                        { step: '3', icon: CheckCircle2, title: 'Provider Accepts', desc: 'First available provider accepts and heads to your location' },
                    ].map((item, i) => (
                        <div key={i} className="rounded-xl p-4 transition-all hover-lift card-lightning-subtle relative"
                            style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                            <div className="absolute -top-3 -right-3 h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}>
                                <span className="font-black text-lg" style={{ color: 'var(--color-primary)' }}>{item.step}</span>
                            </div>
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

            {/* What We Cover */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>What We Cover</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {EMERGENCY_CATEGORIES.map(cat => (
                    <div key={cat.id} className="rounded-xl p-5 transition-all hover-lift card-lightning-subtle"
                        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                                style={{ backgroundColor: cat.color + '15' }}>
                                <cat.icon className="h-5 w-5" style={{ color: cat.color }} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold" style={{ color: 'var(--color-primary)' }}>{cat.label}</h3>
                                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                    {cat.services.slice(0, 3).join(', ')}{cat.services.length > 3 ? '...' : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Help */}
            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 className="font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>Need Help?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button className="h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                        style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)', cursor: 'pointer' }}
                        onClick={() => toast.info('Opening help article...')}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                        <HelpCircle className="h-4 w-4" />
                        How it works
                    </button>
                    <button className="h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                        style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)', cursor: 'pointer' }}
                        onClick={() => toast.info('Opening safety guidelines...')}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                        <Shield className="h-4 w-4" />
                        Safety guidelines
                    </button>
                    <button className="h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                        style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)', cursor: 'pointer' }}
                        onClick={() => toast.info('Opening support chat...')}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                        <MessageSquare className="h-4 w-4" />
                        Emergency chat
                    </button>
                </div>
            </div>
        </div>
    );
}