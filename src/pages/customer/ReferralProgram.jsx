import { useState } from 'react';
import { Users, Copy, Check, Gift, Share2, TrendingUp, DollarSign, Gift as GiftIcon, Link as LinkIcon, CheckCircle2, Loader2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
    { icon: Share2, title: 'Share Your Link', desc: 'Send your unique referral link to friends and family via text, email, or social media.' },
    { icon: Users, title: 'They Sign Up & Book', desc: 'Your friend registers and completes their first booking with any provider.' },
    { icon: Gift, title: 'Both Earn Credits', desc: 'You get $10 credit and your friend gets $5 off their first booking — win-win!' },
];

const MOCK_REFERRALS = [
    { id: '1', name: 'Sarah Johnson', email: 'sarah@email.com', status: 'completed', date: '2025-01-10', credit: 10 },
    { id: '2', name: 'Mike Chen', email: 'mike@email.com', status: 'pending', date: '2025-01-18', credit: 0 },
    { id: '3', name: 'Emma Wilson', email: 'emma@email.com', status: 'completed', date: '2025-01-05', credit: 10 },
];

export default function ReferralProgram() {
    const [user] = useState({ id: 'abc123def456' });
    const [copied, setCopied] = useState(false);
    const [copying, setCopying] = useState(false);

    const refCode = user ? `TRV-${user.id.slice(0, 6).toUpperCase()}` : '...';
    const refLink = `${window.location.origin}/signup?ref=${refCode}`;

    const copyLink = async () => {
        setCopying(true);
        try {
            await navigator.clipboard.writeText(refLink);
            setCopied(true);
            toast.success('Referral link copied to clipboard!');
        } catch {
            toast.error('Failed to copy link');
        }
        setCopying(false);
        setTimeout(() => setCopied(false), 2000);
    };

    const totalEarned = MOCK_REFERRALS.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.credit, 0);
    const completedCount = MOCK_REFERRALS.filter(r => r.status === 'completed').length;
    const pendingCount = MOCK_REFERRALS.filter(r => r.status === 'pending').length;

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>Referral Program</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Invite friends and earn $10 for every successful referral — no limits</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Earned', value: `$${totalEarned}`, icon: DollarSign, color: 'var(--color-success)', bg: 'rgba(var(--color-success),0.12)' },
                        { label: 'Successful', value: completedCount, icon: CheckCircle2, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)' },
                        { label: 'Pending', value: pendingCount, icon: GiftIcon, color: 'var(--color-warning)', bg: 'rgba(var(--color-warning),0.12)' },
                        { label: 'Total Referrals', value: MOCK_REFERRALS.length, icon: Users, color: 'var(--color-accent)', bg: 'rgba(var(--color-accent),0.12)' },
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

            {/* Referral Card */}
            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-accent)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="text-center mb-6">
                    <TrendingUp className="h-10 w-10 mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
                    <h2 className="font-bold text-2xl mb-1" style={{ color: 'var(--color-primary)' }}>Earn $10 per referral</h2>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No limit — the more friends you refer, the more you earn</p>
                </div>

                <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                    <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block" style={{ color: 'var(--color-text-subtle)' }}>Your Referral Link</label>
                    <div className="flex gap-2">
                        <input 
                            value={refLink} 
                            readOnly 
                            className="input-lightning flex-1 px-4 py-3.5 rounded-xl text-sm font-mono bg-surface-high outline-none"
                            style={{ 
                                backgroundColor: 'var(--color-surface-high)', 
                                border: '1px solid var(--color-border-strong)', 
                                color: 'var(--color-text)',
                                fontSize: '13px',
                                fontFamily: 'monospace',
                            }} 
                        />
                        <button 
                            onClick={copyLink}
                            className="h-11 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shrink-0"
                            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                            disabled={copying}>
                            {copying ? <Loader2 className="h-4 w-4 animate-spin" /> : copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copying ? 'Copying...' : copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <p className="text-[10px] mt-2" style={{ color: 'var(--color-text-subtle)' }}>
                        Referral code: <span className="font-mono font-bold" style={{ color: 'var(--color-primary)' }}>{refCode}</span>
                    </p>
                </div>

                {/* Share Buttons */}
                <div className="flex flex-wrap gap-3 justify-center">
                    <button className="h-11 px-5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                        style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                        onClick={() => { toast.info('Opening share dialog...'); if (navigator.share) navigator.share({ title: 'Join Truvornex', text: 'Get $5 off your first booking!', url: refLink }); }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                        <Share2 className="h-4 w-4" />
                        Native Share
                    </button>
                    <button className="h-11 px-5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                        style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                        onClick={() => { toast.info('Opening email...'); window.location.href = `mailto:?subject=Join Truvornex & Get $5 Off&body=Hey! I\'ve been using Truvornex for home services and love it. Sign up with my link and get $5 off your first booking: ${refLink}` }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                        <LinkIcon className="h-4 w-4" />
                        Email
                    </button>
                    <button className="h-11 px-5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                        style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                        onClick={() => { toast.info('Opening SMS...'); window.location.href = `sms:?body=Hey! Join Truvornex with my link and get $5 off: ${refLink}` }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-accent)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}>
                        <MessageSquare className="h-4 w-4" />
                        SMS
                    </button>
                </div>
            </div>

            {/* How It Works */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>How It Works</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {STEPS.map((step, i) => (
                        <div key={i} className="rounded-xl p-4 transition-all hover-lift card-lightning-subtle relative"
                            style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                            {i < 2 && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center" style={{ color: 'var(--color-border)' }}>
                                    <ChevronRight className="h-5 w-5" />
                                </div>
                            )}
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-3 card-lightning-subtle"
                                style={{ backgroundColor: 'rgba(var(--color-primary), 0.12)' }}>
                                <step.icon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <h3 className="font-semibold text-center mb-1" style={{ color: 'var(--color-primary)' }}>{step.title}</h3>
                            <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Referral History */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Referral History</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                {MOCK_REFERRALS.map((ref, i) => {
                    const isCompleted = ref.status === 'completed';
                    return (
                        <div key={ref.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-high/50"
                            style={{ borderBottom: i < MOCK_REFERRALS.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                            <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: isCompleted ? 'rgba(var(--color-success),0.12)' : 'rgba(var(--color-warning),0.12)' }}>
                                {isCompleted ? <CheckCircle2 className="h-4.5 w-4.5" style={{ color: 'var(--color-success)' }} /> : <GiftIcon className="h-4.5 w-4.5" style={{ color: 'var(--color-warning)' }} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-primary)' }}>{ref.name}</p>
                                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{ref.email} · {new Date(ref.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isCompleted ? 'bg-success/10 text-success border border-success/20' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                                    {isCompleted ? 'Completed' : 'Pending'}
                                </span>
                                <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
                                    {isCompleted ? `+$${ref.credit}` : '$0'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* FAQ */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Frequently Asked Questions</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="space-y-3">
                    {[
                        { q: 'Is there a limit to how many people I can refer?', a: 'No limit! You can refer as many friends as you want and earn $10 for each successful referral.' },
                        { q: 'When do I receive my $10 credit?', a: 'You\'ll receive your credit once your friend completes their first paid booking. The credit is added to your account automatically.' },
                        { q: 'Does my friend need to use a specific service?', a: 'No, they can book any service from any provider on the platform. The $5 discount applies to their first booking of any amount.' },
                        { q: 'Can I refer someone who already has an account?', a: 'Referral credits only apply to new users signing up for the first time. Existing users cannot be referred.' },
                        { q: 'Do referral credits expire?', a: 'No, your referral credits never expire and can be used for any future booking on the platform.' },
                    ].map((faq, i) => (
                        <div key={i} className="rounded-xl p-4 transition-all hover-lift card-lightning-subtle"
                            style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                            <p className="font-medium text-sm" style={{ color: 'var(--color-primary)' }}>{faq.q}</p>
                            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}