import { useState, useEffect } from 'react';
import { Search, Download, ShieldAlert, Info, AlertTriangle, Bug, Flame } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const SEVERITY_STYLES = {
    debug: { bg: 'rgba(var(--color-text-muted),0.12)', color: 'var(--color-text-muted)', Icon: Bug },
    info: { bg: 'rgba(var(--color-info),0.12)', color: 'var(--color-info)', Icon: Info },
    warn: { bg: 'rgba(var(--color-warning),0.12)', color: 'var(--color-warning)', Icon: AlertTriangle },
    error: { bg: 'rgba(var(--color-error),0.08)', color: 'var(--color-error)', Icon: ShieldAlert },
    critical: { bg: 'rgba(var(--color-error),0.14)', color: 'var(--color-error)', Icon: Flame },
};

const SEVERITIES = ['debug', 'info', 'warn', 'error', 'critical'];

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [severityFilter, setSeverityFilter] = useState('all');

    useEffect(() => {
        setLogs([]);
        setLoading(false);
    }, []);

    const filtered = logs.filter(l => {
        const matchSearch = !search || l.actor_email?.toLowerCase().includes(search.toLowerCase()) || l.action?.toLowerCase().includes(search.toLowerCase());
        const matchSeverity = severityFilter === 'all' || l.severity === severityFilter;
        return matchSearch && matchSeverity;
    });

    const handleExport = () => {
        toast.success(`Exported ${filtered.length} audit log${filtered.length === 1 ? '' : 's'}`);
    };

    const counts = SEVERITIES.reduce((acc, s) => {
        acc[s] = logs.filter(l => l.severity === s).length;
        return acc;
    }, {});

    return (
        <div className="space-y-6 pb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-inter font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)' }}>Audit Logs</h1>
                    <p className="text-sm" style={{ color: 'var(--color-text-subtle)' }}>Complete audit trail of all platform actions</p>
                </div>
                <Button variant="outline" className="rounded-xl gap-2" style={{ borderColor: 'var(--color-border-strong)', color: 'var(--color-text)' }} onClick={handleExport}><Download className="h-4 w-4" /> Export Logs</Button>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {SEVERITIES.map(s => (
                    <div key={s} className="rounded-2xl p-5 shimmer card-lightning-subtle" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: SEVERITY_STYLES[s].bg }}>
                            {(() => { const Icon = SEVERITY_STYLES[s].Icon; return <Icon className="h-5 w-5" style={{ color: SEVERITY_STYLES[s].color }} />; })()}
                        </div>
                        <p className="font-black text-2xl mt-3" style={{ color: 'var(--color-primary)' }}>{counts[s]}</p>
                        <p className="text-[10px] mt-1 font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>{s}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by actor or action…" className="input-lightning pl-9" />
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="rounded-xl w-36" style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text)' }}><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Severity</SelectItem>
                        {SEVERITIES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton-wave h-12 rounded-xl" />)}</div>
            ) : (
                <div className="card-premium">
                    {filtered.length === 0 ? (
                        <div className="p-10 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>No audit logs found</div>
                    ) : (
                        <div className="space-y-2">
                            {filtered.map(log => {
                                const sev = SEVERITY_STYLES[log.severity] || SEVERITY_STYLES.info;
                                const SevIcon = sev.Icon;
                                return (
                                    <div key={log.id} className="hover-lift flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 transition-colors" style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: sev.bg, color: sev.color }}>
                                                <SevIcon className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-sans font-medium truncate" style={{ color: 'var(--color-text)' }}>{log.actor_email}</p>
                                                <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{log.action}</p>
                                                <p className="text-[10px] mt-0.5 font-mono" style={{ color: 'var(--color-text-subtle)' }}>{log.created_date?.slice(0, 19).replace('T', ' ')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>{log.resource_type} {log.resource_id ? `#${log.resource_id?.slice(0, 6)}` : ''}</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: sev.bg, color: sev.color }}>{log.severity}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
