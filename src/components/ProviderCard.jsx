import { Link } from 'react-router-dom';
import { MapPin, CheckCircle, Star, Clock, Wifi, WifiOff } from 'lucide-react';

export default function ProviderCard({ provider, distance }) {
    // Calculate estimated response time based on distance (assuming 30km/h average speed)
    const estimatedResponseTime = distance ? Math.round(distance * 2) : null; // ~2 minutes per km
    
    // Check if provider is online (heartbeat within 8 minutes)
    const isOnline = provider.is_online && provider.last_heartbeat;
    
    // Format distance if available
    const displayDistance = distance != null && distance < 9999 ? `${distance.toFixed(1)} km` : null;
    
    return (
        <Link
            to={`/providers/${provider.id}`}
            className="group card-lightning block overflow-hidden"
        >
            <div className="h-40 bg-surface-high overflow-hidden relative">
                {provider.cover_image ? (
                    <img src={provider.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-high to-surface-highest">
                        <span className="text-5xl font-black text-text-subtle font-inter select-none">
                            {provider.business_name?.[0]?.toUpperCase()}
                        </span>
                    </div>
                )}
                
                {/* Online Status Indicator */}
                <div className={`absolute top-3 left-3 glass rounded-full px-2.5 py-1 text-xs font-semibold shadow-float flex items-center gap-1.5 ${
                    isOnline ? 'text-success bg-success-bg' : 'text-text-subtle bg-surface-high'
                }`}>
                    {isOnline ? (
                        <>
                            <Wifi className="h-3 w-3" />
                            <span>Online</span>
                        </>
                    ) : (
                        <>
                            <WifiOff className="h-3 w-3" />
                            <span>Offline</span>
                        </>
                    )}
                </div>
                
                {/* Verified Badge */}
                {provider.verified && (
                    <div className="absolute top-3 right-3 glass rounded-full p-1.5 shadow-float">
                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    </div>
                )}
                
                {/* Distance Badge */}
                {displayDistance && (
                    <div className="absolute bottom-3 left-3 glass rounded-full px-2.5 py-1 text-xs font-semibold text-primary shadow-float">
                        📍 {displayDistance} away
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-inter font-bold text-sm leading-tight text-primary group-hover:text-primary transition-colors">
                        {provider.business_name}
                    </h3>
                </div>
                
                {/* Rating and Response Time */}
                <div className="flex items-center gap-3 mb-2.5">
                    {provider.avg_rating > 0 ? (
                        <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                            <span className="text-xs font-semibold text-primary">{provider.avg_rating?.toFixed(1)}</span>
                            <span className="text-xs text-text-subtle">({provider.review_count || 0})</span>
                        </div>
                    ) : (
                        <span className="text-xs text-text-subtle">No reviews yet</span>
                    )}
                    
                    {/* Estimated Response Time */}
                    {estimatedResponseTime && (
                        <div className="flex items-center gap-1 text-xs text-text-subtle">
                            <Clock className="h-3 w-3" />
                            <span>~{estimatedResponseTime} min response</span>
                        </div>
                    )}
                </div>
                
                {/* Location and Trust Score */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-text-subtle">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{provider.city || provider.address || 'Location not specified'}</span>
                    </div>
                    
                    {/* Trust Score Badge */}
                    {provider.trust_score && provider.trust_score > 0 && (
                        <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            provider.trust_score >= 80 ? 'bg-success-bg text-success border border-success/20' :
                            provider.trust_score >= 60 ? 'bg-info-bg text-info border border-info/20' :
                            provider.trust_score >= 40 ? 'bg-warning-bg text-warning border border-warning/20' :
                            'bg-error-bg text-error border border-error/20'
                        }`}>
                            {provider.trust_score.toFixed(0)}% trusted
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}