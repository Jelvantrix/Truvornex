import { useState, useMemo } from 'react';
import { Star, MessageSquare, Pencil, Trash2, Plus, CheckCircle2, Loader2, X, ChevronRight, DollarSign, Shield, Award } from 'lucide-react';
import { toast } from 'sonner';

const MOCK_BOOKINGS = [
    { id: '1', service_name: 'Deep House Cleaning', provider_name: 'Sparkle Clean Co.', provider_id: 'p1', date: '2025-01-15', price: 150, status: 'completed', has_review: true },
    { id: '2', service_name: 'AC Repair & Maintenance', provider_name: 'CoolAir HVAC', provider_id: 'p2', date: '2025-01-10', price: 200, status: 'completed', has_review: true },
    { id: '3', service_name: 'Lawn Mowing', provider_name: 'Green Thumb Landscaping', provider_id: 'p3', date: '2025-01-05', price: 85, status: 'completed', has_review: false },
    { id: '4', service_name: 'Plumbing Inspection', provider_name: 'Emergency Plumbing Co.', provider_id: 'p4', date: '2024-12-28', price: 120, status: 'completed', has_review: false },
];

const MOCK_REVIEWS = [
    { id: 'r1', booking_id: '1', service_name: 'Deep House Cleaning', provider_name: 'Sparkle Clean Co.', rating: 5, comment: 'Amazing service! The team was thorough, professional, and left my house sparkling clean. Will definitely book again.', created_date: '2025-01-16T10:00:00Z' },
    { id: 'r2', booking_id: '2', service_name: 'AC Repair & Maintenance', provider_name: 'CoolAir HVAC', rating: 5, comment: 'Fast, efficient, and fair pricing. Fixed my AC in under an hour. Highly recommend!', created_date: '2025-01-11T14:30:00Z' },
];

