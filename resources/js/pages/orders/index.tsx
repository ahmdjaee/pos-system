import { FlashMessage } from '@/components/flash-message';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatNumber, orderTypeLabel, paymentLabel } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { type OrdersPageProps } from '@/types/pos';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Transaksi', href: '/orders' }];

export default function OrdersIndex({ date, orders, summary }: OrdersPageProps) {
    const [selectedDate, setSelectedDate] = useState(date);

    const filter = (event: FormEvent) => {
        event.preventDefault();
        router.get('/orders', { date: selectedDate }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaksi" />
            <PageHeader
                title="Riwayat Transaksi"
                description="Cari transaksi harian, cek invoice, dan buka detail struk."
                actions={
                    <form onSubmit={filter} className="flex items-center gap-2">
                        <Input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
                        <Button type="submit" variant="secondary">
                            <Search className="size-4" />
                            Filter
                        </Button>
                    </form>
                }
            />

            <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
                <FlashMessage />
                <div className="grid gap-4 sm:grid-cols-3">
                    <SummaryBox label="Total penjualan" value={formatCurrency(summary.total_sales)} />
                    <SummaryBox label="Transaksi" value={formatNumber(summary.total_orders)} />
                    <SummaryBox label="Item terjual" value={formatNumber(summary.total_items)} />
                </div>

                <div className="bg-card overflow-hidden rounded-lg border">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-sm">
                            <thead className="bg-muted text-left">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Invoice</th>
                                    <th className="px-4 py-3 font-medium">Pelanggan</th>
                                    <th className="px-4 py-3 font-medium">Tipe</th>
                                    <th className="px-4 py-3 font-medium">Kasir</th>
                                    <th className="px-4 py-3 font-medium">Pembayaran</th>
                                    <th className="px-4 py-3 text-right font-medium">Total</th>
                                    <th className="px-4 py-3 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{order.invoice_number}</p>
                                            <p className="text-muted-foreground text-xs">{order.paid_at}</p>
                                        </td>
                                        <td className="px-4 py-3">{order.customer_name || order.table_name || 'Pelanggan umum'}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline">{orderTypeLabel(order.order_type)}</Badge>
                                        </td>
                                        <td className="px-4 py-3">{order.cashier_name}</td>
                                        <td className="px-4 py-3">{paymentLabel(order.payment_method)}</td>
                                        <td className="px-4 py-3 text-right font-semibold">{formatCurrency(order.total)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Button asChild variant="ghost" size="icon" aria-label="Lihat invoice">
                                                <Link href={`/orders/${order.id}`}>
                                                    <Eye className="size-4" />
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-muted-foreground px-4 py-8 text-center">
                                            Belum ada transaksi di tanggal ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-card rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="mt-2 text-xl font-semibold">{value}</p>
        </div>
    );
}
