import { CurrencyInput } from '@/components/currency-input';
import { FlashMessage } from '@/components/flash-message';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, orderTypeLabel, paymentLabel, tableStatusLabel } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { type CartLine, type PagePropsWithErrors, type PosPageProps, type Product } from '@/types/pos';
import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Minus, Plus, ReceiptText, Search, Trash2 } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Kasir', href: '/pos' }];

export default function PosIndex({ categories, tables, taxRate }: PosPageProps) {
    const { errors } = usePage<PagePropsWithErrors>().props;
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<CartLine[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [orderType, setOrderType] = useState('dine_in');
    const [tableId, setTableId] = useState('');
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paidAmount, setPaidAmount] = useState(0);
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const products = useMemo(() => categories.flatMap((category) => category.products), [categories]);
    const selectedTable = tables.find((table) => String(table.id) === tableId);
    const filteredProducts = products.filter((product) => {
        const matchCategory = selectedCategory === 'all' || String(product.category_id) === selectedCategory;
        const matchSearch = `${product.name} ${product.sku}`.toLowerCase().includes(search.toLowerCase());

        return matchCategory && matchSearch;
    });

    const subtotal = cart.reduce((total, item) => total + Number(item.product.price) * item.quantity, 0);
    const tax = Math.round(subtotal * taxRate);
    const total = Math.max(0, subtotal + tax - Number(discount || 0));
    const change = Math.max(0, Number(paidAmount || 0) - total);

    const addToCart = (product: Product) => {
        setCart((current) => {
            const existing = current.find((item) => item.product.id === product.id);

            if (existing) {
                return current.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
            }

            return [...current, { product, quantity: 1, notes: '' }];
        });
    };

    const updateQuantity = (productId: number, quantity: number) => {
        if (quantity < 1) {
            setCart((current) => current.filter((item) => item.product.id !== productId));
            return;
        }

        setCart((current) => current.map((item) => (item.product.id === productId ? { ...item, quantity } : item)));
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (cart.length === 0 || processing) {
            return;
        }

        setConfirmOpen(true);
    };

    const checkout = () => {
        setProcessing(true);
        setConfirmOpen(false);

        router.post(
            '/pos/checkout',
            {
                items: cart.map((item) => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    notes: item.notes,
                })),
                customer_name: customerName,
                order_type: orderType,
                dining_table_id: tableId || null,
                discount,
                payment_method: paymentMethod,
                paid_amount: paidAmount,
                notes,
            },
            {
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kasir" />
            <PageHeader title="Kasir" description="Pilih menu, hitung pembayaran, dan simpan transaksi restoran." />

            <form onSubmit={submit} className="grid flex-1 gap-6 p-4 pb-[31rem] md:pb-[25rem] lg:grid-cols-[1fr_420px] lg:p-6 lg:pb-72">
                <div className="flex min-w-0 flex-col gap-4">
                    <FlashMessage />
                    <div className="flex flex-col gap-3">
                        <div className="relative flex-1">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Cari menu atau SKU"
                                className="pl-9"
                            />
                        </div>
                        <div className="scrollbar-hide flex gap-2 overflow-x-auto border-b pb-2">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('all')}
                                className={`h-10 shrink-0 rounded-md px-4 text-sm font-medium transition ${
                                    selectedCategory === 'all'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Semua
                            </button>
                            {categories.map((category) => (
                                <button
                                    type="button"
                                    key={category.id}
                                    onClick={() => setSelectedCategory(String(category.id))}
                                    className={`flex h-10 shrink-0 items-center gap-2 rounded-md px-4 text-sm font-medium transition ${
                                        selectedCategory === String(category.id)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    <span className="size-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredProducts.map((product) => (
                            <button
                                type="button"
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="bg-card rounded-lg border p-4 text-left transition hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-teal-950/20"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-muted-foreground mt-1 text-xs">{product.sku}</p>
                                    </div>
                                    <Plus className="size-4 shrink-0 text-teal-700" />
                                </div>
                                <p className="mt-4 text-lg font-semibold">{formatCurrency(product.price)}</p>
                                <div className="mt-3 flex items-center gap-2">
                                    {product.track_stock ? (
                                        <Badge variant="outline">Stok {product.stock}</Badge>
                                    ) : (
                                        <Badge variant="secondary">Tanpa stok</Badge>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="text-muted-foreground rounded-lg border p-6 text-sm">Menu tidak ditemukan.</div>
                    )}
                </div>

                <aside className="bg-card h-fit rounded-lg border lg:sticky lg:top-20">
                    <div className="flex items-center gap-2 border-b p-4">
                        <ReceiptText className="size-5" />
                        <h2 className="font-semibold">Rincian Pesanan</h2>
                        <Badge variant="secondary" className="ml-auto">
                            {cart.length} item
                        </Badge>
                    </div>

                    <div className="space-y-4 p-4">
                        <InputError message={errors.items} />

                        <div className="space-y-3">
                            {cart.length === 0 && (
                                <p className="text-muted-foreground rounded-md border border-dashed p-4 text-sm">Keranjang masih kosong.</p>
                            )}
                            {cart.map((item) => (
                                <div key={item.product.id} className="rounded-md border p-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-medium">{item.product.name}</p>
                                            <p className="text-muted-foreground text-sm">{formatCurrency(item.product.price)}</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => updateQuantity(item.product.id, 0)}
                                            aria-label="Hapus item"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                aria-label="Kurangi"
                                            >
                                                <Minus className="size-4" />
                                            </Button>
                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                aria-label="Tambah"
                                            >
                                                <Plus className="size-4" />
                                            </Button>
                                        </div>
                                        <p className="font-semibold">{formatCurrency(Number(item.product.price) * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                <div className="bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t-4 border-blue-600 shadow-[0_-14px_36px_rgba(15,23,42,0.12)] backdrop-blur md:right-2 md:bottom-2 md:left-[var(--sidebar-width)] md:rounded-b-xl group-has-data-[collapsible=icon]/sidebar-wrapper:md:left-[calc(var(--sidebar-width-icon)+(--spacing(4))+(--spacing(2)))]">
                    <div className="mx-auto grid max-h-[72svh] w-full gap-4 overflow-y-auto p-4 lg:grid-cols-[1fr_360px] lg:p-5">
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <div className="grid gap-2">
                                <Label htmlFor="customer_name">Nama pelanggan</Label>
                                <Input
                                    id="customer_name"
                                    value={customerName}
                                    onChange={(event) => setCustomerName(event.target.value)}
                                    placeholder="Opsional"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Tipe order</Label>
                                <Select value={orderType} onValueChange={setOrderType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="dine_in">Makan di tempat</SelectItem>
                                        <SelectItem value="takeaway">Bungkus</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Meja</Label>
                                <Select
                                    value={tableId || 'none'}
                                    onValueChange={(value) => setTableId(value === 'none' ? '' : value)}
                                    disabled={orderType !== 'dine_in'}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih meja" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Tanpa meja</SelectItem>
                                        {tables.map((table) => (
                                            <SelectItem key={table.id} value={String(table.id)}>
                                                {table.name} · {tableStatusLabel(table.status)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Metode bayar</Label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Tunai</SelectItem>
                                        <SelectItem value="debit">Debit</SelectItem>
                                        <SelectItem value="qris">QRIS</SelectItem>
                                        <SelectItem value="transfer">Transfer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="discount">Diskon</Label>
                                <CurrencyInput id="discount" value={discount} onValueChange={setDiscount} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="paid_amount">Nominal bayar</Label>
                                <CurrencyInput id="paid_amount" value={paidAmount} onValueChange={setPaidAmount} />
                                <InputError message={errors.paid_amount} />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="notes">Catatan</Label>
                                <Input id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Opsional" />
                            </div>
                        </div>

                        <div className="grid gap-3 rounded-lg border border-blue-200 bg-white p-4 shadow-sm dark:border-blue-900 dark:bg-slate-950">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                <PriceRow label="Subtotal" value={subtotal} />
                                <PriceRow label="Pajak 10%" value={tax} />
                                <PriceRow label="Diskon" value={Number(discount || 0)} />
                                <PriceRow label="Kembalian" value={change} />
                            </div>
                            <div className="flex items-center justify-between border-t pt-3">
                                <div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">Total tagihan</p>
                                    <p className="text-2xl font-semibold">{formatCurrency(total)}</p>
                                </div>
                                <Button type="submit" size="lg" disabled={processing || cart.length === 0}>
                                    <CheckCircle2 className="size-4" />
                                    Simpan
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Simpan transaksi?</DialogTitle>
                            <DialogDescription>Pastikan pesanan, pembayaran, dan kembalian sudah benar sebelum transaksi disimpan.</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4">
                            <div className="rounded-lg border">
                                <div className="grid gap-2 p-4 text-sm">
                                    <ConfirmRow label="Item" value={`${cart.reduce((sum, item) => sum + item.quantity, 0)} item`} />
                                    <ConfirmRow label="Tipe order" value={orderTypeLabel(orderType)} />
                                    <ConfirmRow label="Meja" value={orderType === 'dine_in' ? selectedTable?.name || 'Tanpa meja' : '-'} />
                                    <ConfirmRow label="Pembayaran" value={paymentLabel(paymentMethod)} />
                                </div>
                                <div className="bg-muted grid gap-2 border-t p-4 text-sm">
                                    <ConfirmRow label="Subtotal" value={formatCurrency(subtotal)} />
                                    <ConfirmRow label="Pajak 10%" value={formatCurrency(tax)} />
                                    <ConfirmRow label="Diskon" value={formatCurrency(Number(discount || 0))} />
                                    <ConfirmRow label="Bayar" value={formatCurrency(paidAmount)} />
                                    <ConfirmRow label="Kembalian" value={formatCurrency(change)} />
                                    <div className="flex items-center justify-between border-t pt-3 font-semibold">
                                        <span>Total</span>
                                        <span>{formatCurrency(total)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)} disabled={processing}>
                                    Batal
                                </Button>
                                <Button type="button" onClick={checkout} disabled={processing}>
                                    <CheckCircle2 className="size-4" />
                                    Ya, simpan
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </form>
        </AppLayout>
    );
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium">{value}</span>
        </div>
    );
}

function PriceRow({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span>{formatCurrency(value)}</span>
        </div>
    );
}
