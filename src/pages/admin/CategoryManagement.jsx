import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, FolderTree, Tag, ArrowDownWideNarrow, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/api/supabaseClient';

const EMPTY = { name: '', slug: '', description: '', icon: 'wrench', is_active: true, sort_order: 0 };

export default function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialog, setDialog] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        const { data } = await supabase.from('service_categories').select('*').order('sort_order', { ascending: true });
        if (data) setCategories(data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const save = async () => {
        if (!form.name || !form.slug) { toast.error('Name and slug are required'); return; }
        setSaving(true);
        toast.success(editId ? 'Category updated' : 'Category created');
        setSaving(false);
        setDialog(false);
        setEditId(null);
        setForm(EMPTY);
        load();
    };

    const del = async (id) => {
        setCategories(prev => prev.filter(c => c.id !== id));
        toast.success('Category deleted');
    };

    const toggleActive = async (cat) => {
        setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, is_active: !c.is_active } : c));
    };

    const openEdit = (cat) => { setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', icon: cat.icon || 'wrench', is_active: cat.is_active, sort_order: cat.sort_order || 0 }); setEditId(cat.id); setDialog(true); };

    const activeCount = categories.filter(c => c.is_active).length;

    return (
        <div className="space-y-6 pb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="font-inter font-black text-2xl tracking-tight" style={{ color: 'var(--color-primary)' }}>Category Management</h1>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{categories.length} categories · {activeCount} active</p>
                </div>
                <Button className="rounded-xl gap-2" onClick={() => { setEditId(null); setForm(EMPTY); setDialog(true); }}>
                    <Plus className="h-4 w-4" /> Add Category
                </Button>
            </div>

            {!loading && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl p-5 shimmer hover-lift" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                            <FolderTree className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <p className="font-black text-2xl mt-3" style={{ color: 'var(--color-primary)' }}>{categories.length}</p>
                        <p className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Total Categories</p>
                    </div>
                    <div className="rounded-2xl p-5 shimmer hover-lift" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                            <Power className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <p className="font-black text-2xl mt-3" style={{ color: 'var(--color-primary)' }}>{activeCount}</p>
                        <p className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Active</p>
                    </div>
                    <div className="rounded-2xl p-5 shimmer hover-lift" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center card-lightning-subtle" style={{ backgroundColor: 'rgba(var(--color-primary),0.12)' }}>
                            <ArrowDownWideNarrow className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <p className="font-black text-2xl mt-3" style={{ color: 'var(--color-primary)' }}>{categories.length - activeCount}</p>
                        <p className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Inactive</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton-wave h-14 rounded-2xl" />)}</div>
            ) : (
                <div className="card-premium overflow-hidden">
                    <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                        {categories.map(cat => (
                            <div
                                key={cat.id}
                                className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3 transition-colors"
                                style={{ borderColor: 'var(--color-border)' }}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div
                                        className="h-8 w-8 rounded-lg flex items-center justify-center text-sm shrink-0 card-lightning-subtle"
                                        style={{ backgroundColor: 'rgba(var(--color-primary),0.12)', color: 'var(--color-primary)' }}
                                    >
                                        {cat.icon || '🔧'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold truncate" style={{ color: 'var(--color-text)' }}>{cat.name}</p>
                                        {cat.description && <p className="text-xs truncate max-w-[200px]" style={{ color: 'var(--color-text-muted)' }}>{cat.description}</p>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 sm:gap-6">
                                    <div className="flex items-center gap-1.5">
                                        <Tag className="h-3.5 w-3.5" style={{ color: 'var(--color-text-muted)' }} />
                                        <span className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{cat.slug}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <ArrowDownWideNarrow className="h-3.5 w-3.5" style={{ color: 'var(--color-text-muted)' }} />
                                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{cat.sort_order || 0}</span>
                                    </div>
                                    <Switch checked={!!cat.is_active} onCheckedChange={() => toggleActive(cat)} />
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => openEdit(cat)}><Pencil className="h-3.5 w-3.5" /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" style={{ color: 'rgb(var(--color-error))' }} onClick={() => del(cat.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Dialog open={dialog} onOpenChange={setDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>{editId ? 'Edit' : 'Add'} Category</DialogTitle></DialogHeader>
                    <div className="space-y-3 pt-1">
                        <Input placeholder="Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-lightning" />
                        <Input placeholder="Slug * (e.g. plumbing)" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} className="input-lightning font-mono" />
                        <Input placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input-lightning" />
                        <div className="grid grid-cols-2 gap-3">
                            <Input placeholder="Icon (emoji or name)" value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} className="input-lightning" />
                            <Input type="number" placeholder="Sort Order" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))} className="input-lightning" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Switch checked={form.is_active} onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))} />
                            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Active</span>
                        </div>
                        <Button className="w-full h-11 rounded-xl" onClick={save} disabled={saving}>{saving ? 'Saving…' : editId ? 'Update Category' : 'Create Category'}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
