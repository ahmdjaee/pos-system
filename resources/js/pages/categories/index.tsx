import { FlashMessage } from '@/components/flash-message';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { formatNumber } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { type CategoriesPageProps, type Category, type PagePropsWithErrors } from '@/types/pos';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Package, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Kategori', href: '/categories' }];

const emptyCategory = {
    name: '',
    color: '#0f766e',
};

export default function CategoriesIndex({ categories }: CategoriesPageProps) {
    const { errors } = usePage<PagePropsWithErrors>().props;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [form, setForm] = useState(emptyCategory);

    const openCreate = () => {
        setEditingCategory(null);
        setForm(emptyCategory);
        setDialogOpen(true);
    };

    const openEdit = (category: Category) => {
        setEditingCategory(category);
        setForm({
            name: category.name,
            color: category.color,
        });
        setDialogOpen(true);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (editingCategory) {
            router.put(`/categories/${editingCategory.id}`, form, { onSuccess: () => setDialogOpen(false) });
            return;
        }

        router.post('/categories', form, { onSuccess: () => setDialogOpen(false) });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kategori" />
            <PageHeader
                title="Kategori"
                description="Kelola kelompok menu yang dipakai di kasir dan form produk."
                actions={
                    <>
                        <Button asChild variant="outline">
                            <Link href="/products">
                                <Package className="size-4" />
                                Produk
                            </Link>
                        </Button>
                        <Button onClick={openCreate}>
                            <Plus className="size-4" />
                            Kategori
                        </Button>
                    </>
                }
            />

            <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
                <FlashMessage />

                <div className="bg-card overflow-hidden rounded-lg border">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-sm">
                            <thead className="bg-muted text-left">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Kategori</th>
                                    <th className="px-4 py-3 font-medium">Warna</th>
                                    <th className="px-4 py-3 font-medium">Produk</th>
                                    <th className="px-4 py-3 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {categories.map((category) => (
                                    <tr key={category.id}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="size-3 rounded-full" style={{ backgroundColor: category.color }} />
                                                <p className="font-medium">{category.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline" className="font-mono">
                                                {category.color}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">{formatNumber(category.products_count)} produk</td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEdit(category)}
                                                    aria-label="Edit kategori"
                                                >
                                                    <Edit className="size-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => router.delete(`/categories/${category.id}`)}
                                                    aria-label="Hapus kategori"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-muted-foreground px-4 py-8 text-center">
                                            Belum ada kategori.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Edit kategori' : 'Tambah kategori'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="category_name">Nama kategori</Label>
                            <Input id="category_name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                            <InputError message={errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category_color">Warna</Label>
                            <Input
                                id="category_color"
                                type="color"
                                value={form.color}
                                onChange={(event) => setForm({ ...form, color: event.target.value })}
                                className="h-10 p-1"
                            />
                            <InputError message={errors.color} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
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
