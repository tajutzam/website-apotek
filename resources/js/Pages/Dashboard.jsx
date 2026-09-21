import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Pill,
    AlertTriangle,
    ShoppingCart,
    Wallet,
    ArrowUpRight,
    Clock,
    PlusCircle,
    ChevronRight,
    TrendingUp,
    Boxes,
    FileText
} from 'lucide-react';

export default function Dashboard({ stats, recent_transactions, low_stock_medicines, categories_summary }) {
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

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Ringkasan Apotek</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Pantau inventori obat, peringatan stok, dan performa transaksi harian
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <Link
                        href="/medicines"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg shadow-2xs transition-colors"
                    >
                        <Pill className="w-3.5 h-3.5 text-slate-500" />
                        <span>Katalog Obat</span>
                    </Link>
                    <Link
                        href="/pos"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-colors"
                    >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Mulai Transaksi (POS)</span>
                    </Link>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Medicines */}
                <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Obat</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total_medicines}</p>
                        <div className="flex items-center gap-1 mt-1.5 text-[11px] text-teal-600 font-medium">
                            <span>Tersedia di inventori</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                        <Pill className="w-6 h-6" />
                    </div>
                </div>

                {/* Low Stock Warning */}
                <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stok Menipis</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1">{stats.low_stock_count}</p>
                        <div className="flex items-center gap-1 mt-1.5 text-[11px] text-amber-700 font-medium">
                            <span>Perlu restock segera</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                </div>

                {/* Today Transactions */}
                <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaksi Hari Ini</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stats.today_transactions_count}</p>
                        <div className="flex items-center gap-1 mt-1.5 text-[11px] text-indigo-600 font-medium">
                            <span>Transaksi berhasil</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                        <ShoppingCart className="w-6 h-6" />
                    </div>
                </div>

                {/* Today Revenue */}
                <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pendapatan Hari Ini</p>
                        <p className="text-xl font-bold text-slate-900 mt-1 truncate">
                            {formatRupiah(stats.today_revenue)}
                        </p>
                        <div className="flex items-center gap-1 mt-1.5 text-[11px] text-emerald-600 font-medium">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Kas harian terkumpul</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <Wallet className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Middle Section: Recent Transactions & Low Stock Alert */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Transactions Table (2 Cols) */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Transaksi Terakhir</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Daftar transaksi penjualan apotek terbaru</p>
                        </div>
                        <Link
                            href="/transactions"
                            className="text-xs font-semibold text-teal-600 hover:text-teal-800 inline-flex items-center gap-1"
                        >
                            <span>Lihat Semua</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                                    <th className="py-3 px-4">No. Invoice</th>
                                    <th className="py-3 px-4">Pelanggan</th>
                                    <th className="py-3 px-4">Metode</th>
                                    <th className="py-3 px-4">Total</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {recent_transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-8 text-slate-400">
                                            Belum ada transaksi hari ini
                                        </td>
                                    </tr>
                                ) : (
                                    recent_transactions.map((trx) => (
                                        <tr key={trx.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-3 px-4 font-semibold text-slate-900">
                                                {trx.invoice_number}
                                                <span className="block text-[11px] font-normal text-slate-400">
                                                    {formatDate(trx.transaction_date)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-medium">{trx.customer_name}</td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                                                    {trx.payment_method}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-bold text-slate-900">
                                                {formatRupiah(trx.total_amount)}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link
                                                    href={`/transactions/${trx.id}`}
                                                    className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-800 font-semibold"
                                                >
                                                    <span>Detail</span>
                                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Low Stock Warning List (1 Col) */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Peringatan Stok Obat</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Obat yang berada di bawah batas minimum</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            {low_stock_medicines.length} Item
                        </span>
                    </div>

                    <div className="p-4 divide-y divide-slate-100 flex-1 overflow-y-auto">
                        {low_stock_medicines.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-xs">
                                Seluruh stok obat dalam kondisi aman
                            </div>
                        ) : (
                            low_stock_medicines.map((med) => (
                                <div key={med.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                                    <div className="min-w-0 pr-3">
                                        <p className="text-xs font-bold text-slate-900 truncate">{med.name}</p>
                                        <p className="text-[11px] text-slate-500">
                                            {med.location_rack ? `Lokasi: ${med.location_rack}` : 'Lokasi: -'}
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-rose-100 text-rose-700">
                                            Sisa {med.stock} {med.unit?.name || 'Item'}
                                        </span>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Min: {med.min_stock}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                        <Link
                            href="/medicines?stock_status=low"
                            className="text-xs font-semibold text-teal-600 hover:text-teal-800"
                        >
                            Kelola Stok Obat
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Category Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-bold text-slate-800 tracking-tight">Kategori Inventori</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Distribusi jenis obat yang tersedia</p>
                    </div>
                    <Link
                        href="/categories"
                        className="text-xs font-semibold text-teal-600 hover:text-teal-800"
                    >
                        Kelola Kategori
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                    {categories_summary.map((cat) => (
                        <div key={cat.id} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-100/60 transition-colors">
                            <p className="text-xs font-semibold text-slate-800 truncate">{cat.name}</p>
                            <p className="text-lg font-bold text-teal-600 mt-1">{cat.medicines_count}</p>
                            <p className="text-[11px] text-slate-400">Variasi Produk</p>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
