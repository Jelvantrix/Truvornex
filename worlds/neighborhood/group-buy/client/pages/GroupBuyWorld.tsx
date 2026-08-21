/**
 * GroupBuyWorld - Main page component for the Group Buy world
 * Merges GroupBuy.jsx with enhanced deal tracking
 */

import { useState, useEffect } from 'react';
import {
  Users, Clock, Plus, Check, Loader2, ShoppingCart, X, TrendingDown, Zap,
  Package, Building2, Hammer, Wrench, Truck, Leaf, Shield, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { groupBuyApi } from '../api/group-buy.api';

// ──────────────────────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────────────────────

const SERVICE_CATEGORIES = [
  'Cleaning', 'Gardening', 'Plumbing', 'Electrical', 'Painting',
  'HVAC', 'Security', 'Handyman', 'Pest Control', 'Moving',
  'AC Maintenance', 'Generator Service', 'Water Tank Cleaning', 'Carpentry',
];

const CATEGORY_ICONS: Record<string, any> = {
  'Cleaning': Leaf, 'Gardening': Leaf, 'Plumbing': Wrench, 'Electrical': Zap,
  'Painting': Package, 'HVAC': Building2, 'Security': Shield, 'Handyman': Hammer,
  'Pest Control': Shield, 'Moving': Truck, 'AC Maintenance': Building2,
  'Generator Service': Zap, 'Water Tank Cleaning': Wrench, 'Carpentry': Hammer,
};

const EMPTY_FORM = {
  service_category: '', description: '', target_participants: 5,
  discount_percent: 15, expires_days: 7,
};

function countdown(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────────

function DealCard({ deal, joined, joining, onJoin, onActivate, user }: {
  deal: any;
  joined: boolean;
  joining: string | null;
  onJoin: (deal: any) => void;
  onActivate: (deal: any) => void;
  user: any | null;
}) {
  const isLocked = (deal.current_participants || 0) >= (deal.target_participants || 999);
  const isOpen = !isLocked && (!deal.expires_at || new Date(deal.expires_at) > Date.now());
  const pct = deal.target_participants
    ? Math.round((deal.current_participants || 0) / deal.target_participants * 100)
    : 0;
  const Icon = CATEGORY_ICONS[deal.service_category] || Package;

  return (
    <div className="rounded-xl border p-4 transition-all hover:shadow-md"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
          <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
            {deal.service_category}
          </p>
        </div>
        {!isOpen && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)' }}>
            {isLocked ? 'LOCKED' : 'EXPIRED'}
          </span>
        )}
      </div>

      {deal.description && (
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-subtle)' }}>
          {deal.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs mb-3" style={{ color: 'var(--color-text-subtle)' }}>
        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{deal.current_participants || 0}/{deal.target_participants}</span>
        <span className="flex items-center gap-1"><TrendingDown className="h-3.5 w-3.5" />{deal.discount_percent}% off</span>
        {deal.expires_at && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{countdown(deal.expires_at)}</span>}
      </div>

      <div className="h-2 rounded-full overflow-hidden mb-3" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: 'var(--color-primary)' }} />
      </div>

      {joined ? (
        <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--color-success)' }}>
          <Check className="h-3.5 w-3.5" /> You're in!
        </div>
      ) : isLocked && user?.role === 'provider' ? (
        <Button
          onClick={() => onActivate(deal)}
          className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
        >
          <Zap className="h-3.5 w-3.5" /> Activate Deal
        </Button>
      ) : (
        <Button
          onClick={() => onJoin(deal)}
          disabled={joining === deal.id || isLocked || !isOpen}
          className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', opacity: isLocked || !isOpen ? 0.5 : 1 }}
        >
          {joining === deal.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          {isLocked ? 'Deal Locked' : !isOpen ? 'Expired' : 'Join Deal'}
        </Button>
      )}
    </div>
  );
}

