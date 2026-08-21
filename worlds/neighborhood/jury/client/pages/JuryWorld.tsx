/**
 * JuryWorld - Main page component for the Jury/Dispute Resolution world
 * Merges Jury.jsx with enhanced dispute timeline
 */

import { useState, useEffect } from 'react';
import {
  ShieldCheck, ThumbsUp, ThumbsDown, Minus, AlertCircle,
  Star, Loader2, Check, FileText, Clock, Users, Scale
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { juryApi } from '../api/jury.api';

// ──────────────────────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────────────────────

const VOTE_OPTIONS = [
  { value: 'for_plaintiff', label: 'For Complainant', Icon: ThumbsUp, cls: 'text-emerald-600 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' },
  { value: 'for_defendant', label: 'For Provider',    Icon: ThumbsDown, cls: 'text-red-500 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20' },
  { value: 'abstain', label: 'Abstain', Icon: Minus, cls: 'text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800' },
];

const DISPUTE_CATEGORIES = [
  'service_quality', 'pricing', 'no_show', 'damage', 'communication', 'other'
];

const DISPUTE_PHASES = [
  { id: 'filing', label: 'Filed', icon: FileText },
  { id: 'evidence', label: 'Evidence', icon: FileText },
  { id: 'jury_selection', label: 'Jury Selected', icon: Users },
  { id: 'deliberation', label: 'Deliberation', icon: Scale },
  { id: 'verdict', label: 'Verdict', icon: Check },
];

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return 'just now';
}

// ──────────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────────

