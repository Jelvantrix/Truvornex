import { useState, useEffect } from 'react';
import { ShieldCheck, ThumbsUp, ThumbsDown, Minus, AlertCircle, Star, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';

const VOTE_OPTIONS = [
    { value: 'for',     label: 'For Complainant', Icon: ThumbsUp,   color: 'var(--color-success)' },
    { value: 'against', label: 'For Provider',    Icon: ThumbsDown, color: 'var(--color-error)' },
    { value: 'abstain', label: 'Abstain',         Icon: Minus,      color: 'var(--color-text-muted)' },
];

function timeAgo(ts) {
    const diff = Date.now() - new Date(ts).getTime();
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff / 3600000);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    return 'just now';
}

export default function Jury() {
    const { user } = useAuth();
    const [disputes, setDisputes] = useState([]);
    const [myVotes, setMyVotes] = useState({});
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(null);

    const load = async () => {
        setLoading(true);
        const [dispRes, voteRes] = await Promise.all([
            supabase.from('disputes').select('*').eq('status', 'open').order('created_at', { ascending: false }),
            user ? supabase.from('jury_assignments').select('*').eq('juror_user_id', user.id) : Promise.resolve({ data: [] })
        ]);
        let d = dispRes.data || [];
        if (user) d = d.filter(dp => dp.raised_by !== user.id && dp.against_id !== user.id);
        setDisputes(d);
        const voteMap = {};
        (voteRes.data || []).forEach(v => { voteMap[v.dispute_id] = v.vote; });
        setMyVotes(voteMap);
        setLoading(false);
    };

    useEffect(() => { load(); }, [user]);

    const vote = async (dispute, choice) => {
        if (!user) { toast.error('Sign in to vote'); return; }
        if (myVotes[dispute.id]) { toast('Already voted on this dispute'); return; }
        setVoting(dispute.id + choice);
        const { error } = await supabase.from('jury_assignments').insert([{
            dispute_id: dispute.id,
            juror_user_id: user.id,
            vote: choice,
            voted_at: new Date().toISOString()
        }]);
        if (!error) {
            // Award time credit
            await supabase.from('time_credits_ledger').insert([{
                user_id: user.id,
                amount: 1,
                reason: 'jury_vote',
                related_entity_type: 'dispute',
                related_entity_id: dispute.id
            }]);
            setMyVotes(p => ({ ...p, [dispute.id]: choice }));
            toast.success('Vote recorded — +1 time credit earned');
        } else { toast.error(error.message || 'Failed to vote'); }
        setVoting(null);
    };

    return (
        <div className="space-y-6 pb-8 max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl flex items-center justify-center card-lightning-subtle"
                    style={{ backgroundColor: 'rgba(var(--color-primary),0.12)', border: '1px solid var(--color-border)' }}>
                    <ShieldCheck className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                    <h1 className="font-bold text-2xl tracking-tight" style={{ color: 'var(--color-primary)' }}>Neighborhood Jury</h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Peer-reviewed dispute resolution — earn time credits</p>
                </div>
            </div>

            {/* How it works */}
            <div className="rounded-2xl p-4 flex items-start gap-3 shimmer"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                    style={{ backgroundColor: 'rgba(var(--color-info),0.12)', border: '1px solid var(--color-border)' }}>
                    <AlertCircle className="h-5 w-5" style={{ color: 'var(--color-info)' }} />
                </div>
                <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>How the jury works</p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                        Disputes between customers and providers are resolved by a randomly selected panel of community members.
                        All identities are anonymized. Quorum is reached at 3 votes. Each vote earns 1 time credit.
                    </p>
                </div>
            </div>

            {/* Earn credits callout */}
            <div className="flex items-center gap-3 rounded-2xl p-4 shimmer"
                style={{ backgroundColor: 'rgba(var(--color-warning),0.08)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                    style={{ backgroundColor: 'rgba(var(--color-warning),0.12)', border: '1px solid var(--color-border)' }}>
                    <Star className="h-5 w-5" style={{ color: 'var(--color-warning)' }} />
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                    Earn 1 time credit for every dispute you vote on
                </p>
            </div>

            {/* Disputes list */}
            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-140 rounded-2xl shimmer"
                            style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }} />
                    ))}
                </div>
            ) : disputes.length === 0 ? (
                <div className="text-center py-16 rounded-2xl shimmer"
                    style={{ backgroundColor: 'var(--color-surface)', border: '1px dashed var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-3 card-lightning-subtle"
                        style={{ backgroundColor: 'rgba(var(--color-primary),0.12)', border: '1px solid var(--color-border)' }}>
                        <ShieldCheck className="h-10 w-10" style={{ color: 'var(--color-text-muted)' }} strokeWidth={1.5} />
                    </div>
                    <p className="font-medium" style={{ color: 'var(--color-text-muted)' }}>No open disputes</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>All disputes have been resolved — check back later</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {disputes.map(d => {
                        const voted = myVotes[d.id];
                        const evidence = Array.isArray(d.evidence_urls) ? d.evidence_urls : [];
                        return (
                            <div key={d.id} className="rounded-2xl overflow-hidden hover-lift card-lightning-subtle"
                                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                                <div className="p-5">
                                    <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                                d.status === 'voting'
                                                    ? 'bg-[rgba(var(--color-warning),0.15)]'
                                                    : 'bg-[rgba(var(--color-info),0.15)]'
                                            }`}
                                                style={d.status === 'voting' ? { color: 'var(--color-warning)' } : { color: 'var(--color-info)' }}>
                                                {d.status === 'voting' ? 'Voting in Progress' : 'Open for Review'}
                                            </span>
                                            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{timeAgo(d.created_at)}</span>
                                        </div>
                                        {evidence.length > 0 && (
                                            <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                                                <AlertCircle className="h-3 w-3" />
                                                {evidence.length} evidence item{evidence.length !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>

                                    {d.category && (
                                        <p className="text-sm mb-1">
                                            <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>Category:</span>
                                            <span className="ml-1 capitalize" style={{ color: 'var(--color-text-muted)' }}>{d.category}</span>
                                        </p>
                                    )}
                                    <p className="text-sm leading-relaxed line-clamp-4" style={{ color: 'var(--color-text-muted)' }}>
                                        {d.description}
                                    </p>
                                </div>

                                <div className="p-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                                    {voted ? (
                                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                            <Check className="h-4 w-4 shrink-0" style={{ color: 'var(--color-success)' }} />
                                            <span>Your vote: <span className="font-semibold capitalize" style={{ color: 'var(--color-primary)' }}>{voted.replace('_', ' ')}</span></span>
                                            <span className="ml-auto text-[10px] flex items-center gap-1" style={{ color: 'var(--color-warning)' }}>
                                                <Star className="h-3 w-3" /> +1 credit
                                            </span>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider mb-2.5" style={{ color: 'var(--color-text-muted)' }}>Cast your vote</p>
                                            <div className="flex gap-2 flex-wrap">
                                                {VOTE_OPTIONS.map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => vote(d, opt.value)}
                                                        disabled={!!voting}
                                                        className="flex items-center gap-1.5 h-8 px-3 rounded-xl border text-xs font-semibold transition-all input-lightning"
                                                        style={{
                                                            borderColor: 'var(--color-border)',
                                                            backgroundColor: 'var(--color-surface)',
                                                            color: opt.color
                                                        }}>
                                                        {voting === d.id + opt.value
                                                            ? <Loader2 className="h-3 w-3 animate-spin" style={{ color: opt.color }} />
                                                            : <opt.Icon className="h-3 w-3" style={{ color: opt.color }} />}
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!user && (
                <div className="text-center py-6 text-sm rounded-2xl shimmer"
                    style={{ backgroundColor: 'var(--color-surface)', border: '1px dashed var(--color-border)', color: 'var(--color-text-muted)' }}>
                    Sign in to participate as a juror and earn time credits
                </div>
            )}
        </div>
    );
}