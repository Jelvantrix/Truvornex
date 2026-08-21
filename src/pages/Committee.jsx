import { useState, useEffect, useCallback } from 'react';
import {
    Users, Plus, PiggyBank, Trophy,
    CheckCircle, Loader2, Crown,
    TrendingUp, X, Info, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
    recruiting: { label: 'Recruiting', color: 'var(--color-info)', bg: 'var(--color-info-bg)' },
    active: { label: 'Active', color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
    completed: { label: 'Completed', color: 'var(--color-text-subtle)', bg: 'var(--color-surface-high)' },
    cancelled: { label: 'Cancelled', color: 'var(--color-error)', bg: 'var(--color-error-bg)' },
};

const ROUND_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtPKR(n) {
    return `PKR ${parseFloat(n || 0).toLocaleString('en-PK', { minimumFractionDigits: 0 })}`;
}

function CommitteeCard({ committee, isMember, isOrganizer, onOpen }) {
    const st = STATUS_CONFIG[committee.status] || STATUS_CONFIG.recruiting;
    const progress = committee.member_limit > 0
        ? Math.min(100, Math.round((parseInt(committee.member_count || 0) / committee.member_limit) * 100))
        : 0;
    const totalPot = parseFloat(committee.monthly_amount_pkr) * parseInt(committee.member_limit || 1);

    return (
        <button onClick={() => onOpen(committee)}
            className="card-premium rounded-2xl p-5 shimmer hover-lift w-full text-left block">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <PiggyBank className="h-4 w-4 shrink-0" style={{ color: 'var(--color-warning)' }} />
                        <h3 className="font-bold text-sm truncate" style={{ color: 'var(--color-text)' }}>{committee.name}</h3>
                        {isOrganizer && <Crown className="h-3 w-3 shrink-0" style={{ color: 'var(--color-warning)' }} />}
                    </div>
                    {committee.description && (
                        <p className="text-xs line-clamp-2" style={{ color: 'var(--color-text-subtle)' }}>{committee.description}</p>
                    )}
                </div>
                <div className="shrink-0 text-right">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                        style={{ backgroundColor: st.bg, color: st.color }}>
                        {st.label}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="rounded-xl p-2 text-center" style={{ backgroundColor: 'var(--color-surface-high)' }}>
                    <p className="font-black text-base" style={{ color: 'var(--color-primary)' }}>
                        {fmtPKR(committee.monthly_amount_pkr).replace('PKR ', '')}
                    </p>
                    <p className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--color-text-subtle)' }}>per month</p>
                </div>
                <div className="rounded-xl p-2 text-center" style={{ backgroundColor: 'var(--color-surface-high)' }}>
                    <p className="font-black text-base" style={{ color: 'var(--color-warning)' }}>
                        {committee.member_count || 0}/{committee.member_limit}
                    </p>
                    <p className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--color-text-subtle)' }}>members</p>
                </div>
                <div className="rounded-xl p-2 text-center" style={{ backgroundColor: 'var(--color-surface-high)' }}>
                    <p className="font-black text-base" style={{ color: 'var(--color-success)' }}>
                        {parseFloat(committee.monthly_amount_pkr * (committee.member_limit || 1)).toLocaleString()}
                    </p>
                    <p className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--color-text-subtle)' }}>monthly pot</p>
                </div>
            </div>

            <div className="mb-2">
                <div className="flex items-center justify-between text-[10px] mb-1" style={{ color: 'var(--color-text-subtle)' }}>
                    <span>Members filled</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-high)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: progress === 100 ? 'var(--color-success)' : 'var(--color-warning)' }} />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <p className="text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>
                        Organizer: {committee.organizer_name}
                    </p>
                </div>
                {isMember && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                        ✓ Member
                    </span>
                )}
            </div>
        </button>
    );
}