function DisputeTimeline({ phase }: { phase: string }) {
  const currentIdx = DISPUTE_PHASES.findIndex(p => p.id === phase);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {DISPUTE_PHASES.map((p, i) => {
        const done = i <= currentIdx;
        return (
          <div key={p.id} className="flex items-center gap-1">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
              done
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
            }`}>
              <p.icon className="h-3 w-3" />
              {p.label}
            </div>
            {i < DISPUTE_PHASES.length - 1 && (
              <div className={`w-4 h-px ${i < currentIdx ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function DisputeCard({ dispute, myVote, onVote, voting }: {
  dispute: any;
  myVote?: string;
  onVote: (dispute: any, vote: string) => void;
  voting: string | null;
}) {
  const evidence = Array.isArray(dispute.evidence_urls) ? dispute.evidence_urls : [];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
              dispute.status === 'deliberation'
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            }`}>
              {dispute.status.replace('_', ' ')}
            </span>
            <span className="text-[10px] text-zinc-400">{timeAgo(dispute.created_at)}</span>
          </div>
          {evidence.length > 0 && (
            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {evidence.length} evidence item{evidence.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Timeline */}
        <div className="mb-3">
          <DisputeTimeline phase={dispute.status} />
        </div>

        {dispute.category && (
          <p className="text-sm mb-1">
            <span className="font-semibold text-zinc-900 dark:text-white">Category:</span>
            <span className="text-zinc-600 dark:text-zinc-400 ml-1 capitalize">{dispute.category.replace('_', ' ')}</span>
          </p>
        )}
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-4">
          {dispute.description}
        </p>
      </div>

      <div className="border-t border-zinc-100 dark:border-zinc-800 p-4">
        {myVote ? (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Your vote: <span className="font-semibold text-zinc-900 dark:text-white capitalize">{myVote.replace('_', ' ')}</span></span>
            <span className="ml-auto text-[10px] text-amber-600 flex items-center gap-1">
              <Star className="h-3 w-3" /> +1 credit
            </span>
          </div>
        ) : (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5">Cast your vote</p>
            <div className="flex gap-2 flex-wrap">
              {VOTE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onVote(dispute, opt.value)}
                  disabled={!!voting}
                  className={`flex items-center gap-1.5 h-8 px-3 rounded-xl border text-xs font-semibold transition-all ${opt.cls} ${voting?.startsWith(dispute.id) ? 'opacity-60' : ''}`}
                >
                  {voting === dispute.id + opt.value
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : <opt.Icon className="h-3 w-3" />}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FileDisputeForm({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ category: '', description: '' });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.category) { toast.error('Select a category'); return; }
    if (!form.description.trim()) { toast.error('Describe the dispute'); return; }
    if (!user) { toast.error('Sign in first'); return; }

    setSaving(true);
    try {
      await juryApi.fileDispute({
        category: form.category,
        description: form.description.trim(),
      });
      toast.success('Dispute filed — jury selection will begin soon');
      setForm({ category: '', description: '' });
      onSuccess();
    } catch (err) {
      toast.error('Failed to file dispute');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
      <h3 className="font-semibold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
        <Scale className="h-4 w-4" />
        File a Dispute
      </h3>

      <div>
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Category</p>
        <select
          value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
        >
          <option value="">Select category</option>
          {DISPUTE_CATEGORIES.map(c => (
            <option key={c} value={c}>{c.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Description</p>
        <Textarea
          placeholder="Describe the issue in detail..."
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="rounded-xl resize-none"
          rows={4}
        />
      </div>

      <Button
        className="w-full h-11 rounded-xl gap-2"
        onClick={submit}
        disabled={saving || !form.category || !form.description.trim()}
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scale className="h-4 w-4" />}
        {saving ? 'Filing...' : 'File Dispute'}
      </Button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────────────

export default function JuryWorld() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [myVotes, setMyVotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [tab, setTab] = useState<'available' | 'filed' | 'voted'>('available');

  const load = async () => {
    setLoading(true);
    try {
      const [disputesRes, votesRes] = await Promise.all([
        juryApi.getDisputes(),
        user ? juryApi.getMyVotes() : Promise.resolve({ data: [] }),
      ]);
      setDisputes(disputesRes.data || []);
      const voteMap: Record<string, string> = {};
      (votesRes.data || []).forEach((v: any) => { voteMap[v.dispute_id] = v.vote; });
      setMyVotes(voteMap);
    } catch (err) {
      console.error('Failed to load jury data');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const vote = async (dispute: any, choice: string) => {
    if (!user) { toast.error('Sign in to vote'); return; }
    if (myVotes[dispute.id]) { toast('Already voted on this dispute'); return; }

    setVoting(dispute.id + choice);
    try {
      await juryApi.vote(dispute.id, choice as any);
      setMyVotes(p => ({ ...p, [dispute.id]: choice }));
      toast.success('Vote recorded — +1 time credit earned');
    } catch (err) {
      toast.error('Failed to vote');
    }
    setVoting(null);
  };

  const filteredDisputes = disputes.filter(d => {
    if (tab === 'available') return d.status === 'deliberation' && !myVotes[d.id];
    if (tab === 'filed') return d.raised_by === user?.id;
    return myVotes[d.id]; // voted tab
  });

  return (
    <div className="space-y-6 pb-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <h1 className="font-bold text-2xl tracking-tight text-zinc-900 dark:text-white">
            Neighborhood Jury
          </h1>
          <p className="text-zinc-400 text-sm mt-0.5">Peer-reviewed dispute resolution — earn time credits</p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-zinc-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm text-zinc-900 dark:text-white">How the jury works</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
            Disputes between customers and providers are resolved by a randomly selected panel of community members.
            All identities are anonymized. Quorum is reached at 3 votes. Each vote earns 1 time credit.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl w-fit">
        {[
          ['available', 'Available'],
          ['filed', 'My Disputes'],
          ['voted', 'My Votes'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            className={`h-8 px-4 rounded-xl text-xs font-semibold transition-all ${
              tab === key
                ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Disputes List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-wave h-48 rounded-2xl" />
          ))}
        </div>
      ) : filteredDisputes.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <ShieldCheck className="h-10 w-10 mx-auto mb-3 text-zinc-200 dark:text-zinc-700" strokeWidth={1.5} />
          <p className="text-zinc-400 font-medium">No disputes to show</p>
          <p className="text-xs text-zinc-400 mt-1">
            {tab === 'available' ? 'No open disputes to vote on' : 'Nothing here yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDisputes.map(d => (
            <DisputeCard
              key={d.id}
              dispute={d}
              myVote={myVotes[d.id]}
              onVote={vote}
              voting={voting}
            />
          ))}
        </div>
      )}

      {/* File Dispute Form */}
      {user && (
        <FileDisputeForm onSuccess={load} />
      )}

      {!user && (
        <div className="text-center py-6 text-zinc-400 text-sm border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          Sign in to participate as a juror and earn time credits
        </div>
      )}
    </div>
  );
}