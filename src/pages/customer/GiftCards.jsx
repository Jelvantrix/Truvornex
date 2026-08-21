import { useState } from 'react';
import { Gift, Send, CreditCard, CheckCircle2, Loader2, Star, Heart, Mail, MessageSquare, Minus, Plus, HelpCircle, AlertTriangle, History, Shield } from 'lucide-react';
import { toast } from 'sonner';

const AMOUNTS = [25, 50, 75, 100, 150, 200, 250, 300, 500];

const MOCK_HISTORY = [
    { id: '1', amount: 50, recipient: 'sarah@email.com', date: '2024-12-15', status: 'redeemed', code: 'TRV-ABCD-1234' },
    { id: '2', amount: 100, recipient: 'mike@email.com', date: '2024-11-28', status: 'pending', code: 'TRV-EFGH-5678' },
    { id: '3', amount: 75, recipient: 'emma@email.com', date: '2024-10-10', status: 'redeemed', code: 'TRV-IJKL-9012' },
    { id: '4', amount: 150, recipient: 'james@email.com', date: '2024-09-05', status: 'expired', code: 'TRV-MNOP-3456' },
];

const MOCK_RECEIVED = [
    { id: 'r1', amount: 50, sender: 'Mom', date: '2024-12-20', status: 'redeemed', code: 'TRV-QRST-7890' },
    { id: 'r2', amount: 100, sender: 'Dad', date: '2024-11-15', status: 'pending', code: 'TRV-UVWX-2345' },
];

const getStatusStyle = (status) => {
    switch (status) {
        case 'redeemed': return { bg: 'rgba(var(--color-success),0.15)', color: 'var(--color-success)', label: 'Redeemed' };
        case 'pending': return { bg: 'rgba(var(--color-warning),0.15)', color: 'var(--color-warning)', label: 'Pending' };
        case 'expired': return { bg: 'rgba(var(--color-error),0.15)', color: 'var(--color-error)', label: 'Expired' };
        default: return { bg: 'var(--color-surface-high)', color: 'var(--color-text-muted)', label: status };
    }
};

const formatAmount = (amt) => `$${amt.toLocaleString()}`;

