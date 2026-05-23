import { FlashMessage } from '@/components/flash-message';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatNumber, paymentLabel } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { type DashboardPageProps } from '@/types/pos';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, Boxes, ClipboardList, ReceiptText, Utensils, type LucideIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ summary, lowStockProducts, recentOrders, topProducts }: DashboardPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <PageHeader title="Dashboard" description="Ringkasan penjualan dan operasional restoran hari ini." />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
                <FlashMessage />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard icon={ReceiptText} label="Penjualan hari ini" value={formatCurrency(summary.today_sales)} />
                    <MetricCard icon={ClipboardList} label="Transaksi" value={formatNumber(summary.today_orders)} />
                    <MetricCard icon={Utensils} label="Rata-rata transaksi" value={formatCurrency(summary.average_order)} />
                    <MetricCard icon={Boxes} label="Menu aktif" value={formatNumber(summary.active_products)} />
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <section className="bg-card rounded-lg border">
                        <div className="flex items-center justify-between border-b p-4">
                            <div>
                                <h2 className="font-semibold">Transaksi Terbaru</h2>
                                <p className="text-muted-foreground text-sm">Pembayaran yang baru masuk.</p>
                            </div>
                            <Link href="/orders" className="inline-flex items-center gap-1 text-sm font-medium">
                                Lihat semua <ArrowRight className="size-4" />
                            </Link>
                        </div>
                        <div className="divide-y">
                            {recentOrders.length === 0 && <EmptyRow text="Belum ada transaksi." />}
                            {recentOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/orders/${order.id}`}
                                    className="hover:bg-muted/50 grid gap-2 p-4 sm:grid-cols-[1fr_auto]"
                                >
                                    <div className="min-w-0">
                                        <p className="font-medium">{order.invoice_number}</p>
                                        <p className="text-muted-foreground text-sm">
                                            {order.customer_name || order.table_name || 'Pelanggan umum'} oleh {order.cashier_name}
                                        </p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="font-semibold">{formatCurrency(order.total)}</p>
                                        <p className="text-muted-foreground text-xs">
                                            {paymentLabel(order.payment_method)} · {order.paid_at}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section className="bg-card rounded-lg border">
                        <div className="border-b p-4">
                            <h2 className="font-semibold">Stok Perlu Dicek</h2>
                            <p className="text-muted-foreground text-sm">Produk dengan stok di bawah batas minimum.</p>
                        </div>
                        <div className="divide-y">
                            {lowStockProducts.length === 0 && <EmptyRow text="Semua stok aman." />}
                            {lowStockProducts.map((product) => (
                                <div key={product.id} className="flex items-center justify-between gap-4 p-4">
                                    <div className="min-w-0">
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-muted-foreground text-sm">{product.category?.name ?? 'Tanpa kategori'}</p>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="shrink-0 border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-300"
                                    >
                                        <AlertTriangle className="mr-1 size-3" />
                                        {product.stock}/{product.low_stock_threshold}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <section className="bg-card rounded-lg border">
                    <div className="border-b p-4">
                        <h2 className="font-semibold">Menu Terlaris Hari Ini</h2>
                        <p className="text-muted-foreground text-sm">Diurutkan dari jumlah item terjual.</p>
                    </div>
                    <div className="grid divide-y md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-5">
                        {topProducts.length === 0 && (
                            <div className="text-muted-foreground p-4 text-sm md:col-span-2 xl:col-span-5">Belum ada penjualan menu hari ini.</div>
                        )}
                        {topProducts.map((product) => (
                            <div key={product.product_name} className="p-4">
                                <p className="font-medium">{product.product_name}</p>
                                <p className="text-muted-foreground mt-1 text-sm">{formatNumber(product.sold)} porsi</p>
                                <p className="mt-3 text-lg font-semibold">{formatCurrency(product.revenue)}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}

function MetricCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
    return (
        <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                    <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-muted-foreground text-sm">{label}</p>
                    <p className="text-xl font-semibold">{value}</p>
                </div>
            </div>
        </div>
    );
}

function EmptyRow({ text }: { text: string }) {
    return <div className="text-muted-foreground p-4 text-sm">{text}</div>;
}
