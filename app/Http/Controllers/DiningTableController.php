<?php

namespace App\Http\Controllers;

use App\Models\DiningTable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DiningTableController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('tables/index', [
            'tables' => DiningTable::query()
                ->orderBy('name')
                ->get(),
            'statuses' => [
                DiningTable::STATUS_AVAILABLE,
                DiningTable::STATUS_OCCUPIED,
                DiningTable::STATUS_RESERVED,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        DiningTable::create($this->validatedData($request));

        return back()->with('success', 'Meja berhasil ditambahkan.');
    }

    public function update(Request $request, DiningTable $table): RedirectResponse
    {
        $table->update($this->validatedData($request));

        return back()->with('success', 'Meja berhasil diperbarui.');
    }

    public function destroy(DiningTable $table): RedirectResponse
    {
        $table->delete();

        return back()->with('success', 'Meja berhasil dihapus.');
    }

    private function validatedData(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'capacity' => ['required', 'integer', 'min:1', 'max:50'],
            'status' => ['required', Rule::in([
                DiningTable::STATUS_AVAILABLE,
                DiningTable::STATUS_OCCUPIED,
                DiningTable::STATUS_RESERVED,
            ])],
        ]);
    }
}
