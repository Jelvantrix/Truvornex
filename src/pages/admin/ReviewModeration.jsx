import { useState, useEffect } from 'react';
import { Star, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ReviewModeration() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [ratingFilter, setRatingFilter] = useState('all');

    useEffect(() => {
    }, []);

    const del = async (id) => {
        setReviews(prev => prev.filter(r => r.id !== id));
        toast.success('Review removed');
    };

    const filtered = reviews.filter(r => {
        const matchSearch = !search || r.customer_email?.toLowerCase().includes(search.toLowerCase()) || r.comment?.toLowerCase().includes(search.toLowerCase());
        const matchRating = ratingFilter === 'all' || r.rating === Number(ratingFilter);
        return matchSearch && matchRating;
    });

    const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';
    const lowRating = reviews.filter(r => r.rating <= 2).length;

    return (
        <div className="space-y-6 pb-8">
            <div>
                <h1 className="font-inter font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)' }}>Review Moderation</h1>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Monitor and moderate platform reviews</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Reviews', value: reviews.length },
                    { label: 'Average Rating', value: avgRating },
                    { label: '5-Star Reviews', value: reviews.filter(r => r.rating === 5).length },
                    { label: 'Low Ratings (≤2)', value: lowRating },
                ].map(k => (
                    <div key={k.label} className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <p className="font-black text-3xl" style={{ color: 'var(--color-primary)' }}>{k.value}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reviews…" className="input-lightning pl-9" />
                </div>
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger className="input-lightning w-36"><SelectValue placeholder="Rating" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Ratings</SelectItem>
                        {[5, 4, 3, 2, 1].map(r => <SelectItem key={r} value={String(r)}>{'⭐'.repeat(r)} ({r} star)</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton-wave h-24 rounded-2xl" />)}</div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(r => (
                        <div
                            key={r.id}
                            className="card-premium p-5 hover-lift"
                            style={r.rating <= 2 ? { borderLeft: '4px solid rgba(var(--color-error),0.5)' } : undefined}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex gap-0.5">
                                            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5" style={{ color: i < r.rating ? 'rgb(var(--color-warning, 245 158 11))' : 'var(--color-border-strong)', fill: i < r.rating ? 'rgb(var(--color-warning, 245 158 11))' : 'none' }} />)}
                                        </div>
                                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{r.customer_email}</span>
                                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>·</span>
                                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{r.created_date?.slice(0, 10)}</span>
                                    </div>
                                    <p className="text-sm" style={{ color: 'var(--color-text)' }}>{r.comment || <span className="italic" style={{ color: 'var(--color-text-muted)' }}>No comment</span>}</p>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" style={{ color: 'rgba(var(--color-error),0.8)' }} onClick={() => del(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && <div className="card-premium p-10 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>No reviews found</div>}
                </div>
            )}
        </div>
    );
}
