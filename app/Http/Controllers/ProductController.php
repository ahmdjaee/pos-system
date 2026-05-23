<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('products/index', [
            'categories' => Category::query()
                ->withCount('products')
                ->orderBy('name')
                ->get(),
            'products' => Product::query()
                ->with('category:id,name,color')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Product::create($this->validatedData($request));

        return back()->with('success', 'Produk berhasil ditambahkan.');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $product->update($this->validatedData($request, $product));

        return back()->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return back()->with('success', 'Produk berhasil dihapus.');
    }

    private function validatedData(Request $request, ?Product $product = null): array
    {
        $data = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:150'],
            'sku' => ['required', 'string', 'max:60', Rule::unique('products', 'sku')->ignore($product)],
            'description' => ['nullable', 'string', 'max:500'],
            'price' => ['required', 'numeric', 'min:0'],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
            'track_stock' => ['boolean'],
            'is_available' => ['boolean'],
        ]);

        $data['description'] = $data['description'] ?? null;
        $data['cost'] = $data['cost'] ?? 0;
        $data['stock'] = $data['stock'] ?? 0;
        $data['low_stock_threshold'] = $data['low_stock_threshold'] ?? 0;
        $data['track_stock'] = (bool) ($data['track_stock'] ?? false);
        $data['is_available'] = (bool) ($data['is_available'] ?? false);

        return $data;
    }
}
