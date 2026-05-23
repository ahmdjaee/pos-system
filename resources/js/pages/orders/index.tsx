import { FlashMessage } from '@/components/flash-message';
import { PageHeader } from '@/components/page-header';
import { ResponsiveDataList, ResponsiveDataListActions, ResponsiveDataListCell, ResponsiveDataListRow } from '@/components/responsive-data-list';
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
const orderColumns = [
    { label: 'Invoice' },
    { label: 'Pelanggan' },
    { label: 'Tipe' },
    { label: 'Kasir' },
    { label: 'Pembayaran' },
    { label: 'Total', className: 'text-right' },
    { label: 'Aksi', className: 'text-right' },
];
const orderDesktopColumns = 'minmax(180px,1.3fr) minmax(150px,1fr) 120px 120px 120px 130px 72px';

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
                    <form onSubmit={filter} className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:items-center">
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

                <ResponsiveDataList
                    columns={orderColumns}
                    desktopColumns={orderDesktopColumns}
                    isEmpty={orders.length === 0}
                    emptyMessage="Belum ada transaksi di tanggal ini."
                >
                    {orders.map((order) => (
                        <ResponsiveDataListRow key={order.id}>
                            <div className="flex items-start justify-between gap-3 md:contents">
                                <div className="min-w-0 md:px-4 md:py-3">
                                    <p className="font-medium">{order.invoice_number}</p>
                                    <p className="text-muted-foreground mt-1 text-xs md:mt-0">{order.paid_at}</p>
                                </div>
                                <Badge variant="outline" className="shrink-0 md:order-3 md:mx-4 md:w-fit">
                                    {orderTypeLabel(order.order_type)}
                                </Badge>
                            </div>

                            <ResponsiveDataListCell label="Pelanggan" className="md:order-2">
                                {order.customer_name || order.table_name || 'Pelanggan umum'}
                            </ResponsiveDataListCell>
                            <ResponsiveDataListCell label="Kasir" className="md:order-4">
                                {order.cashier_name ?? '-'}
                            </ResponsiveDataListCell>
                            <ResponsiveDataListCell label="Pembayaran" className="md:order-5">
                                {paymentLabel(order.payment_method)}
                            </ResponsiveDataListCell>
                            <ResponsiveDataListCell label="Total" className="md:order-6" valueClassName="md:text-right">
                                {formatCurrency(order.total)}
                            </ResponsiveDataListCell>

                            <ResponsiveDataListActions className="md:order-7">
                                <Button asChild variant="ghost" size="icon" aria-label="Lihat invoice">
                                    <Link href={`/orders/${order.id}`}>
                                        <Eye className="size-4" />
                                    </Link>
                                </Button>
                            </ResponsiveDataListActions>
                        </ResponsiveDataListRow>
                    ))}
                </ResponsiveDataList>
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
