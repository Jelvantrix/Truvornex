import { useState, useEffect } from 'react';
import StarRating from '../../components/StarRating';

export default function Reports() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    if (loading) return (
        <div className="flex justify-center py-20">
            <div
                className="w-6 h-6 rounded-full animate-spin"
                style={{ border: '2px solid var(--color-border)', borderTopColor: 'var(--color-primary)' }}
            />
        </div>
    );

    return (
        <div>
            <h1 className="font-inter font-bold text-2xl mb-6" style={{ color: 'var(--color-text)' }}>{"Reports & Reviews"}</h1>
            {reviews.length === 0 ? (
                <p className="text-sm text-center py-10" style={{ color: 'var(--color-text-muted)' }}>No reviews yet.</p>
            ) : (
                <div className="space-y-3">
                    {reviews.map(r => (
                        <div
                            key={r.id}
                            className="card-premium rounded-2xl p-5 shimmer hover-lift"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{r.customer_name || r.customer_email}</span>
                                <StarRating rating={r.rating} size={12} />
                            </div>
                            {r.comment && <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{r.comment}</p>}
                            <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>Provider: {r.provider_id}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
