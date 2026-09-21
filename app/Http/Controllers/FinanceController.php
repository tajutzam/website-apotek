<?php

namespace App\Http\Controllers;

use App\Models\CashAccount;
use App\Models\CashBook;
use App\Models\Debt;
use App\Models\DebtPayment;
use App\Models\Receivable;
use App\Models\ReceivablePayment;
use App\Services\ActivityLogger;
use App\Services\CashService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FinanceController extends Controller
{
    /**
     * 1. Daftar Akun Kas & Bank
     */
    public function accounts(Request $request)
    {
        // Auto initialize default accounts if empty
        if (CashAccount::count() === 0) {
            CashService::getDefaultCashAccount();
            CashService::getDefaultBankAccount('bank');
            CashService::getDefaultBankAccount('e-wallet');
        }

        $accounts = CashAccount::withCount('cashBooks')->latest()->get();
        $totalCash = $accounts->where('type', 'cash')->sum('current_balance');
        $totalBank = $accounts->where('type', 'bank')->sum('current_balance');
        $totalEwallet = $accounts->where('type', 'e-wallet')->sum('current_balance');
        $grandTotal = $accounts->sum('current_balance');

        return Inertia::render('Finance/Accounts', [
            'accounts' => $accounts,
            'summary' => [
                'total_cash' => (float) $totalCash,
                'total_bank' => (float) $totalBank,
                'total_ewallet' => (float) $totalEwallet,
                'grand_total' => (float) $grandTotal,
            ],
        ]);
    }

    public function storeAccount(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:cash_accounts,code'],
            'name' => ['required', 'string', 'max:100'],
            'account_number' => ['nullable', 'string', 'max:50'],
            'type' => ['required', 'in:cash,bank,e-wallet'],
            'opening_balance' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
        ]);

        $validated['current_balance'] = $validated['opening_balance'];

        $account = CashAccount::create($validated);

        ActivityLogger::log('create', 'Keuangan', "Menambahkan akun kas baru: {$account->name} ({$account->code})");

        return redirect()->back()->with('success', "Akun kas {$account->name} berhasil ditambahkan.");
    }

    public function updateAccount(Request $request, CashAccount $account)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:cash_accounts,code,' . $account->id],
            'name' => ['required', 'string', 'max:100'],
            'account_number' => ['nullable', 'string', 'max:50'],
            'type' => ['required', 'in:cash,bank,e-wallet'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $account->update($validated);

        ActivityLogger::log('update', 'Keuangan', "Memperbarui akun kas: {$account->name}");

        return redirect()->back()->with('success', "Akun kas {$account->name} berhasil diperbarui.");
    }

    /**
     * 2. Buku Kas & Jurnal Mutasi (Cash Book)
     */
    public function cashBook(Request $request)
    {
        if (CashAccount::count() === 0) {
            CashService::getDefaultCashAccount();
            CashService::getDefaultBankAccount('bank');
        }

        $query = CashBook::with(['cashAccount', 'user']);

        if ($request->filled('cash_account_id')) {
            $query->where('cash_account_id', $request->cash_account_id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('date')) {
            $query->whereDate('transaction_date', $request->date);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('entry_number', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%");
            });
        }

        $cashBooks = $query->latest('transaction_date')->latest('id')->paginate(15)->withQueryString();

        $accounts = CashAccount::where('is_active', true)->get();

        // Summary calculations
        $totalIn = CashBook::where('type', 'in')->sum('amount');
        $totalOut = CashBook::where('type', 'out')->sum('amount');

        return Inertia::render('Finance/CashBook', [
            'cashBooks' => $cashBooks,
            'accounts' => $accounts,
            'filters' => $request->only(['cash_account_id', 'type', 'category', 'date', 'search']),
            'summary' => [
                'total_in' => (float) $totalIn,
                'total_out' => (float) $totalOut,
                'net_balance' => (float) ($totalIn - $totalOut),
            ],
        ]);
    }

    public function storeCashEntry(Request $request)
    {
        $validated = $request->validate([
            'cash_account_id' => ['required', 'exists:cash_accounts,id'],
            'type' => ['required', 'in:in,out'],
            'category' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'min:1'],
            'description' => ['required', 'string', 'max:255'],
            'reference_number' => ['nullable', 'string', 'max:100'],
        ]);

        $account = CashAccount::findOrFail($validated['cash_account_id']);

        if ($validated['type'] === 'out' && $account->current_balance < $validated['amount']) {
            return back()->with('error', "Saldo akun {$account->name} tidak mencukupi untuk pengeluaran ini.");
        }

        DB::transaction(function () use ($account, $validated) {
            CashService::recordMutation(
                $account,
                $validated['type'],
                $validated['category'],
                (float) $validated['amount'],
                $validated['description'],
                null,
                null,
                $validated['reference_number']
            );

            ActivityLogger::log(
                'transaction',
                'Keuangan',
                "Entri buku kas ({$validated['type']}) Rp " . number_format($validated['amount'], 0, ',', '.') . " pada akun {$account->name} - {$validated['description']}"
            );
        });

        return redirect()->back()->with('success', 'Transaksi kas berhasil dicatat ke buku kas.');
    }

    /**
     * 3. Utang Usaha (Accounts Payable)
     */
    public function debts(Request $request)
    {
        $query = Debt::with(['payments.cashAccount', 'payments.user']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('supplier_name', 'like', "%{$search}%")
                  ->orWhere('debt_number', 'like', "%{$search}%")
                  ->orWhere('invoice_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $debts = $query->latest()->paginate(10)->withQueryString();
        $accounts = CashAccount::where('is_active', true)->get();

        $totalDebt = Debt::sum('total_amount');
        $totalPaid = Debt::sum('paid_amount');
        $totalRemaining = Debt::sum('remaining_amount');

        return Inertia::render('Finance/Debts', [
            'debts' => $debts,
            'accounts' => $accounts,
            'filters' => $request->only(['search', 'status']),
            'summary' => [
                'total_debt' => (float) $totalDebt,
                'total_paid' => (float) $totalPaid,
                'total_remaining' => (float) $totalRemaining,
            ],
        ]);
    }

    public function storeDebt(Request $request)
    {
        $validated = $request->validate([
            'supplier_name' => ['required', 'string', 'max:150'],
            'invoice_number' => ['nullable', 'string', 'max:100'],
            'total_amount' => ['required', 'numeric', 'min:1'],
            'due_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $debtNumber = 'UTG-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

        $debt = Debt::create([
            'debt_number' => $debtNumber,
            'supplier_name' => $validated['supplier_name'],
            'invoice_number' => $validated['invoice_number'],
            'total_amount' => $validated['total_amount'],
            'paid_amount' => 0,
            'remaining_amount' => $validated['total_amount'],
            'due_date' => $validated['due_date'],
            'status' => 'unpaid',
            'notes' => $validated['notes'],
        ]);

        ActivityLogger::log('create', 'Keuangan', "Mencatat utang usaha baru #{$debtNumber} ke {$debt->supplier_name} sebesar Rp " . number_format($debt->total_amount, 0, ',', '.'));

        return redirect()->back()->with('success', "Data utang ke {$debt->supplier_name} berhasil dicatat.");
    }

    public function payDebt(Request $request, Debt $debt)
    {
        $validated = $request->validate([
            'cash_account_id' => ['required', 'exists:cash_accounts,id'],
            'amount' => ['required', 'numeric', 'min:1', 'max:' . $debt->remaining_amount],
            'payment_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $account = CashAccount::findOrFail($validated['cash_account_id']);
        if ($account->current_balance < $validated['amount']) {
            return back()->with('error', "Saldo kas/bank {$account->name} tidak cukup untuk membayar utang ini.");
        }

        DB::transaction(function () use ($debt, $account, $validated) {
            $amount = (float) $validated['amount'];
            $newPaid = $debt->paid_amount + $amount;
            $newRemaining = $debt->total_amount - $newPaid;
            $status = $newRemaining <= 0 ? 'paid' : 'partial';

            $paymentNumber = 'BAYAR-UTG-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

            DebtPayment::create([
                'payment_number' => $paymentNumber,
                'debt_id' => $debt->id,
                'cash_account_id' => $account->id,
                'user_id' => Auth::id(),
                'amount' => $amount,
                'payment_date' => $validated['payment_date'],
                'payment_method' => $account->name,
                'notes' => $validated['notes'],
            ]);

            $debt->update([
                'paid_amount' => $newPaid,
                'remaining_amount' => $newRemaining,
                'status' => $status,
            ]);

            // Deduct cash from selected account
            CashService::recordMutation(
                $account,
                'out',
                'pembayaran_utang',
                $amount,
                "Pembayaran utang usaha {$debt->debt_number} ke {$debt->supplier_name}",
                Debt::class,
                $debt->id,
                $debt->debt_number
            );

            ActivityLogger::log(
                'transaction',
                'Keuangan',
                "Pembayaran utang #{$debt->debt_number} ({$debt->supplier_name}) sebesar Rp " . number_format($amount, 0, ',', '.') . " melalui {$account->name}"
            );
        });

        return redirect()->back()->with('success', 'Pembayaran utang berhasil diproses & saldo kas telah dipotong.');
    }

    /**
     * 4. Piutang Usaha (Accounts Receivable)
     */
    public function receivables(Request $request)
    {
        $query = Receivable::with(['transaction', 'payments.cashAccount', 'payments.user']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('receivable_number', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $receivables = $query->latest()->paginate(10)->withQueryString();
        $accounts = CashAccount::where('is_active', true)->get();

        $totalReceivable = Receivable::sum('total_amount');
        $totalPaid = Receivable::sum('paid_amount');
        $totalRemaining = Receivable::sum('remaining_amount');

        return Inertia::render('Finance/Receivables', [
            'receivables' => $receivables,
            'accounts' => $accounts,
            'filters' => $request->only(['search', 'status']),
            'summary' => [
                'total_receivable' => (float) $totalReceivable,
                'total_paid' => (float) $totalPaid,
                'total_remaining' => (float) $totalRemaining,
            ],
        ]);
    }

    public function storeReceivable(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:150'],
            'customer_phone' => ['nullable', 'string', 'max:25'],
            'total_amount' => ['required', 'numeric', 'min:1'],
            'due_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $receivableNumber = 'PIU-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

        $receivable = Receivable::create([
            'receivable_number' => $receivableNumber,
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'],
            'total_amount' => $validated['total_amount'],
            'paid_amount' => 0,
            'remaining_amount' => $validated['total_amount'],
            'due_date' => $validated['due_date'],
            'status' => 'unpaid',
            'notes' => $validated['notes'],
        ]);

        ActivityLogger::log('create', 'Keuangan', "Mencatat piutang usaha baru #{$receivableNumber} atas nama {$receivable->customer_name} sebesar Rp " . number_format($receivable->total_amount, 0, ',', '.'));

        return redirect()->back()->with('success', "Data piutang {$receivable->customer_name} berhasil dicatat.");
    }

    public function receivePayment(Request $request, Receivable $receivable)
    {
        $validated = $request->validate([
            'cash_account_id' => ['required', 'exists:cash_accounts,id'],
            'amount' => ['required', 'numeric', 'min:1', 'max:' . $receivable->remaining_amount],
            'payment_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $account = CashAccount::findOrFail($validated['cash_account_id']);

        DB::transaction(function () use ($receivable, $account, $validated) {
            $amount = (float) $validated['amount'];
            $newPaid = $receivable->paid_amount + $amount;
            $newRemaining = $receivable->total_amount - $newPaid;
            $status = $newRemaining <= 0 ? 'paid' : 'partial';

            $paymentNumber = 'TERIMA-PIU-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

            ReceivablePayment::create([
                'payment_number' => $paymentNumber,
                'receivable_id' => $receivable->id,
                'cash_account_id' => $account->id,
                'user_id' => Auth::id(),
                'amount' => $amount,
                'payment_date' => $validated['payment_date'],
                'payment_method' => $account->name,
                'notes' => $validated['notes'],
            ]);

            $receivable->update([
                'paid_amount' => $newPaid,
                'remaining_amount' => $newRemaining,
                'status' => $status,
            ]);

            // Add cash masuk into selected account
            CashService::recordMutation(
                $account,
                'in',
                'pelunasan_piutang',
                $amount,
                "Penerimaan pelunasan piutang {$receivable->receivable_number} dari {$receivable->customer_name}",
                Receivable::class,
                $receivable->id,
                $receivable->receivable_number
            );

            ActivityLogger::log(
                'transaction',
                'Keuangan',
                "Penerimaan pembayaran piutang #{$receivable->receivable_number} ({$receivable->customer_name}) sebesar Rp " . number_format($amount, 0, ',', '.') . " masuk ke {$account->name}"
            );
        });

        return redirect()->back()->with('success', 'Penerimaan piutang berhasil dicatat & saldo kas telah bertambah.');
    }
}
