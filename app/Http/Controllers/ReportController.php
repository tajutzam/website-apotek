<?php

namespace App\Http\Controllers;

use App\Models\Medicine;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->get('type', 'sales'); // 'sales', 'medicines', 'cashier'
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->format('Y-m-d'));
        $paymentMethod = $request->get('payment_method', '');

        // Query filtered transactions
        $transactionsQuery = Transaction::with(['user', 'items.medicine.unit'])
            ->whereDate('transaction_date', '>=', $startDate)
            ->whereDate('transaction_date', '<=', $endDate);

        if ($paymentMethod) {
            $transactionsQuery->where('payment_method', $paymentMethod);
        }

        $transactions = (clone $transactionsQuery)->latest('transaction_date')->get();

        // Summary statistics
        $totalRevenue = $transactions->sum('total_amount');
        $totalTransactions = $transactions->count();

        // Total items sold
        $totalItemsSold = TransactionItem::whereIn('transaction_id', $transactions->pluck('id'))->sum('quantity');

        // Payment method breakdown
        $paymentMethodBreakdown = $transactions->groupBy('payment_method')->map(function ($group, $method) {
            return [
                'method' => $method,
                'count' => $group->count(),
                'total' => $group->sum('total_amount'),
            ];
        })->values();

        // Best selling medicines in date range
        $topMedicines = TransactionItem::with('medicine.unit')
            ->whereIn('transaction_id', $transactions->pluck('id'))
            ->select('medicine_id', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(subtotal) as total_sales'))
            ->groupBy('medicine_id')
            ->orderByDesc('total_sales')
            ->take(10)
            ->get();

        // Low stock & expired summary for inventory report
        $allMedicines = Medicine::with(['category', 'unit'])->orderBy('stock', 'asc')->get();
        $lowStockCount = $allMedicines->where('stock', '<=', 'min_stock')->count();
        $expiredCount = $allMedicines->filter(function ($m) {
            return $m->expired_date && Carbon::parse($m->expired_date)->isPast();
        })->count();

        // Daily trend data for chart/graph
        $dailyTrend = $transactions->groupBy(function ($trx) {
            return Carbon::parse($trx->transaction_date)->format('Y-m-d');
        })->map(function ($items, $date) {
            return [
                'date' => $date,
                'total' => $items->sum('total_amount'),
                'count' => $items->count(),
            ];
        })->values();

        return Inertia::render('Reports/Index', [
            'type' => $type,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'payment_method' => $paymentMethod,
            ],
            'summary' => [
                'total_revenue' => (float) $totalRevenue,
                'total_transactions' => $totalTransactions,
                'total_items_sold' => (int) $totalItemsSold,
                'low_stock_count' => $lowStockCount,
                'expired_count' => $expiredCount,
            ],
            'transactions' => $transactions,
            'payment_breakdown' => $paymentMethodBreakdown,
            'top_medicines' => $topMedicines,
            'medicines' => $allMedicines,
            'daily_trend' => $dailyTrend,
        ]);
    }
}
