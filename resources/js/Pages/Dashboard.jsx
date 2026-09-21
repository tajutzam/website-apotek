import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Pill,
    AlertTriangle,
    ShoppingCart,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    PlusCircle,
    ChevronRight,
    TrendingUp,
    Boxes,
    FileText,
    CreditCard,
    DollarSign,
    Layers,
    Activity,
    Landmark,
    Receipt,
    Sparkles,
    BarChart3,
    Eye
} from 'lucide-react';

export default function Dashboard({
    stats,
    trend_data = [],
    payment_breakdown = [],
    top_medicines = [],
    recent_transactions = [],
    low_stock_medicines = [],
    categories_summary = []
}) {
    const [activeChartTab, setActiveChartTab] = useState('revenue'); // 'revenue' or 'transactions'

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Calculate max values for dynamic bar heights in chart
    const maxRevenue = Math.max(...trend_data.map((d) => d.revenue), 100000);
    const maxTrx = Math.max(...trend_data.map((d) => d.transactions), 5);

    const totalPaymentSum = payment_breakdown.reduce((acc, curr) => acc + parseFloat(curr.total || 0), 0) || 1;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard - MEDIKASA" />

            {/* Clean Executive Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div>
                    <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                        Ringkasan Operasional Apotek
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Pemantauan real-time transaksi kasir, persediaan stok obat, dan posisi keuangan apotek
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <Link
                        href="/inventory"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        <Boxes className="w-4 h-4 text-slate-500" />
                        <span>Persediaan</span>
                    </Link>
                    <Link
                        href="/pos"
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Buka Kasir POS</span>
                    </Link>
                </div>
            </div>

            {/* Main 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Pendapatan Hari Ini */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Omset Hari Ini
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900 mt-2 truncate">
                        {formatRupiah(stats.today_revenue)}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-slate-100">
                        <span className="text-slate-500 font-medium">Transaksi Selesai:</span>
                        <span className="font-bold text-slate-800">{stats.today_transactions_count} Transaksi</span>
                    </div>
                </div>

                {/* 2. Saldo Kas & Bank */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Likuiditas Kas & Bank
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-blue-700 mt-2 truncate">
                        {formatRupiah(stats.total_cash_liquidity)}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-slate-100">
                        <span className="text-slate-500 font-medium">Bulan Ini:</span>
                        <span className="font-bold text-emerald-600">{formatRupiah(stats.month_revenue)}</span>
                    </div>
                </div>

                {/* 3. Total Valuasi Persediaan Obat */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Aset Persediaan Obat
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                            <Boxes className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900 mt-2 truncate">
                        {formatRupiah(stats.total_inventory_value)}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-slate-100">
                        <span className="text-slate-500 font-medium">Total Produk:</span>
                        <span className="font-bold text-slate-800">{stats.total_medicines} Jenis ({stats.total_stock_units} Unit)</span>
                    </div>
                </div>

                {/* 4. Peringatan Stok & Expired */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Peringatan Inventori
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                        <p className="text-2xl font-black text-amber-600">
                            {stats.low_stock_count}
                        </p>
                        <span className="text-xs text-slate-500 font-medium">Menipis</span>
                        <span className="text-slate-300">/</span>
                        <p className="text-2xl font-black text-rose-600">
                            {stats.expiring_count}
                        </p>
                        <span className="text-xs text-slate-500 font-medium">Akan Expired</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-slate-100">
                        <span className="text-slate-500 font-medium">Stok Kosong:</span>
                        <span className="font-bold text-rose-600">{stats.empty_stock_count} Obat Habis</span>
                    </div>
                </div>
            </div>

            {/* Visual Analytics Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 7-Days Trend Interactive Chart (8 Cols) */}
                <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                    <span>Tren Penjualan 7 Hari Terakhir</span>
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Grafik pergerakan omset harian dan volume transaksi apotek
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                                <button
                                    onClick={() => setActiveChartTab('revenue')}
                                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                                        activeChartTab === 'revenue'
                                            ? 'bg-blue-600 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Omset (Rp)
                                </button>
                                <button
                                    onClick={() => setActiveChartTab('transactions')}
                                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                                        activeChartTab === 'transactions'
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Jumlah Transaksi
                                </button>
                            </div>
                        </div>

                        {/* Professional Visual Chart Area */}
                        <div className="mt-6">
                            {/* SVG Interactive Line & Area Chart */}
                            <div className="relative h-64 w-full bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
                                {/* Horizontal Grid Lines with Y-Axis Values */}
                                <div className="absolute inset-0 px-4 py-6 flex flex-col justify-between pointer-events-none opacity-40">
                                    <div className="border-b border-slate-200 w-full flex justify-between text-[9px] text-slate-400 font-mono">
                                        <span>{activeChartTab === 'revenue' ? formatRupiah(maxRevenue) : `${maxTrx} Trx`}</span>
                                    </div>
                                    <div className="border-b border-slate-200 w-full flex justify-between text-[9px] text-slate-400 font-mono">
                                        <span>{activeChartTab === 'revenue' ? formatRupiah(maxRevenue / 2) : `${Math.round(maxTrx / 2)} Trx`}</span>
                                    </div>
                                    <div className="border-b border-slate-200 w-full flex justify-between text-[9px] text-slate-400 font-mono">
                                        <span>0</span>
                                    </div>
                                </div>

                                {/* Bars with Heights & Values */}
                                <div className="relative z-10 h-full flex items-end justify-between gap-3 sm:gap-6 pt-4 pb-1 px-2">
                                    {trend_data.map((item, idx) => {
                                        const val = activeChartTab === 'revenue' ? item.revenue : item.transactions;
                                        const max = activeChartTab === 'revenue' ? maxRevenue : maxTrx;
                                        
                                        // Minimum visible height so active bars always stand out clearly
                                        const heightPercent = val > 0 
                                            ? Math.max(18, Math.min(100, Math.round((val / max) * 100)))
                                            : 4;

                                        return (
                                            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
                                                {/* Top Value Floating Badge */}
                                                <div className={`mb-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold transition-all ${
                                                    val > 0 
                                                        ? 'bg-blue-600 text-white shadow-xs' 
                                                        : 'text-slate-300 opacity-0 group-hover:opacity-100'
                                                }`}>
                                                    {activeChartTab === 'revenue'
                                                        ? val > 0 ? formatRupiah(val) : 'Rp 0'
                                                        : `${val}`}
                                                </div>

                                                {/* Bar Column with Gradient and Hover Effect */}
                                                <div className="w-full max-w-[44px] h-full flex items-end justify-center">
                                                    <div
                                                        style={{ height: `${heightPercent}%` }}
                                                        className={`w-full rounded-xl transition-all duration-500 relative shadow-sm ${
                                                            val > 0
                                                                ? activeChartTab === 'revenue'
                                                                    ? 'bg-gradient-to-t from-blue-700 via-blue-600 to-indigo-500 group-hover:from-blue-600 group-hover:to-indigo-400 group-hover:scale-105'
                                                                    : 'bg-gradient-to-t from-emerald-700 via-emerald-600 to-teal-400 group-hover:from-emerald-600 group-hover:to-teal-300 group-hover:scale-105'
                                                                : 'bg-slate-200/80 group-hover:bg-slate-300'
                                                        }`}
                                                    >
                                                        {/* Top Glow Accent */}
                                                        {val > 0 && (
                                                            <div className="absolute top-0 inset-x-0 h-1.5 bg-white/40 rounded-t-xl"></div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Label X-Axis */}
                                                <span className={`text-[10px] font-bold mt-2 text-center block ${
                                                    val > 0 ? 'text-blue-900' : 'text-slate-400'
                                                }`}>
                                                    {item.label.split(',')[0]}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-blue-600"></span>
                                <span>Omset Penjualan</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-emerald-600"></span>
                                <span>Volume Transaksi</span>
                            </div>
                        </div>
                        <Link href="/reports" className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                            <span>Laporan Detail</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Payment Methods & Debt/Receivable Breakdown (4 Cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Payment Distribution */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
                        <h2 className="text-sm font-bold text-slate-900 tracking-tight mb-4 flex items-center justify-between">
                            <span>Metode Pembayaran</span>
                            <CreditCard className="w-4 h-4 text-slate-400" />
                        </h2>

                        <div className="space-y-3.5">
                            {payment_breakdown.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-4">Belum ada data transaksi</p>
                            ) : (
                                payment_breakdown.map((pm) => {
                                    const percent = Math.round((parseFloat(pm.total || 0) / totalPaymentSum) * 100);
                                    return (
                                        <div key={pm.payment_method} className="space-y-1.5">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-slate-800">{pm.payment_method}</span>
                                                <span className="font-semibold text-slate-600">{formatRupiah(pm.total)} ({percent}%)</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    style={{ width: `${percent}%` }}
                                                    className={`h-full rounded-full ${
                                                        pm.payment_method === 'Cash'
                                                            ? 'bg-emerald-500'
                                                            : pm.payment_method === 'QRIS'
                                                            ? 'bg-blue-500'
                                                            : 'bg-indigo-500'
                                                    }`}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Utang & Piutang Mini Card */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
                        <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center justify-between">
                            <span>Kewajiban & Tagihan</span>
                            <DollarSign className="w-4 h-4 text-slate-400" />
                        </h2>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <Link href="/finance/debts" className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 hover:bg-rose-100/60 transition-colors">
                                <span className="text-[10px] font-bold text-rose-700 uppercase block">Utang Usaha</span>
                                <span className="text-sm font-black text-rose-700 block mt-0.5">{formatRupiah(stats.total_debt)}</span>
                                <span className="text-[10px] text-rose-500 font-medium">Tagihan Supplier</span>
                            </Link>

                            <Link href="/finance/receivables" className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 hover:bg-blue-100/60 transition-colors">
                                <span className="text-[10px] font-bold text-blue-700 uppercase block">Piutang Pasien</span>
                                <span className="text-sm font-black text-blue-700 block mt-0.5">{formatRupiah(stats.total_receivable)}</span>
                                <span className="text-[10px] text-blue-500 font-medium">Tagihan Tertagih</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lower Section: Top Products, Low Stock Warning & Recent Sales */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Top 5 Best Selling Medicines */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-sm font-black text-slate-900 tracking-tight">Obat Terlaris (Top Sales)</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Produk dengan volume penjualan terbanyak</p>
                            </div>
                            <Sparkles className="w-4 h-4 text-amber-500" />
                        </div>

                        <div className="divide-y divide-slate-100 mt-2">
                            {top_medicines.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-8">Belum ada data obat terjual</p>
                            ) : (
                                top_medicines.map((item, idx) => (
                                    <div key={idx} className="py-2.5 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                            <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 font-black text-[10px] flex items-center justify-center flex-shrink-0">
                                                {idx + 1}
                                            </span>
                                            <div className="truncate">
                                                <p className="text-xs font-bold text-slate-800 truncate">
                                                    {item.medicine?.name || 'Obat'}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-mono">
                                                    {item.medicine?.code || '-'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <span className="text-xs font-black text-emerald-600 block">
                                                {item.total_qty} {item.medicine?.unit?.name || 'Unit'}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {formatRupiah(item.total_sales)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 text-center">
                        <Link href="/reports" className="text-xs font-bold text-blue-600 hover:text-blue-800">
                            Lihat Rekapitulasi Lengkap
                        </Link>
                    </div>
                </div>

                {/* 2. Peringatan Stok Kritis */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-sm font-black text-slate-900 tracking-tight">Peringatan Stok Menipis</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Kuantitas obat di bawah batas minimum</p>
                            </div>
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                        </div>

                        <div className="divide-y divide-slate-100 mt-2">
                            {low_stock_medicines.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-8">Seluruh stok obat aman</p>
                            ) : (
                                low_stock_medicines.map((med) => (
                                    <div key={med.id} className="py-2.5 flex items-center justify-between">
                                        <div className="min-w-0 pr-2">
                                            <p className="text-xs font-bold text-slate-800 truncate">{med.name}</p>
                                            <p className="text-[10px] text-slate-400">
                                                Rak: {med.location_rack || '-'}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                                Sisa: {med.stock} {med.unit?.name}
                                            </span>
                                            <span className="text-[10px] text-slate-400 block mt-0.5">
                                                Min: {med.min_stock}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 text-center">
                        <Link href="/inventory" className="text-xs font-bold text-amber-600 hover:text-amber-800">
                            Restock Persediaan Obat
                        </Link>
                    </div>
                </div>

                {/* 3. Transaksi Penjualan Terakhir */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-sm font-black text-slate-900 tracking-tight">Transaksi Kasir Terakhir</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Aktivitas struk penjualan terbaru</p>
                            </div>
                            <Receipt className="w-4 h-4 text-blue-600" />
                        </div>

                        <div className="divide-y divide-slate-100 mt-2">
                            {recent_transactions.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-8">Belum ada transaksi hari ini</p>
                            ) : (
                                recent_transactions.map((trx) => (
                                    <div key={trx.id} className="py-2.5 flex items-center justify-between">
                                        <div className="min-w-0 pr-2">
                                            <p className="text-xs font-bold text-slate-800 truncate">{trx.customer_name}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">
                                                {trx.invoice_number} ({formatDate(trx.transaction_date)})
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0 flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-900">
                                                {formatRupiah(trx.total_amount)}
                                            </span>
                                            <Link
                                                href={`/transactions/${trx.id}`}
                                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded"
                                                title="Lihat Struk"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 text-center">
                        <Link href="/sales" className="text-xs font-bold text-blue-600 hover:text-blue-800">
                            Buka Riwayat Penjualan
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
