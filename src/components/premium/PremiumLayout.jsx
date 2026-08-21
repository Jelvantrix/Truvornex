import { useState, useEffect, useRef } from 'react'
import { cn } from "@/lib/utils"

export function PageHeader({ 
    title, 
    subtitle, 
    icon, 
    iconColor = 'var(--color-primary)',
    iconBg = 'var(--color-surface-high)',
    action,
    className 
}) {
    return (
        <header className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8", className)}>
            <div className="flex items-start gap-4">
                {icon && (
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 card-lightning-subtle"
                        style={{ backgroundColor: iconBg }}>
                        <icon className="h-6 w-6" style={{ color: iconColor }} />
                    </div>
                )}
                <div>
                    <h1 className="font-black text-2xl sm:text-3xl tracking-tight"
                        style={{ color: 'var(--color-primary)', letterSpacing: '-0.04em' }}>
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {action && (
                <div className="flex-shrink-0 mt-2 sm:mt-0">
                    {action}
                </div>
            )}
        </header>
    )
}

export function SectionCard({ 
    title, 
    subtitle, 
    icon, 
    iconColor = 'var(--color-primary)',
    iconBg = 'var(--color-surface-high)',
    children, 
    className,
    variant = 'default'
}) {
    const variants = {
        default: 'card-lightning-subtle',
        elevated: 'card-lightning',
        ai: 'card-lightning-ai',
        subtle: 'card-lightning-subtle'
    }
    
    return (
        <section className={cn("rounded-2xl p-6 sm:p-8 transition-all", variants[variant], className)}>
            {(title || icon) && (
                <div className="flex items-start gap-3 mb-6">
                    {icon && (
                        <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: iconBg }}>
                        <icon className="h-5 w-5" style={{ color: iconColor }} />
                    </div>
                    )}
                    {title && (
                        <div>
                            <h2 className="font-semibold text-lg tracking-tight"
                                style={{ color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
            <div>{children}</div>
        </section>
    )
}

export function PremiumCard({ 
    children, 
    className, 
    variant = 'default',
    hover = true,
    padding = 'p-5 sm:p-6'
}) {
    const variants = {
        default: 'card-lightning-subtle',
        elevated: 'card-lightning',
        ai: 'card-lightning-ai',
        subtle: 'card-lightning-subtle'
    }
    
    return (
        <div className={cn("rounded-xl transition-all", variants[variant], padding, hover && 'hover-lift', className)}>
            {children}
        </div>
    )
}

export function SettingRow({ 
    icon, 
    iconColor = 'var(--color-text-muted)', 
    iconBg = 'var(--color-surface-high)',
    title, 
    description, 
    children, 
    className 
}) {
    return (
        <div className={cn("flex items-start gap-4 py-3", className)}>
            {icon && (
                <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: iconBg }}>
                    <icon className="h-4.5 w-4.5" style={{ color: iconColor }} />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="font-medium" style={{ color: 'var(--color-primary)' }}>
                    {title}
                </div>
                {description && (
                    <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {description}
                    </p>
                )}
                {children && (
                    <div className="mt-2">{children}</div>
                )}
            </div>
        </div>
    )
}

export function Divider({ className, children }) {
    return (
        <div className={cn("flex items-center gap-3 my-2", className)}>
            <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            {children && (
                <span className="text-xs font-medium px-2" style={{ color: 'var(--color-text-subtle)' }}>
                    {children}
                </span>
            )}
            <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
        </div>
    )
}

export function EmptyState({ 
    icon, 
    title, 
    description, 
    action, 
    className,
    iconColor = 'var(--color-text-subtle)'
}) {
    return (
        <div className={cn("flex flex-col items-center text-center py-12 sm:py-16 px-4", className)}>
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4 card-lightning-subtle"
                style={{ backgroundColor: 'var(--color-surface-high)' }}>
                <icon className="h-7 w-7" style={{ color: iconColor }} />
            </div>
            <h3 className="font-semibold text-lg" style={{ color: 'var(--color-primary)' }}>
                {title}
            </h3>
            {description && (
                <p className="text-sm mt-1 max-w-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {description}
                </p>
            )}
            {action && (
                <div className="mt-4">{action}</div>
            )}
        </div>
    )
}

export function DataGrid({ columns, data, renderRow, className, emptyState }) {
    if (!data.length) {
        return emptyState || (
            <EmptyState 
                icon={columns[0]?.icon} 
                title="No data" 
                description="No items to display" 
            />
        )
    }
    
    return (
        <div className={cn("rounded-xl overflow-hidden", className)}>
            <div className="overflow-x-auto">
                <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--color-surface-high)' }}>
                            {columns.map((col, i) => (
                                <th key={i} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                                    style={{ color: 'var(--color-text-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, i) => (
                            <tr key={item.id || i} 
                                style={{ 
                                    backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--color-surface-low)',
                                    borderBottom: i < data.length - 1 ? '1px solid var(--color-border)' : 'none',
                                    transition: 'background-color 0.15s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-high)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? 'transparent' : 'var(--color-surface-low)'}
                            >
                                {renderRow(item, i)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export function StatCard({ 
    value, 
    label, 
    trend, 
    trendUp = true,
    icon,
    iconColor = 'var(--color-primary)',
    iconBg = 'var(--color-surface-high)',
    className 
}) {
    return (
        <div className={cn("card-lightning-subtle rounded-xl p-5", className)}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-subtle)' }}>
                        {label}
                    </p>
                    <p className="font-black text-2xl sm:text-3xl mt-1 tracking-tight" style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}>
                        {value}
                    </p>
                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            <span className="text-xs font-semibold" style={{ color: trendUp ? 'var(--color-success)' : 'var(--color-error)' }}>
                                {trendUp ? '▲' : '▼'} {trend}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>vs last period</span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: iconBg }}>
                        <icon className="h-6 w-6" style={{ color: iconColor }} />
                    </div>
                )}
            </div>
        </div>
    )
}

export function PremiumButton({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    className, 
    lightning = true,
    ...props 
}) {
    const variants = {
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        outline: 'border border-input bg-transparent',
        ghost: 'bg-transparent',
        destructive: 'bg-destructive text-destructive-foreground'
    }
    
    const sizes = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg'
    }
    
    const lightningClasses = {
        primary: lightning ? 'btn-lightning' : '',
        secondary: lightning ? 'btn-lightning-subtle' : '',
        outline: lightning ? 'btn-lightning-subtle' : '',
        ghost: lightning ? 'btn-lightning-subtle' : '',
        destructive: lightning ? 'btn-lightning-subtle' : ''
    }
    
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all",
                variants[variant],
                sizes[size],
                lightningClasses[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}

export function PremiumInput({ 
    label, 
    error, 
    helperText,
    className,
    variant = 'lightning',
    ...props 
}) {
    return (
        <div className={cn("w-full", className)}>
            {label && (
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: 'var(--color-text-muted)' }}>
                    {label}
                </label>
            )}
            <input
                className={cn(
                    "w-full rounded-xl px-4 py-3 transition-all outline-none",
                    "bg-transparent",
                    "placeholder:text-muted-foreground",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    variant === 'lightning' && 'input-lightning',
                    variant === 'lightning-ai' && 'input-lightning-ai',
                    error && 'border-error'
                )}
                style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border-strong)'}`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: 'Inter,sans-serif',
                    letterSpacing: '-0.011em'
                }}
                {...props}
            />
            {error && (
                <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: 'var(--color-error)' }}>
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </p>
            )}
            {helperText && !error && (
                <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-subtle)' }}>
                    {helperText}
                </p>
            )}
        </div>
    )
}

