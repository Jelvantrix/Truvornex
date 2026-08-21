import { useState, useEffect } from 'react';
import { List, Map as MapIcon, Navigation } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import ProviderCard from '../components/ProviderCard';
import MapView from '../components/MapView';
import useGeolocation from '../hooks/useGeolocation';

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function NearbyProviders() {
    const [providers, setProviders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('both');
    const [catFilter, setCatFilter] = useState('all');
    const [sortBy, setSortBy] = useState('distance');
    const [radius, setRadius] = useState([25]); // Default 25km radius
    const { location: userLoc, loading: locLoading, error: locError, permissionDenied } = useGeolocation();

    useEffect(() => {
        fetchNearbyProviders();
    }, [userLoc, radius, catFilter]);

    const fetchNearbyProviders = async () => {
        if (!userLoc || userLoc.length !== 2) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const [lat, lng] = userLoc;
            const radiusKm = radius[0];

            let url = `/api/providers/nearby?lat=${lat}&lng=${lng}&radius_km=${radiusKm}`;
            if (catFilter !== 'all') {
                url += `&category=${catFilter}`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setProviders(data.providers || []);

                // Extract categories from by_category object
                if (data.by_category) {
                    const categoryList = Object.keys(data.by_category).map(slug => ({
                        slug,
                        name: slug.charAt(0).toUpperCase() + slug.slice(1)
                    }));
                    setCategories(categoryList);
                }
            }
        } catch (error) {
            console.error('Failed to fetch nearby providers:', error);
            toast.error('Failed to load nearby providers');
        } finally {
            setLoading(false);
        }
    };

    // Filter and sort providers
    const filteredProviders = providers.filter(p =>
        catFilter === 'all' || p.category_slug === catFilter
    );

    const sortedProviders = [...filteredProviders].sort((a, b) => {
        if (sortBy === 'distance') return (a.distance_km || 999) - (b.distance_km || 999);
        if (sortBy === 'rating') return (b.avg_rating || 0) - (a.avg_rating || 0);
        if (sortBy === 'trust') return (b.trust_score || 0) - (a.trust_score || 0);
        return 0;
    });

    return (
        <div className="pb-20 md:pb-0">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 fade-in">
                <div>
                    <h1 className="font-inter font-bold text-2xl" style={{ color: 'var(--color-primary)' }}>Nearby Providers</h1>
                    {permissionDenied ? (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-warning)' }}>Location blocked — please allow access in your browser settings</p>
                    ) : locError ? (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{locError}</p>
                    ) : locLoading ? (
                        <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}><Navigation className="h-3 w-3 animate-pulse" /> Getting your location...</p>
                    ) : (
                        <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}><Navigation className="h-3 w-3" style={{ color: 'var(--color-primary)' }} /> Live location active</p>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Select value={catFilter} onValueChange={setCatFilter}>
                        <SelectTrigger className="w-36 h-9 text-xs border-0 rounded-xl card-lightning-subtle">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-28 h-9 text-xs border-0 rounded-xl card-lightning-subtle">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="distance">Distance</SelectItem>
                            <SelectItem value="rating">Rating</SelectItem>
                            <SelectItem value="trust">Trust Score</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ minWidth: '140px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                        <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>{radius[0]}km</span>
                        <Slider
                            value={radius}
                            onValueChange={setRadius}
                            min={5}
                            max={50}
                            step={5}
                            className="flex-1"
                        />
                    </div>
                    <div className="hidden md:flex rounded-md overflow-hidden" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                        {['both', 'map', 'list'].map(v => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`h-9 px-3 text-xs font-medium transition-colors ${view === v ? '' : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]'}`}
                                style={view === v ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' } : undefined}
                            >
                                {v === 'map' ? <MapIcon className="h-3.5 w-3.5" /> : v === 'list' ? <List className="h-3.5 w-3.5" /> : 'Both'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="w-6 h-6 rounded-full animate-spin" style={{ border: '2px solid var(--color-border)', borderTopColor: 'var(--color-primary)' }} /></div>
            ) : (
                <div className={`grid gap-4 ${view === 'both' ? 'lg:grid-cols-2' : ''}`}>
                    {(view === 'both' || view === 'map') && (
                        <div className="rounded-2xl overflow-hidden hover-lift shadow-premium" style={{ border: '1px solid var(--color-border)' }}>
                            <MapView providers={sortedProviders} userLocation={userLoc} className="h-[400px] lg:h-[600px]" />
                        </div>
                    )}
                    {(view === 'both' || view === 'list') && (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                            {sortedProviders.length === 0 ? (
                                <div className="card-premium p-10 text-center">
                                    <p style={{ color: 'var(--color-text-muted)' }}>No providers found nearby within {radius[0]}km.</p>
                                </div>
                            ) : sortedProviders.map(p => (
                                <ProviderCard key={p.id} provider={p} distance={p.distance_km} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
