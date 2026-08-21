import { useState, useMemo } from 'react';
import { 
    Search, BookOpen, MessageSquare, Truck, CreditCard, Shield, 
    Zap, HelpCircle, ChevronDown, ChevronUp, 
    Send, Star, Flag, Mail, Phone, Video, Wifi, Globe,
    CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

const FAQ_CATEGORIES = [
    { id: 'all', label: 'All', icon: HelpCircle, count: 24 },
    { id: 'getting-started', label: 'Getting Started', icon: BookOpen, count: 6 },
    { id: 'booking', label: 'Booking & Scheduling', icon: Truck, count: 5 },
    { id: 'payments', label: 'Payments & Billing', icon: CreditCard, count: 4 },
    { id: 'account', label: 'Account & Privacy', icon: Shield, count: 4 },
    { id: 'emergency', label: 'Emergency Services', icon: Zap, count: 3 },
    { id: 'technical', label: 'Technical Issues', icon: Wifi, count: 2 },
];

const FAQ_DATA = [
    {
        id: 1,
        category: 'getting-started',
        question: 'How do I create an account and get started?',
        answer: 'Creating an account is simple. Download the app or visit our website, click "Sign Up", and follow the prompts. You can sign up with email, phone, or social accounts. Once verified, you\'ll have immediate access to all services.',
        tags: ['account', 'signup', 'verification']
    },
    {
        id: 2,
        category: 'getting-started',
        question: 'What services are available in my area?',
        answer: 'Services vary by location. Use the "Nearby" tab to see all available providers in your area. You can filter by category, distance, rating, and availability. Enable location services for the most accurate results.',
        tags: ['location', 'services', 'nearby']
    },
    {
        id: 3,
        category: 'booking',
        question: 'How do I book a service?',
        answer: 'Browse providers in the Nearby section, select a service, choose your preferred date/time, and confirm. You\'ll receive instant confirmation and can track the provider in real-time. Changes can be made up to 2 hours before the appointment.',
        tags: ['booking', 'scheduling', 'confirmation']
    },
    {
        id: 4,
        category: 'booking',
        question: 'Can I schedule recurring services?',
        answer: 'Yes! When booking, select "Make Recurring" and choose frequency (weekly, bi-weekly, monthly). You can manage all recurring services from the Recurring Services page. Changes to individual occurrences or the entire series are supported.',
        tags: ['recurring', 'schedule', 'management']
    },
    {
        id: 5,
        category: 'payments',
        question: 'What payment methods are accepted?',
        answer: 'We accept all major credit/debit cards, Apple Pay, Google Pay, and bank transfers. Gift cards and promotional credits are also supported. All payments are processed securely through Stripe with PCI DSS compliance.',
        tags: ['payment', 'methods', 'security']
    },
    {
        id: 6,
        category: 'payments',
        question: 'How do refunds work?',
        answer: 'Refunds are processed within 5-10 business days to the original payment method. Cancellations more than 24 hours before service: full refund. 2-24 hours: 50% refund. Less than 2 hours: no refund unless provider cancels.',
        tags: ['refund', 'cancellation', 'policy']
    },
    {
        id: 7,
        category: 'account',
        question: 'How do I update my profile and preferences?',
        answer: 'Go to Settings > Profile to update your name, photo, contact info, and notification preferences. Privacy settings control what providers can see. You can also manage connected accounts and data sharing preferences.',
        tags: ['profile', 'preferences', 'privacy']
    },
    {
        id: 8,
        category: 'emergency',
        question: 'How do emergency services work?',
        answer: 'Emergency requests are prioritized and sent to all available providers in your area. Response time targets: Critical (1 hour), Urgent (4 hours), Same Day (8 hours). You\'ll receive real-time updates via push notification and SMS.',
        tags: ['emergency', 'urgent', 'response-time']
    },
    {
        id: 9,
        category: 'technical',
        question: 'The app isn\'t loading properly. What should I do?',
        answer: 'Try these steps: 1) Check your internet connection, 2) Force close and reopen the app, 3) Clear app cache in device settings, 4) Update to the latest version. If issues persist, contact support with your device info and error details.',
        tags: ['troubleshooting', 'app', 'loading']
    },
];

const CONTACT_METHODS = [
    { id: 'chat', icon: MessageSquare, label: 'Live Chat', desc: 'Instant messaging with support', time: 'Avg. 2 min', color: 'var(--color-primary)', available: true },
    { id: 'email', icon: Mail, label: 'Email Support', desc: 'Detailed help via email', time: 'Avg. 4 hours', color: 'var(--color-accent)', available: true },
    { id: 'phone', icon: Phone, label: 'Phone Support', desc: 'Speak with a specialist', time: 'Avg. 5 min', color: 'var(--color-success)', available: true },
    { id: 'video', icon: Video, label: 'Video Call', desc: 'Screen sharing for complex issues', time: 'By appointment', color: 'var(--color-warning)', available: true },
];

const QUICK_ACTIONS = [
    { label: 'Track My Order', desc: 'Real-time service tracking', icon: Truck },
    { label: 'View Invoices', desc: 'Download payment receipts', icon: CreditCard },
    { label: 'Manage Subscriptions', desc: 'Recurring services & billing', icon: Globe },
    { label: 'Report a Problem', desc: 'Flag issues with a service', icon: Flag },
];

const SUPPORT_STATS = [
    { value: '24', label: 'Help Articles', icon: BookOpen, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)' },
    { value: '98%', label: 'Satisfaction', icon: Star, color: 'var(--color-warning)', bg: 'rgba(var(--color-warning),0.12)' },
    { value: '< 2m', label: 'Avg Chat Reply', icon: MessageSquare, color: 'var(--color-success)', bg: 'rgba(var(--color-success),0.12)' },
    { value: '24/7', label: 'Emergency Help', icon: Zap, color: 'var(--color-error)', bg: 'rgba(var(--color-error),0.12)' },
];

export default function HelpCenter() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [openFAQs, setOpenFAQs] = useState(new Set([1]));
    const [contactMethod, setContactMethod] = useState('chat');
    const [chatMessages, setChatMessages] = useState([
        { from: 'bot', text: 'Hi! How can I help you today?' },
        { from: 'user', text: 'I need help with my recent booking' },
        { from: 'bot', text: 'I\'d be happy to help. Could you share your booking reference number?' },
    ]);
    const [chatInput, setChatInput] = useState('');
    const [sendingChat, setSendingChat] = useState(false);

    const filteredFAQs = useMemo(() => {
        let faqs = FAQ_DATA;
        if (activeCategory !== 'all') {
            faqs = faqs.filter(f => f.category === activeCategory);
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            faqs = faqs.filter(f => 
                f.question.toLowerCase().includes(query) ||
                f.answer.toLowerCase().includes(query) ||
                f.tags.some(t => t.toLowerCase().includes(query))
            );
        }
        return faqs;
    }, [searchQuery, activeCategory]);

    const toggleFAQ = (id) => {
        setOpenFAQs(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const sendChatMessage = () => {
        if (!chatInput.trim() || sendingChat) return;
        const message = chatInput;
        setChatInput('');
        setSendingChat(true);
        
        setChatMessages(prev => [...prev, { from: 'user', text: message }]);
        
        setTimeout(() => {
            setChatMessages(prev => [...prev, { 
                from: 'bot', 
                text: 'Thanks for sharing that. Let me look into this for you right away.' 
            }]);
            setSendingChat(false);
        }, 1000);
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Help Center</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Find answers, get support, and learn to use Truvornex like a pro</p>
            </div>

            {/* Stats Overview */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {SUPPORT_STATS.map((stat, i) => (
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

            {/* Search & Report Issue */}
            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: 'var(--color-text-subtle)' }} />
                        <input
                            type="text"
                            placeholder="Search help articles, FAQs, guides..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="input-lightning w-full pl-12 pr-4 py-3.5 text-base"
                            style={{ 
                                backgroundColor: 'var(--color-surface-high)',
                                borderColor: 'var(--color-border)',
                                fontSize: '15px'
                            }}
                        />
                    </div>
                    <button className="h-11 px-5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                        style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-border-accent)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}>
                        <Flag className="h-4 w-4" />
                        Report Issue
                    </button>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6 card-lightning-subtle p-1 rounded-xl"
                style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                {FAQ_CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            activeCategory === cat.id 
                                ? '' 
                                : 'text-text-muted hover:text-text hover:bg-surface-high'
                        }`}
                        style={{
                            color: activeCategory === cat.id ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
                            backgroundColor: activeCategory === cat.id ? 'var(--color-primary)' : 'transparent'
                        }}
                    >
                        <cat.icon className="h-4 w-4" />
                        {cat.label}
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ 
                                backgroundColor: activeCategory === cat.id ? 'rgba(255,255,255,0.2)' : 'var(--color-surface)',
                                color: activeCategory === cat.id ? 'var(--color-on-primary)' : 'var(--color-text-subtle)',
                                border: '1px solid var(--color-border)'
                            }}>{cat.count}</span>
                    </button>
                ))}
            </div>

            {/* FAQ Accordion */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="space-y-0">
                    {filteredFAQs.map((faq) => {
                        const isOpen = openFAQs.has(faq.id);
                        const category = FAQ_CATEGORIES.find(c => c.id === faq.category);
                        return (
                            <div key={faq.id} className="border-t transition-all" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                                <button
                                    onClick={() => toggleFAQ(faq.id)}
                                    className="w-full flex items-center justify-between gap-4 p-5 text-left"
                                    style={{ backgroundColor: 'transparent' }}
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                style={{ 
                                                    backgroundColor: 'var(--color-surface-high)', 
                                                    color: 'var(--color-text-muted)',
                                                    border: '1px solid var(--color-border)'
                                                }}>
                                                {category?.label}
                                            </span>
                                            {faq.tags.map(tag => (
                                                <span key={tag} className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                                                    style={{ 
                                                        backgroundColor: 'var(--color-surface-high)', 
                                                        color: 'var(--color-text-subtle)',
                                                        border: '1px solid var(--color-border)'
                                                    }}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <h3 className="font-semibold text-base leading-relaxed" style={{ color: 'var(--color-primary)' }}>
                                            {faq.question}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {isOpen ? (
                                            <ChevronUp className="h-5 w-5" style={{ color: 'var(--color-text-muted)' }} />
                                        ) : (
                                            <ChevronDown className="h-5 w-5" style={{ color: 'var(--color-text-muted)' }} />
                                        )}
                                    </div>
                                </button>
                                {isOpen && (
                                    <div className="px-5 pb-5 animate-slide-down" style={{ borderColor: 'var(--color-border)' }}>
                                        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                                            {faq.answer}
                                        </p>
                                        <div className="flex items-center gap-3 mt-5 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                            <span className="text-sm" style={{ color: 'var(--color-text-subtle)' }}>Was this helpful?</span>
                                            <button className="h-9 px-4 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5"
                                                style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                                                onClick={() => toast.success('Thanks for your feedback!')}>
                                                <CheckCircle2 className="h-3 w-3" />
                                                <span>Yes</span>
                                            </button>
                                            <button className="h-9 px-4 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5"
                                                style={{ backgroundColor: 'transparent', color: 'var(--color-text-subtle)', border: 'none' }}
                                                onClick={() => toast.info('We\'ll improve this article')}>
                                                <AlertCircle className="h-3 w-3" />
                                                <span>No</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                {filteredFAQs.length === 0 && (
                    <div className="text-center py-16">
                        <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 card-lightning-subtle"
                            style={{ backgroundColor: 'var(--color-surface-high)' }}>
                            <Search className="h-7 w-7" style={{ color: 'var(--color-text-subtle)' }} />
                        </div>
                        <h2 className="font-bold text-lg mb-1" style={{ color: 'var(--color-primary)' }}>No articles found</h2>
                        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>Try adjusting your search or filter</p>
                        <button 
                            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-medium transition-all"
                            style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
                            <RefreshCw className="h-4 w-4" />
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Quick Actions</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {QUICK_ACTIONS.map((action, i) => (
                        <div key={i} className="rounded-xl p-4 transition-all hover-lift card-lightning-subtle"
                            style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle"
                                    style={{ backgroundColor: 'rgba(var(--color-primary), 0.12)' }}>
                                    <action.icon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                                </div>
                                <div>
                                    <p className="font-medium" style={{ color: 'var(--color-primary)' }}>{action.label}</p>
                                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{action.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Support */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Need More Help?</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="space-y-6">
                <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="mb-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Contact Support</p>
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Our team is here to help you 24/7</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {CONTACT_METHODS.map(method => (
                            <button
                                key={method.id}
                                onClick={() => setContactMethod(method.id)}
                                className={`relative p-4 rounded-xl transition-all cursor-pointer border-2 ${
                                    contactMethod === method.id ? 'card-lightning' : 'card-lightning-subtle'
                                }`}
                                style={{ 
                                    borderColor: contactMethod === method.id ? method.color : 'var(--color-border)',
                                    backgroundColor: contactMethod === method.id ? `${method.color}08` : 'var(--color-surface)',
                                    textAlign: 'left'
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                                        style={{ backgroundColor: `${method.color}15` }}>
                                        <method.icon className="h-5 w-5" style={{ color: method.color }} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold" style={{ color: 'var(--color-primary)' }}>{method.label}</h3>
                                            {method.available && (
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"
                                                    style={{ backgroundColor: 'rgba(var(--color-success),0.15)', color: 'var(--color-success)' }}>
                                                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--color-success)' }} />
                                                    Available
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{method.desc}</p>
                                        <p className="text-xs mt-1 font-medium" style={{ color: method.color }}>{method.time}</p>
                                    </div>
                                    {contactMethod === method.id && (
                                        <div className="absolute top-3 right-3 h-6 w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: method.color }}>
                                            <CheckCircle2 className="h-3 w-3" style={{ color: 'var(--color-on-primary)' }} />
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {contactMethod === 'chat' && (
                        <div className="rounded-xl p-5 animate-fade-in" style={{ backgroundColor: 'rgba(var(--color-primary), 0.05)', border: '1px solid var(--color-border)' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-primary), 0.12)' }}>
                                    <div className="h-5 w-5 rounded-full" style={{ backgroundColor: 'var(--color-success)' }} />
                                </div>
                                <div>
                                    <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>Sarah Mitchell</p>
                                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Support Specialist • Online now</p>
                                </div>
                            </div>
                            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                {chatMessages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${msg.from === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                                            style={{
                                                backgroundColor: msg.from === 'user' ? 'var(--color-primary)' : 'var(--color-surface-high)',
                                                color: msg.from === 'user' ? 'var(--color-on-primary)' : 'var(--color-text)'
                                            }}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="input-lightning flex-1 py-3 text-sm"
                                    style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border-strong)' }}
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                                />
                                <button className="h-11 px-5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                                    onClick={sendChatMessage} disabled={sendingChat || !chatInput.trim()}>
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {contactMethod === 'email' && (
                        <div className="space-y-4 animate-fade-in">
                            <input 
                                placeholder="Subject" 
                                className="input-lightning w-full px-4 py-3.5 rounded-xl text-base outline-none"
                                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text)' }} />
                            <textarea 
                                placeholder="Describe your issue in detail..."
                                className="input-lightning w-full px-4 py-3.5 rounded-xl text-base outline-none resize-none"
                                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text)', fontFamily: 'Inter,sans-serif', minHeight: 100 }} />
                            <div className="flex items-center gap-2">
                                <button className="h-11 px-5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                                    onClick={() => toast.success('Email sent! We\'ll reply within 4 hours.')}>
                                    <Send className="h-4 w-4" />
                                    Send Email
                                </button>
                                <span className="text-[10px] font-medium px-2 py-1 rounded-full"
                                    style={{ backgroundColor: 'rgba(var(--color-info),0.15)', color: 'var(--color-info)' }}>
                                    Usually responds within 4 hours
                                </span>
                            </div>
                        </div>
                    )}

                    {contactMethod === 'phone' && (
                        <div className="text-center py-10 animate-fade-in">
                            <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 card-lightning"
                                style={{ backgroundColor: 'rgba(var(--color-success), 0.15)' }}>
                                <Phone className="h-8 w-8" style={{ color: 'var(--color-success)' }} />
                            </div>
                            <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--color-primary)' }}>Call Us</h3>
                            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>Available 24/7 for emergency support</p>
                            <a href="tel:+1-800-TRUVORNEX" className="text-2xl font-black inline-block mb-2" style={{ color: 'var(--color-primary)' }}>
                                1-800-TRUVORNEX
                            </a>
                            <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>International rates may apply</p>
                        </div>
                    )}

                    {contactMethod === 'video' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="text-center py-4">
                                <h3 className="font-semibold" style={{ color: 'var(--color-primary)' }}>Schedule a Video Call</h3>
                                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Screen sharing available for technical issues</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <select className="input-lightning w-full py-3.5 rounded-xl text-sm outline-none"
                                    style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text)', fontFamily: 'Inter,sans-serif' }}>
                                    <option value="">Select issue type</option>
                                    <option value="technical">Technical Support</option>
                                    <option value="billing">Billing & Payments</option>
                                    <option value="account">Account Issues</option>
                                    <option value="other">Other</option>
                                </select>
                                <select className="input-lightning w-full py-3.5 rounded-xl text-sm outline-none"
                                    style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border-strong)', color: 'var(--color-text)', fontFamily: 'Inter,sans-serif' }}>
                                    <option value="">When works best?</option>
                                    <option value="asap">As Soon As Possible</option>
                                    <option value="today">Today</option>
                                    <option value="tomorrow">Tomorrow</option>
                                    <option value="this-week">This Week</option>
                                </select>
                            </div>
                            <button className="h-11 w-full rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                                onClick={() => toast.success('Video call scheduled! You\'ll receive a calendar invite.')}>
                                <Video className="h-4 w-4" />
                                Schedule Call
                            </button>
                        </div>
                    )}
                </div>

                {/* Feedback */}
                <div className="flex items-center gap-3">
                    <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                    <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Help Us Improve</span>
                    <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                </div>

                <div className="rounded-2xl p-8 text-center shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="flex items-center justify-center gap-1.5 mb-4">
                        <Star className="h-6 w-6" style={{ color: 'var(--color-warning)' }} />
                        <Star className="h-6 w-6" style={{ color: 'var(--color-warning)' }} />
                        <Star className="h-6 w-6" style={{ color: 'var(--color-warning)' }} />
                        <Star className="h-6 w-6" style={{ color: 'var(--color-warning)' }} />
                        <Star className="h-6 w-6" style={{ color: 'var(--color-text-subtle)' }} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--color-primary)' }}>Rate Your Experience</h3>
                    <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                        Your feedback helps us improve our help center and support experience.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button className="h-11 px-6 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                            onClick={() => toast.success('Thanks for your 5-star rating!')}>
                            <Star className="h-4 w-4" />
                            Rate 5 Stars
                        </button>
                        <button className="h-11 px-6 rounded-xl text-sm font-semibold transition-all"
                            style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                            onClick={() => toast.info('Opening detailed feedback form...')}>
                            Detailed Feedback
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}