export default function ProviderReviews() {
    const [reviews, setReviews] = useState(MOCK_REVIEWS);
    const [bookings] = useState(MOCK_BOOKINGS);
    const [dialog, setDialog] = useState(false);
    const [form, setForm] = useState({ rating: 5, comment: '', booking_id: '' });
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';
    const reviewableBookings = useMemo(() => bookings.filter(b => b.status === 'completed' && !b.has_review), [bookings]);

    const save = async () => {
        if (!form.booking_id && !editId) { toast.error('Please select a booking'); return; }
        if (!form.comment.trim()) { toast.error('Please add a comment'); return; }
        
        setSaving(true);
        await new Promise(r => setTimeout(r, 600));
        
        const booking = bookings.find(b => b.id === form.booking_id);
        const newReview = {
            id: editId || `r${Date.now()}`,
            booking_id: form.booking_id || editId && reviews.find(r => r.id === editId)?.booking_id,
            service_name: booking?.service_name || reviews.find(r => r.id === editId)?.service_name,
            provider_name: booking?.provider_name || reviews.find(r => r.id === editId)?.provider_name,
            rating: form.rating,
            comment: form.comment,
            created_date: new Date().toISOString()
        };
        
        if (editId) {
            setReviews(prev => prev.map(r => r.id === editId ? newReview : r));
            toast.success('Review updated');
        } else {
            setReviews(prev => [newReview, ...prev]);
            toast.success('Review submitted — thank you!');
        }
        
        setDialog(false);
        setEditId(null);
        setForm({ rating: 5, comment: '', booking_id: '' });
        setSaving(false);
    };

    const del = async (id) => {
        setDeletingId(id);
        await new Promise(r => setTimeout(r, 300));
        setReviews(prev => prev.filter(r => r.id !== id));
        toast.success('Review deleted');
        setDeletingId(null);
    };

    const openEdit = (r) => {
        setForm({ rating: r.rating, comment: r.comment, booking_id: r.booking_id });
        setEditId(r.id);
        setDialog(true);
    };

    const openAdd = () => {
        if (reviewableBookings.length === 0) {
            toast.info('No completed bookings available for review');
            return;
        }
        setEditId(null);
        setForm({ rating: 5, comment: '', booking_id: reviewableBookings[0].id });
        setDialog(true);
    };

    const starRating = (rating, size = 20, interactive = false, onClick) => (
        <div className="flex items-center gap-0.5" role={interactive ? 'radiogroup' : 'img'}>
            {Array.from({ length: 5 }).map((_, i) => (
                <button 
                    key={i}
                    type={interactive ? 'button' : undefined}
                    onClick={interactive ? () => onClick(i + 1) : undefined}
                    disabled={!interactive}
                    className={`transition-all ${interactive ? 'hover:scale-110' : ''}`}
                    aria-label={interactive ? `${i + 1} star${i > 0 ? 's' : ''}` : undefined}
                    role={interactive ? 'radio' : undefined}
                    aria-checked={interactive ? i < rating : undefined}
                >
                    <Star className={`h-${size/4} w-${size/4} ${i < rating ? 'fill-current text-warning' : 'text-border'}`} />
                </button>
            ))}
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>My Reviews</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        {reviews.length} review{reviews.length !== 1 ? 's' : ''} · Average rating: {avgRating}/5
                        {reviewableBookings.length > 0 && <span className="ml-2 text-success"> · {reviewableBookings.length} to write</span>}
                    </p>
                </div>
                {reviewableBookings.length > 0 && (
                    <button className="h-11 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                        onClick={openAdd}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                        <Plus className="h-4 w-4" />
                        Write Review
                    </button>
                )}
            </div>

            {/* Stats Overview */}
            <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Reviews Written', value: reviews.length, icon: MessageSquare, color: 'var(--color-primary)', bg: 'rgba(var(--color-primary),0.12)' },
                        { label: 'Average Rating', value: avgRating, icon: Star, color: 'var(--color-warning)', bg: 'rgba(var(--color-warning),0.12)' },
                        { label: 'Pending Reviews', value: reviewableBookings.length, icon: Pencil, color: 'var(--color-accent)', bg: 'rgba(var(--color-accent),0.12)' },
                        { label: 'Total Spent', value: `$${bookings.filter(b => b.has_review).reduce((s, b) => s + b.price, 0)}`, icon: DollarSign, color: 'var(--color-success)', bg: 'rgba(var(--color-success),0.12)' },
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

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="rounded-2xl p-12 text-center shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <MessageSquare className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--color-text-subtle)' }} />
                    <h2 className="font-bold text-lg mb-1" style={{ color: 'var(--color-primary)' }}>No reviews yet</h2>
                    <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                        Complete a booking and share your experience to help other customers
                    </p>
                    {reviewableBookings.length > 0 && (
                        <button className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold transition-all"
                            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                            onClick={openAdd}
                            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                            <Plus className="h-4 w-4" />
                            Write Your First Review
                        </button>
                    )}
                </div>
            ) : (
                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    {reviews.map((r, i) => (
                        <div key={r.id} className="flex flex-col sm:flex-row sm:items-start gap-4 px-5 py-4 transition-colors hover:bg-surface-high/50"
                            style={{ borderBottom: i < reviews.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(var(--color-warning),0.12)' }}>
                                <Star className="h-5 w-5 fill-current" style={{ color: 'var(--color-warning)' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm" style={{ color: 'var(--color-primary)' }}>{r.service_name}</span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)', color: 'var(--color-primary)', border: '1px solid rgba(var(--color-primary),0.2)' }}>
                                            {r.provider_name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {starRating(r.rating, 16)}
                                        <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>{r.rating}/5</span>
                                    </div>
                                </div>
                                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                    {r.comment ? r.comment : 'No comment provided'}
                                </p>
                                <p className="text-[10px] mt-2" style={{ color: 'var(--color-text-subtle)' }}>Submitted {new Date(r.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button 
                                    className="h-9 w-9 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                    style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                                    onClick={() => openEdit(r)}
                                    aria-label="Edit review">
                                    <Pencil className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                                </button>
                                <button 
                                    className="h-9 w-9 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                    style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                                    onClick={() => del(r.id)}
                                    disabled={deletingId === r.id}
                                    aria-label="Delete review">
                                    {deletingId === r.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--color-error)' }} />
                                    ) : (
                                        <Trash2 className="h-4 w-4" style={{ color: 'var(--color-error)' }} />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pending Reviews Section */}
            {reviewableBookings.length > 0 && (
                <>
                    <div className="flex items-center gap-3">
                        <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                        <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Ready to Review</span>
                        <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                    </div>

                    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        {reviewableBookings.map((b, i) => (
                            <div key={b.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-high/50"
                                style={{ borderBottom: i < reviewableBookings.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(var(--color-accent),0.12)' }}>
                                    <Pencil className="h-4.5 w-4.5" style={{ color: 'var(--color-accent)' }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-primary)' }}>{b.service_name}</p>
                                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{b.provider_name} · {new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(var(--color-accent),0.12)', color: 'var(--color-accent)', border: '1px solid rgba(var(--color-accent),0.2)' }}>
                                        Write Review
                                    </span>
                                    <button 
                                        className="h-9 w-9 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                        style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                                        onClick={() => { setForm({ rating: 5, comment: '', booking_id: b.id }); setEditId(null); setDialog(true); }}
                                        aria-label="Write review">
                                        <ChevronRight className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Tips */}
            <div className="flex items-center gap-3">
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-bold uppercase tracking-widest px-2" style={{ color: 'var(--color-text-subtle)' }}>Tips for Great Reviews</span>
                <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <div className="rounded-2xl p-6 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: CheckCircle2, title: 'Be Specific', desc: 'Mention what the provider did well — details help others make informed decisions' },
                        { icon: Shield, title: 'Stay Constructive', desc: 'If there were issues, explain them clearly so the provider can improve' },
                        { icon: Award, title: 'Rate Honestly', desc: 'Your authentic rating helps maintain trust in the community' },
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

            {/* Write/Edit Review Dialog */}
            {dialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
                    onClick={e => e.target === e.currentTarget && setDialog(false)}>
                    <div className="w-full max-w-md rounded-2xl p-6 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto"
                        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}>
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-lg" style={{ color: 'var(--color-primary)' }}>{editId ? 'Edit Review' : 'Write a Review'}</h2>
                            <button 
                                onClick={() => { setDialog(false); setEditId(null); setForm({ rating: 5, comment: '', booking_id: '' }); }}
                                className="h-8 w-8 rounded-xl flex items-center justify-center transition-all card-lightning-subtle"
                                style={{ color: 'var(--color-text-subtle)', backgroundColor: 'transparent', border: 'none' }}
                                aria-label="Close dialog">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {!editId && (
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-text-subtle)' }}>Select Booking *</label>
                                <select value={form.booking_id} onChange={e => setForm(p => ({ ...p, booking_id: e.target.value }))}
                                    className="input-lightning w-full px-4 py-3.5 rounded-xl text-base outline-none"
                                    style={{ 
                                        backgroundColor: 'var(--color-surface)',
                                        border: '1px solid var(--color-border-strong)',
                                        color: 'var(--color-text)',
                                        fontSize: '15px',
                                        fontFamily: 'Inter,sans-serif',
                                    }}
                                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-border-accent)')}
                                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border-strong)')}>
                                    <option value="">Choose a completed booking…</option>
                                    {reviewableBookings.map(b => (
                                        <option key={b.id} value={b.id}>{b.service_name} — {b.provider_name} ({new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-text-subtle)' }}>Your Rating *</label>
                            {starRating(form.rating, 28, true, (r) => setForm(p => ({ ...p, rating: r })))}
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: 'var(--color-text-subtle)' }}>Your Comment *</label>
                            <textarea 
                                placeholder="Share your experience — what went well? What could be improved?"
                                value={form.comment}
                                onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                                rows={4}
                                className="input-lightning w-full px-4 py-3.5 rounded-xl resize-none outline-none"
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
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button 
                                className="flex-1 h-10 rounded-xl font-semibold transition-all"
                                style={{ backgroundColor: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-strong)' }}
                                onClick={() => { setDialog(false); setEditId(null); setForm({ rating: 5, comment: '', booking_id: '' }); }}>
                                Cancel
                            </button>
                            <button 
                                className="flex-1 h-10 rounded-xl font-semibold transition-all"
                                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                                onClick={save} 
                                disabled={saving || !form.comment.trim() || (!editId && !form.booking_id)}>
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : editId ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        Update Review
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        Submit Review
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