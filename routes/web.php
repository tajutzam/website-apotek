<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Guest Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');
});

// Authenticated Routes
Route::middleware('auth')->group(function () {
    Route::get('/', function () {
        return redirect()->route('dashboard');
    });

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Medicines (Obat)
    Route::resource('medicines', MedicineController::class)->except(['show', 'create', 'edit']);

    // Categories & Units
    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
    Route::post('/units', [CategoryController::class, 'storeUnit'])->name('units.store');
    Route::delete('/units/{unit}', [CategoryController::class, 'destroyUnit'])->name('units.destroy');

    // Modul Penjualan Lengkap
    Route::get('/pos', [TransactionController::class, 'create'])->name('pos.index');
    Route::post('/pos', [TransactionController::class, 'store'])->name('pos.store');
    
    // Daftar Penjualan
    Route::get('/sales', [SalesController::class, 'index'])->name('sales.index');
    Route::get('/transactions', [SalesController::class, 'index'])->name('transactions.index');
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show'])->name('transactions.show');
    Route::post('/sales/{transaction}/reject', [SalesController::class, 'rejectTransaction'])->name('sales.reject');

    // Retur Penjualan
    Route::get('/sales-returns', [SalesController::class, 'returns'])->name('sales.returns');
    Route::post('/sales-returns', [SalesController::class, 'storeReturn'])->name('sales.returns.store');

    // Penjualan Tertolak
    Route::get('/sales-rejected', [SalesController::class, 'rejected'])->name('sales.rejected');

    // Persediaan & Stok (Inventory)
    Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::post('/inventory/adjustments', [InventoryController::class, 'storeAdjustment'])->name('inventory.adjustments.store');

    // Keuangan Apotek Terpadu
    Route::get('/finance/accounts', [FinanceController::class, 'accounts'])->name('finance.accounts');
    Route::post('/finance/accounts', [FinanceController::class, 'storeAccount'])->name('finance.accounts.store');
    Route::put('/finance/accounts/{account}', [FinanceController::class, 'updateAccount'])->name('finance.accounts.update');

    Route::get('/finance/cash-book', [FinanceController::class, 'cashBook'])->name('finance.cash-book');
    Route::post('/finance/cash-book', [FinanceController::class, 'storeCashEntry'])->name('finance.cash-book.store');

    Route::get('/finance/debts', [FinanceController::class, 'debts'])->name('finance.debts');
    Route::post('/finance/debts', [FinanceController::class, 'storeDebt'])->name('finance.debts.store');
    Route::post('/finance/debts/{debt}/pay', [FinanceController::class, 'payDebt'])->name('finance.debts.pay');

    Route::get('/finance/receivables', [FinanceController::class, 'receivables'])->name('finance.receivables');
    Route::post('/finance/receivables', [FinanceController::class, 'storeReceivable'])->name('finance.receivables.store');
    Route::post('/finance/receivables/{receivable}/pay', [FinanceController::class, 'receivePayment'])->name('finance.receivables.pay');

    // Laporan (Reports)
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');

    // Manajemen Pengguna (Users)
    Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);

    // Log Aktivitas (Audit Trail)
    Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
});