export function PremiumSelect({ 
    label, 
    options, 
    value, 
    onChange, 
    error, 
    helperText,
    placeholder = "Select...",
    className,
    variant = 'lightning',
    ...props 
}) {
    return (
        <div className={cn("w-full", className)}>
            {label && (
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: 'var(--color-text-muted)' }}>
                    {label}
                </label>
            )}
            <select
                value={value}
                onChange={onChange}
                className={cn(
                    "w-full rounded-xl px-4 py-3 transition-all outline-none appearance-none",
                    "bg-transparent cursor-pointer",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    variant === 'lightning' && 'input-lightning',
                    variant === 'lightning-ai' && 'input-lightning-ai',
                    error && 'border-error'
                )}
                style={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border-strong)'}`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: 'Inter,sans-serif',
                    letterSpacing: '-0.011em',
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 12px center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '16px',
                    paddingRight: '40px'
                }}
                {...props}
            >
                <option value="" disabled>{placeholder}</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {error && (
                <p className="text-xs mt-1.5" style={{ color: 'var(--color-error)' }}>{error}</p>
            )}
            {helperText && !error && (
                <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-subtle)' }}>{helperText}</p>
            )}
        </div>
    )
}

export function PremiumSwitch({ 
    label, 
    description, 
    checked, 
    onChange, 
    className,
    disabled = false 
}) {
    return (
        <label className={cn("flex items-center gap-4 cursor-pointer", className)}>
            <button
                role="switch"
                aria-checked={checked}
                onClick={() => !disabled && onChange(!checked)}
                disabled={disabled}
                className={cn(
                    "relative h-6 w-11 rounded-full transition-all duration-200 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                style={{
                    backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-surface-high)',
                    border: `1px solid ${checked ? 'var(--color-primary)' : 'var(--color-border-strong)'}`,
                    boxShadow: checked ? '0 0 12px var(--glow-primary), 0 0 24px var(--glow-secondary)' : 'none'
                }}
            >
                <span
                    className="pointer-events-none block h-4 w-4 rounded-full shadow-sm transition-transform duration-200 ease-out"
                    style={{
                        transform: checked ? 'translateX(20px)' : 'translateX(2px)',
                        backgroundColor: checked ? 'var(--color-on-primary)' : 'var(--color-text-subtle)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                    }}
                />
            </button>
            <div className="flex-1 min-w-0">
                <div className="font-medium" style={{ color: 'var(--color-primary)' }}>
                    {label}
                </div>
                {description && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {description}
                    </p>
                )}
            </div>
        </label>
    )
}

