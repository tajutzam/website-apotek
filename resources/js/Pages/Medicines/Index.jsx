import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import {
    Pill,
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    AlertCircle,
    CheckCircle,
    Clock,
    FileText,
    Layers,
    MapPin
} from 'lucide-react';

export default function MedicinesIndex({ medicines, categories, units, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || '');
    const [selectedStockStatus, setSelectedStockStatus] = useState(filters.stock_status || '');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null);

    // Form for Add & Edit
    const form = useForm({
        code: '',
        name: '',
        category_id: '',
        unit_id: '',
        purchase_price: '',
        selling_price: '',
        stock: '',
        min_stock: '5',
        expired_date: '',
        location_rack: '',
        description: '',
        is_prescription: false,
    });

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            '/medicines',
            {
                search: search || undefined,
                category_id: selectedCategory || undefined,
                stock_status: selectedStockStatus || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilter = () => {
        setSearch('');
        setSelectedCategory('');
        setSelectedStockStatus('');
        router.get('/medicines');
    };

    const openAddModal = () => {
        form.reset();
        form.setData({
            code: 'MED-' + Math.floor(1000 + Math.random() * 9000),
            name: '',
            category_id: categories[0]?.id || '',
            unit_id: units[0]?.id || '',
            purchase_price: '',
            selling_price: '',
            stock: '',
            min_stock: '5',
            expired_date: '',
            location_rack: '',
            description: '',
            is_prescription: false,
        });
        setIsAddModalOpen(true);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        form.post('/medicines', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                form.reset();
            },
        });
    };

    const openEditModal = (med) => {
        setEditingMedicine(med);
        form.setData({
            code: med.code,
            name: med.name,
            category_id: med.category_id || '',
            unit_id: med.unit_id || '',
            purchase_price: med.purchase_price,
            selling_price: med.selling_price,
            stock: med.stock,
            min_stock: med.min_stock,
            expired_date: med.expired_date || '',
            location_rack: med.location_rack || '',
            description: med.description || '',
            is_prescription: Boolean(med.is_prescription),
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingMedicine) return;
        form.put(`/medicines/${editingMedicine.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingMedicine(null);
            },
        });
    };

    const handleDelete = (med) => {
        if (confirm(`Apakah Anda yakin ingin menghapus data obat "${med.name}"?`)) {
            router.delete(`/medicines/${med.id}`);
        }
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
            <Head title="Data Obat & Inventori" />

            {/* Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Katalog & Stok Obat</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Kelola data master obat, harga beli & jual, tanggal kedaluwarsa, dan pemantauan stok
                    </p>
                </div>
                <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Obat Baru</span>
                </button>
            </div>

            {/* Filter Card */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-4 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Cari nama, kode obat, rak..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-700"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sm:col-span-3">
                        <select
                            value={selectedStockStatus}
                            onChange={(e) => setSelectedStockStatus(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-700"
                        >
                            <option value="">Semua Status Stok</option>
                            <option value="available">Stok Aman</option>
                            <option value="low">Stok Menipis (Peringatan)</option>
                            <option value="empty">Stok Kosong / Habis</option>
                        </select>
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-2">
                        <button
                            type="submit"
                            className="flex-1 py-2 px-3 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors"
                        >
                            Filter
                        </button>
                        {(search || selectedCategory || selectedStockStatus) && (
                            <button
                                type="button"
                                onClick={handleResetFilter}
                                className="py-2 px-3 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Medicines Table */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                                <th className="py-3 px-4">Kode & Nama Obat</th>
                                <th className="py-3 px-4">Kategori & Satuan</th>
                                <th className="py-3 px-4">Harga Beli</th>
                                <th className="py-3 px-4">Harga Jual</th>
                                <th className="py-3 px-4">Stok</th>
                                <th className="py-3 px-4">Lokasi Rak</th>
                                <th className="py-3 px-4">Kedaluwarsa</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {medicines.data.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-12 text-slate-400">
                                        Tidak ditemukan data obat
                                    </td>
                                </tr>
                            ) : (
                                medicines.data.map((med) => {
                                    const isLow = med.stock <= med.min_stock && med.stock > 0;
                                    const isEmpty = med.stock <= 0;

                                    return (
                                        <tr key={med.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-slate-900">{med.name}</div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[11px] font-mono text-slate-400">{med.code}</span>
                                                    {med.is_prescription ? (
                                                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                            Resep
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            Bebas
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="block font-medium text-slate-800">
                                                    {med.category?.name || '-'}
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    Satuan: {med.unit?.name || '-'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-medium text-slate-600">
                                                {formatRupiah(med.purchase_price)}
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-slate-900">
                                                {formatRupiah(med.selling_price)}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {isEmpty ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[11px] bg-rose-100 text-rose-800">
                                                        Habis (0)
                                                    </span>
                                                ) : isLow ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[11px] bg-amber-100 text-amber-800">
                                                        Menipis ({med.stock})
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-[11px] bg-emerald-100 text-emerald-800">
                                                        {med.stock} {med.unit?.name || 'Unit'}
                                                    </span>
                                                )}
                                                <div className="text-[10px] text-slate-400 mt-0.5">Min: {med.min_stock}</div>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600 font-medium">
                                                {med.location_rack || '-'}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                                                {med.expired_date || '-'}
                                            </td>
                                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => openEditModal(med)}
                                                    className="p-1 text-slate-500 hover:text-teal-600 rounded-md hover:bg-slate-100 transition-colors mr-1"
                                                    title="Edit Data Obat"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(med)}
                                                    className="p-1 text-slate-500 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors"
                                                    title="Hapus Obat"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {medicines.links && medicines.links.length > 3 && (
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div>
                            Menampilkan <span className="font-semibold">{medicines.from || 0}</span> sampai{' '}
                            <span className="font-semibold">{medicines.to || 0}</span> dari{' '}
                            <span className="font-semibold">{medicines.total}</span> data obat
                        </div>
                        <div className="flex items-center gap-1">
                            {medicines.links.map((link, idx) => (
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

            {/* Modal Tambah Obat */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Tambah Data Obat Baru"
            >
                <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Kode Obat *</label>
                            <input
                                type="text"
                                required
                                value={form.data.code}
                                onChange={(e) => form.setData('code', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                            {form.errors.code && <p className="text-rose-600 mt-1">{form.errors.code}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Nama Obat *</label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: Paracetamol 500mg"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                            {form.errors.name && <p className="text-rose-600 mt-1">{form.errors.name}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Kategori Obat</label>
                            <select
                                value={form.data.category_id}
                                onChange={(e) => form.setData('category_id', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Satuan Kemasan</label>
                            <select
                                value={form.data.unit_id}
                                onChange={(e) => form.setData('unit_id', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="">Pilih Satuan</option>
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Harga Beli (Rp) *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={form.data.purchase_price}
                                onChange={(e) => form.setData('purchase_price', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Harga Jual (Rp) *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={form.data.selling_price}
                                onChange={(e) => form.setData('selling_price', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Stok Awal *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={form.data.stock}
                                onChange={(e) => form.setData('stock', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Batas Minimum Stok *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={form.data.min_stock}
                                onChange={(e) => form.setData('min_stock', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Tanggal Kedaluwarsa</label>
                            <input
                                type="date"
                                value={form.data.expired_date}
                                onChange={(e) => form.setData('expired_date', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Lokasi Rak Simpan</label>
                            <input
                                type="text"
                                placeholder="Contoh: Rak A-01"
                                value={form.data.location_rack}
                                onChange={(e) => form.setData('location_rack', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 cursor-pointer mt-2">
                            <input
                                type="checkbox"
                                checked={form.data.is_prescription}
                                onChange={(e) => form.setData('is_prescription', e.target.checked)}
                                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="font-semibold text-slate-800">
                                Membutuhkan Resep Dokter (Obat Keras)
                            </span>
                        </label>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Keterangan / Indikasi</label>
                        <textarea
                            rows="2"
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            placeholder="Catatan tambahan dosis atau indikasi..."
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
                            {form.processing ? 'Menyimpan...' : 'Simpan Obat'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Edit Obat */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Data Obat"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Kode Obat *</label>
                            <input
                                type="text"
                                required
                                value={form.data.code}
                                onChange={(e) => form.setData('code', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Nama Obat *</label>
                            <input
                                type="text"
                                required
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Kategori Obat</label>
                            <select
                                value={form.data.category_id}
                                onChange={(e) => form.setData('category_id', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Satuan Kemasan</label>
                            <select
                                value={form.data.unit_id}
                                onChange={(e) => form.setData('unit_id', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="">Pilih Satuan</option>
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Harga Beli (Rp) *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={form.data.purchase_price}
                                onChange={(e) => form.setData('purchase_price', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Harga Jual (Rp) *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={form.data.selling_price}
                                onChange={(e) => form.setData('selling_price', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Stok *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={form.data.stock}
                                onChange={(e) => form.setData('stock', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Batas Minimum Stok *</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={form.data.min_stock}
                                onChange={(e) => form.setData('min_stock', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Tanggal Kedaluwarsa</label>
                            <input
                                type="date"
                                value={form.data.expired_date}
                                onChange={(e) => form.setData('expired_date', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Lokasi Rak</label>
                            <input
                                type="text"
                                value={form.data.location_rack}
                                onChange={(e) => form.setData('location_rack', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 cursor-pointer mt-2">
                            <input
                                type="checkbox"
                                checked={form.data.is_prescription}
                                onChange={(e) => form.setData('is_prescription', e.target.checked)}
                                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="font-semibold text-slate-800">
                                Membutuhkan Resep Dokter (Obat Keras)
                            </span>
                        </label>
                    </div>

                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Keterangan / Indikasi</label>
                        <textarea
                            rows="2"
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
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
                            {form.processing ? 'Menyimpan...' : 'Perbarui Obat'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
