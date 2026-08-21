import { useState } from 'react';
import { CreditCard, Plus, Trash2, Shield, CheckCircle2, Loader2, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

const CARD_BRANDS = { 
    visa: { name: 'Visa', color: 'var(--color-primary)', icon: CreditCard }, 
    mastercard: { name: 'Mastercard', color: 'var(--color-warning)', icon: CreditCard }, 
    amex: { name: 'Amex', color: 'var(--color-accent)', icon: CreditCard }, 
    discover: { name: 'Discover', color: 'var(--color-info)', icon: CreditCard } 
};

export default function PaymentMethods() {
    const [cards, setCards] = useState([
        { id: '1', brand: 'visa', last4: '4242', expiry: '12/27', default: true, name: 'John Smith' },
        { id: '2', brand: 'mastercard', last4: '5555', expiry: '08/26', default: false, name: 'John Smith' },
    ]);
    const [dialog, setDialog] = useState(false);
    const [form, setForm] = useState({ number: '', expiry: '', cvv: '', name: '' });
    const [adding, setAdding] = useState(false);
    const [removingId, setRemovingId] = useState(null);
    const [settingDefaultId, setSettingDefaultId] = useState(null);

    const validateCard = (number) => {
        const cleaned = number.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(cleaned)) return false;
        // Luhn algorithm
        let sum = 0;
        let shouldDouble = false;
        for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = parseInt(cleaned[i], 10);
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return sum % 10 === 0;
    };

    const detectBrand = (number) => {
        const cleaned = number.replace(/\s/g, '');
        if (/^4/.test(cleaned)) return 'visa';
        if (/^5[1-5]/.test(cleaned)) return 'mastercard';
        if (/^3[47]/.test(cleaned)) return 'amex';
        if (/^6(?:011|5)/.test(cleaned)) return 'discover';
        return 'visa';
    };

    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\D/g, '');
        const groups = cleaned.match(/.{1,4}/g);
        return groups ? groups.join(' ') : cleaned;
    };

    const addCard = async () => {
        if (!form.number || !form.expiry || !form.cvv || !form.name) { 
            toast.error('All fields are required'); 
            return; 
        }
        if (!validateCard(form.number)) {
            toast.error('Invalid card number');
            return;
        }
        setAdding(true);
        await new Promise(r => setTimeout(r, 800));
        const brand = detectBrand(form.number);
        const last4 = form.number.replace(/\s/g, '').slice(-4);
        const newCard = { id: Date.now().toString(), brand, last4, expiry: form.expiry, default: cards.length === 0, name: form.name };
        setCards(p => [...p, newCard]);
        setDialog(false);
        setForm({ number: '', expiry: '', cvv: '', name: '' });
        toast.success('Card added successfully');
        setAdding(false);
    };

    const setDefault = async (id) => {
        setSettingDefaultId(id);
        await new Promise(r => setTimeout(r, 300));
        setCards(p => p.map(c => ({ ...c, default: c.id === id })));
        toast.success('Default card updated');
        setSettingDefaultId(null);
    };

    const remove = async (id) => {
        setRemovingId(id);
        await new Promise(r => setTimeout(r, 300));
        setCards(p => p.filter(c => c.id !== id));
        toast.success('Card removed');
        setRemovingId(null);
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Payment Methods</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Manage your saved payment methods securely</p>
                </div>
                <button className="h-11 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                    onClick={() => setDialog(true)}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                    <Plus className="h-4 w-4" />
                    Add Card
                </button>
            </div>

            {/* Security Notice */}
            <div className="rounded-xl p-4 shimmer" style={{ backgroundColor: 'rgba(var(--color-primary),0.06)', border: '1px solid rgba(var(--color-primary),0.2)' }}>
                <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(var(--color-primary),0.15)' }}>
                        <Shield className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>Your payments are secure</p>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                            All payment information is encrypted and tokenized. We never store full card numbers — only the last 4 digits for identification.
                            Powered by Stripe with PCI DSS Level 1 compliance.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Saved Cards', value: cards.length, icon: CreditCard, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)' },
                        { label: 'Default Card', value: cards.find(c => c.default) ? 'Set' : 'None', icon: CheckCircle2, color: 'var(--color-success)', bg: 'rgba(var(--color-success),0.12)' },
                        { label: 'Brands Used', value: new Set(cards.map(c => c.brand)).size, icon: CreditCard, color: 'var(--color-accent)', bg: 'rgba(var(--color-accent),0.12)' },
                        { label: 'Security', value: 'Encrypted', icon: Shield, color: 'var(--color-warning)', bg: 'rgba(var(--color-warning),0.12)' },
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

            {/* Cards List */}
            {cards.length === 0 ? (
                <div className="rounded-2xl p-12 text-center shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <CreditCard className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--color-text-subtle)' }} />
                    <h2 className="font-bold text-lg mb-1" style={{ color: 'var(--color-primary)' }}>No payment methods saved</h2>
                    <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>Add your first card to speed up future bookings</p>
                    <button className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold transition-all"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                        onClick={() => setDialog(true)}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                        <Plus className="h-4 w-4" />
                        Add Your First Card
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {cards.map((card, index) => {
                        const brandInfo = CARD_BRANDS[card.brand] || CARD_BRANDS.visa;
                        const BrandIcon = brandInfo.icon;
                        const isDefault = card.default;
                        const isRemoving = removingId === card.id;
                        const isSettingDefault = settingDefaultId === card.id;
                        
                        return (
                            <div key={card.id} className="rounded-xl p-5 transition-all hover-lift card-lightning-subtle"
                                style={{ 
                                    backgroundColor: 'var(--color-surface)', 
                                    border: `1px solid ${isDefault ? 'var(--color-border-accent)' : 'var(--color-border)'}`,
                                    boxShadow: isDefault ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                                }}>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="h-12 w-16 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                                            style={{ backgroundColor: brandInfo.color }}>
                                            <BrandIcon className="h-5 w-5" style={{ color: 'var(--color-on-primary)' }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <p className="font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>
                                                    {brandInfo.name} ending in {card.last4}
                                                </p>
                                                {isDefault && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                                                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                                                        <CheckCircle2 className="h-3 w-3" /> Default
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                                                {card.name} · Expires {card.expiry}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 shrink-0">
                                        {!isDefault && (
                                            <button 
                                                className="h-9 w-9 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                                style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                                                onClick={() => setDefault(card.id)}
                                                disabled={isSettingDefault}
                                                aria-label="Set as default">
                                                {isSettingDefault ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--color-primary)' }} />
                                                ) : (
                                                    <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                                                )}
                                            </button>
                                        )}
                                        <button 
                                            className="h-9 w-9 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                            style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                                            onClick={() => remove(card.id)}
                                            disabled={isRemoving}
                                            aria-label="Remove card">
                                            {isRemoving ? (
                                                <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--color-error)' }} />
                                            ) : (
                                                <Trash2 className="h-4 w-4" style={{ color: 'var(--color-error)' }} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add Another Card Button */}
                    <button 
                        onClick={() => setDialog(true)}
                        className="w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                        style={{ backgroundColor: 'transparent', color: 'var(--color-primary)', border: '1px solid var(--color-border-strong)', cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.backgroundColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-on-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-primary)'; }}>
                        <Plus className="h-4 w-4" />
                        Add Another Card
                    </button>
                </div>
            )}

            {/* Tips */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Tips</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: Shield, title: 'Set Default Card', desc: 'Your default card is automatically charged for bookings — change anytime' },
                        { icon: CreditCard, title: 'Multiple Cards', desc: 'Save multiple cards and choose which one to use at checkout' },
                        { icon: AlertTriangle, title: 'Update Expired Cards', desc: 'Remove expired cards to avoid failed payments on upcoming bookings' },
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

            {/* Add Card Dialog */}
            {dialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
                    onClick={e => e.target === e.currentTarget && setDialog(false)}>
                    <div className="w-full max-w-md rounded-2xl p-6 space-y-5 animate-scale-in"
                        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}>
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>Add Payment Method</h2>
                            <button 
                                onClick={() => { setDialog(false); setForm({ number: '', expiry: '', cvv: '', name: '' }); }}
                                className="h-8 w-8 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                style={{ color: 'var(--color-text-subtle)', backgroundColor: 'transparent', border: 'none' }}
                                aria-label="Close dialog">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-text-subtle)' }}>Cardholder Name</label>
                            <input 
                                placeholder="John Smith"
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
                            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-text-subtle)' }}>Card Number</label>
                            <div className="relative">
                                <input 
                                    placeholder="1234 5678 9012 3456"
                                    value={form.number}
                                    onChange={e => {
                                        const formatted = formatCardNumber(e.target.value);
                                        const brand = detectBrand(formatted);
                                        setForm(p => ({ ...p, number: formatted }));
                                    }}
                                    className="input-lightning w-full px-4 py-3.5 rounded-xl text-base outline-none font-mono"
                                    style={{ 
                                        backgroundColor: 'var(--color-surface)',
                                        border: '1px solid var(--color-border-strong)',
                                        color: 'var(--color-text)',
                                        fontSize: '18px',
                                        fontFamily: 'monospace',
                                        letterSpacing: '0.02em',
                                    }}
                                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-accent)')}
                                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
                                    maxLength={19}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    {Object.entries(CARD_BRANDS).map(([key, info]) => (
                                        <info.icon key={key} className={`h-4 w-4 transition-all ${key === detectBrand(form.number) ? 'opacity-100' : 'opacity-20'}`} style={{ color: info.color }} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--color-text-subtle)' }}>Expiry (MM/YY)</label>
                                <input 
                                    placeholder="12/27"
                                    value={form.expiry}
                                    onChange={e => setForm(p => ({ ...p, expiry: e.target.value }))}
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
                                    maxLength={5}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--color-text-subtle)' }}>CVV</label>
                                <input 
                                    placeholder="123"
                                    value={form.cvv}
                                    onChange={e => setForm(p => ({ ...p, cvv: e.target.value }))}
                                    type="password"
                                    className="input-lightning w-full px-4 py-3.5 rounded-xl text-base outline-none font-mono"
                                    style={{ 
                                        backgroundColor: 'var(--color-surface)',
                                        border: '1px solid var(--color-border-strong)',
                                        color: 'var(--color-text)',
                                        fontSize: '15px',
                                        fontFamily: 'monospace',
                                    }}
                                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-accent)')}
                                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
                                    maxLength={4}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button 
                                className="flex-1 h-10 rounded-xl font-semibold transition-all"
                                style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                                onClick={() => { setDialog(false); setForm({ number: '', expiry: '', cvv: '', name: '' }); }}>
                                Cancel
                            </button>
                            <button 
                                className="flex-1 h-10 rounded-xl font-semibold transition-all"
                                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                                onClick={addCard} 
                                disabled={adding || !form.name || !form.number || !form.expiry || !form.cvv}>
                                {adding ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        Add Card
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