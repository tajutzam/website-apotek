import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import {
    FileSpreadsheet,
    Plus,
    Search,
    CreditCard,
    DollarSign,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Clock,
    User
} from 'lucide-react';

export default function DebtsIndex({ debts, accounts, filters, summary }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState(null);

    const form = useForm({
        supplier_name: '',
        invoice_number: '',
        total_amount: '',
        due_date: '',
        notes: '',
    });

    const payForm = useForm({
        cash_account_id: accounts[0]?.id || '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            '/finance/debts',
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
        form.post('/finance/debts', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                form.reset();
            },
        });
    };

    const handleOpenPay = (debt) => {
        setSelectedDebt(debt);
        payForm.setData({
            cash_account_id: accounts[0]?.id || '',
            amount: debt.remaining_amount.toString(),
            payment_date: new Date().toISOString().split('T')[0],
            notes: `Pelunasan faktur supplier ${debt.invoice_number || debt.debt_number}`,
        });
        setIsPayModalOpen(true);
    };

    const handlePaySubmit = (e) => {
        e.preventDefault();
        if (!selectedDebt) return;
        payForm.post(`/finance/debts/${selectedDebt.id}/pay`, {
            onSuccess: () => {
                setIsPayModalOpen(false);
                setSelectedDebt(null);
                payForm.reset();
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
            <Head title="Utang Usaha & Pembelian Supplier" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Utang Usaha (Supplier)</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Kelola tagihan pembelian obat dari distributor/PBF, termin jatuh tempo, dan pelunasan kas
                    </p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Catat Utang Baru</span>
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Total Nilai Tagihan Utang</span>
                        <span className="text-base font-bold text-slate-900">{formatRupiah(summary.total_debt)}</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Total Sudah Terbayar</span>
                        <span className="text-base font-bold text-emerald-700">{formatRupiah(summary.total_paid)}</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Sisa Utang Belum Lunas</span>
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
                            placeholder="Cari nama supplier, no. faktur, atau nomor utang..."
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

            {/* Debts Table */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                                <th className="py-3 px-4">No. Utang & Faktur</th>
                                <th className="py-3 px-4">Nama Supplier / Distributor</th>
                                <th className="py-3 px-4">Total Tagihan</th>
                                <th className="py-3 px-4">Sudah Dibayar</th>
                                <th className="py-3 px-4">Sisa Tagihan</th>
                                <th className="py-3 px-4">Jatuh Tempo</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {debts.data.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-12 text-slate-400">
                                        Tidak ada data utang usaha
                                    </td>
                                </tr>
                            ) : (
                                debts.data.map((debt) => (
                                    <tr key={debt.id} className="hover:bg-slate-50/70">
                                        <td className="py-3.5 px-4 font-mono font-bold text-teal-700">
                                            {debt.debt_number}
                                            {debt.invoice_number && (
                                                <span className="text-[10px] text-slate-400 block">
                                                    Faktur: {debt.invoice_number}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-slate-800">
                                            {debt.supplier_name}
                                        </td>
                                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                                            {formatRupiah(debt.total_amount)}
                                        </td>
                                        <td className="py-3.5 px-4 font-semibold text-emerald-600">
                                            {formatRupiah(debt.paid_amount)}
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-rose-600">
                                            {formatRupiah(debt.remaining_amount)}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                                            {debt.due_date || '-'}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {getStatusBadge(debt.status)}
                                        </td>
                                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                            {debt.status !== 'paid' && (
                                                <button
                                                    onClick={() => handleOpenPay(debt)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white rounded-md font-semibold text-xs transition-colors"
                                                >
                                                    <CreditCard className="w-3.5 h-3.5" />
                                                    <span>Bayar Utang</span>
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

            {/* Modal Tambah Utang */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Catat Utang Pembelian Supplier Baru"
            >
                <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Nama Supplier / PBF *</label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: PT. Kimia Farma Trading & Dist"
                            value={form.data.supplier_name}
                            onChange={(e) => form.setData('supplier_name', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">No. Faktur Supplier</label>
                            <input
                                type="text"
                                placeholder="FAK-SUP-001"
                                value={form.data.invoice_number}
                                onChange={(e) => form.setData('invoice_number', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Total Tagihan (Rp) *</label>
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
                        <label className="block font-semibold text-slate-700 mb-1">Catatan / Keterangan</label>
                        <textarea
                            rows="2"
                            value={form.data.notes}
                            onChange={(e) => form.setData('notes', e.target.value)}
                            placeholder="Keterangan pengiriman atau rincian obat..."
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
                            {form.processing ? 'Menyimpan...' : 'Simpan Utang'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Bayar Utang */}
            <Modal
                isOpen={isPayModalOpen}
                onClose={() => setIsPayModalOpen(false)}
                title="Pembayaran Utang Supplier"
            >
                <form onSubmit={handlePaySubmit} className="space-y-4 text-xs">
                    {selectedDebt && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                            <div className="flex justify-between font-bold text-slate-800">
                                <span>Supplier: {selectedDebt.supplier_name}</span>
                                <span className="text-rose-600">Sisa: {formatRupiah(selectedDebt.remaining_amount)}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono">
                                No. Utang: {selectedDebt.debt_number} {selectedDebt.invoice_number ? `(${selectedDebt.invoice_number})` : ''}
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Bayar Menggunakan Akun Kas *</label>
                        <select
                            required
                            value={payForm.data.cash_account_id}
                            onChange={(e) => payForm.setData('cash_account_id', e.target.value)}
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
                            <label className="block font-semibold text-slate-700 mb-1">Jumlah Bayar (Rp) *</label>
                            <input
                                type="number"
                                min="1"
                                max={selectedDebt?.remaining_amount}
                                required
                                value={payForm.data.amount}
                                onChange={(e) => payForm.setData('amount', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 font-bold"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Tanggal Bayar *</label>
                            <input
                                type="date"
                                required
                                value={payForm.data.payment_date}
                                onChange={(e) => payForm.setData('payment_date', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Catatan Pembayaran</label>
                        <input
                            type="text"
                            value={payForm.data.notes}
                            onChange={(e) => payForm.setData('notes', e.target.value)}
                            placeholder="Keterangan bukti transfer..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsPayModalOpen(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={payForm.processing}
                            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                        >
                            {payForm.processing ? 'Memproses...' : 'Konfirmasi Bayar'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
