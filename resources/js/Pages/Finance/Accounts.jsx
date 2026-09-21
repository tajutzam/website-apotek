import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import {
    Wallet,
    Landmark,
    CreditCard,
    Plus,
    Edit2,
    CheckCircle2,
    DollarSign,
    Building,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

export default function AccountsIndex({ accounts, summary }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);

    const form = useForm({
        code: '',
        name: '',
        account_number: '',
        type: 'cash',
        opening_balance: '',
        description: '',
        is_active: true,
    });

    const handleOpenAdd = () => {
        form.reset();
        form.setData({
            code: 'KAS-' + Math.floor(100 + Math.random() * 900),
            name: '',
            account_number: '',
            type: 'cash',
            opening_balance: '0',
            description: '',
            is_active: true,
        });
        setIsAddModalOpen(true);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        form.post('/finance/accounts', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                form.reset();
            },
        });
    };

    const handleOpenEdit = (acc) => {
        setEditingAccount(acc);
        form.setData({
            code: acc.code,
            name: acc.name,
            account_number: acc.account_number || '',
            type: acc.type,
            description: acc.description || '',
            is_active: Boolean(acc.is_active),
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingAccount) return;
        form.put(`/finance/accounts/${editingAccount.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingAccount(null);
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

    const getTypeIcon = (type) => {
        switch (type) {
            case 'cash':
                return <Wallet className="w-5 h-5 text-teal-600" />;
            case 'bank':
                return <Landmark className="w-5 h-5 text-blue-600" />;
            case 'e-wallet':
                return <CreditCard className="w-5 h-5 text-purple-600" />;
            default:
                return <DollarSign className="w-5 h-5 text-slate-600" />;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Daftar Akun Kas & Bank" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Daftar Akun Kas & Bank</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Kelola rekening kas tunai, bank transfer, dan e-wallet operasional apotek
                    </p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Akun Kas</span>
                </button>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Total Kas Tunai</span>
                        <span className="text-base font-bold text-slate-900">{formatRupiah(summary.total_cash)}</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Total Rekening Bank</span>
                        <span className="text-base font-bold text-slate-900">{formatRupiah(summary.total_bank)}</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Total QRIS & E-Wallet</span>
                        <span className="text-base font-bold text-slate-900">{formatRupiah(summary.total_ewallet)}</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Total Saldo Likuiditas</span>
                        <span className="text-base font-bold text-emerald-700">{formatRupiah(summary.grand_total)}</span>
                    </div>
                </div>
            </div>

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((acc) => (
                    <div
                        key={acc.id}
                        className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:border-teal-400 transition-all flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                                        {getTypeIcon(acc.type)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-900">{acc.name}</h3>
                                        <span className="text-[11px] font-mono text-slate-400">{acc.code}</span>
                                    </div>
                                </div>
                                <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        acc.is_active
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'bg-slate-100 text-slate-600'
                                    }`}
                                >
                                    {acc.is_active ? 'Aktif' : 'Non-Aktif'}
                                </span>
                            </div>

                            {acc.account_number && (
                                <p className="text-xs font-mono text-slate-600 mt-3">
                                    No. Rekening: <span className="font-bold">{acc.account_number}</span>
                                </p>
                            )}

                            {acc.description && (
                                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                                    {acc.description}
                                </p>
                            )}
                        </div>

                        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                                    Saldo Saat Ini
                                </span>
                                <span className="text-base font-extrabold text-slate-900">
                                    {formatRupiah(acc.current_balance)}
                                </span>
                            </div>
                            <button
                                onClick={() => handleOpenEdit(acc)}
                                className="p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-50 rounded-lg transition-colors"
                                title="Edit Akun"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Tambah Akun */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Tambah Akun Kas & Bank Baru"
            >
                <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Kode Akun *</label>
                            <input
                                type="text"
                                required
                                value={form.data.code}
                                onChange={(e) => form.setData('code', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Jenis Akun *</label>
                            <select
                                value={form.data.type}
                                onChange={(e) => form.setData('type', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-slate-700"
                            >
                                <option value="cash">Kas Tunai (Cash)</option>
                                <option value="bank">Rekening Bank</option>
                                <option value="e-wallet">QRIS / E-Wallet</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Nama Akun Kas *</label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: Kas Kasir Lantai 1 / Bank Mandiri"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Nomor Rekening (Opsional)</label>
                            <input
                                type="text"
                                placeholder="123-456-7890"
                                value={form.data.account_number}
                                onChange={(e) => form.setData('account_number', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Saldo Awal (Rp) *</label>
                            <input
                                type="number"
                                min="0"
                                required
                                value={form.data.opening_balance}
                                onChange={(e) => form.setData('opening_balance', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Keterangan Akun</label>
                        <textarea
                            rows="2"
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            placeholder="Catatan tujuan penggunaan kas..."
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
                            {form.processing ? 'Menyimpan...' : 'Simpan Akun'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Edit Akun */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Akun Kas & Bank"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Kode Akun *</label>
                            <input
                                type="text"
                                required
                                value={form.data.code}
                                onChange={(e) => form.setData('code', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Jenis Akun *</label>
                            <select
                                value={form.data.type}
                                onChange={(e) => form.setData('type', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-slate-700"
                            >
                                <option value="cash">Kas Tunai (Cash)</option>
                                <option value="bank">Rekening Bank</option>
                                <option value="e-wallet">QRIS / E-Wallet</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Nama Akun Kas *</label>
                        <input
                            type="text"
                            required
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Nomor Rekening</label>
                        <input
                            type="text"
                            value={form.data.account_number}
                            onChange={(e) => form.setData('account_number', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Keterangan</label>
                        <textarea
                            rows="2"
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 cursor-pointer mt-1">
                            <input
                                type="checkbox"
                                checked={form.data.is_active}
                                onChange={(e) => form.setData('is_active', e.target.checked)}
                                className="rounded text-teal-600 focus:ring-teal-500"
                            />
                            <span className="font-semibold text-slate-800">Akun Aktif & Dapat Digunakan</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                        >
                            {form.processing ? 'Menyimpan...' : 'Perbarui Akun'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
