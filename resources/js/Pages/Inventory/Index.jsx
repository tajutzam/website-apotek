import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import {
    Boxes,
    PackagePlus,
    PackageMinus,
    ClipboardCheck,
    Search,
    Filter,
    Plus,
    Calendar,
    AlertTriangle,
    CheckCircle2,
    DollarSign,
    Layers,
    FileSpreadsheet,
    ArrowDownRight,
    ArrowUpRight,
    RefreshCw
} from 'lucide-react';

export default function InventoryIndex({
    tab,
    filters,
    summary,
    medicines,
    all_medicines_list,
    accounts = [],
    adjustments,
    expiring_medicines
}) {
    const [currentTab, setCurrentTab] = useState(tab || 'stock');
    const [search, setSearch] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

    const form = useForm({
        medicine_id: '',
        type: 'in', // 'in', 'out', 'adjustment'
        quantity: '',
        reason: 'Restock Pembelian Supplier',
        reference_number: '',
        notes: '',
        use_cash: false,
        cash_account_id: accounts[0]?.id || '',
        total_cost: '',
    });

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            '/inventory',
            {
                tab: currentTab,
                search: search || undefined,
                status: selectedStatus || undefined,
            },
            { preserveState: true }
        );
    };

    const handleTabChange = (newTab) => {
        setCurrentTab(newTab);
        router.get(
            '/inventory',
            {
                tab: newTab,
                search: search || undefined,
                status: selectedStatus || undefined,
            },
            { preserveState: true }
        );
    };

    const handleOpenModal = (defaultType = 'in') => {
        form.reset();
        const firstMed = all_medicines_list[0];
        form.setData({
            medicine_id: firstMed?.id || '',
            type: defaultType,
            quantity: '',
            reason:
                defaultType === 'in'
                    ? 'Restock Pembelian Supplier'
                    : defaultType === 'out'
                    ? 'Obat Rusak / Pecah / Expired'
                    : 'Stock Opname Rutin Bulanan',
            reference_number: defaultType === 'in' ? 'FAK-' + Math.floor(10000 + Math.random() * 90000) : '',
            notes: '',
            use_cash: defaultType === 'in',
            cash_account_id: accounts[0]?.id || '',
            total_cost: firstMed ? (parseFloat(firstMed.purchase_price) || 0).toString() : '',
        });
        setIsAdjustmentModalOpen(true);
    };

    const handleAdjustmentSubmit = (e) => {
        e.preventDefault();
        form.post('/inventory/adjustments', {
            onSuccess: () => {
                setIsAdjustmentModalOpen(false);
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

    const selectedMedicineInfo = all_medicines_list.find(
        (m) => String(m.id) === String(form.data.medicine_id)
    );

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Persediaan & Stok" />

            {/* Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Persediaan & Kartu Stok</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Pemantauan stok fisik, mutasi barang masuk/keluar, stock opname, dan peringatan kedaluwarsa
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleOpenModal('in')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-colors"
                    >
                        <PackagePlus className="w-4 h-4" />
                        <span>Barang Masuk / Restock</span>
                    </button>
                    <button
                        onClick={() => handleOpenModal('adjustment')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg shadow-sm transition-colors"
                    >
                        <ClipboardCheck className="w-4 h-4" />
                        <span>Stock Opname</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                        <Boxes className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Total Nilai Persediaan</span>
                        <span className="text-base font-bold text-slate-900">{formatRupiah(summary.total_stock_value)}</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Layers className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Total Item Obat</span>
                        <span className="text-base font-bold text-slate-900">{summary.total_items} Jenis</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Stok Menipis / Kritis</span>
                        <span className="text-base font-bold text-amber-600">{summary.low_stock_count} Obat</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-medium text-slate-500 block">Akan Expired (&le; 6 Bln)</span>
                        <span className="text-base font-bold text-rose-600">{summary.expiring_count} Obat</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold text-slate-500">
                <button
                    onClick={() => handleTabChange('stock')}
                    className={`pb-3 flex items-center gap-2 border-b-2 font-bold text-xs transition-colors ${
                        currentTab === 'stock'
                            ? 'border-teal-600 text-teal-600'
                            : 'border-transparent hover:text-slate-700'
                    }`}
                >
                    <Boxes className="w-4 h-4" />
                    <span>Status Persediaan Obat</span>
                </button>
                <button
                    onClick={() => handleTabChange('adjustments')}
                    className={`pb-3 flex items-center gap-2 border-b-2 font-bold text-xs transition-colors ${
                        currentTab === 'adjustments'
                            ? 'border-teal-600 text-teal-600'
                            : 'border-transparent hover:text-slate-700'
                    }`}
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Riwayat Mutasi & Opname</span>
                </button>
                <button
                    onClick={() => handleTabChange('expiring')}
                    className={`pb-3 flex items-center gap-2 border-b-2 font-bold text-xs transition-colors ${
                        currentTab === 'expiring'
                            ? 'border-teal-600 text-teal-600'
                            : 'border-transparent hover:text-slate-700'
                    }`}
                >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Peringatan Kedaluwarsa ({summary.expiring_count})</span>
                </button>
            </div>

            {/* TAB 1: STATUS PERSEDIAAN */}
            {currentTab === 'stock' && (
                <div className="space-y-4">
                    {/* Filter Search */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                        <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                            <div className="sm:col-span-6 relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    placeholder="Cari nama, kode obat, atau lokasi rak..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                            <div className="sm:col-span-4">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-slate-700"
                                >
                                    <option value="">Semua Status Stok</option>
                                    <option value="safe">Stok Aman</option>
                                    <option value="low">Stok Menipis (&le; Minimum)</option>
                                    <option value="empty">Stok Kosong (0)</option>
                                    <option value="expiring">Mendekati Expired</option>
                                </select>
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

                    {/* Stock Table */}
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                                        <th className="py-3 px-4">Kode & Nama Obat</th>
                                        <th className="py-3 px-4">Kategori & Satuan</th>
                                        <th className="py-3 px-4">Harga Beli</th>
                                        <th className="py-3 px-4">Stok Fisik</th>
                                        <th className="py-3 px-4">Total Aset Stok</th>
                                        <th className="py-3 px-4">Lokasi Rak</th>
                                        <th className="py-3 px-4">Kedaluwarsa</th>
                                        <th className="py-3 px-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {medicines.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-10 text-slate-400">
                                                Tidak ada data persediaan
                                            </td>
                                        </tr>
                                    ) : (
                                        medicines.data.map((med) => {
                                            const isLow = med.stock <= med.min_stock && med.stock > 0;
                                            const isEmpty = med.stock <= 0;
                                            const assetValue = med.stock * med.purchase_price;

                                            return (
                                                <tr key={med.id} className="hover:bg-slate-50/70">
                                                    <td className="py-3 px-4">
                                                        <div className="font-bold text-slate-900">{med.name}</div>
                                                        <span className="text-[11px] font-mono text-slate-400">{med.code}</span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="block font-medium text-slate-800">{med.category?.name || '-'}</span>
                                                        <span className="text-[11px] text-slate-400">Satuan: {med.unit?.name || '-'}</span>
                                                    </td>
                                                    <td className="py-3 px-4 font-medium text-slate-600">
                                                        {formatRupiah(med.purchase_price)}
                                                    </td>
                                                    <td className="py-3 px-4 font-bold text-slate-900">
                                                        {med.stock} {med.unit?.name}
                                                        <span className="text-[10px] text-slate-400 block font-normal">Min: {med.min_stock}</span>
                                                    </td>
                                                    <td className="py-3 px-4 font-bold text-slate-800">
                                                        {formatRupiah(assetValue)}
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-600 font-medium">
                                                        {med.location_rack || '-'}
                                                    </td>
                                                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                                                        {med.expired_date || '-'}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        {isEmpty ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                                                Habis (0)
                                                            </span>
                                                        ) : isLow ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                                                Menipis
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                                                Aman
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: RIWAYAT MUTASI & OPNAME */}
            {currentTab === 'adjustments' && (
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Log Mutasi Masuk / Keluar & Stock Opname
                        </h3>
                        <span className="text-xs text-slate-500 font-medium">
                            {adjustments.total} Catatan Mutasi
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                                    <th className="py-3 px-4">Waktu</th>
                                    <th className="py-3 px-4">Nama Obat</th>
                                    <th className="py-3 px-4">Tipe Mutasi</th>
                                    <th className="py-3 px-4 text-center">Stok Awal</th>
                                    <th className="py-3 px-4 text-center">Penyesuaian</th>
                                    <th className="py-3 px-4 text-center">Stok Akhir</th>
                                    <th className="py-3 px-4">Alasan & No. Ref</th>
                                    <th className="py-3 px-4">Petugas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {adjustments.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-10 text-slate-400">
                                            Belum ada catatan mutasi persediaan
                                        </td>
                                    </tr>
                                ) : (
                                    adjustments.data.map((adj) => (
                                        <tr key={adj.id} className="hover:bg-slate-50/70">
                                            <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                                                {new Date(adj.created_at).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-slate-900">
                                                {adj.medicine?.name}
                                                <span className="text-[10px] text-slate-400 block font-normal">{adj.medicine?.code}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {adj.type === 'in' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <ArrowUpRight className="w-3 h-3" /> Masuk
                                                    </span>
                                                ) : adj.type === 'out' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <ArrowDownRight className="w-3 h-3" /> Keluar
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                        <RefreshCw className="w-3 h-3" /> Opname
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center font-medium text-slate-600">
                                                {adj.previous_stock}
                                            </td>
                                            <td className="py-3 px-4 text-center font-bold">
                                                {adj.type === 'in' ? (
                                                    <span className="text-emerald-600">+{adj.quantity}</span>
                                                ) : adj.type === 'out' ? (
                                                    <span className="text-rose-600">-{adj.quantity}</span>
                                                ) : (
                                                    <span className="text-blue-600">Set: {adj.quantity}</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center font-bold text-slate-900">
                                                {adj.final_stock}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="font-semibold text-slate-800 block">{adj.reason}</span>
                                                {adj.reference_number && (
                                                    <span className="text-[10px] font-mono text-slate-400">Ref: {adj.reference_number}</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-slate-600 font-medium">
                                                {adj.user?.name || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 3: EXPIRING SOON */}
            {currentTab === 'expiring' && (
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/30">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                                Daftar Obat Mendekati & Melewati Kedaluwarsa
                            </h3>
                        </div>
                        <span className="text-xs text-rose-700 font-bold">
                            {expiring_medicines.length} Obat Perlu Perhatian
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                                    <th className="py-3 px-4">Kode & Nama Obat</th>
                                    <th className="py-3 px-4">Kategori & Satuan</th>
                                    <th className="py-3 px-4">Sisa Stok Fisik</th>
                                    <th className="py-3 px-4">Lokasi Rak</th>
                                    <th className="py-3 px-4">Tanggal Expired</th>
                                    <th className="py-3 px-4 text-right">Rekomendasi Tindakan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {expiring_medicines.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-10 text-slate-400">
                                            Tidak ada obat yang mendekati tanggal kedaluwarsa (&le; 6 bulan)
                                        </td>
                                    </tr>
                                ) : (
                                    expiring_medicines.map((med) => (
                                        <tr key={med.id} className="hover:bg-slate-50/70">
                                            <td className="py-3 px-4 font-bold text-slate-900">
                                                {med.name}
                                                <span className="text-[10px] font-mono text-slate-400 block">{med.code}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {med.category?.name || '-'} ({med.unit?.name || '-'})
                                            </td>
                                            <td className="py-3 px-4 font-bold text-slate-900">
                                                {med.stock} {med.unit?.name}
                                            </td>
                                            <td className="py-3 px-4 font-medium text-slate-600">
                                                {med.location_rack || '-'}
                                            </td>
                                            <td className="py-3 px-4 font-mono font-bold text-rose-600">
                                                {med.expired_date}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                    Retur Supplier / Karantina
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Mutasi / Stock Opname */}
            <Modal
                isOpen={isAdjustmentModalOpen}
                onClose={() => setIsAdjustmentModalOpen(false)}
                title="Input Mutasi & Penyesuaian Persediaan"
            >
                <form onSubmit={handleAdjustmentSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Pilih Obat *</label>
                        <select
                            required
                            value={form.data.medicine_id}
                            onChange={(e) => form.setData('medicine_id', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-slate-800"
                        >
                            <option value="">-- Pilih Obat --</option>
                            {all_medicines_list.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name} ({m.code}) - Sisa Stok: {m.stock} {m.unit?.name}
                                </option>
                            ))}
                        </select>
                        {selectedMedicineInfo && (
                            <p className="text-[11px] text-teal-600 font-medium mt-1">
                                Stok saat ini: <span className="font-bold">{selectedMedicineInfo.stock} {selectedMedicineInfo.unit?.name}</span>
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Jenis Mutasi *</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    form.setData({
                                        ...form.data,
                                        type: 'in',
                                        reason: 'Restock Pembelian Supplier',
                                    });
                                }}
                                className={`py-2 text-xs font-bold rounded-lg border text-center transition-colors ${
                                    form.data.type === 'in'
                                        ? 'bg-teal-600 text-white border-teal-600'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                + Barang Masuk
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    form.setData({
                                        ...form.data,
                                        type: 'out',
                                        reason: 'Obat Rusak / Pecah / Expired',
                                    });
                                }}
                                className={`py-2 text-xs font-bold rounded-lg border text-center transition-colors ${
                                    form.data.type === 'out'
                                        ? 'bg-rose-600 text-white border-rose-600'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                - Barang Keluar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    form.setData({
                                        ...form.data,
                                        type: 'adjustment',
                                        reason: 'Stock Opname Rutin',
                                    });
                                }}
                                className={`py-2 text-xs font-bold rounded-lg border text-center transition-colors ${
                                    form.data.type === 'adjustment'
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                = Stock Opname
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                            {form.data.type === 'adjustment'
                                ? 'Jumlah Stok Fisik Riil Hasil Opname *'
                                : 'Jumlah Kuantitas (Qty) *'}
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={form.data.quantity}
                            onChange={(e) => form.setData('quantity', e.target.value)}
                            placeholder="Contoh: 10"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 font-bold"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Alasan Penyesuaian *</label>
                            <input
                                type="text"
                                required
                                value={form.data.reason}
                                onChange={(e) => form.setData('reason', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">No. Referensi / Faktur</label>
                            <input
                                type="text"
                                placeholder="FAK-2024-001"
                                value={form.data.reference_number}
                                onChange={(e) => form.setData('reference_number', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
                        <textarea
                            rows="2"
                            value={form.data.notes}
                            onChange={(e) => form.setData('notes', e.target.value)}
                            placeholder="Keterangan opsional..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    {/* Input Potong Kas (Khusus Barang Masuk / Restock) */}
                    {form.data.type === 'in' && accounts.length > 0 && (
                        <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-lg space-y-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.data.use_cash}
                                    onChange={(e) => form.setData('use_cash', e.target.checked)}
                                    className="rounded text-teal-600 focus:ring-teal-500"
                                />
                                <span className="font-bold text-slate-900">
                                    Catat Pembayaran Tunai & Potong Saldo Kas/Bank
                                </span>
                            </label>

                            {form.data.use_cash && (
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Pilih Akun Kas *
                                        </label>
                                        <select
                                            value={form.data.cash_account_id}
                                            onChange={(e) => form.setData('cash_account_id', e.target.value)}
                                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                                        >
                                            {accounts.map((acc) => (
                                                <option key={acc.id} value={acc.id}>
                                                    {acc.name} - Saldo: {formatRupiah(acc.current_balance)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Total Biaya Pembelian (Rp) *
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            required={form.data.use_cash}
                                            placeholder="0"
                                            value={form.data.total_cost}
                                            onChange={(e) => form.setData('total_cost', e.target.value)}
                                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsAdjustmentModalOpen(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                        >
                            {form.processing ? 'Menyimpan...' : 'Simpan Mutasi'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
