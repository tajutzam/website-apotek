<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\SaleReturn;
use App\Models\SaleReturnItem;
use App\Models\StockAdjustment;
use App\Models\Transaction;
use App\Services\ActivityLogger;
use App\Services\CashService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SalesController extends Controller
{
    /**
     * 1. Daftar Penjualan (Sales History with status & actions)
     */
    public function index(Request $request)
    {
        $query = Transaction::with(['user', 'items.medicine.unit', 'saleReturns']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date')) {
            $query->whereDate('transaction_date', $request->date);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        $transactions = $query->latest('transaction_date')->paginate(10)->withQueryString();

        return Inertia::render('Sales/Index', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'status', 'date', 'payment_method']),
        ]);
    }

    /**
     * 2. Retur Penjualan List & Process
     */
    public function returns(Request $request)
    {
        $returns = SaleReturn::with(['transaction.user', 'user', 'items.medicine.unit'])
            ->latest()
            ->paginate(10);

        // Eligible transactions for return (status completed/active)
        $completedTransactions = Transaction::with(['items.medicine.unit'])
            ->where('status', '!=', 'rejected')
            ->latest('transaction_date')
            ->take(30)
            ->get();

        return Inertia::render('Sales/Returns', [
            'returns' => $returns,
            'completed_transactions' => $completedTransactions,
        ]);
    }

    /**
     * Store Return
     */
    public function storeReturn(Request $request)
    {
        $validated = $request->validate([
            'transaction_id' => ['required', 'exists:transactions,id'],
            'reason' => ['required', 'string', 'max:255'],
            'refund_method' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.medicine_id' => ['required', 'exists:medicines,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.refund_price' => ['required', 'numeric', 'min:0'],
            'items.*.restore_stock' => ['required', 'boolean'],
        ]);

        return DB::transaction(function () use ($validated) {
            $transaction = Transaction::with('items')->findOrFail($validated['transaction_id']);
            $totalRefund = 0;
            $returnNumber = 'RET-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

            foreach ($validated['items'] as $item) {
                $totalRefund += ($item['refund_price'] * $item['quantity']);
            }

            $saleReturn = SaleReturn::create([
                'return_number' => $returnNumber,
                'transaction_id' => $transaction->id,
                'user_id' => Auth::id(),
                'total_refund' => $totalRefund,
                'reason' => $validated['reason'],
                'refund_method' => $validated['refund_method'],
                'notes' => $validated['notes'],
                'return_date' => now(),
            ]);

            foreach ($validated['items'] as $item) {
                $subtotal = $item['refund_price'] * $item['quantity'];
                SaleReturnItem::create([
                    'sale_return_id' => $saleReturn->id,
                    'medicine_id' => $item['medicine_id'],
                    'quantity' => $item['quantity'],
                    'refund_price' => $item['refund_price'],
                    'subtotal' => $subtotal,
                    'restore_stock' => $item['restore_stock'],
                ]);

                // If restore_stock is checked, return back to medicine inventory
                if ($item['restore_stock']) {
                    $med = Medicine::lockForUpdate()->find($item['medicine_id']);
                    $prevStock = $med->stock;
                    $finalStock = $prevStock + $item['quantity'];
                    $med->increment('stock', $item['quantity']);

                    StockAdjustment::create([
                        'medicine_id' => $med->id,
                        'user_id' => Auth::id(),
                        'type' => 'in',
                        'previous_stock' => $prevStock,
                        'quantity' => $item['quantity'],
                        'final_stock' => $finalStock,
                        'reason' => "Retur Penjualan No: {$returnNumber}",
                        'reference_number' => $returnNumber,
                        'notes' => "Barang retur dari invoice {$transaction->invoice_number}",
                    ]);
                }
            }

            // Update transaction status to returned
            $transaction->update(['status' => 'returned']);

            // Integrasi ke Keuangan Kas (Pencatatan pengeluaran kas refund retur)
            try {
                $cashAccount = $validated['refund_method'] === 'Cash'
                    ? CashService::getDefaultCashAccount()
                    : CashService::getDefaultBankAccount('bank');

                CashService::recordMutation(
                    $cashAccount,
                    'out',
                    'retur_penjualan',
                    $totalRefund,
                    "Pengeluaran refund retur penjualan #{$returnNumber} (Invoice: {$transaction->invoice_number})",
                    SaleReturn::class,
                    $saleReturn->id,
                    $returnNumber
                );
            } catch (\Exception $e) {
                // Continue
            }

            ActivityLogger::log(
                'transaction',
                'Penjualan',
                "Retur penjualan dibuat #{$returnNumber} untuk invoice {$transaction->invoice_number} (Refund: Rp " . number_format($totalRefund, 0, ',', '.') . ")",
                ['return_number' => $returnNumber, 'total_refund' => $totalRefund]
            );

            return redirect()->back()->with('success', "Retur penjualan {$returnNumber} berhasil diproses.");
        });
    }

    /**
     * 3. Penjualan Tertolak / Dibatalkan (Rejected / Voided Sales)
     */
    public function rejected(Request $request)
    {
        $query = Transaction::with(['user', 'items.medicine.unit'])
            ->where('status', 'rejected');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('rejection_reason', 'like', "%{$search}%");
            });
        }

        $rejectedSales = $query->latest('updated_at')->paginate(10)->withQueryString();

        return Inertia::render('Sales/Rejected', [
            'rejectedSales' => $rejectedSales,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Tolak / Batalkan Transaksi (Reject / Void transaction and rollback stock)
     */
    public function rejectTransaction(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:255'],
        ]);

        if ($transaction->status === 'rejected') {
            return back()->with('error', 'Transaksi ini sudah dalam status tertolak.');
        }

        return DB::transaction(function () use ($transaction, $validated) {
            // Restore medicine stocks if not previously returned
            if ($transaction->status !== 'returned') {
                foreach ($transaction->items as $item) {
                    $med = Medicine::lockForUpdate()->find($item->medicine_id);
                    if ($med) {
                        $prevStock = $med->stock;
                        $finalStock = $prevStock + $item->quantity;
                        $med->increment('stock', $item->quantity);

                        StockAdjustment::create([
                            'medicine_id' => $med->id,
                            'user_id' => Auth::id(),
                            'type' => 'in',
                            'previous_stock' => $prevStock,
                            'quantity' => $item->quantity,
                            'final_stock' => $finalStock,
                            'reason' => "Pembatalan / Penolakan Invoice: {$transaction->invoice_number}",
                            'reference_number' => $transaction->invoice_number,
                            'notes' => "Alasan ditolak: {$validated['rejection_reason']}",
                        ]);
                    }
                }
            }

            $transaction->update([
                'status' => 'rejected',
                'rejection_reason' => $validated['rejection_reason'],
            ]);

            // Pengeluaran kas pembatalan jika sebelumnya kasir telah mencatat pemasukan
            try {
                $cashAccount = $transaction->payment_method === 'Cash'
                    ? CashService::getDefaultCashAccount()
                    : CashService::getDefaultBankAccount($transaction->payment_method === 'Transfer' ? 'bank' : 'e-wallet');

                CashService::recordMutation(
                    $cashAccount,
                    'out',
                    'penjualan',
                    $transaction->total_amount,
                    "Pembatalan / Penolakan transaksi #{$transaction->invoice_number}",
                    Transaction::class,
                    $transaction->id,
                    $transaction->invoice_number
                );
            } catch (\Exception $e) {
                // Continue
            }

            ActivityLogger::log(
                'update',
                'Penjualan',
                "Menolak / membatalkan transaksi #{$transaction->invoice_number} Alasan: {$validated['rejection_reason']}",
                ['invoice' => $transaction->invoice_number, 'reason' => $validated['rejection_reason']]
            );

            return back()->with('success', "Transaksi #{$transaction->invoice_number} berhasil dibatalkan/ditolak dan stok telah dipulihkan.");
        });
    }
}
