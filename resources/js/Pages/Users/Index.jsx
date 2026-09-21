import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import {
    Users,
    UserPlus,
    Search,
    Edit2,
    Trash2,
    Shield,
    Mail,
    Phone,
    KeyRound,
    UserCheck,
    Lock
} from 'lucide-react';

export default function UsersIndex({ users, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const form = useForm({
        name: '',
        email: '',
        role: 'kasir',
        phone: '',
        password: '',
    });

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            '/users',
            {
                search: search || undefined,
                role: selectedRole || undefined,
            },
            { preserveState: true }
        );
    };

    const handleOpenAdd = () => {
        form.reset();
        form.setData({
            name: '',
            email: '',
            role: 'kasir',
            phone: '',
            password: '',
        });
        setIsAddModalOpen(true);
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        form.post('/users', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                form.reset();
            },
        });
    };

    const handleOpenEdit = (user) => {
        setEditingUser(user);
        form.setData({
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone || '',
            password: '',
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingUser) return;
        form.put(`/users/${editingUser.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingUser(null);
                form.reset();
            },
        });
    };

    const handleDelete = (user) => {
        if (confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${user.name}"?`)) {
            router.delete(`/users/${user.id}`);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Pengguna & Hak Akses" />

            {/* Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Pengguna</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Kelola akun petugas kasir, apoteker, dan administrator sistem apotek
                    </p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-colors"
                >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Tambah Pengguna Baru</span>
                </button>
            </div>

            {/* Filter Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Cari nama, email, atau nomor HP pengguna..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>
                    <div className="sm:col-span-4">
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-slate-700"
                        >
                            <option value="">Semua Role / Hak Akses</option>
                            <option value="admin">Administrator</option>
                            <option value="apoteker">Apoteker</option>
                            <option value="kasir">Kasir</option>
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

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                                <th className="py-3 px-4">Nama Pengguna</th>
                                <th className="py-3 px-4">Email</th>
                                <th className="py-3 px-4">Nomor HP</th>
                                <th className="py-3 px-4">Peran / Role</th>
                                <th className="py-3 px-4">Tanggal Bergabung</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {users.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-10 text-slate-400">
                                        Tidak ditemukan data pengguna
                                    </td>
                                </tr>
                            ) : (
                                users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/70">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-200">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-900 block">{user.name}</span>
                                                    <span className="text-[10px] text-slate-400">ID: #{user.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 font-medium text-slate-600">
                                            {user.email}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-slate-600">
                                            {user.phone || '-'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                    user.role === 'admin'
                                                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                                        : user.role === 'apoteker'
                                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                        : 'bg-teal-50 text-teal-700 border border-teal-200'
                                                }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                                            {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="py-3 px-4 text-right whitespace-nowrap">
                                            <button
                                                onClick={() => handleOpenEdit(user)}
                                                className="p-1 text-slate-500 hover:text-teal-600 rounded-md hover:bg-slate-100 transition-colors mr-1"
                                                title="Edit Pengguna"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user)}
                                                className="p-1 text-slate-500 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors"
                                                title="Hapus Pengguna"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.links && users.links.length > 3 && (
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div>
                            Total: <span className="font-semibold">{users.total}</span> Pengguna
                        </div>
                        <div className="flex items-center gap-1">
                            {users.links.map((link, idx) => (
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

            {/* Modal Tambah Pengguna */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Tambah Akun Pengguna Baru"
            >
                <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: Siti Rahmawati"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                        {form.errors.name && <p className="text-rose-600 mt-1">{form.errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                            <input
                                type="email"
                                required
                                placeholder="nama@apotek.com"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                            {form.errors.email && <p className="text-rose-600 mt-1">{form.errors.email}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">No. Handphone / WA</label>
                            <input
                                type="text"
                                placeholder="08123456789"
                                value={form.data.phone}
                                onChange={(e) => form.setData('phone', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Hak Akses / Peran *</label>
                            <select
                                required
                                value={form.data.role}
                                onChange={(e) => form.setData('role', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-slate-700"
                            >
                                <option value="kasir">Kasir (POS & Transaksi)</option>
                                <option value="apoteker">Apoteker (Master & Stok)</option>
                                <option value="admin">Administrator (Akses Penuh)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Password Awal *</label>
                            <input
                                type="password"
                                required
                                placeholder="Minimal 6 karakter"
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                            {form.errors.password && <p className="text-rose-600 mt-1">{form.errors.password}</p>}
                        </div>
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
                            {form.processing ? 'Menyimpan...' : 'Simpan Pengguna'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Edit Pengguna */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Profil Pengguna"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                        <input
                            type="text"
                            required
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                            <input
                                type="email"
                                required
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">No. Handphone</label>
                            <input
                                type="text"
                                value={form.data.phone}
                                onChange={(e) => form.setData('phone', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Hak Akses / Peran *</label>
                            <select
                                required
                                value={form.data.role}
                                onChange={(e) => form.setData('role', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-slate-700"
                            >
                                <option value="kasir">Kasir</option>
                                <option value="apoteker">Apoteker</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Ubah Password (Opsional)</label>
                            <input
                                type="password"
                                placeholder="Kosongkan bila tidak diubah"
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
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
