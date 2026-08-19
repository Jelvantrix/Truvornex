import { useState, useMemo } from 'react';
import { 
    Search, BookOpen, MessageSquare, Truck, CreditCard, Shield, 
    Zap, HelpCircle, ChevronDown, ChevronUp, Loader2, 
    Send, Star, Flag, Mail, Phone, Video, Wifi, Globe 
} from 'lucide-react';
import { toast } from 'sonner';
import {
    PageWrapper,
    PageHeader,
    SectionCard,
    PremiumCard,
    PremiumButton,
    PremiumInput,
    StatCard,
    Badge,
    EmptyState,
    Avatar
} from '@/components/premium/PremiumLayout';

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

export default function HelpCenter() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [openFAQs, setOpenFAQs] = useState(new Set([1]));
    const [contactMethod, setContactMethod] = useState('chat');

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

    return (
        <PageWrapper>
            <PageHeader
                title="Help Center"
                subtitle="Find answers, get support, and learn to use Truvornex like a pro"
                icon={HelpCircle}
                iconColor="var(--color-primary)"
                iconBg="rgba(var(--color-primary), 0.12)"
            />

            {/* Search & Stats */}
            <SectionCard variant="elevated">
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
                                backgroundColor: 'var(--color-surface)',
                                borderColor: 'var(--color-border-strong)',
                                fontSize: '15px'
                            }}
                        />
                    </div>
                    <PremiumButton variant="outline" size="lg">
                        <Flag className="h-4 w-4" />
                        Report Issue
                    </PremiumButton>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard value="24" label="Articles" icon={BookOpen} iconColor="var(--color-primary)" iconBg="rgba(var(--color-primary),0.12)" />
                    <StatCard value="98%" label="Satisfaction" icon={Star} iconColor="var(--color-warning)" iconBg="rgba(var(--color-warning),0.12)" />
                    <StatCard value="< 2m" label="Chat Response" icon={MessageSquare} iconColor="var(--color-success)" iconBg="rgba(var(--color-success),0.12)" />
                    <StatCard value="24/7" label="Emergency Help" icon={Zap} iconColor="var(--color-error)" iconBg="rgba(var(--color-error),0.12)" />
                </div>
            </SectionCard>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6 card-lightning-subtle p-1 rounded-xl" style={{ maxWidth: '100%' }}>
                {FAQ_CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            activeCategory === cat.id 
                                ? 'btn-lightning-ai' 
                                : 'text-text-muted hover:text-text hover:bg-surface-high'
                        }`}
                        style={{
                            color: activeCategory === cat.id ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
                            backgroundColor: activeCategory === cat.id ? 'var(--color-accent)' : 'transparent'
                        }}
                    >
                        <cat.icon className="h-4 w-4" />
                        {cat.label}
                        <Badge variant="default" className="ml-1">{cat.count}</Badge>
                    </button>
                ))}
            </div>

            {/* FAQ Accordion */}
            <SectionCard variant="default">
                <div className="space-y-3">
                    {filteredFAQs.map((faq) => {
                        const isOpen = openFAQs.has(faq.id);
                        return (
                            <PremiumCard 
                                key={faq.id} 
                                variant="subtle" 
                                hover={false}
                                className="overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleFAQ(faq.id)}
                                    className="w-full flex items-center justify-between gap-4 p-4 text-left"
                                    style={{ backgroundColor: 'transparent' }}
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge 
                                                variant="premium" 
                                                size="xs"
                                                className="text-[10px]"
                                            >
                                                {FAQ_CATEGORIES.find(c => c.id === faq.category)?.label}
                                            </Badge>
                                            {faq.tags.map(tag => (
                                                <Badge key={tag} variant="default" size="xs" className="text-[9px]">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                        <h3 className="font-semibold text-base" style={{ color: 'var(--color-primary)' }}>
                                            {faq.question}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {isOpen ? (
                                            <ChevronUp className="h-5 w-5 text-text-muted" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-text-muted" />
                                        )}
                                    </div>
                                </button>
                                {isOpen && (
                                    <div className="px-4 pb-4 border-t animate-slide-down" style={{ borderColor: 'var(--color-border)' }}>
                                        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                                            {faq.answer}
                                        </p>
                                        <div className="flex items-center gap-3 mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                            <span className="text-sm" style={{ color: 'var(--color-text-subtle)' }}>Was this helpful?</span>
                                            <button className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-success-bg" style={{ color: 'var(--color-success)', backgroundColor: 'transparent', border: '1px solid var(--color-success)' }}>
                                                <span className="flex items-center gap-1"><Star className="h-3 w-3" /> Yes</span>
                                            </button>
                                            <button className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-error-bg" style={{ color: 'var(--color-error)', backgroundColor: 'transparent', border: '1px solid var(--color-error)' }}>
                                                <span className="flex items-center gap-1"><Flag className="h-3 w-3" /> No</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </PremiumCard>
                        );
                    })}
                </div>
                {filteredFAQs.length === 0 && (
                    <EmptyState
                        icon={Search}
                        title="No articles found"
                        description="Try adjusting your search or filter"
                        action={
                            <PremiumButton variant="outline" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
                                Clear Filters
                            </PremiumButton>
                        }
                    />
                )}
            </SectionCard>

            {/* Quick Actions */}
            <SectionCard 
                title="Quick Actions" 
                subtitle="Common tasks you might need help with"
                icon={Zap}
                iconColor="var(--color-warning)"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { label: 'Track My Order', desc: 'Real-time service tracking', icon: Truck, action: () => toast.info('Opening tracking...') },
                        { label: 'View Invoices', desc: 'Download payment receipts', icon: CreditCard, action: () => toast.info('Opening invoices...') },
                        { label: 'Manage Subscriptions', desc: 'Recurring services & billing', icon: Globe, action: () => toast.info('Opening subscriptions...') },
                        { label: 'Report a Problem', desc: 'Flag issues with a service', icon: Flag, action: () => toast.info('Opening report form...') },
                    ].map((action, i) => (
                        <PremiumCard key={i} variant="default" onClick={action.action}>
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
                        </PremiumCard>
                    ))}
                </div>
            </SectionCard>

            {/* Contact Support */}
            <Divider label="Need More Help?" />

            <SectionCard 
                title="Contact Support" 
                subtitle="Our team is here to help you 24/7"
                icon={MessageSquare}
                iconColor="var(--color-primary)"
                variant="ai"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {CONTACT_METHODS.map(method => (
                        <PremiumCard 
                            key={method.id} 
                            variant={contactMethod === method.id ? 'ai' : 'default'}
                            hover={false}
                            onClick={() => setContactMethod(method.id)}
                            className="relative"
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
                                            <Badge variant="success" dot dotColor="var(--color-success)" size="xs">Available</Badge>
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
                        </PremiumCard>
                    ))}
                </div>

                {contactMethod === 'chat' && (
                    <div className="card-lightning-subtle rounded-xl p-5" style={{ backgroundColor: 'rgba(var(--color-primary), 0.05)' }}>
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar name="Sarah" size="lg" status statusColor="var(--color-success)" />
                            <div>
                                <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>Sarah Mitchell</p>
                                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Support Specialist • Online now</p>
                            </div>
                        </div>
                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                            {[
                                { from: 'bot', text: 'Hi! How can I help you today?' },
                                { from: 'user', text: 'I need help with my recent booking' },
                                { from: 'bot', text: 'I\'d be happy to help. Could you share your booking reference number?' },
                            ].map((msg, i) => (
                                <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${msg.from === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
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
                            />
                            <PremiumButton variant="primary" size="lg">
                                <Send className="h-4 w-4" />
                            </PremiumButton>
                        </div>
                    </div>
                )}

                {contactMethod === 'email' && (
                    <div className="space-y-4">
                        <PremiumInput label="Subject" placeholder="How can we help?" />
                        <PremiumInput label="Description" placeholder="Describe your issue in detail..." helperText="Include booking ID, screenshots, or error messages if applicable" />
                        <div className="flex items-center gap-2">
                            <PremiumButton variant="primary" size="lg">
                                <Send className="h-4 w-4" />
                                Send Email
                            </PremiumButton>
                            <Badge variant="info">Usually responds within 4 hours</Badge>
                        </div>
                    </div>
                )}

                {contactMethod === 'phone' && (
                    <div className="text-center py-8">
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
                    <div className="space-y-4">
                        <div className="text-center py-4">
                            <h3 className="font-semibold" style={{ color: 'var(--color-primary)' }}>Schedule a Video Call</h3>
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Screen sharing available for technical issues</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <PremiumSelect label="Issue Type" options={[
                                { value: 'technical', label: 'Technical Support' },
                                { value: 'billing', label: 'Billing & Payments' },
                                { value: 'account', label: 'Account Issues' },
                                { value: 'other', label: 'Other' },
                            ]} placeholder="Select issue type" />
                            <PremiumSelect label="Preferred Time" options={[
                                { value: 'asap', label: 'As Soon As Possible' },
                                { value: 'today', label: 'Today' },
                                { value: 'tomorrow', label: 'Tomorrow' },
                                { value: 'this-week', label: 'This Week' },
                            ]} placeholder="When works best?" />
                        </div>
                        <PremiumButton variant="primary" size="lg" className="w-full">
                            <Video className="h-4 w-4" />
                            Schedule Call
                        </PremiumButton>
                    </div>
                )}
            </SectionCard>

            {/* Feedback */}
            <Divider label="Help Us Improve" />

            <SectionCard variant="elevated" className="text-center py-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Star className="h-6 w-6" style={{ color: 'var(--color-warning)' }} />
                    <Star className="h-6 w-6" style={{ color: 'var(--color-warning)' }} />
                    <Star className="h-6 w-6" style={{ color: 'var(--color-warning)' }} />
                    <Star className="h-6 w-6" style={{ color: 'var(--color-warning)' }} />
                    <Star className="h-6 w-6" style={{ color: 'var(--color-text-subtle)' }} />
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--color-primary)' }}>Rate Your Experience</h3>
                <p className="text-sm mb-4 max-w-md mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                    Your feedback helps us improve our help center and support experience.
                </p>
                <div className="flex justify-center gap-2">
                    <PremiumButton variant="primary" onClick={() => toast.success('Thanks for your feedback!')}>
                        <Star className="h-4 w-4" />
                        Rate 5 Stars
                    </PremiumButton>
                    <PremiumButton variant="outline" onClick={() => toast.info('Opening feedback form...')}>
                        Detailed Feedback
                    </PremiumButton>
                </div>
            </SectionCard>
        </PageWrapper>
    );
}