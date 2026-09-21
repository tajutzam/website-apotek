import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import {
    ReceiptText,
    Search,
    Filter,
    Eye,
    XCircle,
    CheckCircle2,
    RotateCcw,
    Calendar,
    CreditCard,
    DollarSign,
    User,
    AlertTriangle
} from 'lucide-react';

export default function SalesIndex({ transactions, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [date, setDate] = useState(filters.date || '');
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || '');

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const rejectForm = useForm({
        rejection_reason: '',
    });

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            '/sales',
            {
                search: search || undefined,
                status: status || undefined,
                date: date || undefined,
                payment_method: paymentMethod || undefined,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setDate('');
        setPaymentMethod('');
        router.get('/sales');
    };

    const openRejectModal = (trx) => {
        setSelectedTransaction(trx);
        rejectForm.setData({ rejection_reason: '' });
        setIsRejectModalOpen(true);
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        if (!selectedTransaction) return;

        rejectForm.post(`/sales/${selectedTransaction.id}/reject`, {
            onSuccess: () => {
                setIsRejectModalOpen(false);
                setSelectedTransaction(null);
                rejectForm.reset();
            },
        });
    };

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val || 0);
    };

    const getStatusBadge = (st) => {
        switch (st) {
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Berhasil
                    </span>
                );
            case 'returned':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <RotateCcw className="w-3 h-3" /> Ada Retur
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3 h-3" /> Ditolak / Batal
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-800">
                        {st || 'Selesai'}
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Daftar Penjualan & Riwayat Kasir" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Daftar Penjualan</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Seluruh rekaman data transaksi penjualan, invoice pelanggan, dan status pesanan
                    </p>
                </div>
                <Link
                    href="/pos"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-colors"
                >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Buka Kasir POS Baru</span>
                </Link>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-4 relative">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Cari Invoice / Pasien</label>
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                placeholder="INV-2024... / Nama pasien"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-slate-700"
                        >
                            <option value="">Semua Status</option>
                            <option value="completed">Berhasil</option>
                            <option value="returned">Ada Retur</option>
                            <option value="rejected">Ditolak / Batal</option>
                        </select>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Metode Bayar</label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-slate-700"
                        >
                            <option value="">Semua Metode</option>
                            <option value="Cash">Cash</option>
                            <option value="QRIS">QRIS</option>
                            <option value="Transfer">Transfer</option>
                            <option value="Debit">Debit</option>
                        </select>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-2">
                        <button
                            type="submit"
                            className="flex-1 py-1.5 px-3 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors"
                        >
                            Filter
                        </button>
                        {(search || status || date || paymentMethod) && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="py-1.5 px-3 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
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
                                <th className="py-3 px-4">Waktu Transaksi</th>
                                <th className="py-3 px-4">Pasien / Pelanggan</th>
                                <th className="py-3 px-4">Kasir</th>
                                <th className="py-3 px-4">Metode & Item</th>
                                <th className="py-3 px-4">Total Belanja</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {transactions.data.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-12 text-slate-400">
                                        Tidak ditemukan catatan penjualan
                                    </td>
                                </tr>
                            ) : (
                                transactions.data.map((trx) => (
                                    <tr key={trx.id} className="hover:bg-slate-50/70">
                                        <td className="py-3.5 px-4 font-mono font-bold text-teal-700">
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
                                        <td className="py-3.5 px-4">
                                            <span className="font-semibold text-slate-800 block">
                                                {trx.payment_method}
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                                {trx.items?.length || 0} Macam Obat
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-slate-900">
                                            {formatRupiah(trx.total_amount)}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {getStatusBadge(trx.status)}
                                            {trx.status === 'rejected' && trx.rejection_reason && (
                                                <span className="text-[10px] text-rose-600 block mt-0.5 truncate max-w-[150px]" title={trx.rejection_reason}>
                                                    Ket: {trx.rejection_reason}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                            <Link
                                                href={`/transactions/${trx.id}`}
                                                className="inline-flex items-center gap-1 p-1.5 text-teal-600 hover:bg-teal-50 rounded-md font-semibold text-xs transition-colors mr-1"
                                                title="Lihat Struk"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Struk</span>
                                            </Link>
                                            {trx.status !== 'rejected' && (
                                                <button
                                                    onClick={() => openRejectModal(trx)}
                                                    className="inline-flex items-center gap-1 p-1.5 text-rose-600 hover:bg-rose-50 rounded-md font-semibold text-xs transition-colors"
                                                    title="Batalkan / Tolak Transaksi"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    <span>Tolak</span>
                                                </button>
                                            )}
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
                            Total: <span className="font-semibold">{transactions.total}</span> Penjualan
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

            {/* Modal Tolak / Batalkan Transaksi */}
            <Modal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                title="Tolak & Batalkan Transaksi Penjualan"
            >
                <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
                        <div>
                            <p className="font-bold">Perhatian Pembatalan:</p>
                            <p className="text-[11px] mt-0.5">
                                Menolak transaksi invoice <span className="font-bold">{selectedTransaction?.invoice_number}</span> akan mengembalikan kuantitas stok obat yang telah terjual kembali ke inventori secara otomatis.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                            Alasan Penolakan / Pembatalan *
                        </label>
                        <textarea
                            required
                            rows="3"
                            value={rejectForm.data.rejection_reason}
                            onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                            placeholder="Contoh: Pasien membatalkan pesanan, salah input kuantitas, atau pembayaran gagal..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-rose-500 focus:border-rose-500"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsRejectModalOpen(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={rejectForm.processing}
                            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
                        >
                            {rejectForm.processing ? 'Memproses...' : 'Konfirmasi Tolak Transaksi'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
