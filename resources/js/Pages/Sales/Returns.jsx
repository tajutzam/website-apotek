import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import {
    RotateCcw,
    Plus,
    Search,
    ReceiptText,
    Calendar,
    DollarSign,
    User,
    CheckCircle2,
    Package
} from 'lucide-react';

export default function SalesReturns({ returns, completed_transactions }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState('');

    const form = useForm({
        transaction_id: '',
        reason: 'Obat salah beli / tertukar oleh pasien',
        refund_method: 'Cash',
        notes: '',
        items: [],
    });

    const handleSelectTransaction = (e) => {
        const trxId = e.target.value;
        setSelectedInvoiceId(trxId);
        const trx = completed_transactions.find((t) => String(t.id) === String(trxId));

        if (trx) {
            form.setData({
                ...form.data,
                transaction_id: trx.id,
                items: trx.items.map((item) => ({
                    medicine_id: item.medicine_id,
                    name: item.medicine?.name || 'Obat',
                    max_qty: item.quantity,
                    quantity: item.quantity,
                    refund_price: parseFloat(item.unit_price),
                    restore_stock: true,
                })),
            });
        }
    };

    const handleOpenAddModal = () => {
        form.reset();
        setSelectedInvoiceId('');
        setIsAddModalOpen(true);
    };

    const handleSubmitReturn = (e) => {
        e.preventDefault();
        if (form.data.items.length === 0) {
            alert('Pilih invoice yang memiliki item untuk diretur.');
            return;
        }

        form.post('/sales-returns', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                form.reset();
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

    return (
        <AuthenticatedLayout>
            <Head title="Retur Penjualan Obat" />

            {/* Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Retur Penjualan</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Pencatatan pengembalian obat dari pasien, pengembalian dana (refund), dan pemulihan stok
                    </p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Buat Retur Penjualan</span>
                </button>
            </div>

            {/* Returns Table */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                                <th className="py-3 px-4">No. Retur</th>
                                <th className="py-3 px-4">No. Invoice Asal</th>
                                <th className="py-3 px-4">Waktu Retur</th>
                                <th className="py-3 px-4">Item Diretur</th>
                                <th className="py-3 px-4">Alasan & Metode</th>
                                <th className="py-3 px-4">Total Refund</th>
                                <th className="py-3 px-4 text-right">Petugas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {returns.data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-slate-400">
                                        Belum ada riwayat retur penjualan
                                    </td>
                                </tr>
                            ) : (
                                returns.data.map((ret) => (
                                    <tr key={ret.id} className="hover:bg-slate-50/70">
                                        <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                                            {ret.return_number}
                                        </td>
                                        <td className="py-3.5 px-4 font-mono font-bold text-teal-700">
                                            {ret.transaction?.invoice_number || '-'}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600">
                                            {new Date(ret.return_date).toLocaleString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-800 font-medium">
                                            {ret.items?.map((it) => `${it.medicine?.name} (${it.quantity})`).join(', ') || '-'}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className="font-semibold text-slate-800 block">{ret.reason}</span>
                                            <span className="text-[10px] text-slate-400">Metode: {ret.refund_method}</span>
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-rose-600">
                                            {formatRupiah(ret.total_refund)}
                                        </td>
                                        <td className="py-3.5 px-4 text-right text-slate-600 font-medium">
                                            {ret.user?.name || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {returns.links && returns.links.length > 3 && (
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div>
                            Total: <span className="font-semibold">{returns.total}</span> Retur Penjualan
                        </div>
                        <div className="flex items-center gap-1">
                            {returns.links.map((link, idx) => (
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

            {/* Modal Tambah Retur */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Input Retur Penjualan Pasien"
            >
                <form onSubmit={handleSubmitReturn} className="space-y-4 text-xs">
                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                            Pilih Invoice Penjualan Asal *
                        </label>
                        <select
                            required
                            value={selectedInvoiceId}
                            onChange={handleSelectTransaction}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-slate-800 font-mono text-xs"
                        >
                            <option value="">-- Pilih Transaksi --</option>
                            {completed_transactions.map((trx) => (
                                <option key={trx.id} value={trx.id}>
                                    {trx.invoice_number} - {trx.customer_name} ({formatRupiah(trx.total_amount)})
                                </option>
                            ))}
                        </select>
                    </div>

                    {form.data.items.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-200">
                            <label className="block font-bold text-slate-800">
                                Daftar Obat yang Diretur:
                            </label>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {form.data.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2"
                                    >
                                        <div className="flex justify-between font-bold text-slate-800">
                                            <span>{item.name}</span>
                                            <span>{formatRupiah(item.refund_price * item.quantity)}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 items-center">
                                            <div>
                                                <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                                                    Qty Retur (Maks {item.max_qty})
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={item.max_qty}
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const newItems = [...form.data.items];
                                                        newItems[idx].quantity = Math.min(
                                                            item.max_qty,
                                                            Math.max(1, parseInt(e.target.value) || 1)
                                                        );
                                                        form.setData('items', newItems);
                                                    }}
                                                    className="w-full px-2 py-1 border border-slate-300 rounded bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="flex items-center gap-1.5 cursor-pointer mt-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.restore_stock}
                                                        onChange={(e) => {
                                                            const newItems = [...form.data.items];
                                                            newItems[idx].restore_stock = e.target.checked;
                                                            form.setData('items', newItems);
                                                        }}
                                                        className="rounded text-teal-600 focus:ring-teal-500"
                                                    />
                                                    <span className="text-[11px] font-semibold text-slate-700">
                                                        Kembalikan ke Stok
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Alasan Retur *</label>
                            <input
                                type="text"
                                required
                                value={form.data.reason}
                                onChange={(e) => form.setData('reason', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Metode Refund</label>
                            <select
                                value={form.data.refund_method}
                                onChange={(e) => form.setData('refund_method', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-slate-700"
                            >
                                <option value="Cash">Cash (Uang Tunai)</option>
                                <option value="Transfer">Transfer Bank</option>
                                <option value="Voucher">Voucher Belanja</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
                        <textarea
                            rows="2"
                            value={form.data.notes}
                            onChange={(e) => form.setData('notes', e.target.value)}
                            placeholder="Keterangan tambahan retur..."
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
                            disabled={form.processing || form.data.items.length === 0}
                            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                        >
                            {form.processing ? 'Menyimpan...' : 'Simpan Retur Penjualan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
