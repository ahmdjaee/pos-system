import { CurrencyInput } from '@/components/currency-input';
import { FlashMessage } from '@/components/flash-message';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { ResponsiveDataList, ResponsiveDataListActions, ResponsiveDataListCell, ResponsiveDataListRow } from '@/components/responsive-data-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { type PagePropsWithErrors, type Product, type ProductsPageProps } from '@/types/pos';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Plus, Tags, Trash2 } from 'lucide-react';
import { FormEvent, ReactNode, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Produk', href: '/products' }];
const productColumns = [
    { label: 'Produk' },
    { label: 'Kategori' },
    { label: 'Harga' },
    { label: 'Stok' },
    { label: 'Status' },
    { label: 'Aksi', className: 'text-right' },
];
const productDesktopColumns = 'minmax(200px,1.4fr) minmax(120px,1fr) 120px 130px 110px 96px';

const emptyProduct = {
    category_id: '',
    name: '',
    sku: '',
    description: '',
    price: 0,
    cost: 0,
    stock: 0,
    low_stock_threshold: 5,
    track_stock: true,
    is_available: true,
};

export default function ProductsIndex({ categories, products }: ProductsPageProps) {
    const { errors } = usePage<PagePropsWithErrors>().props;
    const [productDialogOpen, setProductDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productForm, setProductForm] = useState(emptyProduct);

    const openCreateProduct = () => {
        setEditingProduct(null);
        setProductForm({ ...emptyProduct, category_id: categories[0] ? String(categories[0].id) : '' });
        setProductDialogOpen(true);
    };

    const openEditProduct = (product: Product) => {
        setEditingProduct(product);
        setProductForm({
            category_id: String(product.category_id),
            name: product.name,
            sku: product.sku,
            description: product.description ?? '',
            price: Number(product.price),
            cost: Number(product.cost),
            stock: product.stock,
            low_stock_threshold: product.low_stock_threshold,
            track_stock: product.track_stock,
            is_available: product.is_available,
        });
        setProductDialogOpen(true);
    };

    const submitProduct = (event: FormEvent) => {
        event.preventDefault();
        const payload = { ...productForm, category_id: Number(productForm.category_id) };

        if (editingProduct) {
            router.put(`/products/${editingProduct.id}`, payload, { onSuccess: () => setProductDialogOpen(false) });
            return;
        }

        router.post('/products', payload, { onSuccess: () => setProductDialogOpen(false) });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Produk" />
            <PageHeader
                title="Produk"
                description="Kelola menu, harga, status jual, dan stok produk restoran."
                actions={
                    <>
                        <Button asChild variant="outline">
                            <Link href="/categories">
                                <Tags className="size-4" />
                                Kategori
                            </Link>
                        </Button>
                        <Button onClick={openCreateProduct} disabled={categories.length === 0}>
                            <Plus className="size-4" />
                            Produk
                        </Button>
                    </>
                }
            />

            <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
                <FlashMessage />

                {categories.length === 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                        Buat kategori terlebih dahulu sebelum menambahkan produk.
                    </div>
                )}

                <ResponsiveDataList
                    columns={productColumns}
                    desktopColumns={productDesktopColumns}
                    isEmpty={products.length === 0}
                    emptyMessage="Belum ada produk."
                >
                    {products.map((product) => (
                        <ResponsiveDataListRow key={product.id}>
                            <div className="flex items-start justify-between gap-3 md:contents">
                                <div className="min-w-0 md:px-4 md:py-3">
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-muted-foreground mt-1 text-xs md:mt-0">{product.sku}</p>
                                </div>
                                <Badge variant={product.is_available ? 'secondary' : 'outline'} className="shrink-0 md:order-5 md:mx-4 md:w-fit">
                                    {product.is_available ? 'Aktif' : 'Nonaktif'}
                                </Badge>
                            </div>

                            <ResponsiveDataListCell label="Kategori">{product.category?.name ?? '-'}</ResponsiveDataListCell>
                            <ResponsiveDataListCell label="Harga">{formatCurrency(product.price)}</ResponsiveDataListCell>
                            <ResponsiveDataListCell label="Stok">
                                {product.track_stock ? `${product.stock} item` : 'Tidak dilacak'}
                            </ResponsiveDataListCell>

                            <ResponsiveDataListActions className="md:order-6">
                                <Button type="button" variant="ghost" size="icon" onClick={() => openEditProduct(product)} aria-label="Edit produk">
                                    <Edit className="size-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.delete(`/products/${product.id}`)}
                                    aria-label="Hapus produk"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </ResponsiveDataListActions>
                        </ResponsiveDataListRow>
                    ))}
                </ResponsiveDataList>
            </div>

            <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Edit produk' : 'Tambah produk'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitProduct} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label>Kategori</Label>
                            <Select value={productForm.category_id} onValueChange={(value) => setProductForm({ ...productForm, category_id: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={String(category.id)}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.category_id} />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Nama produk" error={errors.name}>
                                <Input value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} />
                            </Field>
                            <Field label="SKU" error={errors.sku}>
                                <Input value={productForm.sku} onChange={(event) => setProductForm({ ...productForm, sku: event.target.value })} />
                            </Field>
                            <Field label="Harga jual" error={errors.price}>
                                <CurrencyInput value={productForm.price} onValueChange={(price) => setProductForm({ ...productForm, price })} />
                            </Field>
                            <Field label="Modal" error={errors.cost}>
                                <CurrencyInput value={productForm.cost} onValueChange={(cost) => setProductForm({ ...productForm, cost })} />
                            </Field>
                            <Field label="Stok" error={errors.stock}>
                                <Input
                                    type="number"
                                    min="0"
                                    value={productForm.stock}
                                    onChange={(event) => setProductForm({ ...productForm, stock: Number(event.target.value) })}
                                />
                            </Field>
                            <Field label="Batas stok rendah" error={errors.low_stock_threshold}>
                                <Input
                                    type="number"
                                    min="0"
                                    value={productForm.low_stock_threshold}
                                    onChange={(event) => setProductForm({ ...productForm, low_stock_threshold: Number(event.target.value) })}
                                />
                            </Field>
                        </div>
                        <div className="grid gap-2">
                            <Label>Deskripsi</Label>
                            <textarea
                                value={productForm.description}
                                onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                                className="border-input bg-background focus-visible:ring-ring min-h-20 rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-hidden"
                            />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="flex items-center gap-3 rounded-md border p-3 text-sm">
                                <Checkbox
                                    checked={productForm.track_stock}
                                    onCheckedChange={(checked) => setProductForm({ ...productForm, track_stock: checked === true })}
                                />
                                Lacak stok
                            </label>
                            <label className="flex items-center gap-3 rounded-md border p-3 text-sm">
                                <Checkbox
                                    checked={productForm.is_available}
                                    onCheckedChange={(checked) => setProductForm({ ...productForm, is_available: checked === true })}
                                />
                                Tersedia di kasir
                            </label>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setProductDialogOpen(false)}>
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

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}