export function Badge({ 
    children, 
    variant = 'default', 
    className,
    dot = false,
    dotColor
}) {
    const variants = {
        default: 'bg-surface-high text-text-muted border border-border',
        primary: 'bg-primary text-primary-foreground',
        success: 'bg-success-bg text-success border border-success/20',
        warning: 'bg-warning-bg text-warning border border-warning/20',
        error: 'bg-error-bg text-error border border-error/20',
        info: 'bg-info-bg text-info border border-info/20',
        premium: 'bg-gradient-to-r from-primary/10 to-primary/20 text-primary border border-primary/20',
        ai: 'bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-purple-300 border border-purple-500/20 dark:text-purple-400'
    }
    
    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold",
            "transition-all",
            variants[variant],
            className
        )}>
            {dot && (
                <span className="h-1.5 w-1.5 rounded-full" 
                    style={{ backgroundColor: dotColor || 'currentColor' }} />
            )}
            {children}
        </span>
    )
}

export function Avatar({ 
    src, 
    alt, 
    name, 
    size = 'md', 
    className,
    status,
    statusColor = 'var(--color-success)'
}) {
    const sizes = {
        xs: 'h-6 w-6 text-[10px]',
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
        '2xl': 'h-24 w-24 text-xl'
    }
    
    return (
        <div className={cn("relative inline-flex shrink-0", className)}>
            {src ? (
                <img 
                    src={src} 
                    alt={alt || name} 
                    className={cn("rounded-full object-cover", sizes[size])}
                />
            ) : (
                <div className={cn("rounded-full flex items-center justify-center bg-gradient-to-br from-surface-high to-surface-highest", sizes[size])}>
                    <span className="font-black" style={{ color: 'var(--color-text-subtle)' }}>
                        {name?.charAt(0)?.toUpperCase()}
                    </span>
                </div>
            )}
            {status && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-bg"
                    style={{ backgroundColor: statusColor }} />
            )}
        </div>
    )
}

