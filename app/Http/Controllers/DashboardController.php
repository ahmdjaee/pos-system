<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $today = now()->toDateString();

        $todayOrders = Order::whereDate('paid_at', $today);

        $topProducts = OrderItem::query()
            ->select('product_name', DB::raw('SUM(quantity) as sold'), DB::raw('SUM(subtotal) as revenue'))
            ->whereHas('order', fn ($query) => $query->whereDate('paid_at', $today))
            ->groupBy('product_name')
            ->orderByDesc('sold')
            ->limit(5)
            ->get()
            ->map(fn (OrderItem $item) => [
                'product_name' => $item->product_name,
                'sold' => (int) $item->sold,
                'revenue' => (float) $item->revenue,
            ]);

        return Inertia::render('dashboard', [
            'summary' => [
                'today_sales' => (float) (clone $todayOrders)->sum('total'),
                'today_orders' => (clone $todayOrders)->count(),
                'average_order' => (float) (clone $todayOrders)->avg('total'),
                'active_products' => Product::where('is_available', true)->count(),
            ],
            'lowStockProducts' => Product::query()
                ->with('category:id,name,color')
                ->where('track_stock', true)
                ->whereColumn('stock', '<=', 'low_stock_threshold')
                ->orderBy('stock')
                ->limit(6)
                ->get(['id', 'category_id', 'name', 'stock', 'low_stock_threshold']),
            'recentOrders' => Order::query()
                ->with(['diningTable:id,name', 'user:id,name'])
                ->latest()
                ->limit(6)
                ->get()
                ->map(fn (Order $order) => $this->orderRow($order)),
            'topProducts' => $topProducts,
        ]);
    }

    private function orderRow(Order $order): array
    {
        return [
            'id' => $order->id,
            'invoice_number' => $order->invoice_number,
            'customer_name' => $order->customer_name,
            'table_name' => $order->diningTable?->name,
            'cashier_name' => $order->user?->name,
            'total' => (float) $order->total,
            'payment_method' => $order->payment_method,
            'paid_at' => $order->paid_at?->format('d M Y H:i'),
        ];
    }
}
