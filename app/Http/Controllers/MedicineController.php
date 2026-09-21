<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Medicine;
use App\Models\Unit;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MedicineController extends Controller
{
    public function index(Request $request)
    {
        $query = Medicine::with(['category', 'unit']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('location_rack', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('stock_status')) {
            if ($request->stock_status === 'low') {
                $query->whereColumn('stock', '<=', 'min_stock');
            } elseif ($request->stock_status === 'available') {
                $query->whereColumn('stock', '>', 'min_stock');
            } elseif ($request->stock_status === 'empty') {
                $query->where('stock', '<=', 0);
            }
        }

        $medicines = $query->latest()->paginate(10)->withQueryString();
        $categories = Category::orderBy('name')->get();
        $units = Unit::orderBy('name')->get();

        return Inertia::render('Medicines/Index', [
            'medicines' => $medicines,
            'categories' => $categories,
            'units' => $units,
            'filters' => $request->only(['search', 'category_id', 'stock_status']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:medicines,code'],
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'unit_id' => ['nullable', 'exists:units,id'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'min_stock' => ['required', 'integer', 'min:0'],
            'expired_date' => ['nullable', 'date'],
            'location_rack' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'is_prescription' => ['boolean'],
        ]);

        $medicine = Medicine::create($validated);

        ActivityLogger::log(
            'create',
            'Obat',
            "Menambahkan data obat baru: {$medicine->name} ({$medicine->code})",
            ['id' => $medicine->id, 'name' => $medicine->name, 'stock' => $medicine->stock]
        );

        return redirect()->back()->with('success', 'Obat berhasil ditambahkan ke inventori.');
    }

    public function update(Request $request, Medicine $medicine)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:medicines,code,' . $medicine->id],
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'unit_id' => ['nullable', 'exists:units,id'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'min_stock' => ['required', 'integer', 'min:0'],
            'expired_date' => ['nullable', 'date'],
            'location_rack' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'is_prescription' => ['boolean'],
        ]);

        $oldData = $medicine->toArray();
        $medicine->update($validated);

        ActivityLogger::log(
            'update',
            'Obat',
            "Memperbarui data obat: {$medicine->name} ({$medicine->code})",
            ['old' => $oldData, 'new' => $validated]
        );

        return redirect()->back()->with('success', 'Data obat berhasil diperbarui.');
    }

    public function destroy(Medicine $medicine)
    {
        $name = $medicine->name;
        $code = $medicine->code;
        $medicine->delete();

        ActivityLogger::log(
            'delete',
            'Obat',
            "Menghapus data obat: {$name} ({$code})",
            ['code' => $code, 'name' => $name]
        );

        return redirect()->back()->with('success', 'Obat berhasil dihapus dari inventori.');
    }
}
