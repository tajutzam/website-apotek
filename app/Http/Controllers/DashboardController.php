<?php

namespace App\Http\Controllers;

use App\Models\CashAccount;
use App\Models\Category;
use App\Models\Debt;
use App\Models\Medicine;
use App\Models\Receivable;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        // 1. Core KPIs
        $totalMedicines = Medicine::count();
        $totalStockUnits = Medicine::sum('stock');
        $totalInventoryValue = Medicine::sum(DB::raw('stock * purchase_price'));
        
        $lowStockCount = Medicine::whereColumn('stock', '<=', 'min_stock')->where('stock', '>', 0)->count();
        $emptyStockCount = Medicine::where('stock', '<=', 0)->count();
        
        $expiringCount = Medicine::whereNotNull('expired_date')
            ->where('expired_date', '<=', Carbon::now()->addMonths(6))
            ->count();

        $todayTransactionsCount = Transaction::whereDate('transaction_date', $today)->where('status', '!=', 'rejected')->count();
        $todayRevenue = Transaction::whereDate('transaction_date', $today)->where('status', '!=', 'rejected')->sum('total_amount');
        
        $monthRevenue = Transaction::whereDate('transaction_date', '>=', $thisMonth)->where('status', '!=', 'rejected')->sum('total_amount');

        // Total Kas & Keuangan
        $totalCashLiquidity = CashAccount::where('is_active', true)->sum('current_balance');
        $totalRemainingDebt = Debt::sum('remaining_amount');
        $totalRemainingReceivable = Receivable::sum('remaining_amount');

        // 2. 7-Days Trend (Support transaction_date or created_at)
        $days = collect(range(6, 0))->map(function ($daysAgo) {
            $date = Carbon::today()->subDays($daysAgo);
            $dateStr = $date->format('Y-m-d');
            $dayLabel = $date->locale('id')->isoFormat('ddd, D MMM');

            // Query matching by DATE(transaction_date) or DATE(created_at)
            $revenue = Transaction::where(function ($q) use ($dateStr) {
                    $q->whereDate('transaction_date', $dateStr)
                      ->orWhere(function ($sub) use ($dateStr) {
                          $sub->whereNull('transaction_date')->whereDate('created_at', $dateStr);
                      });
                })
                ->where('status', '!=', 'rejected')
                ->sum('total_amount');

            $count = Transaction::where(function ($q) use ($dateStr) {
                    $q->whereDate('transaction_date', $dateStr)
                      ->orWhere(function ($sub) use ($dateStr) {
                          $sub->whereNull('transaction_date')->whereDate('created_at', $dateStr);
                      });
                })
                ->where('status', '!=', 'rejected')
                ->count();

            return [
                'date' => $dateStr,
                'label' => $dayLabel,
                'revenue' => (float) $revenue,
                'transactions' => (int) $count,
            ];
        });

        // 3. Payment Methods Breakdown
        $paymentBreakdown = Transaction::where('status', '!=', 'rejected')
            ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
            ->groupBy('payment_method')
            ->get();

        // 4. Top 5 Best Selling Medicines
        $topMedicines = TransactionItem::with('medicine.unit')
            ->select('medicine_id', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(subtotal) as total_sales'))
            ->groupBy('medicine_id')
            ->orderByDesc('total_qty')
            ->take(5)
            ->get();

        // 5. Recent 6 transactions
        $recentTransactions = Transaction::with(['user', 'items.medicine'])
            ->latest('id')
            ->take(6)
            ->get();

        // 6. Low stock medicines alert list
        $lowStockMedicines = Medicine::with(['category', 'unit'])
            ->whereColumn('stock', '<=', 'min_stock')
            ->orderBy('stock', 'asc')
            ->take(5)
            ->get();

        // 7. Categories summary
        $categoriesSummary = Category::withCount('medicines')
            ->orderBy('medicines_count', 'desc')
            ->take(6)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'total_medicines' => $totalMedicines,
                'total_stock_units' => (int) $totalStockUnits,
                'total_inventory_value' => (float) $totalInventoryValue,
                'low_stock_count' => $lowStockCount,
                'empty_stock_count' => $emptyStockCount,
                'expiring_count' => $expiringCount,
                'today_transactions_count' => $todayTransactionsCount,
                'today_revenue' => (float) $todayRevenue,
                'month_revenue' => (float) $monthRevenue,
                'total_cash_liquidity' => (float) $totalCashLiquidity,
                'total_debt' => (float) $totalRemainingDebt,
                'total_receivable' => (float) $totalRemainingReceivable,
            ],
            'trend_data' => $days,
            'payment_breakdown' => $paymentBreakdown,
            'top_medicines' => $topMedicines,
            'recent_transactions' => $recentTransactions,
            'low_stock_medicines' => $lowStockMedicines,
            'categories_summary' => $categoriesSummary,
        ]);
    }
}
