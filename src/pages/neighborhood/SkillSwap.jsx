import { useState, useEffect } from 'react';
import { RefreshCw, GraduationCap, Search, Plus, Star, Check, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';

export default function SkillSwap() {
    const { user } = useAuth();
    const [swaps, setSwaps] = useState([]);
    const [mySwaps, setMySwaps] = useState([]);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [dialog, setDialog] = useState(false);
    const [form, setForm] = useState({ offering: '', seeking: '', time_credits: 1 });
    const [saving, setSaving] = useState(false);
    const [proposing, setProposing] = useState(null);

    const load = async () => {
        setLoading(true);
        const [openRes, myRes, balRes] = await Promise.all([
            supabase.from('skill_swaps').select('*').eq('status', 'open').order('created_at', { ascending: false }),
            user ? supabase.from('skill_swaps').select('*').eq('offerer_id', user.id) : Promise.resolve({ data: [] }),
            user ? supabase.from('time_credits_ledger').select('amount').eq('user_id', user.id) : Promise.resolve({ data: [] })
        ]);
        if (openRes.data) {
            // Get a default zone for the swaps
            const { data: zones } = await supabase.from('neighborhood_zones').select('id').limit(1);
            const defaultZone = zones?.[0]?.id || null;
            setSwaps(user ? openRes.data.filter(s => s.offerer_id !== user.id) : openRes.data);
        }
        if (myRes.data) setMySwaps(myRes.data);
        if (balRes.data) setBalance(balRes.data.reduce((sum, r) => sum + (r.amount || 0), 0));
        setLoading(false);
    };

    useEffect(() => { load(); }, [user]);

    const post = async () => {
        if (!form.offering.trim() || !form.seeking.trim()) { toast.error('Fill in both fields'); return; }
        if (!user) { toast.error('Sign in first'); return; }
        setSaving(true);
        try {
            // Get a default zone
            const { data: zones } = await supabase.from('neighborhood_zones').select('id').limit(1);
            const defaultZone = zones?.[0]?.id || null;
            const { error } = await supabase.from('skill_swaps').insert([{
                offering: form.offering.trim(),
                seeking: form.seeking.trim(),
                time_credits_offered: Number(form.time_credits),
                offerer_id: user.id,
                zone_id: defaultZone
            }]);
            if (error) throw error;
            toast.success('Skill swap posted');
            setDialog(false);
            setForm({ offering: '', seeking: '', time_credits: 1 });
            load();
        } catch (err) { toast.error(err.message || 'Failed to post'); }
        finally { setSaving(false); }
    };

    const propose = async (swap) => {
        if (!user) { toast.error('Sign in first'); return; }
        setProposing(swap.id);
        try {
            const { error } = await supabase.from('skill_swaps').update({
                status: 'matched',
                matched_with_user_id: user.id
            }).eq('id', swap.id);
            if (error) throw error;
            setSwaps(p => p.filter(s => s.id !== swap.id));
            toast.success('Swap proposed — the other person will be notified');
        } catch (err) { toast.error(err.message || 'Failed to propose'); }
        finally { setProposing(null); }
    };

    const STATUS_BADGE = {
        open:      { bg: 'rgba(var(--color-primary),0.12)', color: 'var(--color-primary)' },
        matched:   { bg: 'rgba(var(--color-success),0.12)', color: 'var(--color-success)' },
        completed: { bg: 'rgba(var(--color-text-muted),0.12)', color: 'var(--color-text-muted)' },
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                        <RefreshCw className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                        <h1 className="font-bold text-2xl tracking-tight" style={{ color: 'var(--color-primary)' }}>Skill Exchange</h1>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Trade skills · earn time credits</p>
                    </div>
                </div>
                <Button className="rounded-xl gap-2" onClick={() => user ? setDialog(true) : toast.error('Sign in first')}>
                    <Plus className="h-4 w-4" /> Post a Swap
                </Button>
            </div>

            {/* KPI: Time credits balance */}
            <div className="rounded-2xl p-5 shimmer hover-lift" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>Your Time Credits</p>
                        <p className="text-4xl font-black" style={{ color: 'var(--color-primary)' }}>{balance}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>1 credit = 1 hour of service</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                        <Star className="h-6 w-6" style={{ color: 'var(--color-primary)', opacity: 0.5 }} strokeWidth={1} />
                    </div>
                </div>
            </div>

            {/* My swaps */}
            {mySwaps.length > 0 && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>My Swaps</p>
                    <div className="space-y-2">
                        {mySwaps.map(s => {
                            const badge = STATUS_BADGE[s.status] || STATUS_BADGE.open;
                            return (
                                <div key={s.id} className="rounded-2xl p-4 flex items-center gap-3 flex-wrap card-premium hover-lift">
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1" style={{ color: 'var(--color-primary)', backgroundColor: 'rgba(var(--color-primary),0.10)' }}>
                                        <GraduationCap className="h-2.5 w-2.5" /> {s.offering}
                                    </span>
                                    <ArrowRight className="h-3 w-3 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1" style={{ color: 'var(--color-secondary)', backgroundColor: 'rgba(var(--color-secondary),0.10)' }}>
                                        <Search className="h-2.5 w-2.5" /> {s.seeking}
                                    </span>
                                    <div className="ml-auto">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: badge.bg, color: badge.color }}>
                                            {s.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Browse available swaps */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Available Swaps</p>
                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{swaps.length} posted</span>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton-wave h-24 rounded-2xl" />)}
                    </div>
                ) : swaps.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl card-premium" style={{ borderColor: 'var(--color-border)' }}>
                        <RefreshCw className="h-10 w-10 mx-auto mb-3" strokeWidth={1.5} style={{ color: 'var(--color-border-strong)' }} />
                        <p className="font-medium" style={{ color: 'var(--color-text-muted)' }}>No swaps posted yet</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Be the first — post what you offer and need</p>
                        {user && (
                            <button onClick={() => setDialog(true)} className="mt-4 text-sm font-semibold underline underline-offset-2" style={{ color: 'var(--color-primary)' }}>
                                Post the first swap
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {swaps.map(s => (
                            <div key={s.id} className="rounded-2xl p-5 card-premium hover-lift">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ color: 'var(--color-primary)', backgroundColor: 'rgba(var(--color-primary),0.10)' }}>
                                        <GraduationCap className="h-3 w-3" /> Offering: {s.offering}
                                    </span>
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ color: 'var(--color-secondary)', backgroundColor: 'rgba(var(--color-secondary),0.10)' }}>
                                        <Search className="h-3 w-3" /> Seeking: {s.seeking}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                                        <Star className="h-3 w-3" style={{ color: 'var(--color-warning)' }} />
                                        {s.time_credits_offered} credit{s.time_credits_offered !== 1 ? 's' : ''}
                                    </span>
                                    <Button size="sm" className="h-7 rounded-xl text-[10px] gap-1"
                                        disabled={proposing === s.id} onClick={() => propose(s)}>
                                        {proposing === s.id
                                            ? <Loader2 className="h-3 w-3 animate-spin" />
                                            : <Check className="h-3 w-3" />}
                                        Propose Swap
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Post dialog */}
            <Dialog open={dialog} onOpenChange={setDialog}>
                <DialogContent className="max-w-md rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <DialogHeader><DialogTitle>Post a Skill Swap</DialogTitle></DialogHeader>
                    <div className="space-y-3 pt-1">
                        <div className="rounded-xl p-3 card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.08)', border: '1px solid rgba(var(--color-primary),0.18)' }}>
                            <p className="text-xs font-bold mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
                                <GraduationCap className="h-3.5 w-3.5" /> What I Offer
                            </p>
                            <Input placeholder="e.g. Web design, cooking lessons, photography"
                                value={form.offering} onChange={e => setForm(p => ({ ...p, offering: e.target.value }))} className="input-lightning" />
                        </div>
                        <div className="rounded-xl p-3 card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-secondary),0.08)', border: '1px solid rgba(var(--color-secondary),0.18)' }}>
                            <p className="text-xs font-bold mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--color-secondary)' }}>
                                <Search className="h-3.5 w-3.5" /> What I Need
                            </p>
                            <Input placeholder="e.g. Plumbing help, accounting, tutoring"
                                value={form.seeking} onChange={e => setForm(p => ({ ...p, seeking: e.target.value }))} className="input-lightning" />
                        </div>
                        <div>
                            <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Time credits offered (hours)</p>
                            <Input type="number" min={1} max={20} value={form.time_credits}
                                onChange={e => setForm(p => ({ ...p, time_credits: e.target.value }))} className="input-lightning" />
                        </div>
                        <div className="rounded-xl p-3 text-xs" style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                            When a match is confirmed, credits transfer between both parties automatically via the time bank.
                        </div>
                        <Button className="w-full h-11 rounded-xl gap-2" onClick={post}
                            disabled={saving || !form.offering.trim() || !form.seeking.trim()}>
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            {saving ? 'Posting...' : 'Post Skill Swap'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
