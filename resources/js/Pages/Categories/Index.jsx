import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Tags, Plus, Trash2, Edit2, Layers, Package } from 'lucide-react';

export default function CategoriesIndex({ categories, units }) {
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [editingCat, setEditingCat] = useState(null);
    const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);

    const catForm = useForm({
        name: '',
        description: '',
    });

    const unitForm = useForm({
        name: '',
    });

    const openAddCat = () => {
        setEditingCat(null);
        catForm.reset();
        setIsCatModalOpen(true);
    };

    const openEditCat = (cat) => {
        setEditingCat(cat);
        catForm.setData({
            name: cat.name,
            description: cat.description || '',
        });
        setIsCatModalOpen(true);
    };

    const handleCatSubmit = (e) => {
        e.preventDefault();
        if (editingCat) {
            catForm.put(`/categories/${editingCat.id}`, {
                onSuccess: () => setIsCatModalOpen(false),
            });
        } else {
            catForm.post('/categories', {
                onSuccess: () => setIsCatModalOpen(false),
            });
        }
    };

    const handleDeleteCat = (cat) => {
        if (confirm(`Hapus kategori "${cat.name}"?`)) {
            router.delete(`/categories/${cat.id}`);
        }
    };

    const handleUnitSubmit = (e) => {
        e.preventDefault();
        unitForm.post('/units', {
            onSuccess: () => {
                setIsUnitModalOpen(false);
                unitForm.reset();
            },
        });
    };

    const handleDeleteUnit = (unit) => {
        if (confirm(`Hapus satuan "${unit.name}"?`)) {
            router.delete(`/units/${unit.id}`);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Kategori & Satuan Obat" />

            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Kategori & Satuan Obat</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                    Kelola pengelompokan klasifikasi medis dan satuan takaran obat
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Categories Column (2 Cols) */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                                <Tags className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-800">Daftar Kategori Obat</h2>
                                <p className="text-xs text-slate-500">Golongan dan klasifikasi obat</p>
                            </div>
                        </div>
                        <button
                            onClick={openAddCat}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah Kategori</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                                    <th className="py-3 px-4">Nama Kategori</th>
                                    <th className="py-3 px-4">Deskripsi / Indikasi</th>
                                    <th className="py-3 px-4 text-center">Jumlah Obat</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3 px-4 font-bold text-slate-900">{cat.name}</td>
                                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                                            {cat.description || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                                {cat.medicines_count} Obat
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right whitespace-nowrap">
                                            <button
                                                onClick={() => openEditCat(cat)}
                                                className="p-1 text-slate-500 hover:text-teal-600 rounded-md hover:bg-slate-100 transition-colors mr-1"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCat(cat)}
                                                className="p-1 text-slate-500 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Units Column (1 Col) */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                <Package className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-800">Satuan Kemasan</h2>
                                <p className="text-xs text-slate-500">Unit takaran obat</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                unitForm.reset();
                                setIsUnitModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah</span>
                        </button>
                    </div>

                    <div className="p-4 divide-y divide-slate-100 flex-1 overflow-y-auto">
                        {units.map((unit) => (
                            <div key={unit.id} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                                <div>
                                    <p className="text-xs font-semibold text-slate-900">{unit.name}</p>
                                    <p className="text-[11px] text-slate-400">{unit.medicines_count} produk terdaftar</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteUnit(unit)}
                                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                    title="Hapus Satuan"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal Category */}
            <Modal
                isOpen={isCatModalOpen}
                onClose={() => setIsCatModalOpen(false)}
                title={editingCat ? 'Edit Kategori Obat' : 'Tambah Kategori Obat'}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleCatSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Nama Kategori *</label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: Vitamin & Suplemen"
                            value={catForm.data.name}
                            onChange={(e) => catForm.setData('name', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>
                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Deskripsi / Penjelasan</label>
                        <textarea
                            rows="3"
                            placeholder="Keterangan singkat fungsi golongan obat..."
                            value={catForm.data.description}
                            onChange={(e) => catForm.setData('description', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsCatModalOpen(false)}
                            className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={catForm.processing}
                            className="px-4 py-2 font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                        >
                            {catForm.processing ? 'Menyimpan...' : 'Simpan Kategori'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Unit */}
            <Modal
                isOpen={isUnitModalOpen}
                onClose={() => setIsUnitModalOpen(false)}
                title="Tambah Satuan Kemasan"
                maxWidth="max-w-sm"
            >
                <form onSubmit={handleUnitSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Nama Satuan *</label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: Tablet, Botol, Strip, Ampul"
                            value={unitForm.data.name}
                            onChange={(e) => unitForm.setData('name', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsUnitModalOpen(false)}
                            className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={unitForm.processing}
                            className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                        >
                            {unitForm.processing ? 'Menyimpan...' : 'Simpan Satuan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
