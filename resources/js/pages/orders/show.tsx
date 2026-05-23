import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, orderTypeLabel, paymentLabel } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { type OrderShowPageProps } from '@/types/pos';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';

export default function OrderShow({ order }: OrderShowPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Transaksi', href: '/orders' },
        { title: order.invoice_number, href: `/orders/${order.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={order.invoice_number} />
            <PageHeader
                title={order.invoice_number}
                description="Detail invoice dan struk pembayaran."
                actions={
                    <>
                        <Button asChild variant="outline">
                            <Link href="/orders">
                                <ArrowLeft className="size-4" />
                                Kembali
                            </Link>
                        </Button>
                        <Button type="button" onClick={() => window.print()}>
                            <Printer className="size-4" />
                            Cetak
                        </Button>
                    </>
                }
            />

            <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
                <section className="bg-card rounded-lg border p-5 print:border-0 print:shadow-none">
                    <div className="border-b pb-4 text-center">
                        <h2 className="text-xl font-semibold">Restoran UMKM</h2>
                        <p className="text-muted-foreground text-sm">Struk pembayaran</p>
                    </div>

                    <div className="grid gap-2 border-b py-4 text-sm sm:grid-cols-2">
                        <Info label="Invoice" value={order.invoice_number} />
                        <Info label="Tanggal" value={order.paid_at ?? '-'} />
                        <Info label="Pelanggan" value={order.customer_name || order.table_name || 'Pelanggan umum'} />
                        <Info label="Kasir" value={order.cashier_name ?? '-'} />
                        <Info label="Tipe" value={orderTypeLabel(order.order_type)} />
                        <Info label="Pembayaran" value={paymentLabel(order.payment_method)} />
                    </div>

                    <div className="divide-y">
                        {order.items.map((item) => (
                            <div key={item.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto]">
                                <div>
                                    <p className="font-medium">{item.product_name}</p>
                                    <p className="text-muted-foreground text-sm">
                                        {item.quantity} x {formatCurrency(item.unit_price)}
                                    </p>
                                    {item.notes && <p className="text-muted-foreground text-xs">Catatan: {item.notes}</p>}
                                </div>
                                <p className="font-semibold sm:text-right">{formatCurrency(item.subtotal)}</p>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2 border-t pt-4 text-sm">
                        <PriceRow label="Subtotal" value={order.subtotal} />
                        <PriceRow label="Pajak" value={order.tax} />
                        <PriceRow label="Diskon" value={order.discount} />
                        <PriceRow label="Bayar" value={order.paid_amount} />
                        <PriceRow label="Kembalian" value={order.change_amount} />
                        <div className="flex justify-between border-t pt-3 text-lg font-semibold">
                            <span>Total</span>
                            <span>{formatCurrency(order.total)}</span>
                        </div>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    );
}

function PriceRow({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span>{formatCurrency(value)}</span>
        </div>
    );
}
