import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    XCircle,
    Search,
    Eye,
    Calendar,
    ReceiptText,
    DollarSign,
    RotateCcw
} from 'lucide-react';

export default function SalesRejected({ rejectedSales, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            '/sales-rejected',
            { search: search || undefined },
            { preserveState: true }
        );
    };

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val || 0);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Penjualan Tertolak & Dibatalkan" />

            {/* Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Penjualan Tertolak</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Daftar transaksi kasir yang dibatalkan atau ditolak beserta alasan penolakan dan status pemulihan stok
                    </p>
                </div>
            </div>

            {/* Search Filter */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-10 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Cari nomor invoice, nama pelanggan, atau alasan penolakan..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <button
                            type="submit"
                            className="w-full py-2 px-3 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors"
                        >
                            Filter
                        </button>
                    </div>
                </form>
            </div>

            {/* Rejected Sales Table */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                                <th className="py-3 px-4">No. Invoice</th>
                                <th className="py-3 px-4">Waktu Transaksi</th>
                                <th className="py-3 px-4">Pelanggan</th>
                                <th className="py-3 px-4">Kasir</th>
                                <th className="py-3 px-4">Total Tagihan</th>
                                <th className="py-3 px-4">Alasan Penolakan</th>
                                <th className="py-3 px-4">Stok Pulih</th>
                                <th className="py-3 px-4 text-right">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {rejectedSales.data.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-12 text-slate-400">
                                        Tidak ada transaksi yang ditolak atau dibatalkan
                                    </td>
                                </tr>
                            ) : (
                                rejectedSales.data.map((trx) => (
                                    <tr key={trx.id} className="hover:bg-slate-50/70">
                                        <td className="py-3.5 px-4 font-mono font-bold text-rose-600 line-through">
                                            {trx.invoice_number}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600">
                                            {new Date(trx.transaction_date).toLocaleString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-slate-800">
                                            {trx.customer_name}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                                            {trx.user?.name || '-'}
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-slate-900">
                                            {formatRupiah(trx.total_amount)}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                                {trx.rejection_reason || 'Dibatalkan oleh kasir'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                                ✓ Dikembalikan
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                            <Link
                                                href={`/transactions/${trx.id}`}
                                                className="inline-flex items-center gap-1 p-1.5 text-slate-600 hover:bg-slate-100 rounded-md font-semibold text-xs transition-colors"
                                                title="Lihat Detail Transaksi"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Detail</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {rejectedSales.links && rejectedSales.links.length > 3 && (
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div>
                            Total: <span className="font-semibold">{rejectedSales.total}</span> Penjualan Tertolak
                        </div>
                        <div className="flex items-center gap-1">
                            {rejectedSales.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                        link.active
                                            ? 'bg-rose-600 text-white'
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
