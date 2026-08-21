/**
 * CommunityWorld - Main page component for the Community world
 * Merges Community.jsx and Events.jsx into one unified experience
 */

import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Calendar, MapPin, Ticket, Plus, Search, Users,
  Loader2, Check, Music, Wrench, Zap, Sparkles,
  UtensilsCrossed, ImageIcon, Building2, Globe, Home, Trees,
  FileText, Flag, Star, ChevronDown, ChevronUp, Heart, ThumbsUp, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { communityApi } from '../api/community.api';

// ──────────────────────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────────────────────

const CATEGORY_ICONS = {
  concert: Music, workshop: Wrench, meetup: Users, sports: Zap,
  festival: Sparkles, exhibition: ImageIcon, food: UtensilsCrossed, other: Calendar,
};
const CATEGORY_LABELS = {
  concert: 'Concert', workshop: 'Workshop', meetup: 'Meetup', sports: 'Sports',
  festival: 'Festival', exhibition: 'Exhibition', food: 'Food & Drink', other: 'Other',
};
const VENUE_TYPES = { hall: 'Community Hall', rooftop: 'Rooftop', open_ground: 'Open Ground', indoor: 'Indoor', online: 'Online', other: 'Other' };
const BUNDLE_SERVICES = ['photographer', 'decorator', 'caterer', 'security', 'sound_system', 'mc_host', 'florist'];

const EMPTY_EVENT = {
  title: '', description: '', category: 'meetup', venue_name: '', venue_type: 'hall',
  address: '', date: '', start_time: '', end_time: '', organizer_name: '',
  ticket_price: 0, is_free: true, total_tickets: 100, bundle_services: [],
};

const POST_TYPES = [
  { id: 'post', label: 'Post', icon: MessageSquare },
  { id: 'announcement', label: 'Announcement', icon: Flag },
  { id: 'event', label: 'Event', icon: Calendar },
  { id: 'poll', label: 'Poll', icon: FileText },
];

const VISIBILITY_SCOPES = [
  { id: 'block', label: 'My Block' },
  { id: 'zone', label: 'My Zone' },
  { id: 'city', label: 'My City' },
];

// ──────────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────────

function ScopeSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {VISIBILITY_SCOPES.map(s => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            value === s.id
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent'
              : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-400'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function PostComposer({ onPost, user }: { onPost: () => void; user: any | null }) {
  const [type, setType] = useState('post');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [scope, setScope] = useState('zone');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!body.trim()) { toast.error('Write something'); return; }
    if (!user) { toast.error('Sign in first'); return; }
    setSaving(true);
    try {
      await communityApi.createPost({
        type, title: title || undefined, body: body.trim(), image_url: imageUrl || undefined,
        visibility_scope: scope,
      });
      toast.success(`${type} posted`);
      setTitle(''); setBody(''); setImageUrl('');
      onPost();
    } catch (err) {
      toast.error('Failed to post');
    } finally { setSaving(false); }
  };

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
      {/* Type selector */}
      <div className="flex gap-2 flex-wrap">
        {POST_TYPES.map(t => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              type === t.id
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-400'
            }`}
          >
            <t.icon className="h-3 w-3" /> {t.label}
          </button>
        ))}
      </div>

      {/* Scope */}
      <div>
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Visibility</p>
        <ScopeSelector value={scope} onChange={setScope} />
      </div>

      {/* Title (optional for posts) */}
      {type !== 'poll' && (
        <Input
          placeholder="Title (optional)"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="rounded-xl"
        />
      )}

      {/* Body */}
      <Textarea
        placeholder={type === 'poll' ? 'Poll question...' : 'What\'s on your mind?'}
        value={body}
        onChange={e => setBody(e.target.value)}
        className="rounded-xl resize-none"
        rows={type === 'poll' ? 2 : 4}
      />

      {/* Image URL */}
      <Input
        placeholder="Image URL (optional)"
        value={imageUrl}
        onChange={e => setImageUrl(e.target.value)}
        className="rounded-xl"
      />

      {/* Submit */}
      <Button className="w-full h-11 rounded-xl gap-2" onClick={submit} disabled={saving || !body.trim()}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {saving ? 'Posting...' : `Post ${type.charAt(0).toUpperCase() + type.slice(1)}`}
      </Button>
    </div>
  );
}

function PostCard({ post, onRefresh }: { post: any; onRefresh: () => void }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [reactions, setReactions] = useState(post.reactions || {});

  const toggleLike = async (reaction_type: string) => {
    try {
      await communityApi.reactToPost(post.id, reaction_type);
      setReactions(r => ({ ...r, [reaction_type]: (r[reaction_type] || 0) + 1 }));
    } catch (err) {
      console.error('Failed to react');
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    setCommenting(true);
    try {
      await communityApi.commentOnPost(post.id, newComment.trim());
      setNewComment('');
      setComments(prev => [...prev, { body: newComment, author_name: 'You', created_at: new Date().toISOString() }]);
      post.reply_count = (post.reply_count || 0) + 1;
    } catch (err) {
      toast.error('Failed to comment');
    } finally { setCommenting(false); }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                {post.author_name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm text-zinc-900 dark:text-white">{post.author_name}</p>
              <p className="text-xs text-zinc-400">{new Date(post.created_date).toLocaleDateString()}</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
            post.type === 'announcement' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
            post.type === 'event' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
            post.type === 'poll' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' :
            'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
          }`}>
            {post.type}
          </span>
        </div>

        {post.title && <h3 className="font-bold text-base mb-2 text-zinc-900 dark:text-white">{post.title}</h3>}
        {post.body && <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{post.body}</p>}

        {post.image_url && (
          <img src={post.image_url} alt="" className="mt-3 rounded-xl max-h-64 w-full object-cover" />
        )}

        {/* Reactions */}
        <div className="flex items-center gap-1 mt-3">
          {['like', 'love', 'laugh', 'wow', 'sad', 'angry'].map(r => (
            <button
              key={r}
              onClick={() => toggleLike(r)}
              className={`p-1.5 rounded-xl transition-all ${reactions[r] > 0 ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}
              title={r}
            >
              {r === 'like' && <ThumbsUp className={`h-4 w-4 ${reactions.like > 0 ? 'text-blue-500' : 'text-zinc-400'}`} />}
              {r === 'love' && <Heart className={`h-4 w-4 ${reactions.love > 0 ? 'text-red-500' : 'text-zinc-400'}`} />}
              {r === 'laugh' && <span style={{fontSize: '16px'}}>😂</span>}
              {r === 'wow' && <span style={{fontSize: '16px'}}>😲</span>}
              {r === 'sad' && <span style={{fontSize: '16px'}}>😢</span>}
              {r === 'angry' && <span style={{fontSize: '16px'}}>😡</span>}
              {reactions[r] > 0 && <span className="text-[10px] ml-0.5 text-zinc-500">{reactions[r]}</span>}
            </button>
          ))}
          <span className="ml-auto text-xs text-zinc-400 flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {post.reply_count || 0} comments
          </span>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3">
            {comments.map((c, i) => (
              <div key={i} className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                    {c.author_name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2">
                  <p className="text-xs font-medium text-zinc-900 dark:text-white">{c.author_name}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{c.body}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="Write a comment..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="flex-1 rounded-xl"
              />
              <Button size="sm" className="h-9 rounded-xl" onClick={addComment} disabled={commenting || !newComment.trim()}>
                <Mail className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        <button
          onClick={() => { setShowComments(!showComments); if (!showComments && comments.length === 0) onRefresh(); }}
          className="mt-3 text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {showComments ? 'Hide' : 'View'} comments
          {showComments ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

function EventCard({ event, onTicket, user }: { event: any; onTicket: (e: any) => void; user: any | null }) {
  const CatIcon = CATEGORY_ICONS[event.category] || Calendar;
  const soldOut = (event.tickets_sold || 0) >= (event.total_tickets || 9999);
  const pct = Math.min(100, Math.round(((event.tickets_sold || 0) / (event.total_tickets || 1)) * 100));

  return (
    <div className="card-premium overflow-hidden group" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="h-36 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center relative">
        {event.cover_image_url
          ? <img src={event.cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          : <CatIcon className="h-12 w-12 text-zinc-300 dark:text-zinc-600" strokeWidth={1.5} />}
        <span className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur text-[10px] font-bold px-2 py-1 rounded-full capitalize">
          {CATEGORY_LABELS[event.category as keyof typeof CATEGORY_LABELS] || event.category}
        </span>
        {soldOut && <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">SOLD OUT</span>}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-sm mb-2 line-clamp-1" style={{ color: 'var(--color-text)' }}>{event.title}</h3>
        <div className="space-y-1 text-xs mb-3" style={{ color: 'var(--color-text-subtle)' }}>
          <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{event.date}{event.start_time && ` · ${event.start_time}`}</div>
          <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{event.venue_name}{event.venue_type && ` · ${VENUE_TYPES[event.venue_type as keyof typeof VENUE_TYPES] || event.venue_type}`}</div>
          <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{event.tickets_sold || 0}/{event.total_tickets} tickets</div>
        </div>
        {event.bundle_services?.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-3">
            {event.bundle_services.map((s: string) => <span key={s} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-1.5 py-0.5 rounded-full">{s}</span>)}
          </div>
        )}
        <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-3 overflow-hidden">
          <div className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
            {event.is_free || !event.ticket_price ? 'Free' : `$${event.ticket_price}`}
          </span>
          <Button size="sm" className="rounded-xl h-8 text-xs gap-1.5" disabled={soldOut} onClick={() => onTicket(event)}>
            <Ticket className="h-3.5 w-3.5" />{soldOut ? 'Sold Out' : 'Get Ticket'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────────────

export default function CommunityWorld() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState('zone');
  const [tab, setTab] = useState<'feed' | 'events' | 'polls'>('feed');
  const [createEventDialog, setCreateEventDialog] = useState(false);
  const [ticketEvent, setTicketEvent] = useState<any | null>(null);
  const [eventForm, setEventForm] = useState(EMPTY_EVENT);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [postsRes, eventsRes, pollsRes] = await Promise.all([
        communityApi.getPosts({ scope }),
        communityApi.getEvents({ scope, upcoming: 'true' }),
        communityApi.getPolls({ scope }),
      ]);
      if (postsRes.data) setPosts(postsRes.data);
      if (eventsRes.data) setEvents(eventsRes.data);
      if (pollsRes.data) setPolls(pollsRes.data);
    } catch (err) {
      console.error('Failed to load community data');
    }
    setLoading(false);
  }, [scope]);

  useEffect(() => { load(); }, [load, scope]);

  // Ticket handling
  const openTicket = (event: any) => setTicketEvent(event);
  const buyTicket = async (event: any, qty = 1) => {
    if (!user) { toast.error('Please log in to get tickets'); return; }
    setSaving(true);
    try {
      await communityApi.getEventTicket(event.id, qty);
      toast.success(`Ticket reserved for ${event.title}`);
      setTicketEvent(null);
      load();
    } catch (err) {
      toast.error('Failed to book ticket');
    } finally { setSaving(false); }
  };

  // Create event
  const createEvent = async () => {
    if (!eventForm.title || !eventForm.date || !eventForm.venue_name) {
      toast.error('Title, date and venue required'); return;
    }
    if (!user) { toast.error('Sign in to create an event'); return; }
    setSaving(true);
    try {
      await communityApi.createEvent({
        ...eventForm,
        ticket_price: eventForm.is_free ? 0 : eventForm.ticket_price,
        is_free: eventForm.is_free,
        bundle_services: eventForm.bundle_services,
      });
      toast.success('Event published');
      setCreateEventDialog(false);
      setEventForm(EMPTY_EVENT);
      load();
    } catch (err) {
      toast.error('Failed to create event');
    } finally { setSaving(false); }
  };

  // Filter past/upcoming events
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const upcoming = events.filter(e => !e.date || new Date(e.date) >= now);
  const past = events.filter(e => e.date && new Date(e.date) < now);

  return (
    <div className="space-y-6 pb-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-bold text-3xl tracking-tight text-zinc-900 dark:text-white">Community</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Posts · Events · Polls · Neighborhood voice</p>
        </div>
        <div className="flex items-center gap-2">
          <ScopeSelector value={scope} onChange={setScope} />
          {user && (
            <Button className="rounded-xl gap-2" onClick={() => setCreateEventDialog(true)}>
              <Plus className="h-4 w-4" /> Create Event
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl w-fit">
        {[['feed', 'Feed'], ['events', 'Events'], ['polls', 'Polls']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key as any)}
            className={`h-8 px-4 rounded-xl text-xs font-semibold transition-all ${tab === key ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Feed Tab */}
      {tab === 'feed' && (
        <>
          <PostComposer user={user} onPost={load} />
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton-wave h-32 rounded-2xl" />)}</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 text-zinc-200 dark:text-zinc-700" strokeWidth={1.5} />
                <p className="text-zinc-400 font-medium">No posts yet</p>
                <p className="text-xs text-zinc-400 mt-1">Be the first to share something</p>
              </div>
            ) : (
              posts.map(p => <PostCard key={p.id} post={p} onRefresh={load} />)
            )}
          </div>
        </>
      )}

      {/* Events Tab */}
      {tab === 'events' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton-wave h-64 rounded-2xl" />)}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <Calendar className="h-10 w-10 mx-auto mb-3 text-zinc-200 dark:text-zinc-700" strokeWidth={1.5} />
              <p className="text-zinc-400 font-medium">No upcoming events</p>
              {user && <button onClick={() => setCreateEventDialog(true)} className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white underline underline-offset-2">Create the first event</button>}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {upcoming.map(event => (
                  <EventCard key={event.id} event={event} onTicket={openTicket} user={user} />
                ))}
              </div>
              {past.length > 0 && (
                <div className="mt-8">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Past Events</p>
                  <div className="space-y-2">
                    {past.slice(0, 5).map(event => (
                      <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 opacity-60">
                        <CATEGORY_ICONS[event.category] || Calendar className="h-5 w-5 text-zinc-400 shrink-0" strokeWidth={1.5} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1" style={{ color: 'var(--color-text)' }}>{event.title}</p>
                          <p className="text-xs text-zinc-400">{event.date} · {event.venue_name}</p>
                        </div>
                        <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">Ended</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Polls Tab */}
      {tab === 'polls' && (
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton-wave h-20 rounded-xl" />)}</div>
          ) : polls.length === 0 ? (
            <div className="card-premium p-10 text-center">
              <FileText className="h-10 w-10 mx-auto mb-3 text-zinc-200 dark:text-zinc-700" strokeWidth={1.5} />
              <p className="text-zinc-400">No polls yet</p>
              <button onClick={() => toast.info('Poll creation coming soon')}" className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white underline underline-offset-2">Create a poll</button>
            </div>
          ) : (
            polls.map(poll => {
              const options = Array.isArray(poll.options) ? poll.options : [];
              return (
                <div key={poll.id} className="card-premium p-5">
                  <p className="font-bold text-sm mb-3">{poll.question}</p>
                  <div className="space-y-2">
                    {options.map((opt: any, i: number) => (
                      <div key={i} className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3">
                        <p className="text-sm font-medium">{opt.text || opt}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{opt.votes || 0} votes</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Create Event Dialog */}
      <Dialog open={createEventDialog} onOpenChange={setCreateEventDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create New Event</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-1">
            <Input placeholder="Event title *" value={eventForm.title} onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))} className="rounded-xl" />
            <Textarea placeholder="Description" value={eventForm.description} onChange={e => setEventForm(p => ({ ...p, description: e.target.value }))} className="rounded-xl resize-none" rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={eventForm.category} onValueChange={v => setEventForm(p => ({ ...p, category: v }))}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(CATEGORY_LABELS).map(([c, label]) => <SelectItem key={c} value={c}>{label}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={eventForm.venue_type} onValueChange={v => setEventForm(p => ({ ...p, venue_type: v }))}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(VENUE_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Input placeholder="Venue name *" value={eventForm.venue_name} onChange={e => setEventForm(p => ({ ...p, venue_name: e.target.value }))} className="rounded-xl" />
            <Input placeholder="Address" value={eventForm.address} onChange={e => setEventForm(p => ({ ...p, address: e.target.value }))} className="rounded-xl" />
            <div className="grid grid-cols-3 gap-3">
              <Input type="date" value={eventForm.date} onChange={e => setEventForm(p => ({ ...p, date: e.target.value }))} className="rounded-xl" />
              <Input type="time" value={eventForm.start_time} onChange={e => setEventForm(p => ({ ...p, start_time: e.target.value }))} className="rounded-xl" />
              <Input type="time" value={eventForm.end_time} onChange={e => setEventForm(p => ({ ...p, end_time: e.target.value }))} className="rounded-xl" />
            </div>
            <Input placeholder="Organizer name" value={eventForm.organizer_name} onChange={e => setEventForm(p => ({ ...p, organizer_name: e.target.value }))} className="rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Total tickets" value={eventForm.total_tickets} onChange={e => setEventForm(p => ({ ...p, total_tickets: Number(e.target.value) }))} className="rounded-xl" />
              <Input type="number" placeholder="Price (0 = free)" value={eventForm.ticket_price}
                onChange={e => setEventForm(p => ({ ...p, ticket_price: Number(e.target.value), is_free: Number(e.target.value) === 0 }))} className="rounded-xl" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Bundle Services</p>
              <div className="flex flex-wrap gap-2">
                {BUNDLE_SERVICES.map(s => {
                  const active = eventForm.bundle_services?.includes(s);
                  return (
                    <button key={s} onClick={() => setEventForm(p => ({
                      ...p, bundle_services: p.bundle_services?.includes(s)
                        ? p.bundle_services.filter(x => x !== s)
                        : [...(p.bundle_services || []), s]
                    }))}
                      className={`flex items-center gap-1.5 h-7 px-3 rounded-xl text-xs font-semibold border transition-all ${active ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-400'}`}>
                      {active && <Check className="h-3 w-3" />} {s.replace('_', ' ')}
                    </button>
                  );
                })}
              </div>
            </div>
            <Button className="w-full h-11 rounded-xl gap-2" onClick={createEvent} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Publishing' : 'Publish Event'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Dialog */}
      {ticketEvent && (
        <Dialog open={!!ticketEvent} onOpenChange={() => setTicketEvent(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Get Ticket</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-1">
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4">
                <p className="font-bold">{ticketEvent.title}</p>
                <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5"><Calendar className="h-3 w-3" />{ticketEvent.date}{ticketEvent.start_time && ` at ${ticketEvent.start_time}`}</p>
                <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5"><MapPin className="h-3 w-3" />{ticketEvent.venue_name}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-semibold">Price per ticket</p>
                <p className="font-bold text-lg">{ticketEvent.is_free || !ticketEvent.ticket_price ? 'Free' : `$${ticketEvent.ticket_price}`}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Available</span>
                <span>{Math.max(0, (ticketEvent.total_tickets || 0) - (ticketEvent.tickets_sold || 0))} remaining</span>
              </div>
              {ticketEvent.bundle_services?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Bundled Services</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ticketEvent.bundle_services.map((s: string) => <span key={s} className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">{s}</span>)}
                  </div>
                </div>
              )}
              <Button className="w-full h-11 rounded-xl gap-2" onClick={() => buyTicket(ticketEvent)} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
                {saving ? 'Booking' : ticketEvent.is_free || !ticketEvent.ticket_price ? 'Reserve Free Ticket' : `Pay $${ticketEvent.ticket_price} & Book`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}