function CreateDealDialog({ open, onClose, onCreate, user }: {
  open: boolean;
  onClose: () => void;
  onCreate: () => void;
  user: any | null;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const create = async () => {
    if (!form.service_category) { toast.error('Select a service category'); return; }
    if (!user) { toast.error('Please log in'); return; }
    setSaving(true);
    try {
      const expiresAt = new Date(Date.now() + Number(form.expires_days) * 86400000).toISOString();
      await groupBuyApi.createDeal({
        service_category: form.service_category,
        description: form.description || undefined,
        target_participants: parseInt(form.target_participants.toString()),
        discount_percent: parseInt(form.discount_percent.toString()),
        expires_at: expiresAt,
      });
      toast.success('Group buy created!');
      onClose();
      setForm(EMPTY_FORM);
      onCreate();
    } catch (err) {
      toast.error('Failed to create');
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
          <h2 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>Create Group Deal</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold block mb-1">Service Category *</label>
            <select
              value={form.service_category}
              onChange={e => setForm(f => ({ ...f, service_category: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
            >
              <option value="">Select category</option>
              {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1">Description</label>
            <Input
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional description"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1">Target</label>
              <Input
                type="number"
                value={form.target_participants}
                onChange={e => setForm(f => ({ ...f, target_participants: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Discount %</label>
              <Input
                type="number"
                value={form.discount_percent}
                onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Expires (days)</label>
              <Input
                type="number"
                value={form.expires_days}
                onChange={e => setForm(f => ({ ...f, expires_days: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
              />
            </div>
          </div>
          <Button
            onClick={create}
            disabled={saving}
            className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {saving ? 'Creating...' : 'Create Group Deal'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────────────

export default function GroupBuyWorld() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [joining, setJoining] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await groupBuyApi.getDeals();
      if (data) setDeals(data);
    } catch (err) {
      console.error('Failed to fetch deals');
    }
    setLoading(false);
  }, []);

  const fetchMyParticipation = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await groupBuyApi.getMyParticipations();
      if (data) setJoined(new Set(data.map((p: any) => p.group_buy_id)));
    } catch (err) {
      console.error('Failed to fetch participation');
    }
  }, [user]);

  useEffect(() => {
    fetchDeals();
    if (user) fetchMyParticipation();
  }, [fetchDeals, fetchMyParticipation, user]);

  const joinDeal = async (deal: any) => {
    if (!user) { toast.error('Please log in to join'); return; }
    if (joined.has(deal.id)) { toast('Already joined'); return; }
    setJoining(deal.id);
    try {
      await groupBuyApi.joinDeal(deal.id);
      setJoined(p => new Set([...p, deal.id]));
      setDeals(prev => prev.map(d => d.id === deal.id
        ? { ...d, current_participants: (d.current_participants || 0) + 1 }
        : d));
      toast.success('Joined! You\'ll be notified when the deal locks.');
    } catch (err) {
      toast.error('Failed to join');
    }
    setJoining(null);
  };

  const activateDeal = async (deal: any) => {
    if (!user || user.role !== 'provider') { toast.error('Providers only'); return; }
    const finalPrice = parseFloat(prompt('Enter final price per participant:') || '0');
    const originalPrice = parseFloat(prompt('Enter original price per participant:') || '0');
    if (!finalPrice || !originalPrice) { toast.error('Invalid prices'); return; }
    try {
      await groupBuyApi.activateDeal(deal.id, {
        final_price: finalPrice,
        original_price: originalPrice,
      });
      toast.success('Deal activated!');
      fetchDeals();
    } catch (err) {
      toast.error('Failed to activate');
    }
  };

  const sorted = [...deals].sort((a, b) => {
    const aOpen = !((a.current_participants || 0) >= (a.target_participants || 999)) && (!a.expires_at || new Date(a.expires_at) > Date.now());
    const bOpen = !((b.current_participants || 0) >= (b.target_participants || 999)) && (!b.expires_at || new Date(b.expires_at) > Date.now());
    if (aOpen && !bOpen) return -1;
    if (!aOpen && bOpen) return 1;
    return 0;
  });

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display font-bold text-2xl tracking-tight flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Users className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
            Group Deals
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-subtle)' }}>
            Bundle jobs with neighbors · Save up to 35%
          </p>
        </div>
        {user && (
          <Button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            <Plus className="h-3.5 w-3.5" /> Create Deal
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton-wave h-28 rounded-xl" />)}</div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-2xl" style={{ borderColor: 'var(--color-border)' }}>
          <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p style={{ color: 'var(--color-text-subtle)' }}>No group deals yet</p>
          {user && <Button variant="ghost" size="sm" className="mt-3 text-sm font-semibold" onClick={() => setCreateOpen(true)}>Create the first one</Button>}
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(deal => (
            <DealCard
              key={deal.id}
              deal={deal}
              joined={joined.has(deal.id)}
              joining={joining}
              onJoin={joinDeal}
              onActivate={activateDeal}
              user={user}
            />
          ))}
        </div>
      )}

      <CreateDealDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={fetchDeals}
        user={user}
      />
    </div>
  );
}