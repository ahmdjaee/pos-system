import { FlashMessage } from '@/components/flash-message';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { ResponsiveDataList, ResponsiveDataListActions, ResponsiveDataListCell, ResponsiveDataListRow } from '@/components/responsive-data-list';
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
const categoryColumns = [{ label: 'Kategori' }, { label: 'Warna' }, { label: 'Produk' }, { label: 'Aksi', className: 'text-right' }];
const categoryDesktopColumns = 'minmax(220px,1.5fr) 130px 130px 96px';

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

                <ResponsiveDataList
                    columns={categoryColumns}
                    desktopColumns={categoryDesktopColumns}
                    isEmpty={categories.length === 0}
                    emptyMessage="Belum ada kategori."
                >
                    {categories.map((category) => (
                        <ResponsiveDataListRow key={category.id}>
                            <div className="flex items-start justify-between gap-3 md:contents">
                                <div className="flex min-w-0 items-center gap-2 md:px-4 md:py-3">
                                    <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                                    <p className="font-medium">{category.name}</p>
                                </div>
                                <Badge variant="outline" className="shrink-0 font-mono md:order-2 md:mx-4 md:w-fit">
                                    {category.color}
                                </Badge>
                            </div>

                            <ResponsiveDataListCell label="Produk" className="md:order-3">
                                {formatNumber(category.products_count)} produk
                            </ResponsiveDataListCell>

                            <ResponsiveDataListActions className="md:order-4">
                                <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(category)} aria-label="Edit kategori">
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
                            </ResponsiveDataListActions>
                        </ResponsiveDataListRow>
                    ))}
                </ResponsiveDataList>
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
