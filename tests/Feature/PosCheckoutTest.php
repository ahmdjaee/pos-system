<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\DiningTable;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PosCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_cashier_can_checkout_order_and_stock_is_reduced(): void
    {
        $user = User::factory()->create();
        $category = Category::create(['name' => 'Makanan', 'color' => '#0f766e']);
        $table = DiningTable::create(['name' => 'Meja 1', 'capacity' => 2, 'status' => DiningTable::STATUS_AVAILABLE]);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Nasi Goreng',
            'sku' => 'MKN-001',
            'price' => 20000,
            'cost' => 10000,
            'stock' => 10,
            'low_stock_threshold' => 3,
            'track_stock' => true,
            'is_available' => true,
        ]);

        $response = $this
            ->actingAs($user)
            ->post('/pos/checkout', [
                'items' => [
                    ['product_id' => $product->id, 'quantity' => 2],
                ],
                'customer_name' => 'Budi',
                'order_type' => 'dine_in',
                'dining_table_id' => $table->id,
                'discount' => 0,
                'payment_method' => 'cash',
                'paid_amount' => 50000,
            ]);

        $order = Order::first();

        $response->assertRedirect("/orders/{$order->id}");
        $this->assertDatabaseHas('orders', [
            'customer_name' => 'Budi',
            'subtotal' => 40000,
            'tax' => 4000,
            'total' => 44000,
            'change_amount' => 6000,
        ]);
        $this->assertDatabaseHas('order_items', [
            'product_name' => 'Nasi Goreng',
            'quantity' => 2,
            'subtotal' => 40000,
        ]);
        $this->assertSame(8, $product->fresh()->stock);
        $this->assertSame(DiningTable::STATUS_OCCUPIED, $table->fresh()->status);
    }

    public function test_checkout_rejects_insufficient_stock(): void
    {
        $user = User::factory()->create();
        $category = Category::create(['name' => 'Minuman', 'color' => '#2563eb']);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Es Teh',
            'sku' => 'MNM-001',
            'price' => 6000,
            'stock' => 1,
            'track_stock' => true,
            'is_available' => true,
        ]);

        $this
            ->actingAs($user)
            ->post('/pos/checkout', [
                'items' => [
                    ['product_id' => $product->id, 'quantity' => 2],
                ],
                'order_type' => 'takeaway',
                'discount' => 0,
                'payment_method' => 'cash',
                'paid_amount' => 20000,
            ])
            ->assertSessionHasErrors('items');

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(1, $product->fresh()->stock);
    }
}
