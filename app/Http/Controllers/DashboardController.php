<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Medicine;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        
        $totalMedicines = Medicine::count();
        $lowStockCount = Medicine::whereColumn('stock', '<=', 'min_stock')->count();
        
        $expiringCount = Medicine::whereNotNull('expired_date')
            ->where('expired_date', '<=', Carbon::now()->addMonths(6))
            ->count();

        $todayTransactionsCount = Transaction::whereDate('transaction_date', $today)->count();
        $todayRevenue = Transaction::whereDate('transaction_date', $today)->sum('total_amount');

        // Recent 5 transactions
        $recentTransactions = Transaction::with(['user', 'items.medicine'])
            ->latest('transaction_date')
            ->take(5)
            ->get();

        // Low stock medicines list
        $lowStockMedicines = Medicine::with(['category', 'unit'])
            ->whereColumn('stock', '<=', 'min_stock')
            ->orderBy('stock', 'asc')
            ->take(6)
            ->get();

        // Categories summary
        $categoriesSummary = Category::withCount('medicines')
            ->orderBy('medicines_count', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_medicines' => $totalMedicines,
                'low_stock_count' => $lowStockCount,
                'expiring_count' => $expiringCount,
                'today_transactions_count' => $todayTransactionsCount,
                'today_revenue' => (float) $todayRevenue,
            ],
            'recent_transactions' => $recentTransactions,
            'low_stock_medicines' => $lowStockMedicines,
            'categories_summary' => $categoriesSummary,
        ]);
    }
}
