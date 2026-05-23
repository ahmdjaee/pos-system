import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatNumber, paymentLabel } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { type ReportsPageProps } from '@/types/pos';
import { Head, router } from '@inertiajs/react';
import { BarChart3, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Laporan', href: '/reports' }];

export default function ReportsIndex({ filters, summary, dailySales, paymentMethods, topProducts }: ReportsPageProps) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);
    const maxSales = Math.max(...dailySales.map((row) => row.total), 1);

    const filter = (event: FormEvent) => {
        event.preventDefault();
        router.get('/reports', { from, to }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan" />
            <PageHeader
                title="Laporan Penjualan"
                description="Pantau omzet, pajak, metode pembayaran, dan menu terlaris."
                actions={
                    <form onSubmit={filter} className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
                        <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="w-full sm:w-auto" />
                        <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="w-full sm:w-auto" />
                        <Button type="submit" variant="secondary">
                            <Search className="size-4" />
                            Filter
                        </Button>
                    </form>
                }
            />

            <div className="grid flex-1 gap-6 p-4 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryBox label="Total penjualan" value={formatCurrency(summary.total_sales)} />
                    <SummaryBox label="Total transaksi" value={formatNumber(summary.total_orders)} />
                    <SummaryBox label="Rata-rata transaksi" value={formatCurrency(summary.average_order)} />
                    <SummaryBox label="Pajak terkumpul" value={formatCurrency(summary.total_tax)} />
                </div>

                <section className="bg-card rounded-lg border">
                    <div className="flex items-center gap-2 border-b p-4">
                        <BarChart3 className="size-5" />
                        <div>
                            <h2 className="font-semibold">Penjualan Harian</h2>
                            <p className="text-muted-foreground text-sm">Grafik ringkas dari rentang tanggal terpilih.</p>
                        </div>
                    </div>
                    <div className="grid gap-3 p-4">
                        {dailySales.map((row) => (
                            <div key={row.date} className="grid gap-2 sm:grid-cols-[130px_1fr_140px] sm:items-center">
                                <span className="text-sm font-medium">{row.date}</span>
                                <div className="bg-muted h-3 overflow-hidden rounded-full">
                                    <div
                                        className="h-full rounded-full bg-teal-600"
                                        style={{ width: `${Math.max(4, (row.total / maxSales) * 100)}%` }}
                                    />
                                </div>
                                <span className="text-sm sm:text-right">
                                    {formatCurrency(row.total)} · {row.orders} trx
                                </span>
                            </div>
                        ))}
                        {dailySales.length === 0 && <p className="text-muted-foreground text-sm">Belum ada penjualan pada rentang tanggal ini.</p>}
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="bg-card rounded-lg border">
                        <div className="border-b p-4">
                            <h2 className="font-semibold">Metode Pembayaran</h2>
                        </div>
                        <div className="divide-y">
                            {paymentMethods.map((row) => (
                                <div key={row.payment_method} className="grid gap-2 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                                    <div>
                                        <p className="font-medium">{paymentLabel(row.payment_method)}</p>
                                        <p className="text-muted-foreground text-sm">{formatNumber(row.orders)} transaksi</p>
                                    </div>
                                    <p className="font-semibold sm:text-right">{formatCurrency(row.total)}</p>
                                </div>
                            ))}
                            {paymentMethods.length === 0 && <p className="text-muted-foreground p-4 text-sm">Belum ada data pembayaran.</p>}
                        </div>
                    </section>

                    <section className="bg-card rounded-lg border">
                        <div className="border-b p-4">
                            <h2 className="font-semibold">Menu Terlaris</h2>
                        </div>
                        <div className="divide-y">
                            {topProducts.map((row) => (
                                <div key={row.product_name} className="grid gap-2 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                                    <div className="min-w-0">
                                        <p className="font-medium">{row.product_name}</p>
                                        <p className="text-muted-foreground text-sm">{formatNumber(row.quantity)} item</p>
                                    </div>
                                    <p className="font-semibold sm:text-right">{formatCurrency(row.total)}</p>
                                </div>
                            ))}
                            {topProducts.length === 0 && <p className="text-muted-foreground p-4 text-sm">Belum ada menu terjual.</p>}
                        </div>
                    </section>
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
