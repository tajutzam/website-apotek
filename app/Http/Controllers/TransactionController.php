<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Services\ActivityLogger;
use App\Services\CashService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransactionController extends Controller
{
    /**
     * Point of Sale (POS) screen for cashier
     */
    public function create()
    {
        $medicines = Medicine::with(['category', 'unit'])
            ->where('stock', '>', 0)
            ->orderBy('name')
            ->get();

        return Inertia::render('Pos/Index', [
            'medicines' => $medicines,
        ]);
    }

    /**
     * Store POS checkout transaction
     */
    public function store(Request $request)
    {
        $request->validate([
            'customer_name' => ['nullable', 'string', 'max:100'],
            'payment_method' => ['required', 'string'],
            'paid_amount' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.medicine_id' => ['required', 'exists:medicines,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        return DB::transaction(function () use ($request) {
            $totalAmount = 0;
            $itemsToCreate = [];

            // Validate stock and calculate total
            foreach ($request->items as $item) {
                $medicine = Medicine::lockForUpdate()->find($item['medicine_id']);

                if ($medicine->stock < $item['quantity']) {
                    return back()->with('error', "Stok obat {$medicine->name} tidak mencukupi (sisa {$medicine->stock}).");
                }

                $subtotal = $medicine->selling_price * $item['quantity'];
                $totalAmount += $subtotal;

                $itemsToCreate[] = [
                    'medicine' => $medicine,
                    'quantity' => $item['quantity'],
                    'unit_price' => $medicine->selling_price,
                    'subtotal' => $subtotal,
                ];
            }

            if ($request->paid_amount < $totalAmount) {
                return back()->with('error', 'Jumlah uang pembayaran kurang dari total belanja.');
            }

            $changeAmount = $request->paid_amount - $totalAmount;
            $invoiceNumber = 'INV-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

            $transaction = Transaction::create([
                'invoice_number' => $invoiceNumber,
                'user_id' => Auth::id(),
                'customer_name' => $request->customer_name ?: 'Pelanggan Umum',
                'total_amount' => $totalAmount,
                'paid_amount' => $request->paid_amount,
                'change_amount' => $changeAmount,
                'payment_method' => $request->payment_method,
                'notes' => $request->notes,
                'transaction_date' => now(),
            ]);

            foreach ($itemsToCreate as $itemData) {
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'medicine_id' => $itemData['medicine']->id,
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'subtotal' => $itemData['subtotal'],
                ]);

                // Reduce stock
                $itemData['medicine']->decrement('stock', $itemData['quantity']);
            }

            // Integrasi ke Keuangan Kas (Otomatis mencatat penerimaan kas penjualan)
            try {
                $cashAccount = $request->payment_method === 'Cash'
                    ? CashService::getDefaultCashAccount()
                    : CashService::getDefaultBankAccount($request->payment_method === 'Transfer' ? 'bank' : 'e-wallet');

                CashService::recordMutation(
                    $cashAccount,
                    'in',
                    'penjualan',
                    $totalAmount,
                    "Penerimaan penjualan kasir #{$invoiceNumber} ({$request->customer_name})",
                    Transaction::class,
                    $transaction->id,
                    $invoiceNumber
                );
            } catch (\Exception $e) {
                // Keep transaction even if cash log fails
            }

            ActivityLogger::log(
                'transaction',
                'Penjualan',
                "Transaksi kasir berhasil #{$transaction->invoice_number} ({$transaction->customer_name}) Total: Rp " . number_format($totalAmount, 0, ',', '.'),
                ['invoice' => $transaction->invoice_number, 'total' => $totalAmount, 'items_count' => count($itemsToCreate)]
            );

            return redirect()->route('transactions.show', $transaction->id)
                ->with('success', 'Transaksi berhasil disimpan!');
        });
    }

    /**
     * Transaction history list
     */
    public function index(Request $request)
    {
        $query = Transaction::with(['user', 'items.medicine']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('date')) {
            $query->whereDate('transaction_date', $request->date);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        $transactions = $query->latest('transaction_date')->paginate(10)->withQueryString();

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'date', 'payment_method']),
        ]);
    }

    /**
     * Show invoice receipt
     */
    public function show(Transaction $transaction)
    {
        $transaction->load(['user', 'items.medicine.unit']);

        return Inertia::render('Transactions/Show', [
            'transaction' => $transaction,
        ]);
    }
}
