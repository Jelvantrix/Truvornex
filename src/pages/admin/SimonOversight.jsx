import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Activity, Shield, AlertTriangle, CheckCircle, XCircle, RotateCcw, Loader2, TrendingUp, Database, Zap, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function SimonOversight() {
    const [snapshot, setSnapshot] = useState(null);
    const [anomalies, setAnomalies] = useState([]);
    const [actions, setActions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAction, setSelectedAction] = useState(null);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const [snapshotRes, anomaliesRes, actionsRes, statsRes] = await Promise.all([
                fetch('/api/admin/simon/snapshot'),
                fetch('/api/admin/simon/anomalies'),
                fetch('/api/admin/simon/actions'),
                fetch('/api/admin/simon/stats')
            ]);

            const [snapshotData, anomaliesData, actionsData, statsData] = await Promise.all([
                snapshotRes.json(),
                anomaliesRes.json(),
                actionsRes.json(),
                statsRes.json()
            ]);

            setSnapshot(snapshotData);
            setAnomalies(anomaliesData.anomalies || []);
            setActions(actionsData.actions || []);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load Simon data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (actionId, execute = false) => {
        try {
            const response = await fetch(`/api/admin/simon/actions/${actionId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ execute })
            });
            const data = await response.json();
            if (data.success) {
                toast.success(`Action approved${execute ? ' and executed' : ''}`);
                loadData();
            }
        } catch (error) {
            toast.error('Failed to approve action');
        }
    };

    const handleReject = async (actionId) => {
        try {
            const response = await fetch(`/api/admin/simon/actions/${actionId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: 'Admin rejected' })
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Action rejected');
                loadData();
            }
        } catch (error) {
            toast.error('Failed to reject action');
        }
    };

    const handleReverse = async (actionId) => {
        try {
            const response = await fetch(`/api/admin/simon/actions/${actionId}/reverse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: 'Admin reversed' })
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Action reversed');
                loadData();
            }
        } catch (error) {
            toast.error('Failed to reverse action');
        }
    };

    const getActionIcon = (actionType) => {
        switch (actionType) {
            case 'wallet_freeze': return Shield;
            case 'wallet_unfreeze': return Shield;
            case 'dispute_escalate': return AlertTriangle;
            case 'booking_reroute': return Activity;
            case 'warning_send': return AlertTriangle;
            case 'anomaly_flag': return AlertTriangle;
            case 'recommendation': return Brain;
            default: return Activity;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending_approval': return <Badge variant="warning">Pending Approval</Badge>;
            case 'approved': return <Badge variant="success">Approved</Badge>;
            case 'rejected': return <Badge variant="error">Rejected</Badge>;
            case 'executed': return <Badge variant="success">Executed</Badge>;
            case 'reversed': return <Badge variant="error">Reversed</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-bold text-2xl tracking-tight" style={{ color: 'var(--color-text)' }}>Simon Oversight</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Monitor and control Simon's autonomous actions</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={loadData} size="sm" variant="outline">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* System Snapshot */}
            {snapshot && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                            <Activity className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <p className="font-black text-2xl" style={{ color: 'var(--color-primary)' }}>{snapshot.users?.total || 0}</p>
                        <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{snapshot.users?.active || 0} active now</p>
                    </div>
                    <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                            <Clock className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <p className="font-black text-2xl" style={{ color: 'var(--color-primary)' }}>{snapshot.bookings?.active || 0}</p>
                        <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{snapshot.bookings?.today || 0} today</p>
                    </div>
                    <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                            <Database className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <p className="font-black text-2xl" style={{ color: 'var(--color-primary)' }}>PKR {(snapshot.financial?.total_balance || 0).toLocaleString()}</p>
                        <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{snapshot.financial?.frozen_wallets || 0} frozen wallets</p>
                    </div>
                    <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                            <AlertTriangle className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <p className="font-black text-2xl" style={{ color: 'var(--color-primary)' }}>{snapshot.disputes?.pending || 0}</p>
                        <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{snapshot.disputes?.total || 0} total</p>
                    </div>
                </div>
            )}

            {/* Anomalies */}
            {anomalies.length > 0 && (
                <div className="card-premium hover-lift">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5" style={{ color: 'var(--color-warning)' }} />
                        <h2 className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>Active Anomalies</h2>
                    </div>
                    <div className="space-y-3">
                        {anomalies.map((anomaly, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                                <AlertTriangle
                                    className="h-5 w-5 mt-0.5"
                                    style={{ color: anomaly.severity === 'high' ? 'var(--color-error)' : 'var(--color-warning)' }}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant={anomaly.severity === 'high' ? 'error' : 'warning'}>
                                            {anomaly.severity}
                                        </Badge>
                                        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{anomaly.type}</span>
                                    </div>
                                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{anomaly.description}</p>
                                    <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Confidence: {(anomaly.confidence * 100).toFixed(0)}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Model Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                            <Brain className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <p className="font-black text-2xl" style={{ color: 'var(--color-primary)' }}>{stats.model_usage?.totalCalls || 0}</p>
                        <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{stats.model_usage?.successRate || '0%'} success</p>
                    </div>
                    <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                            <Database className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <p className="font-black text-2xl" style={{ color: 'var(--color-primary)' }}>{stats.actions?.total_actions || 0}</p>
                        <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{stats.actions?.pending || 0} pending</p>
                    </div>
                    <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                            <Zap className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <p className="font-black text-2xl" style={{ color: 'var(--color-primary)' }}>{stats.actions?.avg_confidence ? (stats.actions.avg_confidence * 100).toFixed(0) + '%' : 'N/A'}</p>
                        <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{stats.actions?.executed || 0} executed</p>
                    </div>
                    <div className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                            <TrendingUp className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <p className="font-black text-2xl" style={{ color: 'var(--color-primary)' }}>{stats.model_usage?.cacheHitRate || '0%'}</p>
                        <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{stats.model_usage?.uptime || '0m'} uptime</p>
                    </div>
                </div>
            )}

            {/* Recent Actions */}
            <div className="card-premium">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                    <div>
                        <h2 className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>Recent Simon Actions</h2>
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Review and manage autonomous actions proposed by Simon</p>
                    </div>
                </div>
                <div className="space-y-3">
                    {actions.length === 0 ? (
                        <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                            No recent actions from Simon
                        </div>
                    ) : (
                        actions.map((action) => {
                            const ActionIcon = getActionIcon(action.action_type);
                            return (
                                <div key={action.id} className="p-4 rounded-xl border card-lightning-subtle" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle shrink-0" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                                                <ActionIcon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className="font-medium capitalize" style={{ color: 'var(--color-text)' }}>{action.action_type.replace(/_/g, ' ')}</span>
                                                    {getStatusBadge(action.status)}
                                                </div>
                                                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{action.reasoning}</p>
                                                {action.action_data && (
                                                    <div className="mt-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-surface-high)' }}>
                                                        <pre className="text-xs overflow-auto" style={{ color: 'var(--color-text)' }}>{JSON.stringify(action.action_data, null, 2)}</pre>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(action.created_at).toLocaleString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Brain className="h-3 w-3" />
                                                        Confidence: {(action.confidence_score * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {(action.status === 'pending_approval' || action.status === 'executed') && (
                                            <div className="flex gap-2 flex-wrap shrink-0">
                                                {action.status === 'pending_approval' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleApprove(action.id, false)}
                                                            style={{ backgroundColor: 'var(--color-success)' }}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleApprove(action.id, true)}
                                                            style={{ backgroundColor: 'var(--color-primary)' }}
                                                        >
                                                            <Zap className="h-4 w-4 mr-1" />
                                                            Approve & Execute
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleReject(action.id)}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                                {action.status === 'executed' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleReverse(action.id)}
                                                    >
                                                        <RotateCcw className="h-4 w-4 mr-1" />
                                                        Reverse
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
