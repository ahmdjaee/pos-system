<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\DiningTable;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('pos/index', [
            'categories' => Category::query()
                ->with(['products' => fn ($query) => $query->where('is_available', true)->orderBy('name')])
                ->orderBy('name')
                ->get(),
            'tables' => DiningTable::query()
                ->orderBy('name')
                ->get(),
            'taxRate' => 0.1,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
            'items.*.notes' => ['nullable', 'string', 'max:250'],
            'customer_name' => ['nullable', 'string', 'max:120'],
            'order_type' => ['required', Rule::in(['dine_in', 'takeaway'])],
            'dining_table_id' => ['nullable', 'exists:dining_tables,id'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'payment_method' => ['required', Rule::in(['cash', 'debit', 'qris', 'transfer'])],
            'paid_amount' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $order = DB::transaction(function () use ($request, $validated): Order {
            $products = Product::query()
                ->whereIn('id', collect($validated['items'])->pluck('product_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $items = [];
            $subtotal = 0;

            foreach ($validated['items'] as $item) {
                /** @var Product|null $product */
                $product = $products->get($item['product_id']);
                $quantity = (int) $item['quantity'];

                if (! $product || ! $product->is_available) {
                    throw ValidationException::withMessages([
                        'items' => 'Ada produk yang tidak tersedia.',
                    ]);
                }

                if ($product->track_stock && $product->stock < $quantity) {
                    throw ValidationException::withMessages([
                        'items' => "Stok {$product->name} tidak cukup.",
                    ]);
                }

                $lineSubtotal = (float) $product->price * $quantity;
                $subtotal += $lineSubtotal;

                $items[] = [
                    'product' => $product,
                    'quantity' => $quantity,
                    'notes' => $item['notes'] ?? null,
                    'subtotal' => $lineSubtotal,
                ];
            }

            $tax = round($subtotal * 0.1, 2);
            $discount = min((float) ($validated['discount'] ?? 0), $subtotal + $tax);
            $total = round($subtotal + $tax - $discount, 2);
            $paidAmount = (float) $validated['paid_amount'];

            if ($paidAmount < $total) {
                throw ValidationException::withMessages([
                    'paid_amount' => 'Nominal bayar kurang dari total tagihan.',
                ]);
            }

            $order = Order::create([
                'invoice_number' => $this->nextInvoiceNumber(),
                'user_id' => $request->user()->id,
                'dining_table_id' => $validated['order_type'] === 'dine_in' ? ($validated['dining_table_id'] ?? null) : null,
                'customer_name' => $validated['customer_name'] ?? null,
                'order_type' => $validated['order_type'],
                'status' => 'completed',
                'subtotal' => $subtotal,
                'tax' => $tax,
                'discount' => $discount,
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'paid_amount' => $paidAmount,
                'change_amount' => max(0, $paidAmount - $total),
                'notes' => $validated['notes'] ?? null,
                'paid_at' => now(),
            ]);

            foreach ($items as $item) {
                /** @var Product $product */
                $product = $item['product'];

                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit_price' => $product->price,
                    'quantity' => $item['quantity'],
                    'subtotal' => $item['subtotal'],
                    'notes' => $item['notes'],
                ]);

                if ($product->track_stock) {
                    $product->decrement('stock', $item['quantity']);
                }
            }

            if ($order->dining_table_id) {
                DiningTable::whereKey($order->dining_table_id)->update(['status' => DiningTable::STATUS_OCCUPIED]);
            }

            return $order;
        });

        return redirect()
            ->route('orders.show', $order)
            ->with('success', "Transaksi {$order->invoice_number} berhasil disimpan.");
    }

    private function nextInvoiceNumber(): string
    {
        $prefix = 'INV-'.now()->format('Ymd').'-';
        $sequence = Order::whereDate('created_at', today())->count() + 1;

        do {
            $invoice = $prefix.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
            $sequence++;
        } while (Order::where('invoice_number', $invoice)->exists());

        return $invoice;
    }
}
