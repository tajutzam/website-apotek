import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import {
    BookOpen,
    Plus,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    Calendar,
    Wallet,
    DollarSign,
    Tag
} from 'lucide-react';

export default function CashBookIndex({ cashBooks, accounts, filters, summary }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedAccount, setSelectedAccount] = useState(filters.cash_account_id || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [selectedDate, setSelectedDate] = useState(filters.date || '');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const form = useForm({
        cash_account_id: accounts[0]?.id || '',
        type: 'in', // 'in' or 'out'
        category: 'operasional',
        amount: '',
        description: '',
        reference_number: '',
    });

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            '/finance/cash-book',
            {
                search: search || undefined,
                cash_account_id: selectedAccount || undefined,
                type: selectedType || undefined,
                category: selectedCategory || undefined,
                date: selectedDate || undefined,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setSelectedAccount('');
        setSelectedType('');
        setSelectedCategory('');
        setSelectedDate('');
        router.get('/finance/cash-book');
    };

    const handleOpenAdd = (defaultType = 'in') => {
        form.reset();
        form.setData({
            cash_account_id: accounts[0]?.id || '',
            type: defaultType,
            category: defaultType === 'in' ? 'penjualan' : 'operasional',
            amount: '',
            description: '',
            reference_number: '',
        });
        setIsAddModalOpen(true);
    };

    const handleSubmitEntry = (e) => {
        e.preventDefault();
        form.post('/finance/cash-book', {
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
            <Head title="Buku Kas & Jurnal Mutasi" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Buku Kas & Jurnal Keuangan</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Jurnal pencatatan seluruh aliran arus kas masuk (penerimaan) dan arus kas keluar (pengeluaran)
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleOpenAdd('in')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
                    >
                        <ArrowUpRight className="w-4 h-4" />
                        <span>Kas Masuk</span>
                    </button>
                    <button
                        onClick={() => handleOpenAdd('out')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-colors"
                    >
                        <ArrowDownRight className="w-4 h-4" />
                        <span>Kas Keluar</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <ArrowUpRight className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Total Kas Masuk (Penerimaan)</span>
                        <span className="text-base font-bold text-emerald-700">{formatRupiah(summary.total_in)}</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                        <ArrowDownRight className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Total Kas Keluar (Pengeluaran)</span>
                        <span className="text-base font-bold text-rose-600">{formatRupiah(summary.total_out)}</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Net Saldo Arus Kas</span>
                        <span className="text-base font-bold text-slate-900">{formatRupiah(summary.net_balance)}</span>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-3 relative">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Cari Keterangan / No. Ref</label>
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                placeholder="Cari..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Akun Kas</label>
                        <select
                            value={selectedAccount}
                            onChange={(e) => setSelectedAccount(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-slate-700"
                        >
                            <option value="">Semua Akun</option>
                            {accounts.map((acc) => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.name} ({acc.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Arus Kas</label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-slate-700"
                        >
                            <option value="">Semua Arus</option>
                            <option value="in">Kas Masuk (In)</option>
                            <option value="out">Kas Keluar (Out)</option>
                        </select>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
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
                        {(search || selectedAccount || selectedType || selectedCategory || selectedDate) && (
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

            {/* Cash Book Table */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                                <th className="py-3 px-4">No. Transaksi</th>
                                <th className="py-3 px-4">Waktu</th>
                                <th className="py-3 px-4">Akun Kas / Bank</th>
                                <th className="py-3 px-4">Kategori & Deskripsi</th>
                                <th className="py-3 px-4 text-right">Kas Masuk</th>
                                <th className="py-3 px-4 text-right">Kas Keluar</th>
                                <th className="py-3 px-4 text-right">Saldo Akhir</th>
                                <th className="py-3 px-4 text-right">Petugas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {cashBooks.data.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-12 text-slate-400">
                                        Belum ada catatan mutasi buku kas
                                    </td>
                                </tr>
                            ) : (
                                cashBooks.data.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-slate-50/70">
                                        <td className="py-3 px-4 font-mono font-bold text-teal-700">
                                            {entry.entry_number}
                                        </td>
                                        <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                                            {new Date(entry.transaction_date).toLocaleString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-slate-800">
                                            {entry.cash_account?.name}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="font-bold text-slate-900 block">{entry.description}</span>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
                                                    {entry.category.replace('_', ' ')}
                                                </span>
                                                {entry.reference_number && (
                                                    <span className="text-[10px] font-mono text-slate-400">
                                                        Ref: {entry.reference_number}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right font-bold text-emerald-600">
                                            {entry.type === 'in' ? formatRupiah(entry.amount) : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-right font-bold text-rose-600">
                                            {entry.type === 'out' ? formatRupiah(entry.amount) : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                                            {formatRupiah(entry.balance_after)}
                                        </td>
                                        <td className="py-3 px-4 text-right text-slate-600 font-medium">
                                            {entry.user?.name || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {cashBooks.links && cashBooks.links.length > 3 && (
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div>
                            Total: <span className="font-semibold">{cashBooks.total}</span> Entri Kas
                        </div>
                        <div className="flex items-center gap-1">
                            {cashBooks.links.map((link, idx) => (
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

            {/* Modal Tambah Entri Kas */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={form.data.type === 'in' ? 'Input Kas Masuk (Penerimaan)' : 'Input Kas Keluar (Pengeluaran)'}
            >
                <form onSubmit={handleSubmitEntry} className="space-y-4 text-xs">
                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Pilih Akun Kas / Bank *</label>
                        <select
                            required
                            value={form.data.cash_account_id}
                            onChange={(e) => form.setData('cash_account_id', e.target.value)}
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
                            <label className="block font-semibold text-slate-700 mb-1">Kategori Transaksi *</label>
                            <select
                                value={form.data.category}
                                onChange={(e) => form.setData('category', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-slate-700"
                            >
                                {form.data.type === 'in' ? (
                                    <>
                                        <option value="penjualan">Penjualan Obat</option>
                                        <option value="pelunasan_piutang">Pelunasan Piutang</option>
                                        <option value="pendapatan_lain">Pendapatan Lain-lain</option>
                                        <option value="modal_tambahan">Setoran Modal / Kas</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="operasional">Biaya Operasional & Listrik</option>
                                        <option value="gaji_karyawan">Gaji Petugas / Karyawan</option>
                                        <option value="pembayaran_utang">Pembayaran Utang Supplier</option>
                                        <option value="pembelian_perlengkapan">Perlengkapan Apotek</option>
                                        <option value="pengeluaran_lain">Pengeluaran Lain-lain</option>
                                    </>
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Jumlah Nominal (Rp) *</label>
                            <input
                                type="number"
                                min="1"
                                required
                                placeholder="0"
                                value={form.data.amount}
                                onChange={(e) => form.setData('amount', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 font-bold"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Deskripsi / Keterangan *</label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: Pembayaran listrik bulanan & token PLN"
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Nomor Referensi / Bukti Transaksi</label>
                        <input
                            type="text"
                            placeholder="KWT-2024-001"
                            value={form.data.reference_number}
                            onChange={(e) => form.setData('reference_number', e.target.value)}
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
                            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg ${
                                form.data.type === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                            }`}
                        >
                            {form.processing ? 'Menyimpan...' : 'Simpan Transaksi Kas'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
