<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $from = $request->string('from')->toString() ?: now()->startOfMonth()->toDateString();
        $to = $request->string('to')->toString() ?: now()->toDateString();

        $orders = Order::query()
            ->whereDate('paid_at', '>=', $from)
            ->whereDate('paid_at', '<=', $to);

        $dailySales = (clone $orders)
            ->select(DB::raw('DATE(paid_at) as date'), DB::raw('SUM(total) as total'), DB::raw('COUNT(*) as orders'))
            ->groupBy(DB::raw('DATE(paid_at)'))
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'date' => $row->date,
                'total' => (float) $row->total,
                'orders' => (int) $row->orders,
            ]);

        $paymentMethods = (clone $orders)
            ->select('payment_method', DB::raw('SUM(total) as total'), DB::raw('COUNT(*) as orders'))
            ->groupBy('payment_method')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'payment_method' => $row->payment_method,
                'total' => (float) $row->total,
                'orders' => (int) $row->orders,
            ]);

        $topProducts = OrderItem::query()
            ->select('product_name', DB::raw('SUM(quantity) as quantity'), DB::raw('SUM(subtotal) as total'))
            ->whereHas('order', fn ($query) => $query
                ->whereDate('paid_at', '>=', $from)
                ->whereDate('paid_at', '<=', $to))
            ->groupBy('product_name')
            ->orderByDesc('quantity')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'product_name' => $row->product_name,
                'quantity' => (int) $row->quantity,
                'total' => (float) $row->total,
            ]);

        return Inertia::render('reports/index', [
            'filters' => [
                'from' => $from,
                'to' => $to,
            ],
            'summary' => [
                'total_sales' => (float) (clone $orders)->sum('total'),
                'total_orders' => (clone $orders)->count(),
                'average_order' => (float) (clone $orders)->avg('total'),
                'total_tax' => (float) (clone $orders)->sum('tax'),
            ],
            'dailySales' => $dailySales,
            'paymentMethods' => $paymentMethods,
            'topProducts' => $topProducts,
        ]);
    }
}
