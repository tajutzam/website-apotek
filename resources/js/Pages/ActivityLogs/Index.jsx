import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Activity,
    Search,
    Filter,
    Calendar,
    User,
    Layers,
    Shield,
    FileText,
    History,
    LogIn,
    LogOut,
    PlusCircle,
    Edit3,
    Trash2,
    DollarSign,
    Boxes
} from 'lucide-react';

export default function ActivityLogsIndex({ logs, modules, actions, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedModule, setSelectedModule] = useState(filters.module || '');
    const [selectedAction, setSelectedAction] = useState(filters.action || '');
    const [selectedDate, setSelectedDate] = useState(filters.date || '');

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            '/activity-logs',
            {
                search: search || undefined,
                module: selectedModule || undefined,
                action: selectedAction || undefined,
                date: selectedDate || undefined,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setSelectedModule('');
        setSelectedAction('');
        setSelectedDate('');
        router.get('/activity-logs');
    };

    const getActionBadge = (action) => {
        switch (action) {
            case 'create':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <PlusCircle className="w-3 h-3" /> Tambah
                    </span>
                );
            case 'update':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <Edit3 className="w-3 h-3" /> Ubah
                    </span>
                );
            case 'delete':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <Trash2 className="w-3 h-3" /> Hapus
                    </span>
                );
            case 'transaction':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        <DollarSign className="w-3 h-3" /> Transaksi
                    </span>
                );
            case 'inventory':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Boxes className="w-3 h-3" /> Mutasi Stok
                    </span>
                );
            case 'login':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <LogIn className="w-3 h-3" /> Masuk
                    </span>
                );
            case 'logout':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                        <LogOut className="w-3 h-3" /> Keluar
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                        {action}
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Log Aktivitas & Audit Trail" />

            {/* Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Log Aktivitas & Audit Trail</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Rekam jejak seluruh penambahan, perubahan, penghapusan data obat, transaksi kasir, dan login pengguna
                    </p>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-4 relative">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Cari Keterangan</label>
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                placeholder="Cari aktivitas, nama user, atau IP..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Modul</label>
                        <select
                            value={selectedModule}
                            onChange={(e) => setSelectedModule(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-slate-700"
                        >
                            <option value="">Semua Modul</option>
                            {modules.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Aksi</label>
                        <select
                            value={selectedAction}
                            onChange={(e) => setSelectedAction(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 text-slate-700"
                        >
                            <option value="">Semua Aksi</option>
                            {actions.map((a) => (
                                <option key={a} value={a}>
                                    {a}
                                </option>
                            ))}
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
                        {(search || selectedModule || selectedAction || selectedDate) && (
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

            {/* Activity Logs Table */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                                <th className="py-3 px-4">Waktu</th>
                                <th className="py-3 px-4">Pengguna</th>
                                <th className="py-3 px-4">Modul</th>
                                <th className="py-3 px-4">Aksi</th>
                                <th className="py-3 px-4">Deskripsi Aktivitas</th>
                                <th className="py-3 px-4 text-right">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {logs.data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-slate-400">
                                        Belum ada riwayat aktivitas yang tercatat
                                    </td>
                                </tr>
                            ) : (
                                logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/70">
                                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit'
                                            })}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                                                    {log.user_name ? log.user_name.charAt(0).toUpperCase() : 'S'}
                                                </div>
                                                <span className="font-bold text-slate-900">{log.user_name || 'Sistem'}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-slate-800">
                                            {log.module}
                                        </td>
                                        <td className="py-3 px-4">
                                            {getActionBadge(log.action)}
                                        </td>
                                        <td className="py-3 px-4 font-medium text-slate-800">
                                            {log.description}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500">
                                            {log.ip_address || '127.0.0.1'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {logs.links && logs.links.length > 3 && (
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div>
                            Menampilkan <span className="font-semibold">{logs.from || 0}</span> -{' '}
                            <span className="font-semibold">{logs.to || 0}</span> dari{' '}
                            <span className="font-semibold">{logs.total}</span> catatan aktivitas
                        </div>
                        <div className="flex items-center gap-1">
                            {logs.links.map((link, idx) => (
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
        </AuthenticatedLayout>
    );
}