export function LoadingCard({ lines = 3, className }) {
    return (
        <div className={cn("card-lightning-subtle rounded-xl p-5 animate-pulse", className)}>
            <div className="h-4 w-3/4 rounded bg-surface-high mb-3" />
            <div className="h-4 w-1/2 rounded bg-surface-high mb-2" />
            {Array.from({ length: lines - 2 }).map((_, i) => (
                <div key={i} className="h-4 w-full rounded bg-surface-high mb-2" />
            ))}
        </div>
    )
}

export function PageWrapper({ children, className, maxWidth = 'max-w-6xl' }) {
    return (
        <div className={cn("w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8", maxWidth, "mx-auto", className)}>
            {children}
        </div>
    )
}

export function SectionDivider({ label, className }) {
    return (
        <div className={cn("flex items-center gap-4 my-8", className)}>
            <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            {label && (
                <span className="text-xs font-semibold uppercase tracking-widest px-3" 
                    style={{ color: 'var(--color-text-subtle)', backgroundColor: 'var(--color-bg)' }}>
                    {label}
                </span>
            )}
            <hr className="flex-1 border-0 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
        </div>
    )
}

export function PremiumTabs({ tabs, activeTab, onChange, className, variant = 'default' }) {
    const variants = {
        default: 'bg-surface-high rounded-lg p-1',
        underline: 'border-b border-border',
        pills: 'gap-1'
    }
    
    return (
        <div className={cn("flex", variants[variant], className)} role="tablist">
            {tabs.map((tab, i) => (
                <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => onChange(tab.id)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                        "relative overflow-hidden",
                        activeTab === tab.id 
                            ? 'text-primary bg-primary/10 shadow-sm' 
                            : 'text-text-muted hover:text-text hover:bg-surface-high',
                        tab.badge && 'pr-6'
                    )}
                    style={{
                        color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        backgroundColor: activeTab === tab.id ? 'rgba(var(--color-primary), 0.08)' : 'transparent'
                    }}
                >
                    {tab.icon && <tab.icon className="h-4 w-4" />}
                    {tab.label}
                    {tab.badge && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                            style={{ 
                                backgroundColor: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-surface-high)',
                                color: activeTab === tab.id ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
                                border: '1px solid var(--color-border)'
                            }}>
                            {tab.badge}
                        </span>
                    )}
                </button>
            ))}
        </div>
    )
}

export function ActionMenu({ 
    trigger, 
    items, 
    align = 'right',
    className 
}) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    
    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])
    
    return (
        <div className={cn("relative inline-block", className)} ref={ref}>
            {trigger({ open, onClick: () => setOpen(!open) })}
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className={cn(
                        "fixed z-50 mt-1 min-w-[180px] rounded-xl shadow-lg border overflow-hidden animate-scale-in",
                        "card-lightning",
                        align === 'right' ? 'right-0' : 'left-0'
                    )} style={{ backgroundColor: 'var(--color-surface)' }}>
                        <div className="py-1">
                            {items.map((item, i) => (
                                <button
                                    key={item.id || i}
                                    onClick={() => { item.onClick?.(); setOpen(false); }}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                                        "text-left focus-visible:outline-none focus-visible:bg-surface-high",
                                        item.destructive && 'text-error hover:bg-error-bg'
                                    )}
                                    style={{ 
                                        color: item.destructive ? 'var(--color-error)' : 'var(--color-text)',
                                        backgroundColor: 'transparent'
                                    }}
                                >
                                    {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                                    {item.label}
                                    {item.shortcut && (
                                        <span className="ml-auto text-xs text-text-subtle font-mono">{item.shortcut}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}