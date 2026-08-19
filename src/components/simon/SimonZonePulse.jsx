import { useSimon } from '@/lib/SimonContext';

export default function SimonZonePulse() {
    const { zoneHealth, ready } = useSimon();
    if (!ready || !zoneHealth) return null;

    const color = zoneHealth.health === 'active' ? '#22c55e'
        : zoneHealth.health === 'moderate' ? '#f59e0b'
        : 'var(--color-text-subtle)';

    const label = zoneHealth.health === 'active' ? 'Active'
        : zoneHealth.health === 'moderate' ? 'Moderate'
        : 'Quiet';

    // Select glow colors based on health status
    const glowColor = zoneHealth.health === 'active' ? 'var(--glow-ai-primary)'
        : zoneHealth.health === 'moderate' ? 'var(--glow-aura-5)'
        : 'var(--glow-secondary)';

    const glowSecondary = zoneHealth.health === 'active' ? 'var(--glow-ai-secondary)'
        : zoneHealth.health === 'moderate' ? 'var(--glow-aura-4)'
        : 'var(--glow-tertiary)';

    return (
        <div className="card-lightning-ai" style={{ padding: '6px 10px', borderBottom: '1px solid var(--color-border)', flexShrink: 0, borderRadius: '10px', marginBottom: '8px', marginLeft: '-8px', marginRight: '-8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ position: 'relative', width: 8, height: 8, flexShrink: 0, display: 'inline-block', filter: 'drop-shadow(0 0 6px ' + color + ')' }}>
                    <span className="float-gentle" style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: color, opacity: 0.4, animation: 'glow-breathe 2s ease-out infinite' }} />
                    <span style={{ position: 'absolute', inset: '1px', borderRadius: '50%', backgroundColor: color, boxShadow: '0 0 8px ' + color }} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--color-text-muted)', lineHeight: 1.3 }}>
                        Zone {label}
                        <span style={{ fontWeight: 400, color: 'var(--color-text-subtle)' }}> · {zoneHealth.activeProviders} providers</span>
                    </div>
                    {zoneHealth.trendingServices?.length > 0 && (
                        <div style={{ fontSize: 9, color: 'var(--color-text-subtle)', marginTop: 1, lineHeight: 1.3 }}>
                            Trending: {zoneHealth.trendingServices.slice(0, 2).join(', ')}
                        </div>
                    )}
                </div>
                <span style={{ fontSize: 8, fontWeight: 800, color: '#7c6fcd', letterSpacing: '0.05em', flexShrink: 0, textShadow: '0 0 8px rgba(124, 111, 205, 0.5)' }}>SIMON</span>
            </div>
        </div>
    );
}