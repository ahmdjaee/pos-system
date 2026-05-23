import { FlashMessage } from '@/components/flash-message';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { tableStatusLabel } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { type DiningTable, type PagePropsWithErrors, type TablesPageProps } from '@/types/pos';
import { Head, router, usePage } from '@inertiajs/react';
import { Edit, Plus, Trash2, Users } from 'lucide-react';
import { FormEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Meja', href: '/tables' }];

const emptyForm = {
    name: '',
    capacity: 2,
    status: 'available',
};

export default function TablesIndex({ tables, statuses }: TablesPageProps) {
    const { errors } = usePage<PagePropsWithErrors>().props;
    const [open, setOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<DiningTable | null>(null);
    const [form, setForm] = useState(emptyForm);

    const openCreate = () => {
        setEditingTable(null);
        setForm(emptyForm);
        setOpen(true);
    };

    const openEdit = (table: DiningTable) => {
        setEditingTable(table);
        setForm({
            name: table.name,
            capacity: table.capacity,
            status: table.status,
        });
        setOpen(true);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (editingTable) {
            router.put(`/tables/${editingTable.id}`, form, { onSuccess: () => setOpen(false) });
            return;
        }

        router.post('/tables', form, { onSuccess: () => setOpen(false) });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Meja" />
            <PageHeader
                title="Meja Restoran"
                description="Atur kapasitas dan status meja untuk layanan makan di tempat."
                actions={
                    <Button onClick={openCreate}>
                        <Plus className="size-4" />
                        Meja
                    </Button>
                }
            />

            <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
                <FlashMessage />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {tables.map((table) => (
                        <div key={table.id} className="bg-card rounded-lg border p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold">{table.name}</h2>
                                    <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                                        <Users className="size-4" />
                                        {table.capacity} kursi
                                    </p>
                                </div>
                                <StatusBadge status={table.status} />
                            </div>
                            <div className="mt-5 flex justify-end gap-1">
                                <Button type="button" variant="outline" size="icon" onClick={() => openEdit(table)} aria-label="Edit meja">
                                    <Edit className="size-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => router.delete(`/tables/${table.id}`)}
                                    aria-label="Hapus meja"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {tables.length === 0 && <div className="text-muted-foreground rounded-lg border p-6 text-sm">Belum ada meja.</div>}
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTable ? 'Edit meja' : 'Tambah meja'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama meja</Label>
                            <Input id="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                            <InputError message={errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="capacity">Kapasitas</Label>
                            <Input
                                id="capacity"
                                type="number"
                                min="1"
                                value={form.capacity}
                                onChange={(event) => setForm({ ...form, capacity: Number(event.target.value) })}
                            />
                            <InputError message={errors.capacity} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select value={form.status} onValueChange={(status) => setForm({ ...form, status })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {tableStatusLabel(status)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">Simpan</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function StatusBadge({ status }: { status: string }) {
    const className =
        status === 'available'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
            : status === 'occupied'
              ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300'
              : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300';

    return (
        <Badge variant="outline" className={className}>
            {tableStatusLabel(status)}
        </Badge>
    );
}
