import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, memo } from 'react';
import { useTheme } from '@/lib/ThemeContext';
import {
    LayoutDashboard, Wrench, CalendarDays, DollarSign, User,
    Moon, Sun, Menu, X, Bot, Users, ChevronRight,
    TrendingUp, MessageSquare, Home, Zap, Bell,
    PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

const NAV_ITEMS = [
    { path: '/provider',             icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/provider/services',    icon: Wrench,          label: 'Services' },
    { path: '/provider/bookings',    icon: CalendarDays,    label: 'Bookings' },
    { path: '/provider/earnings',    icon: DollarSign,      label: 'Earnings' },
    { path: '/provider/profile',     icon: User,            label: 'Profile' },
];

const MORE_ITEMS = [
    { path: '/provider/copilot',     icon: Bot,             label: 'AI Copilot' },
    { path: '/provider/ai-insights', icon: TrendingUp,      label: 'AI Insights' },
    { path: '/provider/customers',   icon: Users,           label: 'Customers' },
    { path: '/provider/chat',        icon: MessageSquare,   label: 'Messages' },
    { path: '/provider/availability',icon: CalendarDays,    label: 'Availability' },
];

const NavItem = memo(function NavItem({ item, active, onClick, slim }) {
    return (
        <Link to={item.path} onClick={onClick}
            className="relative flex items-center rounded-lg hover-lift"
            title={slim ? item.label : undefined}
            style={{
                padding: slim ? '8px' : '8px 10px',
                gap: slim ? 0 : 10,
                justifyContent: slim ? 'center' : 'flex-start',
                color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                backgroundColor: active ? 'var(--color-surface-high)' : 'transparent',
                fontSize: 13,
                fontWeight: active ? 600 : 450,
            }}
            onMouseEnter={e => !active && (e.currentTarget.style.backgroundColor = 'var(--color-surface-high)', e.currentTarget.style.color = 'var(--color-text)', e.currentTarget.style.boxShadow = 'var(--shadow-glow)')}
            onMouseLeave={e => !active && (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = 'var(--color-text-muted)', e.currentTarget.style.boxShadow = 'none')}>
            {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full"
                style={{ backgroundColor: 'var(--color-primary)', marginLeft: -1, boxShadow: '0 0 8px rgba(255,255,255,0.35)' }} />}
            <item.icon style={{ width: 15, height: 15, flexShrink: 0, opacity: active ? 1 : 0.6 }} />
            {!slim && <span style={{ letterSpacing: '-0.01em' }}>{item.label}</span>}
        </Link>
    );
});

const MoreItem = memo(function MoreItem({ item, onClick, slim }) {
    return (
        <Link to={item.path} onClick={onClick}
            className="flex items-center rounded-lg hover-lift"
            title={slim ? item.label : undefined}
            style={{
                padding: slim ? '7px' : '8px 10px',
                gap: slim ? 0 : 10,
                justifyContent: slim ? 'center' : 'flex-start',
                color: 'var(--color-text-muted)',
                fontSize: 13,
                letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-high)', e.currentTarget.style.color = 'var(--color-text)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = 'var(--color-text-muted)')}>
            <item.icon style={{ width: 15, height: 15, flexShrink: 0, opacity: 0.6 }} />
            {!slim && <span>{item.label}</span>}
        </Link>
    );
});

export default function ProviderLayout() {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(() =>
        localStorage.getItem('truvornex-provider-collapsed') === 'true'
    );
    const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 768);
        window.addEventListener('resize', handleResize, { passive: true });
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    useEffect(() => { setSidebarOpen(false); }, [pathname]);

    const toggleCollapsed = useCallback(() => {
        setCollapsed(c => {
            localStorage.setItem('truvornex-provider-collapsed', String(!c));
            return !c;
        });
    }, []);

    const isActive = useCallback((item) =>
        item.exact ? pathname === item.path : pathname === item.path || pathname.startsWith(item.path + '/'), [pathname]);

    const sidebarW = collapsed ? 56 : 224;

    const SidebarInner = ({ onClose }) => {
        const isMobile = !!onClose;
        const slim = !isMobile && collapsed;

        return (
            <div className="flex flex-col h-full overflow-hidden" style={{ width: '100%' }}>
                <div className="flex items-center justify-between px-3 py-3.5"
                    style={{ borderBottom: '1px solid var(--color-border)', minHeight: 52, flexShrink: 0 }}>
                    <Link to="/provider" onClick={onClose} className="flex items-center gap-2 min-w-0 glow-ring-ai">
                        <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 btn-lightning-subtle"
                            style={{ backgroundColor: 'var(--color-primary)', boxShadow: 'var(--shadow-xs)', transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                            <Wrench className="h-3.5 w-3.5" style={{ color: 'var(--color-on-primary)' }} />
                        </div>
                        {!slim && (
                            <div className="min-w-0">
                                <h1 className="text-xs font-black" style={{ color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>TRUVORNEX</h1>
                                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                                    style={{ backgroundColor: 'var(--color-surface-high)', color: 'var(--color-text-muted)' }}>
                                    Provider
                                </span>
                            </div>
                        )}
                    </Link>
                    {isMobile ? (
                        <button onClick={onClose} className="h-7 w-7 rounded-md flex items-center justify-center"
                            style={{ color: 'var(--color-text-subtle)', flexShrink: 0 }}>
                            <X className="h-3.5 w-3.5" />
                        </button>
                    ) : (
                        <button onClick={toggleCollapsed}
                            className="h-7 w-7 rounded-md flex items-center justify-center transition-all"
                            style={{ color: 'var(--color-text-subtle)', flexShrink: 0 }}
                            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-high)', e.currentTarget.style.color = 'var(--color-text)')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = 'var(--color-text-subtle)')}>
                            {collapsed
                                ? <PanelLeftOpen className="h-3.5 w-3.5" />
                                : <PanelLeftClose className="h-3.5 w-3.5" />}
                        </button>
                    )}
                </div>

                {!slim && (
                    <div className="px-2.5 py-2" style={{ borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
                        <div className="flex rounded-lg p-0.5 gap-0.5" style={{ backgroundColor: 'var(--color-surface-high)' }}>
                            <button onClick={() => { navigate('/'); onClose?.(); }}
                                className="flex-1 text-center text-[11px] font-medium py-1.5 rounded-md transition-all flex items-center justify-center gap-0.5"
                                style={{ color: 'var(--color-text-muted)' }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                                Customer <ChevronRight style={{ width: 9, height: 9 }} />
                            </button>
                            <span className="flex-1 text-center text-[11px] font-semibold py-1.5 rounded-md"
                                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                                Provider
                            </span>
                        </div>
                    </div>
                )}

                <nav className="flex-1 overflow-y-auto py-2 no-scrollbar" style={{ padding: slim ? '8px 6px' : '8px 6px' }}>
                    <div className="space-y-0.5">
                        {NAV_ITEMS.map(item => (
                            <NavItem key={item.path} item={item} active={isActive(item)} onClick={onClose} slim={slim} />
                        ))}
                    </div>

                    {!slim && (
                        <>
                            <div className="px-2.5 pt-4 pb-1.5">
                                <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-subtle)' }}>Tools</span>
                            </div>
                            <div className="space-y-0.5">
                                {MORE_ITEMS.map(item => (
                                    <MoreItem key={item.path} item={item} onClick={onClose} slim={slim} />
                                ))}
                            </div>
                        </>
                    )}

                    {slim && (
                        <div className="space-y-0.5 mt-2 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                            {MORE_ITEMS.slice(0, 4).map(item => (
                                <Link key={item.path} to={item.path}
                                    title={item.label}
                                    className="flex items-center justify-center rounded-lg transition-all hover-lift"
                                    style={{ padding: '7px', color: 'var(--color-text-subtle)' }}
                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-high)', e.currentTarget.style.color = 'var(--color-text)', e.currentTarget.style.boxShadow = 'var(--shadow-glow)')}
                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = 'var(--color-text-subtle)', e.currentTarget.style.boxShadow = 'none')}>
                                    <item.icon style={{ width: 13, height: 13 }} />
                                </Link>
                            ))}
                        </div>
                    )}
                </nav>

                <div className="py-2" style={{ borderTop: '1px solid var(--color-border)', flexShrink: 0, padding: slim ? '8px 6px' : '8px 6px' }}>
                    <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg mb-0.5"
                        style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border-strong)', opacity: slim ? 0 : 1, height: slim ? 0 : 'auto', overflow: slim ? 'hidden' : 'visible', padding: slim ? 0 : undefined }}>
                        <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-success)', animation: 'rt-pulse 2s ease-in-out infinite' }} />
                        <p className="text-[11px] font-medium flex-1" style={{ color: 'var(--color-text-muted)' }}>AI Copilot Active</p>
                        <Zap style={{ width: 10, height: 10, color: 'var(--color-text-subtle)', flexShrink: 0 }} />
                    </div>
                    <button onClick={toggleTheme}
                        className="w-full flex items-center rounded-lg transition-all btn-lightning-subtle"
                        title={slim ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
                        style={{
                            padding: slim ? '8px' : '8px 10px',
                            gap: slim ? 0 : 10,
                            justifyContent: slim ? 'center' : 'flex-start',
                            color: 'var(--color-text-muted)',
                            fontSize: 13,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-surface-high)', e.currentTarget.style.color = 'var(--color-text)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = 'var(--color-text-muted)')}>
                        {theme === 'dark' ? <Sun style={{ width: 15, height: 15, flexShrink: 0 }} /> : <Moon style={{ width: 15, height: 15, flexShrink: 0 }} />}
                        {!slim && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                    </button>
                </div>
            </div>
        );
    };

    const headerStyle = {
        backgroundColor: 'var(--color-glass)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--color-border)',
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
            <aside className="hidden md:flex fixed left-0 top-0 h-full flex-col z-40"
                style={{
                    width: sidebarW,
                    backgroundColor: 'var(--color-surface)',
                    borderRight: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'width 0.22s cubic-bezier(0.25,1,0.5,1)',
                    overflow: 'hidden',
                }}>
                <SidebarInner />
            </aside>

            <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-1"
                style={headerStyle}>
                <div className="flex items-center">
                    <button onClick={() => setSidebarOpen(true)}
                        style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', touchAction: 'manipulation', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 12 }}>
                        <Menu style={{ width: 20, height: 20 }} />
                    </button>
                    <div className="flex items-center gap-1.5 ml-1">
                        <div className="h-5 w-5 rounded-md flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
                            <Wrench className="h-3 w-3" style={{ color: 'var(--color-on-primary)' }} />
                        </div>
                        <span className="text-xs font-black" style={{ color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>Provider</span>
                    </div>
                </div>
                <div className="flex items-center">
                    <button onClick={toggleTheme}
                        style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', touchAction: 'manipulation', background: 'none', border: 'none', cursor: 'pointer' }}>
                        {theme === 'dark' ? <Sun style={{ width: 18, height: 18 }} /> : <Moon style={{ width: 18, height: 18 }} />}
                    </button>
                    <button onClick={() => navigate('/')}
                        style={{ height: 44, paddingLeft: 10, paddingRight: 10, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-muted)', touchAction: 'manipulation', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999, backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Home style={{ width: 9, height: 9 }} />
                            Customer
                        </span>
                    </button>
                </div>
            </header>

            {sidebarOpen && (
                <div className="md:hidden fixed inset-0 z-50" style={{ animation: 'fadeIn 0.15s ease' }}>
                    <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
                        onClick={() => setSidebarOpen(false)} />
                    <div className="absolute left-0 top-0 h-full w-64 flex flex-col"
                        style={{ backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', zIndex: 51, animation: 'slideInLeft 0.28s cubic-bezier(0.19,1,0.22,1)' }}>
                        <SidebarInner onClose={() => setSidebarOpen(false)} />
                    </div>
                </div>
            )}

            <main className="pt-14 md:pt-0 pb-20 md:pb-6" style={{ minHeight: '100vh' }}>
                <div style={{ marginLeft: isDesktop ? sidebarW : 0, transition: 'margin-left 0.22s cubic-bezier(0.25,1,0.5,1)' }}>
                    <div key={pathname} className="max-w-4xl mx-auto px-3 md:px-7 py-4 md:py-7">
                        <Outlet />
                    </div>
                </div>
            </main>

            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center h-14 pb-safe"
                style={{
                    backgroundColor: 'var(--color-glass)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderTop: '1px solid var(--color-border)',
                }}>
                {NAV_ITEMS.map(item => {
                    const active = isActive(item);
                    return (
                        <Link key={item.path} to={item.path}
                            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full">
                            <div className="h-7 w-7 flex items-center justify-center rounded-lg"
                                style={{ backgroundColor: active ? 'var(--color-surface-high)' : 'transparent' }}>
                                <item.icon style={{ width: 17, height: 17, color: active ? 'var(--color-primary)' : 'var(--color-text-subtle)', strokeWidth: active ? 2.2 : 1.7 }} />
                            </div>
                            <span className="text-[9px] font-medium leading-none"
                                style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-subtle)', fontWeight: active ? 700 : 500 }}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
