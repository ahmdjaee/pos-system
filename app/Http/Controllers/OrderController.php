<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $date = $request->string('date')->toString() ?: now()->toDateString();

        $orders = Order::query()
            ->with(['diningTable:id,name', 'user:id,name', 'items:id,order_id,product_name,quantity,subtotal'])
            ->whereDate('paid_at', $date)
            ->latest('paid_at')
            ->get();

        return Inertia::render('orders/index', [
            'date' => $date,
            'orders' => $orders->map(fn (Order $order) => $this->orderData($order)),
            'summary' => [
                'total_sales' => (float) $orders->sum('total'),
                'total_orders' => $orders->count(),
                'total_items' => $orders->flatMap->items->sum('quantity'),
            ],
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['diningTable:id,name', 'user:id,name', 'items']);

        return Inertia::render('orders/show', [
            'order' => $this->orderData($order, true),
        ]);
    }

    private function orderData(Order $order, bool $withDetails = false): array
    {
        $data = [
            'id' => $order->id,
            'invoice_number' => $order->invoice_number,
            'customer_name' => $order->customer_name,
            'order_type' => $order->order_type,
            'status' => $order->status,
            'table_name' => $order->diningTable?->name,
            'cashier_name' => $order->user?->name,
            'subtotal' => (float) $order->subtotal,
            'tax' => (float) $order->tax,
            'discount' => (float) $order->discount,
            'total' => (float) $order->total,
            'payment_method' => $order->payment_method,
            'paid_amount' => (float) $order->paid_amount,
            'change_amount' => (float) $order->change_amount,
            'notes' => $order->notes,
            'paid_at' => $order->paid_at?->format('d M Y H:i'),
        ];

        if ($withDetails) {
            $data['items'] = $order->items->map(fn ($item) => [
                'id' => $item->id,
                'product_name' => $item->product_name,
                'unit_price' => (float) $item->unit_price,
                'quantity' => $item->quantity,
                'subtotal' => (float) $item->subtotal,
                'notes' => $item->notes,
            ]);
        }

        return $data;
    }
}
