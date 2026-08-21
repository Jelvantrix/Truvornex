import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, UserCheck, ShieldCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';

const ROLE_STYLES = {
    admin: { bg: 'rgba(var(--color-warning),0.12)', color: 'var(--color-warning)' },
    provider: { bg: 'rgba(var(--color-info),0.12)', color: 'var(--color-info)' },
    user: { bg: 'rgba(var(--color-text-muted),0.12)', color: 'var(--color-text-muted)' },
};

export default function UsersAdmin() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setUsers([]);
        setLoading(false);
    }, []);

    const updateRole = async (id, role) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
        toast.success(`Role updated to ${role}`);
    };

    const filtered = users.filter(u => !search ||
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    const adminCount = users.filter(u => u.role === 'admin').length;
    const providerCount = users.filter(u => u.role === 'provider').length;
    const userCount = users.filter(u => u.role === 'user' || !u.role).length;

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }} />
        </div>
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h1 className="font-bold text-2xl" style={{ color: 'var(--color-primary)' }}>
                    Users <span className="font-normal text-lg" style={{ color: 'var(--color-text-muted)' }}>({users.length})</span>
                </h1>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                    <Input placeholder="Search users..." className="input-lightning pl-9 h-9 text-sm w-full" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="rounded-2xl p-5 shimmer card-lightning-subtle" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                        <Users className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <p className="font-black text-2xl mt-3" style={{ color: 'var(--color-primary)' }}>{users.length}</p>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>TOTAL USERS</p>
                </div>
                <div className="rounded-2xl p-5 shimmer card-lightning-subtle" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-warning),0.12)' }}>
                        <ShieldCheck className="h-5 w-5" style={{ color: 'var(--color-warning)' }} />
                    </div>
                    <p className="font-black text-2xl mt-3" style={{ color: 'var(--color-primary)' }}>{adminCount}</p>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>ADMINS</p>
                </div>
                <div className="rounded-2xl p-5 shimmer card-lightning-subtle" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-info),0.12)' }}>
                        <UserCheck className="h-5 w-5" style={{ color: 'var(--color-info)' }} />
                    </div>
                    <p className="font-black text-2xl mt-3" style={{ color: 'var(--color-primary)' }}>{providerCount}</p>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>PROVIDERS</p>
                </div>
                <div className="rounded-2xl p-5 shimmer card-lightning-subtle" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-text-muted),0.12)' }}>
                        <UserX className="h-5 w-5" style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                    <p className="font-black text-2xl mt-3" style={{ color: 'var(--color-primary)' }}>{userCount}</p>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>MEMBERS</p>
                </div>
            </div>

            {/* Users card list */}
            <div className="card-premium">
                <div className="space-y-2">
                    {filtered.map(u => {
                        const roleKey = u.role || 'user';
                        const roleStyle = ROLE_STYLES[roleKey] || ROLE_STYLES.user;
                        return (
                            <div key={u.id} className="hover-lift flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 transition-colors" style={{ backgroundColor: 'var(--color-surface-high)', border: '1px solid var(--color-border)' }}>
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-black" style={{ backgroundColor: 'rgba(var(--color-text-muted),0.12)', color: 'var(--color-text-muted)' }}>
                                        {u.full_name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{u.full_name || 'No name'}</p>
                                        <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{u.email}</p>
                                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{u.created_date ? new Date(u.created_date).toLocaleDateString() : '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: roleStyle.bg, color: roleStyle.color }}>{roleKey}</span>
                                    <Select value={roleKey} onValueChange={v => updateRole(u.id, v)}>
                                        <SelectTrigger className="w-24 h-7 text-xs shrink-0" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border-strong)', color: 'var(--color-text)' }}><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="provider">Provider</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {filtered.length === 0 && <p className="text-sm text-center py-10" style={{ color: 'var(--color-text-muted)' }}>No users found.</p>}
        </div>
    );
}
