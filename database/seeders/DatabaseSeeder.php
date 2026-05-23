<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\DiningTable;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@pos.test'],
            [
                'name' => 'Admin POS',
                'password' => Hash::make('password'),
            ],
        );

        $categories = collect([
            ['name' => 'Makanan', 'color' => '#0f766e'],
            ['name' => 'Minuman', 'color' => '#2563eb'],
            ['name' => 'Camilan', 'color' => '#c2410c'],
        ])->mapWithKeys(fn (array $category) => [
            $category['name'] => Category::updateOrCreate(['name' => $category['name']], $category),
        ]);

        $products = [
            ['category' => 'Makanan', 'name' => 'Nasi Goreng Kampung', 'sku' => 'MKN-001', 'price' => 22000, 'cost' => 12000, 'stock' => 40],
            ['category' => 'Makanan', 'name' => 'Ayam Geprek Sambal Bawang', 'sku' => 'MKN-002', 'price' => 25000, 'cost' => 15000, 'stock' => 35],
            ['category' => 'Makanan', 'name' => 'Mie Goreng Jawa', 'sku' => 'MKN-003', 'price' => 20000, 'cost' => 11000, 'stock' => 30],
            ['category' => 'Minuman', 'name' => 'Es Teh Manis', 'sku' => 'MNM-001', 'price' => 6000, 'cost' => 2500, 'stock' => 100],
            ['category' => 'Minuman', 'name' => 'Kopi Susu Gula Aren', 'sku' => 'MNM-002', 'price' => 18000, 'cost' => 9000, 'stock' => 45],
            ['category' => 'Camilan', 'name' => 'Pisang Goreng Keju', 'sku' => 'CML-001', 'price' => 15000, 'cost' => 7000, 'stock' => 25],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(
                ['sku' => $product['sku']],
                [
                    'category_id' => $categories[$product['category']]->id,
                    'name' => $product['name'],
                    'description' => null,
                    'price' => $product['price'],
                    'cost' => $product['cost'],
                    'stock' => $product['stock'],
                    'low_stock_threshold' => 8,
                    'track_stock' => true,
                    'is_available' => true,
                ],
            );
        }

        foreach (range(1, 8) as $number) {
            DiningTable::updateOrCreate(['name' => "Meja {$number}"], [
                'capacity' => $number <= 4 ? 2 : 4,
                'status' => DiningTable::STATUS_AVAILABLE,
            ]);
        }
    }
}