export default function GiftCards() {
    const [tab, setTab] = useState('send');
    const [amount, setAmount] = useState(50);
    const [customAmount, setCustomAmount] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [message, setMessage] = useState('');
    const [redeemCode, setRedeemCode] = useState('');
    const [sending, setSending] = useState(false);
    const [redeeming, setRedeeming] = useState(false);
    const [sentSuccess, setSentSuccess] = useState(false);
    const [redeemSuccess, setRedeemSuccess] = useState(false);

    const selectedAmount = customAmount ? Number(customAmount) : amount;
    const isValidAmount = selectedAmount >= 10 && selectedAmount <= 2000;

    const adjustAmount = (delta) => {
        const newAmount = Math.max(10, Math.min(2000, selectedAmount + delta));
        if (newAmount % 5 === 0) {
            setAmount(newAmount);
            setCustomAmount('');
        }
    };

    const sendGift = async () => {
        if (!recipientEmail || !isValidAmount) { 
            toast.error('Valid email and amount ($10-$2000) required'); 
            return; 
        }
        setSending(true);
        await new Promise(r => setTimeout(r, 1200));
        setSending(false);
        setSentSuccess(true);
        toast.success(`Gift card sent to ${recipientEmail}!`);
        setRecipientEmail(''); 
        setRecipientName(''); 
        setMessage('');
        setTimeout(() => setSentSuccess(false), 5000);
    };

    const redeem = async () => {
        if (!redeemCode.trim()) { toast.error('Enter a gift card code'); return; }
        setRedeeming(true);
        await new Promise(r => setTimeout(r, 1000));
        setRedeeming(false);
        setRedeemSuccess(true);
        toast.success('Gift card redeemed! $50 added to your account credits.');
        setRedeemCode('');
        setTimeout(() => setRedeemSuccess(false), 5000);
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Gift Cards</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Give the gift of great service — perfect for any occasion</p>
            </div>

            {/* Stats Overview */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { value: '$375', label: 'Sent This Year', icon: Send, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)' },
                        { value: '$150', label: 'Received', icon: Gift, color: 'var(--color-accent)', bg: 'rgba(var(--color-accent),0.12)' },
                        { value: '$200', label: 'Account Balance', icon: CreditCard, color: 'var(--color-success)', bg: 'rgba(var(--color-success),0.12)' },
                        { value: 'No expiry', label: 'Valid Forever', icon: Star, color: 'var(--color-warning)', bg: 'rgba(var(--color-warning),0.12)' },
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

            {/* Tab Switcher */}
            <div className="flex gap-1 p-1 rounded-xl mb-6 card-lightning-subtle" style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                {[
                    { id: 'send', label: 'Send Gift Card', icon: Send },
                    { id: 'redeem', label: 'Redeem Code', icon: CreditCard },
                    { id: 'history', label: 'History', icon: History },
                ].map(t => (
                    <button 
                        key={t.id}
                        onClick={() => { setTab(t.id); setSentSuccess(false); setRedeemSuccess(false); }}
                        className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'btn-lightning' : 'text-text-muted hover:text-text hover:bg-surface-high'}`}
                        style={{
                            color: tab === t.id ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
                            backgroundColor: tab === t.id ? 'var(--color-primary)' : 'transparent',
                            border: 'none', cursor: 'pointer',
                        }}>
                        <span className="flex items-center justify-center gap-2">
                            <t.icon className="h-4 w-4" />
                            {t.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Send Tab */}
            {tab === 'send' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Gift Card Preview */}
                    <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-accent)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="relative">
                            <div className="absolute inset-0" style={{ 
                                background: 'radial-gradient(ellipse at center, var(--glow-primary) 0%, transparent 70%)',
                                opacity: 0.15
                            }} />
                            <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl flex items-center justify-center card-lightning"
                                        style={{ backgroundColor: 'rgba(var(--color-primary), 0.12)', boxShadow: '0 0 32px -4px var(--color-primary)' }}>
                                        <Gift className="h-7 w-7" style={{ color: 'var(--color-primary)' }} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Gift Card Value</p>
                                        <p className="font-black text-3xl sm:text-4xl" style={{ color: 'var(--color-primary)', letterSpacing: '-0.05em' }}>{formatAmount(selectedAmount)}</p>
                                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Truvornex Services Gift Card</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium flex items-center gap-1 justify-end" style={{ color: 'var(--color-success)' }}>
                                        <Shield className="h-3 w-3" /> Never expires
                                    </p>
                                    <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>No fees • Transferable</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Amount Selector */}
                    <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-subtle)' }}>Select Amount</p>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(var(--color-primary),0.15)', color: 'var(--color-primary)' }}>$10 - $2,000</span>
                        </div>
                        
                        {/* Quick Amount Buttons */}
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                            {AMOUNTS.map(a => {
                                const selected = amount === a && !customAmount;
                                return (
                                    <button 
                                        key={a} 
                                        onClick={() => { setAmount(a); setCustomAmount(''); }}
                                        className="h-12 rounded-xl text-sm font-bold transition-all card-lightning-subtle"
                                        style={{
                                            backgroundColor: selected ? 'var(--color-primary)' : 'var(--color-surface-high)',
                                            color: selected ? 'var(--color-on-primary)' : 'var(--color-text)',
                                            border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border-strong)'}`,
                                            cursor: 'pointer',
                                        }}>
                                        {formatAmount(a)}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Custom Amount Input */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold" style={{ color: 'var(--color-primary)' }}>$</span>
                                <input 
                                    placeholder="Custom amount" 
                                    type="number" 
                                    min="10" 
                                    max="2000" 
                                    step="5"
                                    value={customAmount || (amount && !AMOUNTS.includes(amount) ? amount : '')}
                                    onChange={e => { const val = e.target.value; setCustomAmount(val); if (val) setAmount(Number(val)); }}
                                    onBlur={e => { if (e.target.value) { setAmount(Number(e.target.value)); setCustomAmount(''); }}}
                                    className="input-lightning w-full pl-8 pr-4 py-3.5 text-lg outline-none"
                                    style={{ 
                                        backgroundColor: 'var(--color-surface)',
                                        border: `1px solid ${isValidAmount || !customAmount ? 'var(--color-border-strong)' : 'var(--color-error)'}`,
                                        color: 'var(--color-text)',
                                        fontSize: '18px',
                                        fontFamily: 'Inter,sans-serif',
                                    }}
                                />
                            </div>
                            <div className="flex items-center gap-1 border-l pl-3" style={{ borderColor: 'var(--color-border)' }}>
                                <button 
                                    onClick={() => adjustAmount(-5)}
                                    className="h-10 w-10 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                    style={{ backgroundColor: 'var(--color-surface-high)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
                                    aria-label="Decrease amount">
                                    <Minus className="h-4 w-4" />
                                </button>
                                <button 
                                    onClick={() => adjustAmount(5)}
                                    className="h-10 w-10 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                    style={{ backgroundColor: 'var(--color-surface-high)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
                                    aria-label="Increase amount">
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {!isValidAmount && customAmount && (
                            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--color-error)' }}>
                                <AlertTriangle className="h-3 w-3" />
                                Amount must be between $10 and $2,000
                            </p>
                        )}
                    </div>

                    {/* Recipient Fields */}
                    <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="mb-5">
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Recipient Details</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Where should we send the gift card?</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                                    Recipient Email *
                                </label>
                                <input 
                                    placeholder="friend@example.com"
                                    type="email"
                                    value={recipientEmail}
                                    onChange={e => setRecipientEmail(e.target.value)}
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
                                {recipientEmail && !recipientEmail.includes('@') && (
                                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--color-error)' }}>
                                        <AlertTriangle className="h-3 w-3" />
                                        Enter a valid email
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                                    Recipient Name (optional)
                                </label>
                                <input 
                                    placeholder="John Smith"
                                    value={recipientName}
                                    onChange={e => setRecipientName(e.target.value)}
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
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                                    Personal Message (optional)
                                </label>
                                <textarea 
                                    placeholder="Add a personal note..."
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    rows={4}
                                    className="input-lightning w-full px-4 py-3 rounded-xl resize-none outline-none"
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
                                <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-subtle)' }}>{message.length}/500 characters</p>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Options */}
                    <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="mb-5">
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Delivery Options</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>How would you like to send it?</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="rounded-xl p-4 transition-all hover-lift card-lightning-subtle relative"
                                style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
                                    <CheckCircle2 className="h-3 w-3" style={{ color: 'var(--color-on-primary)' }} />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle"
                                        style={{ backgroundColor: 'rgba(var(--color-primary), 0.12)' }}>
                                        <Mail className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                                    </div>
                                    <div>
                                        <p className="font-medium" style={{ color: 'var(--color-primary)' }}>Email Delivery</p>
                                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Sent instantly to their inbox</p>
                                    </div>
                                </div>
                                <span className="text-xs" style={{ color: 'var(--color-success)' }}>Free • Default</span>
                            </div>
                            <div className="rounded-xl p-4 transition-all hover-lift card-lightning-subtle"
                                style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle"
                                        style={{ backgroundColor: 'var(--color-surface-high)' }}>
                                        <MessageSquare className="h-5 w-5" style={{ color: 'var(--color-text-muted)' }} />
                                    </div>
                                    <div>
                                        <p className="font-medium" style={{ color: 'var(--color-primary)' }}>Text Message</p>
                                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>SMS with gift card link</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(var(--color-info),0.15)', color: 'var(--color-info)' }}>Coming Soon</span>
                            </div>
                        </div>
                    </div>

                    {/* Send Button */}
                    <button 
                        className="w-full h-12 rounded-xl gap-2 card-lightning text-base font-semibold flex items-center justify-center transition-all"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', cursor: sending || sentSuccess || !recipientEmail || !isValidAmount ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: sending || sentSuccess || !recipientEmail || !isValidAmount ? 0.6 : 1 }}
                        onClick={sendGift}
                        disabled={sending || sentSuccess || !recipientEmail || !isValidAmount}
                        onMouseEnter={e => { if (!sending && !sentSuccess && recipientEmail && isValidAmount) e.currentTarget.style.opacity = '0.88'; }}
                        onMouseLeave={e => { if (!sending && !sentSuccess) e.currentTarget.style.opacity = '1'; }}>
                        {sending ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="flex items-center gap-2">Sending Gift Card…</span>
                            </>
                        ) : sentSuccess ? (
                            <>
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="flex items-center gap-2">Sent Successfully!</span>
                            </>
                        ) : (
                            <>
                                <Send className="h-5 w-5" />
                                <span className="flex items-center gap-2">Send {formatAmount(selectedAmount)} Gift Card</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Redeem Tab */}
            {tab === 'redeem' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="rounded-2xl p-6 shimmer text-center" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4 card-lightning"
                            style={{ backgroundColor: 'rgba(var(--color-primary), 0.12)' }}>
                            <CreditCard className="h-7 w-7" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <h2 className="font-semibold text-lg mb-2" style={{ color: 'var(--color-primary)' }}>Redeem a Gift Card</h2>
                        <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                            Enter your gift card code below to add credits to your account instantly
                        </p>
                        
                        {redeemSuccess && (
                            <div className="mt-6 p-4 rounded-xl animate-fade-in" style={{ backgroundColor: 'rgba(var(--color-success), 0.1)', border: '1px solid rgba(var(--color-success), 0.3)' }}>
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--color-success)' }} />
                                    <span className="font-semibold" style={{ color: 'var(--color-success)' }}>Redeemed Successfully!</span>
                                </div>
                                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>$50 added to your account credits</p>
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="space-y-4">
                            <input 
                                placeholder="Gift card code (e.g. TRV-XXXX-XXXX)"
                                value={redeemCode} 
                                onChange={e => setRedeemCode(e.target.value.toUpperCase())}
                                className="input-lightning w-full py-3.5 text-center text-lg outline-none font-mono tracking-wider"
                                style={{ 
                                    backgroundColor: 'var(--color-surface)',
                                    border: '1px solid var(--color-border-strong)',
                                    height: 52,
                                    fontSize: '16px',
                                    letterSpacing: '0.08em',
                                    fontFamily: 'monospace',
                                }}
                                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-accent)')}
                                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}
                                autoFocus
                            />
                            <button 
                                className="w-full h-12 rounded-xl gap-2 text-base font-semibold flex items-center justify-center transition-all"
                                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', cursor: redeeming || redeemSuccess || !redeemCode.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: redeeming || redeemSuccess || !redeemCode.trim() ? 0.6 : 1 }}
                                onClick={redeem}
                                disabled={redeeming || redeemSuccess || !redeemCode.trim()}
                                onMouseEnter={e => { if (!redeeming && !redeemSuccess && redeemCode.trim()) e.currentTarget.style.opacity = '0.88'; }}
                                onMouseLeave={e => { if (!redeeming && !redeemSuccess) e.currentTarget.style.opacity = '1'; }}>
                                {redeeming ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span className="flex items-center gap-2">Verifying Code…</span>
                                    </>
                                ) : redeemSuccess ? (
                                    <>
                                        <CheckCircle2 className="h-5 w-5" />
                                        <span className="flex items-center gap-2">Redeemed!</span>
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="h-5 w-5" />
                                        <span className="flex items-center gap-2">Redeem Gift Card</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Help */}
                    <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 className="font-semibold mb-3" style={{ color: 'var(--color-primary)' }}>Need Help?</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button className="h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)', cursor: 'pointer' }}
                                onClick={() => toast.info('Opening help article...')}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                                <HelpCircle className="h-4 w-4" />
                                Where to find your code
                            </button>
                            <button className="h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)', cursor: 'pointer' }}
                                onClick={() => toast.info('Opening support chat...')}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                                <MessageSquare className="h-4 w-4" />
                                Code not working?
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* History Tab */}
            {tab === 'history' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Gift Card History</p>
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Track all sent and received gift cards</p>
                    </div>

                    {/* Sent History */}
                    <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="mb-5">
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Sent Gift Cards</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{MOCK_HISTORY.length} total</p>
                        </div>
                        
                        <div className="space-y-3">
                            {MOCK_HISTORY.map(item => {
                                const statusStyle = getStatusStyle(item.status);
                                return (
                                    <div key={item.id} className="rounded-xl p-4 transition-all hover-lift card-lightning-subtle"
                                        style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                                        <div className="flex items-center justify-between gap-4 flex-wrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                                                    style={{ backgroundColor: 'rgba(var(--color-primary), 0.12)' }}>
                                                    <Gift className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>{formatAmount(item.amount)}</p>
                                                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>To: {item.recipient}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                                                    style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                                                    {statusStyle.label}
                                                </span>
                                                <span className="text-xs font-mono" style={{ color: 'var(--color-text-subtle)' }}>{item.code}</span>
                                                <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
                                                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Received History */}
                    <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="mb-5">
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-subtle)' }}>Received Gift Cards</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{MOCK_RECEIVED.length} total</p>
                        </div>
                        
                        <div className="space-y-3">
                            {MOCK_RECEIVED.map(item => {
                                const statusStyle = getStatusStyle(item.status);
                                return (
                                    <div key={item.id} className="rounded-xl p-4 transition-all hover-lift card-lightning-subtle"
                                        style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                                        <div className="flex items-center justify-between gap-4 flex-wrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                                                    style={{ backgroundColor: 'rgba(var(--color-accent), 0.12)' }}>
                                                    <Heart className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold" style={{ color: 'var(--color-primary)' }}>{formatAmount(item.amount)}</p>
                                                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>From: {item.sender}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                                                    style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                                                    {statusStyle.label}
                                                </span>
                                                <span className="text-xs font-mono" style={{ color: 'var(--color-text-subtle)' }}>{item.code}</span>
                                                <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
                                                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}