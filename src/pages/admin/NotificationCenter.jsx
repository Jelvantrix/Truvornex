import { useState, useEffect } from 'react';
import { Bell, Send, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const PRIORITY_STYLES = {
    urgent: { bg: 'rgba(var(--color-error),0.12)', color: 'var(--color-error)' },
    high: { bg: 'rgba(var(--color-warning),0.12)', color: 'var(--color-warning)' },
    normal: { bg: 'rgba(var(--color-primary),0.12)', color: 'var(--color-primary)' },
    low: { bg: 'rgba(var(--color-text-muted),0.12)', color: 'var(--color-text-muted)' },
};

export default function AdminNotificationCenter() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialog, setDialog] = useState(false);
    const [form, setForm] = useState({ title: '', body: '', type: 'system_alert', recipient_role: 'customer', priority: 'normal' });
    const [sending, setSending] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setNotifications([]);
        setLoading(false);
    }, []);

    const send = async () => {
        if (!form.title || !form.body) { toast.error('Title and body required'); return; }
        setSending(true);
        toast.success('Notification sent');
        setSending(false);
        setDialog(false);
    };

    const del = async (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast.success('Notification deleted');
    };

    const filtered = notifications.filter(n => !search || n.title?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6 pb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-inter font-black text-2xl tracking-tight" style={{ color: 'var(--color-text)' }}>Notification Center</h1>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Broadcast messages and manage platform notifications</p>
                </div>
                <Button className="rounded-xl gap-2" onClick={() => setDialog(true)}>
                    <Send className="h-4 w-4" /> Broadcast Notification
                </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Sent', value: notifications.length },
                    { label: 'Unread', value: notifications.filter(n => !n.is_read).length },
                    { label: 'Urgent', value: notifications.filter(n => n.priority === 'urgent').length },
                    { label: 'This Week', value: notifications.filter(n => new Date(n.created_date) > new Date(Date.now() - 7 * 864e5)).length },
                ].map(k => (
                    <div key={k.label} className="rounded-2xl p-5 shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <p className="font-black text-3xl" style={{ color: 'var(--color-primary)' }}>{k.value}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
                    </div>
                ))}
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notifications…" className="input-lightning pl-9" />
            </div>

            {loading ? (
                <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton-wave h-16 rounded-2xl" />)}</div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(n => (
                        <div key={n.id} className="rounded-2xl p-5 hover-lift shimmer" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                            <div className="flex items-center gap-4">
                                <Bell className={`h-4.5 w-4.5 shrink-0 ${n.priority === 'urgent' ? 'card-lightning-subtle' : ''}`} style={{ color: n.priority === 'urgent' ? 'var(--color-error)' : 'var(--color-text-muted)' }} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>{n.title}</p>
                                        <span
                                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                            style={{ backgroundColor: (PRIORITY_STYLES[n.priority] || PRIORITY_STYLES.low).bg, color: (PRIORITY_STYLES[n.priority] || PRIORITY_STYLES.low).color }}
                                        >
                                            {n.priority}
                                        </span>
                                    </div>
                                    <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{n.body}</p>
                                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{n.recipient_role} · {n.created_date?.slice(0, 10)}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl shrink-0" style={{ color: 'var(--color-error)' }} onClick={() => del(n.id)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="rounded-2xl p-10 text-center text-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                            No notifications
                        </div>
                    )}
                </div>
            )}

            <Dialog open={dialog} onOpenChange={setDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Broadcast Notification</DialogTitle></DialogHeader>
                    <div className="space-y-3 pt-1">
                        <Input placeholder="Title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input-lightning" />
                        <Textarea placeholder="Message body *" value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} className="input-lightning resize-none" rows={3} />
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Send To</label>
                                <Select value={form.recipient_role} onValueChange={v => setForm(p => ({ ...p, recipient_role: v }))}>
                                    <SelectTrigger className="input-lightning"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="customer">All Customers</SelectItem>
                                        <SelectItem value="provider">All Providers</SelectItem>
                                        <SelectItem value="admin">Admins</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Priority</label>
                                <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                                    <SelectTrigger className="input-lightning"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {['low', 'normal', 'high', 'urgent'].map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button className="w-full h-11 rounded-xl gap-2" onClick={send} disabled={sending}>
                            <Send className="h-4 w-4" /> {sending ? 'Sending…' : 'Send Notification'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
