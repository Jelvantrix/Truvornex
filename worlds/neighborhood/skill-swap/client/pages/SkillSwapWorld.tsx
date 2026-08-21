/**
 * SkillSwapWorld - Main page component for the Skill Swap world
 * Based on SkillSwap.jsx with enhanced features
 */

import { useState, useEffect } from 'react';
import {
  RefreshCw, GraduationCap, Search, Plus, Star, Check, Loader2, ArrowRight, Zap, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { skillSwapApi } from '../api/skill-swap.api';

// ──────────────────────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────────────────────

const STATUS_BADGE = {
  open:      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  matched:   'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  in_progress: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  completed: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};

// ──────────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────────

function SwapCard({ swap, isOwn, onPropose, proposing }: {
  swap: any;
  isOwn: boolean;
  onPropose: (swap: any) => void;
  proposing: string | null;
}) {
  const status = swap.status || 'open';

  if (isOwn) {
    return (
      <div key={swap.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 flex items-center gap-3 flex-wrap">
        <span className="text-xs font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded-full flex items-center gap-1">
          <GraduationCap className="h-2.5 w-2.5" /> {swap.offering}
        </span>
        <ArrowRight className="h-3 w-3 text-zinc-300 shrink-0" />
        <span className="text-xs font-medium text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/20 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Search className="h-2.5 w-2.5" /> {swap.seeking}
        </span>
        <div className="ml-auto">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[status as keyof typeof STATUS_BADGE] || STATUS_BADGE.open}`}>
            {status}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div key={swap.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5">
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <GraduationCap className="h-3 w-3" /> Offering: {swap.offering}
        </span>
        <span className="text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <Search className="h-3 w-3" /> Seeking: {swap.seeking}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400 flex items-center gap-1">
          <Star className="h-3 w-3 text-amber-500" />
          {swap.time_credits_offered} credit{swap.time_credits_offered !== 1 ? 's' : ''}
        </span>
        <Button size="sm" className="h-7 rounded-xl text-[10px] gap-1"
          disabled={proposing === swap.id}
          onClick={() => onPropose(swap)}>
          {proposing === swap.id
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : <Check className="h-3 w-3" />}
          Propose Swap
        </Button>
      </div>
    </div>
  );
}

function SwapProposalDialog({ open, onClose, onPropose, swap }: {
  open: boolean;
  onClose: () => void;
  onPropose: (swapId: string, message?: string) => void;
  swap: any | null;
}) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!open || !swap) return null;

  const submit = async () => {
    setSending(true);
    try {
      await onPropose(swap.id, message);
      toast.success('Proposal sent!');
      onClose();
    } catch (err) {
      toast.error('Failed to send proposal');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative rounded-2xl p-5 w-full max-w-md shadow-xl"
        style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>Propose Swap</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5">✕</button>
        </div>
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--color-text-subtle)' }}>
            You're proposing a swap with <strong>{swap.offerer_name || 'someone'}</strong>
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
            They offer: <span className="font-medium">{swap.offering}</span> · They need: <span className="font-medium">{swap.seeking}</span>
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
            Credits: <span className="font-medium">{swap.time_credits_offered}</span>
          </p>
          <div>
            <label className="text-xs font-semibold block mb-1">Message (optional)</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Anything they should know about your skill level or availability?"
              className="w-full rounded-lg border px-3 py-2 text-sm resize-none"
              rows={3}
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
            />
          </div>
          <Button
            onClick={submit}
            disabled={sending}
            className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {sending ? 'Sending...' : 'Send Proposal'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PostSwapDialog({ open, onClose, onPost }: { open: boolean; onClose: () => void; onPost: () => void }) {
  const [form, setForm] = useState({ offering: '', seeking: '', time_credits: 1 });
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const post = async () => {
    if (!form.offering.trim() || !form.seeking.trim()) { toast.error('Fill in both fields'); return; }
    setSaving(true);
    try {
      await onPost();
      toast.success('Skill swap posted');
      onClose();
      setForm({ offering: '', seeking: '', time_credits: 1 });
    } catch (err) {
      toast.error('Failed to post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative rounded-2xl p-5 w-full max-w-md shadow-xl"
        style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>Post a Skill Swap</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5">✕</button>
        </div>
        <div className="space-y-3 pt-1">
          <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-xl p-3">
            <p className="text-xs font-bold text-teal-700 dark:text-teal-300 mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" /> What I Offer
            </p>
            <Input placeholder="e.g. Web design, cooking lessons, photography"
              value={form.offering} onChange={e => setForm(p => ({ ...p, offering: e.target.value }))} className="rounded-xl" />
          </div>
          <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 rounded-xl p-3">
            <p className="text-xs font-bold text-violet-700 dark:text-violet-300 mb-1.5 flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" /> What I Need
            </p>
            <Input placeholder="e.g. Plumbing help, accounting, tutoring"
              value={form.seeking} onChange={e => setForm(p => ({ ...p, seeking: e.target.value }))} className="rounded-xl" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 mb-1">Time credits offered (hours)</p>
            <Input type="number" min={1} max={20} value={form.time_credits}
              onChange={e => setForm(p => ({ ...p, time_credits: e.target.value }))} className="rounded-xl" />
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-500">
            When a match is confirmed, credits transfer between both parties automatically via the time bank.
          </div>
          <Button className="w-full h-11 rounded-xl gap-2" onClick={post} disabled={saving || !form.offering.trim() || !form.seeking.trim()}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Posting...' : 'Post Skill Swap'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────────────

export default function SkillSwapWorld() {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState<any[]>([]);
  const [mySwaps, setMySwaps] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [proposing, setProposing] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposalSwap, setProposalSwap] = useState<any | null>(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const [openRes, myRes, balRes] = await Promise.all([
        skillSwapApi.getSwaps(),
        skillSwapApi.getMySwaps(),
        skillSwapApi.getBalance(),
      ]);
      if (openRes.data) setSwaps(openRes.data.filter((s: any) => s.offerer_id !== user.id));
      if (myRes.data) setMySwaps(myRes.data);
      if (balRes.balance !== undefined) setBalance(balRes.balance);
    } catch (err) {
      console.error('Failed to load skill swaps');
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load, user]);

  const postSwap = async () => {
    const { data } = await skillSwapApi.createSwap({
      offering: (document.querySelector('[placeholder*="Web design"]') as HTMLInputElement)?.value || '',
      seeking: (document.querySelector('[placeholder*="Plumbing"]') as HTMLInputElement)?.value || '',
      time_credits_offered: 1,
    });
    setSwaps([data.data, ...swaps]);
  };

  const propose = async (swap: any) => {
    setProposing(swap.id);
    try {
      await skillSwapApi.proposeSwap(swap.id);
      setSwaps(prev => prev.filter(s => s.id !== swap.id));
      toast.success('Swap proposed — the other person will be notified');
    } catch (err) {
      toast.error('Failed to propose');
    } finally {
      setProposing(null);
    }
  };

  const openProposal = (swap: any) => {
    setProposalSwap(swap);
    setProposalOpen(true);
  };

  const handlePropose = (swapId: string, message?: string) => {
    // Simplified - using the direct proposeSwap which doesn't take message currently
    return skillSwapApi.proposeSwap(swapId);
  };

  return (
    <div className="space-y-6 pb-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
            <RefreshCw className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h1 className="font-bold text-2xl tracking-tight text-zinc-900 dark:text-white">Skill Exchange</h1>
            <p className="text-zinc-400 text-sm mt-0.5">Trade skills · earn time credits</p>
          </div>
        </div>
        <Button className="rounded-xl gap-2" onClick={() => user ? setDialogOpen(true) : toast.error('Sign in first')}>
          <Plus className="h-4 w-4" /> Post a Swap
        </Button>
      </div>

      {/* Time credits balance */}
      <div className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">Your Time Credits</p>
          <p className="text-4xl font-black">{balance}</p>
          <p className="text-xs opacity-40 mt-1">1 credit = 1 hour of service</p>
        </div>
        <Star className="h-12 w-12 opacity-20" strokeWidth={1} />
      </div>

      {/* My swaps */}
      {mySwaps.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">My Swaps</p>
          <div className="space-y-2">
            {mySwaps.map(s => (
              <SwapCard key={s.id} swap={s} isOwn={true} onPropose={openProposal} proposing={proposing} />
            ))}
          </div>
        </div>
      )}

      {/* Browse available swaps */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Available Swaps</p>
          <span className="text-[10px] text-zinc-400">{swaps.length} posted</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton-wave h-24 rounded-2xl" />)}
          </div>
        ) : swaps.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <RefreshCw className="h-10 w-10 mx-auto mb-3 text-zinc-200 dark:text-zinc-700" strokeWidth={1.5} />
            <p className="text-zinc-400 font-medium">No swaps posted yet</p>
            <p className="text-xs text-zinc-400 mt-1">Be the first — post what you offer and need</p>
            {user && (
              <button onClick={() => setDialogOpen(true)} className="mt-4 text-sm font-semibold text-zinc-900 dark:text-white underline underline-offset-2">
                Post the first swap
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {swaps.map(s => (
              <SwapCard key={s.id} swap={s} isOwn={false} onPropose={openProposal} proposing={proposing} />
            ))}
          </div>
        )}
      </div>

      {/* Post dialog */}
      <PostSwapDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onPost={postSwap} />

      {/* Proposal dialog */}
      <SwapProposalDialog
        open={proposalOpen}
        onClose={() => { setProposalOpen(false); setProposalSwap(null); }}
        onPropose={handlePropose}
        swap={proposalSwap}
      />
    </div>
  );
}