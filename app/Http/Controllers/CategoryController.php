<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withCount('medicines')->latest()->get();
        $units = Unit::withCount('medicines')->latest()->get();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
            'units' => $units,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . rand(100, 999);

        Category::create($validated);

        return redirect()->back()->with('success', 'Kategori baru berhasil ditambahkan.');
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $category->update($validated);

        return redirect()->back()->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return redirect()->back()->with('success', 'Kategori berhasil dihapus.');
    }

    public function storeUnit(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', 'unique:units,name'],
        ]);

        Unit::create($validated);

        return redirect()->back()->with('success', 'Satuan baru berhasil ditambahkan.');
    }

    public function destroyUnit(Unit $unit)
    {
        $unit->delete();

        return redirect()->back()->with('success', 'Satuan berhasil dihapus.');
    }
}
