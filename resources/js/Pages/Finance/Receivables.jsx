import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import {
    ReceiptText,
    Plus,
    Search,
    CreditCard,
    DollarSign,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Clock,
    User,
    Phone
} from 'lucide-react';

export default function ReceivablesIndex({ receivables, accounts, filters, summary }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    const [selectedReceivable, setSelectedReceivable] = useState(null);

    const form = useForm({
        customer_name: '',
        customer_phone: '',
        total_amount: '',
        due_date: '',
        notes: '',
    });

    const receiveForm = useForm({
        cash_account_id: accounts[0]?.id || '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            '/finance/receivables',
            { search: search || undefined, status: status || undefined },
            { preserveState: true }
        );
    };

    const handleOpenAdd = () => {
        form.reset();
        setIsAddModalOpen(true);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        form.post('/finance/receivables', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                form.reset();
            },
        });
    };

    const handleOpenReceive = (rec) => {
        setSelectedReceivable(rec);
        receiveForm.setData({
            cash_account_id: accounts[0]?.id || '',
            amount: rec.remaining_amount.toString(),
            payment_date: new Date().toISOString().split('T')[0],
            notes: `Penerimaan cicilan/lunas piutang ${rec.receivable_number} - ${rec.customer_name}`,
        });
        setIsReceiveModalOpen(true);
    };

    const handleReceiveSubmit = (e) => {
        e.preventDefault();
        if (!selectedReceivable) return;
        receiveForm.post(`/finance/receivables/${selectedReceivable.id}/pay`, {
            onSuccess: () => {
                setIsReceiveModalOpen(false);
                setSelectedReceivable(null);
                receiveForm.reset();
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
            case 'paid':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Lunas
                    </span>
                );
            case 'partial':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" /> Sebagian
                    </span>
                );
            case 'unpaid':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertCircle className="w-3 h-3" /> Belum Dibayar
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Piutang Usaha & Tagihan Pasien" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Piutang Usaha (Pasien / Klinik)</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Kelola buku piutang penjualan obat resep/bon pasien, tempo pembayaran, dan penerimaan kas
                    </p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Catat Piutang Baru</span>
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Total Tagihan Piutang</span>
                        <span className="text-base font-bold text-slate-900">{formatRupiah(summary.total_receivable)}</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Total Sudah Diterima</span>
                        <span className="text-base font-bold text-emerald-700">{formatRupiah(summary.total_paid)}</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Sisa Piutang Tertagih</span>
                        <span className="text-base font-bold text-rose-600">{formatRupiah(summary.total_remaining)}</span>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-8 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Cari nama pasien, no. telepon, atau no. piutang..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>
                    <div className="sm:col-span-3">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-slate-700"
                        >
                            <option value="">Semua Status</option>
                            <option value="unpaid">Belum Dibayar</option>
                            <option value="partial">Sebagian (Belum Lunas)</option>
                            <option value="paid">Lunas</option>
                        </select>
                    </div>
                    <div className="sm:col-span-1">
                        <button
                            type="submit"
                            className="w-full py-2 px-3 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors"
                        >
                            Filter
                        </button>
                    </div>
                </form>
            </div>

            {/* Receivables Table */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                                <th className="py-3 px-4">No. Piutang</th>
                                <th className="py-3 px-4">Nama Pasien / Pelanggan</th>
                                <th className="py-3 px-4">No. HP</th>
                                <th className="py-3 px-4">Total Piutang</th>
                                <th className="py-3 px-4">Sudah Dibayar</th>
                                <th className="py-3 px-4">Sisa Tagihan</th>
                                <th className="py-3 px-4">Jatuh Tempo</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {receivables.data.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-12 text-slate-400">
                                        Tidak ada data piutang usaha
                                    </td>
                                </tr>
                            ) : (
                                receivables.data.map((rec) => (
                                    <tr key={rec.id} className="hover:bg-slate-50/70">
                                        <td className="py-3.5 px-4 font-mono font-bold text-teal-700">
                                            {rec.receivable_number}
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-slate-800">
                                            {rec.customer_name}
                                        </td>
                                        <td className="py-3.5 px-4 font-mono text-slate-600">
                                            {rec.customer_phone || '-'}
                                        </td>
                                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                                            {formatRupiah(rec.total_amount)}
                                        </td>
                                        <td className="py-3.5 px-4 font-semibold text-emerald-600">
                                            {formatRupiah(rec.paid_amount)}
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-rose-600">
                                            {formatRupiah(rec.remaining_amount)}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                                            {rec.due_date || '-'}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {getStatusBadge(rec.status)}
                                        </td>
                                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                            {rec.status !== 'paid' && (
                                                <button
                                                    onClick={() => handleOpenReceive(rec)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white rounded-md font-semibold text-xs transition-colors"
                                                >
                                                    <DollarSign className="w-3.5 h-3.5" />
                                                    <span>Terima Bayar</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tambah Piutang */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Catat Piutang Pelanggan / Pasien Baru"
            >
                <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Nama Pasien / Pelanggan *</label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: dr. Bambang / Klinik Sehat"
                            value={form.data.customer_name}
                            onChange={(e) => form.setData('customer_name', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">No. HP / WA</label>
                            <input
                                type="text"
                                placeholder="08123456789"
                                value={form.data.customer_phone}
                                onChange={(e) => form.setData('customer_phone', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Jumlah Piutang (Rp) *</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={form.data.total_amount}
                                onChange={(e) => form.setData('total_amount', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 font-bold"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Tanggal Jatuh Tempo</label>
                        <input
                            type="date"
                            value={form.data.due_date}
                            onChange={(e) => form.setData('due_date', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Catatan / Rincian Obat</label>
                        <textarea
                            rows="2"
                            value={form.data.notes}
                            onChange={(e) => form.setData('notes', e.target.value)}
                            placeholder="Rincian obat yang dibon..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                        >
                            {form.processing ? 'Menyimpan...' : 'Simpan Piutang'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Terima Bayar Piutang */}
            <Modal
                isOpen={isReceiveModalOpen}
                onClose={() => setIsReceiveModalOpen(false)}
                title="Penerimaan Pembayaran Piutang Pasien"
            >
                <form onSubmit={handleReceiveSubmit} className="space-y-4 text-xs">
                    {selectedReceivable && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                            <div className="flex justify-between font-bold text-slate-800">
                                <span>Pasien: {selectedReceivable.customer_name}</span>
                                <span className="text-rose-600">Sisa Tagihan: {formatRupiah(selectedReceivable.remaining_amount)}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono">
                                No. Piutang: {selectedReceivable.receivable_number}
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Masuk ke Akun Kas / Bank *</label>
                        <select
                            required
                            value={receiveForm.data.cash_account_id}
                            onChange={(e) => receiveForm.setData('cash_account_id', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-slate-700"
                        >
                            {accounts.map((acc) => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.name} - Saldo: {formatRupiah(acc.current_balance)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Jumlah Uang Diterima (Rp) *</label>
                            <input
                                type="number"
                                min="1"
                                max={selectedReceivable?.remaining_amount}
                                required
                                value={receiveForm.data.amount}
                                onChange={(e) => receiveForm.setData('amount', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 font-bold"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Tanggal Terima *</label>
                            <input
                                type="date"
                                required
                                value={receiveForm.data.payment_date}
                                onChange={(e) => receiveForm.setData('payment_date', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Keterangan / Catatan</label>
                        <input
                            type="text"
                            value={receiveForm.data.notes}
                            onChange={(e) => receiveForm.setData('notes', e.target.value)}
                            placeholder="Catatan pelunasan..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsReceiveModalOpen(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={receiveForm.processing}
                            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                        >
                            {receiveForm.processing ? 'Memproses...' : 'Konfirmasi Terima Pembayaran'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
