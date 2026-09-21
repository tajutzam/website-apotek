import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ReceiptText,
    Search,
    Calendar,
    ArrowUpRight,
    Filter,
    User,
    CreditCard
} from 'lucide-react';

export default function TransactionsIndex({ transactions, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || '');
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || '');

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            '/transactions',
            {
                search: search || undefined,
                date: date || undefined,
                payment_method: paymentMethod || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setDate('');
        setPaymentMethod('');
        router.get('/transactions');
    };

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val || 0);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Riwayat Transaksi Penjualan" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Riwayat Transaksi Penjualan</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Daftar seluruh rekam jejak penjualan, nota tagihan, dan metode pembayaran kasir
                    </p>
                </div>
                <Link
                    href="/pos"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-colors"
                >
                    <ReceiptText className="w-3.5 h-3.5" />
                    <span>Buka Kasir Baru</span>
                </Link>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-4 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Cari no. invoice, nama pelanggan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-700"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-700"
                        >
                            <option value="">Semua Metode Pembayaran</option>
                            <option value="Cash">Cash (Tunai)</option>
                            <option value="QRIS">QRIS</option>
                            <option value="Transfer">Transfer Bank</option>
                            <option value="Debit">Debit Card</option>
                        </select>
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-2">
                        <button
                            type="submit"
                            className="flex-1 py-2 px-3 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors"
                        >
                            Filter
                        </button>
                        {(search || date || paymentMethod) && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="py-2 px-3 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                                <th className="py-3 px-4">No. Invoice</th>
                                <th className="py-3 px-4">Tanggal & Waktu</th>
                                <th className="py-3 px-4">Pelanggan</th>
                                <th className="py-3 px-4">Kasir</th>
                                <th className="py-3 px-4">Metode</th>
                                <th className="py-3 px-4">Total</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {transactions.data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-slate-400">
                                        Tidak ada transaksi yang sesuai
                                    </td>
                                </tr>
                            ) : (
                                transactions.data.map((trx) => (
                                    <tr key={trx.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3.5 px-4 font-bold font-mono text-slate-900">
                                            {trx.invoice_number}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-500">
                                            {formatDate(trx.transaction_date)}
                                        </td>
                                        <td className="py-3.5 px-4 font-medium text-slate-800">
                                            {trx.customer_name}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600">
                                            {trx.user?.name || '-'}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                                                {trx.payment_method}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-slate-900">
                                            {formatRupiah(trx.total_amount)}
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <Link
                                                href={`/transactions/${trx.id}`}
                                                className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-800 font-semibold"
                                            >
                                                <span>Lihat Struk</span>
                                                <ArrowUpRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {transactions.links && transactions.links.length > 3 && (
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div>
                            Menampilkan <span className="font-semibold">{transactions.from || 0}</span> sampai{' '}
                            <span className="font-semibold">{transactions.to || 0}</span> dari{' '}
                            <span className="font-semibold">{transactions.total}</span> transaksi
                        </div>
                        <div className="flex items-center gap-1">
                            {transactions.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                        link.active
                                            ? 'bg-teal-600 text-white'
                                            : link.url
                                            ? 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50'
                                            : 'text-slate-300 bg-slate-50 border border-slate-100 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
