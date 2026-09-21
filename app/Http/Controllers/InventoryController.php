<?php

namespace App\Http\Controllers;

use App\Models\CashAccount;
use App\Models\Medicine;
use App\Models\StockAdjustment;
use App\Services\ActivityLogger;
use App\Services\CashService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $tab = $request->get('tab', 'stock'); // 'stock', 'adjustments', 'expiring'
        $search = $request->get('search', '');
        $status = $request->get('status', '');

        // Query Medicines
        $medicineQuery = Medicine::with(['category', 'unit']);

        if ($search) {
            $medicineQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('location_rack', 'like', "%{$search}%");
            });
        }

        if ($status === 'low') {
            $medicineQuery->whereColumn('stock', '<=', 'min_stock')->where('stock', '>', 0);
        } elseif ($status === 'empty') {
            $medicineQuery->where('stock', '<=', 0);
        } elseif ($status === 'safe') {
            $medicineQuery->whereColumn('stock', '>', 'min_stock');
        } elseif ($status === 'expiring') {
            $medicineQuery->whereNotNull('expired_date')
                ->where('expired_date', '<=', Carbon::now()->addMonths(6));
        }

        $medicines = $medicineQuery->orderBy('stock', 'asc')->paginate(10)->withQueryString();

        // Adjustments History
        $adjustmentsQuery = StockAdjustment::with(['medicine.unit', 'user'])->latest();
        if ($search) {
            $adjustmentsQuery->whereHas('medicine', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            })->orWhere('reference_number', 'like', "%{$search}%");
        }
        $adjustments = $adjustmentsQuery->paginate(10)->withQueryString();

        // Expiring Soon List (dalam 6 bulan)
        $expiringMedicines = Medicine::with(['category', 'unit'])
            ->whereNotNull('expired_date')
            ->where('expired_date', '<=', Carbon::now()->addMonths(6))
            ->orderBy('expired_date', 'asc')
            ->get();

        // Summary Cards
        $allMedicines = Medicine::all();
        $totalStockValue = $allMedicines->sum(function ($m) {
            return $m->stock * $m->purchase_price;
        });
        $lowStockCount = $allMedicines->where('stock', '<=', 'min_stock')->where('stock', '>', 0)->count();
        $emptyStockCount = $allMedicines->where('stock', '<=', 0)->count();
        $expiringCount = $expiringMedicines->count();
        $accounts = CashAccount::where('is_active', true)->get();

        return Inertia::render('Inventory/Index', [
            'tab' => $tab,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'summary' => [
                'total_items' => $allMedicines->count(),
                'total_stock_value' => (float) $totalStockValue,
                'low_stock_count' => $lowStockCount,
                'empty_stock_count' => $emptyStockCount,
                'expiring_count' => $expiringCount,
            ],
            'medicines' => $medicines,
            'all_medicines_list' => Medicine::select('id', 'code', 'name', 'stock', 'purchase_price', 'unit_id')
                ->with('unit')
                ->orderBy('name')
                ->get(),
            'accounts' => $accounts,
            'adjustments' => $adjustments,
            'expiring_medicines' => $expiringMedicines,
        ]);
    }

    /**
     * Store stock adjustment / Stock Opname / Masuk / Keluar
     */
    public function storeAdjustment(Request $request)
    {
        $validated = $request->validate([
            'medicine_id' => ['required', 'exists:medicines,id'],
            'type' => ['required', 'in:in,out,adjustment'],
            'quantity' => ['required', 'integer', 'min:1'],
            'reason' => ['required', 'string', 'max:150'],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
            'use_cash' => ['nullable', 'boolean'],
            'cash_account_id' => ['nullable', 'exists:cash_accounts,id'],
            'total_cost' => ['nullable', 'numeric', 'min:0'],
        ]);

        return DB::transaction(function () use ($validated) {
            $medicine = Medicine::lockForUpdate()->findOrFail($validated['medicine_id']);
            $previousStock = $medicine->stock;
            $qty = $validated['quantity'];

            if ($validated['type'] === 'in') {
                $finalStock = $previousStock + $qty;
            } elseif ($validated['type'] === 'out') {
                if ($previousStock < $qty) {
                    return back()->with('error', "Stok tidak mencukupi untuk dikeluarkan. Sisa stok: {$previousStock}");
                }
                $finalStock = $previousStock - $qty;
            } else {
                // Adjustment / Opname: quantity is actual stock found
                $finalStock = $qty;
            }

            // Jika barang masuk dan user memilih potong kas tunai/bank langsung
            if ($validated['type'] === 'in' && !empty($validated['use_cash']) && !empty($validated['cash_account_id']) && !empty($validated['total_cost'])) {
                $account = CashAccount::lockForUpdate()->findOrFail($validated['cash_account_id']);
                $totalCost = (float) $validated['total_cost'];

                if ($account->current_balance < $totalCost) {
                    return back()->with('error', "Saldo akun {$account->name} tidak mencukupi untuk pembelian stok ini (Perlu: Rp " . number_format($totalCost, 0, ',', '.') . ").");
                }

                CashService::recordMutation(
                    $account,
                    'out',
                    'pembelian_perlengkapan',
                    $totalCost,
                    "Pembelian / Restock persediaan obat {$medicine->name} ({$qty} {$medicine->unit?->name})",
                    Medicine::class,
                    $medicine->id,
                    $validated['reference_number'] ?: 'RESTOCK'
                );
            }

            // Update medicine stock
            $medicine->update(['stock' => $finalStock]);

            // Create record
            StockAdjustment::create([
                'medicine_id' => $medicine->id,
                'user_id' => Auth::id(),
                'type' => $validated['type'],
                'previous_stock' => $previousStock,
                'quantity' => $qty,
                'final_stock' => $finalStock,
                'reason' => $validated['reason'],
                'reference_number' => $validated['reference_number'],
                'notes' => $validated['notes'],
            ]);

            ActivityLogger::log(
                'inventory',
                'Persediaan',
                "Mutasi stok ({$validated['type']}) obat {$medicine->name}: {$previousStock} -> {$finalStock} (Qty: {$qty}) Alasan: {$validated['reason']}",
                ['medicine_id' => $medicine->id, 'type' => $validated['type'], 'qty' => $qty, 'final_stock' => $finalStock]
            );

            return back()->with('success', "Persediaan obat {$medicine->name} berhasil diperbarui (Stok baru: {$finalStock}).");
        });
    }
}