export default function CommitteePage() {
    const [user, setUser] = useState(null);
    const [committees, setCommittees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('all');
    const [selected, setSelected] = useState(null);
    const [detailData, setDetailData] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [joiningId, setJoiningId] = useState(null);
    const [activating, setActivating] = useState(false);
    const [contributing, setContributing] = useState(false);

    // Form state
    const [form, setForm] = useState({
        name: '', description: '', monthly_amount_pkr: '', member_limit: 12, total_rounds: 12, payout_day: 1,
    });
    const [saving, setSaving] = useState(false);

    const fetchCommittees = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch('/api/committees');
            const d = await r.json();
            setCommittees(d.committees || []);
        } catch (_) {}
        setLoading(false);
    }, []);

    useEffect(() => {
        const init = async () => {
            const r = await fetch('/api/auth/user');
            const d = await r.json();
            setUser(d.user);
            await fetchCommittees();
        };
        init();
    }, [fetchCommittees]);

    const openDetail = async (committee) => {
        setSelected(committee);
        setDetailLoading(true);
        try {
            const r = await fetch(`/api/committees/${committee.id}`);
            const d = await r.json();
            setDetailData(d);
        } catch (_) {}
        setDetailLoading(false);
    };

    const joinCommittee = async (id) => {
        setJoiningId(id);
        try {
            const r = await fetch(`/api/committees/${id}/join`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
            const d = await r.json();
            if (d.success) {
                toast.success(`Joined! Your payout position: #${d.position}`);
                await fetchCommittees();
                if (selected?.id === id) await openDetail({ ...selected });
            } else { toast.error(d.error || 'Failed to join'); }
        } catch (_) { toast.error('Network error'); }
        setJoiningId(null);
    };

    const activateCommittee = async () => {
        if (!selected) return;
        setActivating(true);
        try {
            const r = await fetch(`/api/committees/${selected.id}/activate`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' }
            });
            const d = await r.json();
            if (d.committee) {
                toast.success('Committee is now active! Round 1 has begun.');
                await fetchCommittees();
                setSelected(d.committee);
                await openDetail(d.committee);
            } else { toast.error(d.error || 'Failed to activate'); }
        } catch (_) { toast.error('Network error'); }
        setActivating(false);
    };

    const markContribution = async () => {
        if (!selected || !detailData) return;
        const committee = detailData.committee;
        const currentRound = committee.current_round || 1;
        setContributing(true);
        try {
            const r = await fetch(`/api/committees/${selected.id}/contribute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ round_number: currentRound, amount_pkr: parseFloat(committee.monthly_amount_pkr) }),
            });
            const d = await r.json();
            if (d.contribution) {
                toast.success(`Contribution of ${fmtPKR(committee.monthly_amount_pkr)} recorded for Round ${currentRound}!`);
                await openDetail(selected);
            } else { toast.error(d.error || 'Failed'); }
        } catch (_) { toast.error('Network error'); }
        setContributing(false);
    };

    const createCommittee = async () => {
        if (!form.name || !form.monthly_amount_pkr) { toast.error('Name and monthly amount required'); return; }
        setSaving(true);
        try {
            const r = await fetch('/api/committees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, monthly_amount_pkr: parseFloat(form.monthly_amount_pkr) }),
            });
            const d = await r.json();
            if (d.committee) {
                toast.success('Committee created! Share it with your neighbors to recruit members.');
                setCreateOpen(false);
                setForm({ name: '', description: '', monthly_amount_pkr: '', member_limit: 12, total_rounds: 12, payout_day: 1 });
                await fetchCommittees();
            } else { toast.error(d.error || 'Failed to create'); }
        } catch (_) { toast.error('Network error'); }
        setSaving(false);
    };

    const myCommittees = committees.filter(c => parseInt(c.is_member) > 0);
    const allCommittees = tab === 'my' ? myCommittees : committees;

    const isMember = (c) => parseInt(c.is_member) > 0;
    const isOrganizer = (c) => c.organizer_id === user?.id;

    const totalMonthlyPot = myCommittees
        .filter(c => c.status === 'active')
        .reduce((s, c) => s + parseFloat(c.monthly_amount_pkr) * parseInt(c.member_limit || 1), 0);

    const myStats = [
        { icon: Users, label: 'Active Groups', value: myCommittees.filter(c => c.status === 'active').length, tint: 'var(--color-primary)' },
        { icon: PiggyBank, label: 'Monthly Commitment', value: `PKR ${myCommittees.filter(c => c.status === 'active').reduce((s, c) => s + parseFloat(c.monthly_amount_pkr), 0).toLocaleString()}`, tint: 'var(--color-warning)' },
        { icon: TrendingUp, label: 'Total Monthly Pots', value: `PKR ${totalMonthlyPot.toLocaleString()}`, tint: 'var(--color-success)' },
    ];

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="font-display font-bold text-2xl tracking-tight flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                        <PiggyBank className="h-6 w-6" style={{ color: 'var(--color-warning)' }} />
                        Committee
                    </h1>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-subtle)' }}>
                        Rotating savings groups — digitized for your neighborhood
                    </p>
                </div>
                {user && (
                    <button onClick={() => setCreateOpen(true)}
                        className="btn-lightning flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                        <Plus className="h-3.5 w-3.5" /> Create Committee
                    </button>
                )}
            </div>

            {/* My Stats */}
            {user && myCommittees.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                    {myStats.map((s, i) => (
                        <div key={i} className="rounded-2xl p-5 shimmer"
                            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle mb-3"
                                style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                                <s.icon className="h-5 w-5" style={{ color: s.tint }} />
                            </div>
                            <p className="font-black text-2xl" style={{ color: s.tint }}>{s.value}</p>
                            <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Info Banner */}
            <div className="card-premium rounded-2xl p-4 mb-5 flex items-start gap-3 shimmer"
                style={{ backgroundColor: 'var(--color-warning-bg)', border: '1px solid var(--color-border)' }}>
                <Info className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
                <div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--color-warning)' }}>How Committee (Chit Fund) Works</p>
                    <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-text-subtle)' }}>
                        A group of neighbors each contribute a fixed amount monthly. Every month, one member receives the full pot.
                        Over N months, everyone gets their turn once — guaranteed savings without a bank!
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4">
                {[{ key: 'all', label: 'All Committees' }, { key: 'my', label: `My Committees${myCommittees.length ? ` (${myCommittees.length})` : ''}` }].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className="px-4 py-1.5 rounded-xl text-xs font-semibold transition-all"
                        style={{
                            backgroundColor: tab === t.key ? 'var(--color-primary)' : 'var(--color-surface)',
                            color: tab === t.key ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
                            border: `1px solid ${tab === t.key ? 'transparent' : 'var(--color-border)'}`,
                        }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--color-text-subtle)' }} />
                </div>
            ) : allCommittees.length === 0 ? (
                <div className="text-center py-16" style={{ color: 'var(--color-text-subtle)' }}>
                    <PiggyBank className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">{tab === 'my' ? 'You haven\'t joined any committees yet' : 'No committees yet'}</p>
                    {user && <button onClick={() => setCreateOpen(true)} className="text-xs mt-2 font-semibold" style={{ color: 'var(--color-primary)' }}>
                        Create the first one →
                    </button>}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {allCommittees.map(c => (
                        <CommitteeCard
                            key={c.id}
                            committee={c}
                            isMember={isMember(c)}
                            isOrganizer={isOrganizer(c)}
                            onOpen={openDetail}
                        />
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                    onClick={e => e.target === e.currentTarget && setSelected(null)}>
                    <div className="card-premium rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>{selected.name}</h2>
                                    {selected.description && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-subtle)' }}>{selected.description}</p>}
                                </div>
                                <button onClick={() => setSelected(null)} style={{ color: 'var(--color-text-subtle)' }}><X className="h-4 w-4" /></button>
                            </div>

                            {detailLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--color-text-subtle)' }} />
                                </div>
                            ) : detailData && (
                                <>
                                    {/* Stats */}
                                    <div className="grid grid-cols-4 gap-2 mb-4">
                                        {[
                                            { label: 'Monthly', value: fmtPKR(detailData.committee.monthly_amount_pkr), color: 'var(--color-warning)' },
                                            { label: 'Members', value: `${detailData.members?.length || 0}/${detailData.committee.member_limit}`, color: 'var(--color-info)' },
                                            { label: 'Round', value: `${detailData.committee.current_round || 0}/${detailData.committee.total_rounds}`, color: 'var(--color-success)' },
                                            { label: 'Pot', value: `PKR ${(parseFloat(detailData.committee.monthly_amount_pkr) * parseInt(detailData.committee.member_limit)).toLocaleString()}`, color: 'var(--color-warning)' },
                                        ].map(s => (
                                            <div key={s.label} className="rounded-xl p-2.5 text-center" style={{ backgroundColor: 'var(--color-surface-high)' }}>
                                                <p className="text-[10px] tracking-wide uppercase" style={{ color: 'var(--color-text-subtle)' }}>{s.label}</p>
                                                <p className="font-black text-xs mt-0.5" style={{ color: s.color }}>{s.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Status-specific actions */}
                                    {detailData.committee.status === 'recruiting' && (
                                        <div className="card-premium rounded-2xl p-4 mb-4 shimmer"
                                            style={{ backgroundColor: 'var(--color-info-bg)', border: '1px solid var(--color-border)' }}>
                                            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-info)' }}>Recruiting Members</p>
                                            <div className="h-2 rounded-full overflow-hidden mb-2" style={{ backgroundColor: 'var(--color-surface-high)' }}>
                                                <div className="h-full rounded-full"
                                                    style={{ width: `${Math.min(100, (detailData.members?.length / detailData.committee.member_limit) * 100)}%`, backgroundColor: 'var(--color-info)' }} />
                                            </div>
                                            <p className="text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>
                                                {detailData.members?.length || 0} of {detailData.committee.member_limit} spots filled
                                            </p>
                                            <div className="flex gap-2 mt-3">
                                                {!isMember(selected) && user && (
                                                    <button onClick={() => joinCommittee(selected.id)} disabled={joiningId === selected.id}
                                                        className="btn-lightning flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-opacity"
                                                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', opacity: joiningId === selected.id ? 0.6 : 1 }}>
                                                        {joiningId === selected.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                                                        Join Committee
                                                    </button>
                                                )}
                                                {isOrganizer(selected) && (detailData.members?.length || 0) >= 2 && (
                                                    <button onClick={activateCommittee} disabled={activating}
                                                        className="btn-lightning flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-opacity"
                                                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', opacity: activating ? 0.6 : 1 }}>
                                                        {activating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                                                        Start Committee
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {detailData.committee.status === 'active' && (
                                        <div className="card-premium rounded-2xl p-4 mb-4 shimmer"
                                            style={{ backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-border)' }}>
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs font-semibold" style={{ color: 'var(--color-success)' }}>
                                                    Round {detailData.committee.current_round} of {detailData.committee.total_rounds}
                                                </p>
                                                {detailData.committee.next_payout_at && (
                                                    <p className="text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>
                                                        Next payout: {new Date(detailData.committee.next_payout_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </p>
                                                )}
                                            </div>
                                            {isMember(selected) && user && (
                                                <button onClick={markContribution} disabled={contributing}
                                                    className="btn-lightning w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-opacity"
                                                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', opacity: contributing ? 0.6 : 1 }}>
                                                    {contributing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                                                    Record My Contribution — {fmtPKR(detailData.committee.monthly_amount_pkr)}
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Payout Schedule */}
                                    <div className="mb-4">
                                        <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: 'var(--color-text)' }}>
                                            <Trophy className="h-3.5 w-3.5" style={{ color: 'var(--color-warning)' }} />
                                            Payout Schedule
                                        </h3>
                                        <div className="space-y-1.5">
                                            {detailData.members?.map((member, i) => {
                                                const round = member.payout_position || (i + 1);
                                                const isCurrentRound = round === detailData.committee.current_round;
                                                const isPastRound = round < (detailData.committee.current_round || 1);
                                                const isMe = member.user_id === user?.id;
                                                return (
                                                    <div key={member.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl card-lightning-subtle"
                                                        style={{
                                                            backgroundColor: isCurrentRound ? 'var(--color-warning-bg)' : isMe ? 'var(--color-success-bg)' : 'var(--color-surface-high)',
                                                            border: `1px solid ${isCurrentRound ? 'var(--color-border)' : 'transparent'}`,
                                                        }}>
                                                        <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                                                            style={{ backgroundColor: isPastRound ? 'var(--color-success-bg)' : isCurrentRound ? 'var(--color-warning-bg)' : 'var(--color-surface)', color: isPastRound ? 'var(--color-success)' : isCurrentRound ? 'var(--color-warning)' : 'var(--color-text-subtle)' }}>
                                                            {round}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                                                                {member.full_name || member.email || 'Member'} {isMe && '(You)'}
                                                            </p>
                                                            <p className="text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>
                                                                {member.contributed_rounds} contributions
                                                            </p>
                                                        </div>
                                                        <div className="shrink-0 flex items-center gap-1.5">
                                                            {isPastRound && member.has_received_payout && (
                                                                <CheckCircle className="h-3.5 w-3.5" style={{ color: 'var(--color-success)' }} />
                                                            )}
                                                            {isCurrentRound && (
                                                                <Trophy className="h-3.5 w-3.5" style={{ color: 'var(--color-warning)' }} />
                                                            )}
                                                            <p className="text-xs font-bold" style={{ color: isCurrentRound ? 'var(--color-warning)' : 'var(--color-text-subtle)' }}>
                                                                {fmtPKR(detailData.committee.monthly_amount_pkr * (detailData.committee.member_limit || 1))}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Recent Contributions */}
                                    {detailData.contributions?.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: 'var(--color-text)' }}>
                                                <BarChart3 className="h-3.5 w-3.5" style={{ color: 'var(--color-info)' }} />
                                                Recent Contributions
                                            </h3>
                                            <div className="space-y-1.5">
                                                {detailData.contributions.slice(0, 6).map(c => (
                                                    <div key={c.id} className="flex items-center justify-between px-3 py-2 rounded-xl card-lightning-subtle"
                                                        style={{ backgroundColor: 'var(--color-surface-high)' }}>
                                                        <div>
                                                            <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{c.member_name || 'Member'}</p>
                                                            <p className="text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>Round {c.round_number} · {new Date(c.paid_at).toLocaleDateString()}</p>
                                                        </div>
                                                        <p className="text-sm font-bold" style={{ color: 'var(--color-success)' }}>+{fmtPKR(c.amount_pkr)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {createOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                    onClick={e => e.target === e.currentTarget && setCreateOpen(false)}>
                    <div className="card-premium rounded-2xl p-5 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>Create Committee</h2>
                            <button onClick={() => setCreateOpen(false)} style={{ color: 'var(--color-text-subtle)' }}><X className="h-4 w-4" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-subtle)' }}>Committee Name *</label>
                                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. DHA Phase 5 Block B Committee"
                                    className="input-lightning w-full px-4 py-3.5 rounded-xl text-sm outline-none"
                                    style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-subtle)' }}>Description</label>
                                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Who can join, purpose, any rules…" rows={2}
                                    className="input-lightning w-full px-4 py-3.5 rounded-xl text-sm outline-none resize-none"
                                    style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-subtle)' }}>Monthly Contribution per Member (PKR) *</label>
                                <input type="number" min={100} value={form.monthly_amount_pkr} onChange={e => setForm(f => ({ ...f, monthly_amount_pkr: e.target.value }))}
                                    placeholder="e.g. 5000"
                                    className="input-lightning w-full px-4 py-3.5 rounded-xl text-sm outline-none"
                                    style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                                {form.monthly_amount_pkr && form.member_limit && (
                                    <p className="text-[10px] mt-1" style={{ color: 'var(--color-success)' }}>
                                        Monthly pot = PKR {(parseFloat(form.monthly_amount_pkr) * parseInt(form.member_limit)).toLocaleString()}
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-subtle)' }}>Max Members</label>
                                    <select value={form.member_limit} onChange={e => setForm(f => ({ ...f, member_limit: parseInt(e.target.value), total_rounds: parseInt(e.target.value) }))}
                                        className="input-lightning w-full px-4 py-3.5 rounded-xl text-sm outline-none"
                                        style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                                        {[5, 6, 8, 10, 12, 15, 20, 24].map(n => <option key={n} value={n}>{n} members</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--color-text-subtle)' }}>Payout Day of Month</label>
                                    <select value={form.payout_day} onChange={e => setForm(f => ({ ...f, payout_day: parseInt(e.target.value) }))}
                                        className="input-lightning w-full px-4 py-3.5 rounded-xl text-sm outline-none"
                                        style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                                        {[1, 5, 10, 15, 20, 25, 28].map(n => <option key={n} value={n}>{n}th</option>)}
                                    </select>
                                </div>
                            </div>

                            {form.monthly_amount_pkr && form.member_limit && (
                                <div className="card-premium rounded-xl p-3 shimmer"
                                    style={{ backgroundColor: 'var(--color-warning-bg)', border: '1px solid var(--color-border)' }}>
                                    <p className="text-[11px] font-semibold mb-1" style={{ color: 'var(--color-warning)' }}>Summary</p>
                                    <p className="text-[11px]" style={{ color: 'var(--color-text-subtle)' }}>
                                        {form.member_limit} members × PKR {parseFloat(form.monthly_amount_pkr).toLocaleString()}/month =
                                        <strong style={{ color: 'var(--color-warning)' }}> PKR {(parseFloat(form.monthly_amount_pkr) * parseInt(form.member_limit)).toLocaleString()}</strong> monthly pot.
                                        Each member waits their turn (max {form.member_limit} months) to receive the full amount.
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 mt-5">
                            <button onClick={() => setCreateOpen(false)} className="btn-lightning-subtle flex-1 py-2.5 rounded-xl text-sm font-semibold"
                                style={{ backgroundColor: 'var(--color-surface-high)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                                Cancel
                            </button>
                            <button onClick={createCommittee} disabled={saving || !form.name || !form.monthly_amount_pkr}
                                className="btn-lightning flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity"
                                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', opacity: (saving || !form.name || !form.monthly_amount_pkr) ? 0.5 : 1 }}>
                                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : 'Create Committee'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
