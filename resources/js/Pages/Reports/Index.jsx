import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    BarChart3,
    Calendar,
    DollarSign,
    ShoppingBag,
    TrendingUp,
    Download,
    Printer,
    FileText,
    Filter,
    Package,
    AlertTriangle,
    CheckCircle2,
    Search
} from 'lucide-react';

export default function ReportsIndex({
    type,
    filters,
    summary,
    transactions,
    payment_breakdown,
    top_medicines,
    medicines,
    daily_trend
}) {
    const [reportType, setReportType] = useState(type || 'sales');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || '');
    const [searchMed, setSearchMed] = useState('');

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            '/reports',
            {
                type: reportType,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                payment_method: paymentMethod || undefined,
            },
            { preserveState: true }
        );
    };

    const handleTabChange = (newType) => {
        setReportType(newType);
        router.get(
            '/reports',
            {
                type: newType,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                payment_method: paymentMethod || undefined,
            },
            { preserveState: true }
        );
    };

    const handlePrint = () => {
        window.print();
    };

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val || 0);
    };

    const filteredMedicines = medicines.filter((m) =>
        m.name.toLowerCase().includes(searchMed.toLowerCase()) ||
        m.code.toLowerCase().includes(searchMed.toLowerCase()) ||
        (m.category?.name && m.category.name.toLowerCase().includes(searchMed.toLowerCase()))
    );

    return (
        <AuthenticatedLayout>
            <Head title="Laporan Penjualan & Inventori" />

            {/* Print Header View Only */}
            <div className="hidden print:block mb-6 border-b border-slate-900 pb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-blue-900">MEDIKASA</h1>
                        <p className="text-xs text-slate-600">Simple Pharmacy POS & Management System</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-sm font-bold uppercase text-slate-800">
                            {reportType === 'sales' ? 'Laporan Penjualan' : 'Laporan Stok Inventori'}
                        </h2>
                        <p className="text-xs text-slate-600">
                            Periode: {startDate} s/d {endDate}
                        </p>
                    </div>
                </div>
            </div>

            {/* Normal Screen Header */}
            <div className="print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Laporan & Rekapitulasi</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Ringkasan performa omset penjualan, perputaran obat, dan status persediaan stok
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg shadow-2xs transition-colors"
                    >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Cetak / PDF</span>
                    </button>
                </div>
            </div>

            {/* Report Type Tabs */}
            <div className="print:hidden flex border-b border-slate-200 gap-6 text-sm font-semibold text-slate-500">
                <button
                    onClick={() => handleTabChange('sales')}
                    className={`pb-3 flex items-center gap-2 border-b-2 font-bold text-xs transition-colors ${
                        reportType === 'sales'
                            ? 'border-teal-600 text-teal-600'
                            : 'border-transparent hover:text-slate-700'
                    }`}
                >
                    <DollarSign className="w-4 h-4" />
                    <span>Laporan Penjualan & Pendapatan</span>
                </button>
                <button
                    onClick={() => handleTabChange('medicines')}
                    className={`pb-3 flex items-center gap-2 border-b-2 font-bold text-xs transition-colors ${
                        reportType === 'medicines'
                            ? 'border-teal-600 text-teal-600'
                            : 'border-transparent hover:text-slate-700'
                    }`}
                >
                    <Package className="w-4 h-4" />
                    <span>Laporan Stok & Perputaran Obat</span>
                </button>
            </div>

            {/* Filter Section */}
            <div className="print:hidden bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Dari Tanggal</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>
                    <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Sampai Tanggal</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>
                    {reportType === 'sales' && (
                        <div className="sm:col-span-3">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Metode Bayar</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-slate-700"
                            >
                                <option value="">Semua Metode</option>
                                <option value="Cash">Cash</option>
                                <option value="QRIS">QRIS</option>
                                <option value="Transfer">Transfer Bank</option>
                                <option value="Debit">Debit</option>
                            </select>
                        </div>
                    )}
                    <div className="sm:col-span-3 flex items-center gap-2">
                        <button
                            type="submit"
                            className="w-full py-2 px-4 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>Terapkan Filter</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* KPI Cards */}
            {reportType === 'sales' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
                        <div className="w-11 h-11 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-medium text-slate-500 block">Total Omset Pendapatan</span>
                            <span className="text-lg font-bold text-slate-900">{formatRupiah(summary.total_revenue)}</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
                        <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-medium text-slate-500 block">Total Transaksi Selesai</span>
                            <span className="text-lg font-bold text-slate-900">{summary.total_transactions} Transaksi</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
                        <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-medium text-slate-500 block">Total Item Obat Terjual</span>
                            <span className="text-lg font-bold text-slate-900">{summary.total_items_sold} Pcs / Unit</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
                        <div className="w-11 h-11 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-medium text-slate-500 block">Total Item Terdaftar</span>
                            <span className="text-lg font-bold text-slate-900">{medicines.length} Jenis Obat</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
                        <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-medium text-slate-500 block">Stok Menipis / Kritis</span>
                            <span className="text-lg font-bold text-amber-600">{summary.low_stock_count} Obat</span>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
                        <div className="w-11 h-11 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-medium text-slate-500 block">Obat Kedaluwarsa</span>
                            <span className="text-lg font-bold text-rose-600">{summary.expired_count} Obat</span>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT 1: SALES REPORT */}
            {reportType === 'sales' && (
                <div className="space-y-6">
                    {/* Payment Method Breakdown & Top Medicines */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Breakdown Metode Bayar */}
                        <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                                Distribusi Pembayaran
                            </h3>
                            <div className="space-y-3">
                                {payment_breakdown.length === 0 ? (
                                    <p className="text-xs text-slate-400 py-4 text-center">Belum ada transaksi</p>
                                ) : (
                                    payment_breakdown.map((item) => (
                                        <div key={item.method} className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                                            <div>
                                                <span className="font-bold text-slate-800">{item.method}</span>
                                                <span className="text-[11px] text-slate-400 block">{item.count} Transaksi</span>
                                            </div>
                                            <span className="font-bold text-slate-900">{formatRupiah(item.total)}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Top Selling Products */}
                        <div className="lg:col-span-8 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                                10 Obat Terlaris (Top Sales)
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                                            <th className="pb-2">Nama Obat</th>
                                            <th className="pb-2 text-center">Qty Terjual</th>
                                            <th className="pb-2 text-right">Total Penjualan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {top_medicines.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="py-4 text-center text-slate-400">
                                                    Tidak ada data penjualan pada rentang tanggal ini.
                                                </td>
                                            </tr>
                                        ) : (
                                            top_medicines.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50">
                                                    <td className="py-2.5 font-bold text-slate-800">
                                                        {item.medicine?.name || 'Obat telah dihapus'}
                                                    </td>
                                                    <td className="py-2.5 text-center font-bold text-teal-600">
                                                        {item.total_qty} {item.medicine?.unit?.name || 'Pcs'}
                                                    </td>
                                                    <td className="py-2.5 text-right font-bold text-slate-900">
                                                        {formatRupiah(item.total_sales)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Transactions Table */}
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                Rincian Rekap Transaksi
                            </h3>
                            <span className="text-xs text-slate-500 font-medium">
                                Total: {transactions.length} Data
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                                        <th className="py-3 px-4">No. Invoice</th>
                                        <th className="py-3 px-4">Tanggal & Waktu</th>
                                        <th className="py-3 px-4">Pasien / Pelanggan</th>
                                        <th className="py-3 px-4">Kasir</th>
                                        <th className="py-3 px-4">Metode</th>
                                        <th className="py-3 px-4">Item Dibeli</th>
                                        <th className="py-3 px-4 text-right">Total Transaksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-10 text-slate-400">
                                                Tidak ada transaksi pada periode ini
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((trx) => (
                                            <tr key={trx.id} className="hover:bg-slate-50/70">
                                                <td className="py-3 px-4 font-mono font-bold text-teal-700">
                                                    {trx.invoice_number}
                                                </td>
                                                <td className="py-3 px-4 text-slate-600">
                                                    {trx.transaction_date}
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-slate-800">
                                                    {trx.customer_name}
                                                </td>
                                                <td className="py-3 px-4 text-slate-600">
                                                    {trx.user?.name || '-'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                                                        {trx.payment_method}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-slate-600">
                                                    {trx.items?.map((item) => `${item.medicine?.name || 'Item'} (${item.quantity})`).join(', ') || '-'}
                                                </td>
                                                <td className="py-3 px-4 text-right font-bold text-slate-900">
                                                    {formatRupiah(trx.total_amount)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-50 font-bold border-t border-slate-200">
                                        <td colSpan="6" className="py-3 px-4 text-right text-slate-800">
                                            GRAND TOTAL:
                                        </td>
                                        <td className="py-3 px-4 text-right text-teal-700 text-sm">
                                            {formatRupiah(summary.total_revenue)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT 2: MEDICINE INVENTORY REPORT */}
            {reportType === 'medicines' && (
                <div className="space-y-4">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                        <div className="relative w-72">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                placeholder="Cari obat di laporan..."
                                value={searchMed}
                                onChange={(e) => setSearchMed(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                            Menampilkan {filteredMedicines.length} Obat
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                                        <th className="py-3 px-4">Kode & Nama Obat</th>
                                        <th className="py-3 px-4">Kategori & Satuan</th>
                                        <th className="py-3 px-4">Harga Beli</th>
                                        <th className="py-3 px-4">Harga Jual</th>
                                        <th className="py-3 px-4">Stok Sekarang</th>
                                        <th className="py-3 px-4">Kedaluwarsa</th>
                                        <th className="py-3 px-4">Lokasi Rak</th>
                                        <th className="py-3 px-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {filteredMedicines.map((med) => {
                                        const isLow = med.stock <= med.min_stock && med.stock > 0;
                                        const isEmpty = med.stock <= 0;

                                        return (
                                            <tr key={med.id} className="hover:bg-slate-50/70">
                                                <td className="py-3 px-4">
                                                    <span className="font-bold text-slate-900 block">{med.name}</span>
                                                    <span className="font-mono text-[11px] text-slate-400">{med.code}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="font-medium text-slate-800 block">{med.category?.name || '-'}</span>
                                                    <span className="text-[11px] text-slate-400">Satuan: {med.unit?.name || '-'}</span>
                                                </td>
                                                <td className="py-3 px-4 font-medium text-slate-600">
                                                    {formatRupiah(med.purchase_price)}
                                                </td>
                                                <td className="py-3 px-4 font-bold text-slate-900">
                                                    {formatRupiah(med.selling_price)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="font-bold text-slate-900">{med.stock}</span>
                                                    <span className="text-[10px] text-slate-400 block">Min: {med.min_stock}</span>
                                                </td>
                                                <td className="py-3 px-4 font-mono text-slate-600">
                                                    {med.expired_date || '-'}
                                                </td>
                                                <td className="py-3 px-4 text-slate-600 font-medium">
                                                    {med.location_rack || '-'}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    {isEmpty ? (
                                                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                                            Habis
                                                        </span>
                                                    ) : isLow ? (
                                                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                                            Menipis
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                                            Aman
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
