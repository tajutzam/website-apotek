import React, { useState, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import {
    Database,
    Download,
    Upload,
    RotateCcw,
    Trash2,
    HardDrive,
    ShieldAlert,
    CheckCircle2,
    AlertTriangle,
    FileSpreadsheet,
    Users,
    Pill,
    Tags,
    Calendar,
    FolderArchive,
    RefreshCw,
    Info,
    Server,
    ShieldCheck
} from 'lucide-react';

export default function DatabaseSettings({ databaseInfo, stats, backups = [] }) {
    const [restoreModalOpen, setRestoreModalOpen] = useState(false);
    const [localRestoreModalOpen, setLocalRestoreModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedLocalBackup, setSelectedLocalBackup] = useState(null);
    const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors, reset, progress } = useForm({
        file: null,
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('file', file);
            setRestoreModalOpen(true);
        }
    };

    const handleDownload = () => {
        window.location.href = '/settings/database/download';
    };

    const handleCreateLocalBackup = () => {
        setIsCreatingSnapshot(true);
        router.post(
            '/settings/database/create-backup',
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsCreatingSnapshot(false),
            }
        );
    };

    const handleConfirmRestoreFile = (e) => {
        e.preventDefault();
        post('/settings/database/restore', {
            preserveScroll: true,
            onSuccess: () => {
                setRestoreModalOpen(false);
                reset('file');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const handleConfirmLocalRestore = (e) => {
        e.preventDefault();
        if (!selectedLocalBackup) return;

        router.post(
            '/settings/database/restore-local',
            { filename: selectedLocalBackup.filename },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setLocalRestoreModalOpen(false);
                    setSelectedLocalBackup(null);
                },
            }
        );
    };

    const handleConfirmDelete = (e) => {
        e.preventDefault();
        if (!selectedLocalBackup) return;

        router.delete(`/settings/database/backups/${encodeURIComponent(selectedLocalBackup.filename)}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedLocalBackup(null);
            },
        });
    };

    return (
        <AuthenticatedLayout title="Pengaturan & Backup Database">
            <Head title="Pengaturan & Backup Database" />

            <div className="space-y-6 pb-10">
                {/* Header Page */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center flex-shrink-0">
                            <Database className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                                Backup & Restore Database
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    Admin Only
                                </span>
                            </h1>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Unduh salinan database SQLite secara aman, buat snapshot lokal, dan pulihkan data sistem apotek.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            type="button"
                            onClick={handleCreateLocalBackup}
                            disabled={isCreatingSnapshot}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:scale-95 transition-all shadow-xs disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 text-slate-500 ${isCreatingSnapshot ? 'animate-spin' : ''}`} />
                            {isCreatingSnapshot ? 'Membuat Snapshot...' : 'Buat Snapshot Lokal'}
                        </button>
                        <button
                            type="button"
                            onClick={handleDownload}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white text-xs font-semibold rounded-xl hover:bg-teal-700 active:scale-95 transition-all shadow-xs"
                        >
                            <Download className="w-4 h-4" />
                            Unduh Database (.sqlite)
                        </button>
                    </div>
                </div>

                {/* Status & Live Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Database Active Info */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between text-slate-400 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Database Aktif</span>
                                <Server className="w-4 h-4 text-teal-600" />
                            </div>
                            <div className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                                SQLite 3
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Connected
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 font-mono truncate" title={databaseInfo.path}>
                                {databaseInfo.path}
                            </p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                            <span>Ukuran File:</span>
                            <span className="font-semibold text-slate-800">{databaseInfo.size}</span>
                        </div>
                    </div>

                    {/* Stats Obat & Kategori */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between text-slate-400 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Katalog Obat</span>
                                <Pill className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="text-2xl font-bold text-slate-800">
                                {stats.medicines_count}
                                <span className="text-xs font-medium text-slate-500 ml-1.5">Item Obat</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                {stats.categories_count} Kategori terdaftar
                            </p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                            <span>Kategori:</span>
                            <span className="font-semibold text-indigo-600">{stats.categories_count} Jenis</span>
                        </div>
                    </div>

                    {/* Stats Transaksi Penjualan */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between text-slate-400 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Riwayat Penjualan</span>
                                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="text-2xl font-bold text-slate-800">
                                {stats.transactions_count}
                                <span className="text-xs font-medium text-slate-500 ml-1.5">Faktur Transaksi</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Data kasir & penjualan terarsip
                            </p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                            <span>Status:</span>
                            <span className="font-semibold text-emerald-600">Terbuka & Terindeks</span>
                        </div>
                    </div>

                    {/* Stats Pengguna Terdaftar */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between text-slate-400 mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pengguna Sistem</span>
                                <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="text-2xl font-bold text-slate-800">
                                {stats.users_count}
                                <span className="text-xs font-medium text-slate-500 ml-1.5">Akun Aktif</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Admin & Kasir Apotek
                            </p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                            <span>Autentikasi:</span>
                            <span className="font-semibold text-blue-600">Bcrypt Protected</span>
                        </div>
                    </div>
                </div>

                {/* Dua Panel Utama: Backup & Restore */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Panel 1: Backup Database */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 flex-shrink-0">
                                    <Download className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-800">1. Pencadangan Database (Backup)</h2>
                                    <p className="text-xs text-slate-500">Simpan salinan data lengkap apotek ke komputer Anda.</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 space-y-2 leading-relaxed">
                                <div className="flex items-start gap-2">
                                    <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                                    <span>
                                        File backup berisi seluruh data transaksi penjualan, daftar obat, stok, kategori, buku kas, dan akun pengguna.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    <span>
                                        Sistem secara otomatis menyinkronkan <em>WAL (Write-Ahead Logging)</em> sebelum proses pengunduhan untuk memastikan data mutakhir.
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleDownload}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white text-xs font-semibold rounded-xl hover:bg-teal-700 active:scale-95 transition-all shadow-xs"
                            >
                                <Download className="w-4 h-4" />
                                Unduh File Backup (.sqlite)
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateLocalBackup}
                                disabled={isCreatingSnapshot}
                                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50"
                            >
                                <FolderArchive className="w-4 h-4 text-slate-500" />
                                Simpan Snapshot
                            </button>
                        </div>
                    </div>

                    {/* Panel 2: Restore Database dari File */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 flex-shrink-0">
                                    <Upload className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-800">2. Pemulihan Database (Restore)</h2>
                                    <p className="text-xs text-slate-500">Pulihkan seluruh data dari file cadangan sebelumnya.</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-800 space-y-2 leading-relaxed">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <span>
                                        <strong>Perhatian:</strong> Proses restore akan menimpa database aktif saat ini. Sistem secara otomatis membuat <em>backup pengaman otomatis</em> sebelum proses pemulihan.
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".sqlite,.db,.sqlite3"
                                onChange={handleFileChange}
                                className="hidden"
                                id="restore-file-input"
                            />
                            <label
                                htmlFor="restore-file-input"
                                className="w-full border-2 border-dashed border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 p-5 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                            >
                                <Upload className="w-6 h-6 text-slate-400" />
                                <span className="text-xs font-semibold text-slate-700">
                                    Klik untuk Pilih File Database (.sqlite / .db)
                                </span>
                                <span className="text-[11px] text-slate-400">
                                    Format didukung: .sqlite, .db (Maks. 100MB)
                                </span>
                            </label>
                            {errors.file && (
                                <p className="text-xs text-rose-600 mt-2 font-medium">{errors.file}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 3: Riwayat Snapshot Lokal */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <FolderArchive className="w-5 h-5 text-teal-600" />
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Daftar Snapshot Cadangan Lokal</h3>
                                <p className="text-xs text-slate-500">File cadangan tersimpan di penyimpanan internal aplikasi.</p>
                            </div>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg self-start sm:self-auto">
                            Total: {backups.length} File
                        </span>
                    </div>

                    {backups.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <FolderArchive className="w-6 h-6" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-700">Belum ada snapshot lokal</h4>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                Klik tombol <strong>"Buat Snapshot Lokal"</strong> di atas untuk membuat cadangan instan kapan saja.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="py-3 px-4">Nama File</th>
                                        <th className="py-3 px-4">Ukuran</th>
                                        <th className="py-3 px-4">Waktu Dibuat</th>
                                        <th className="py-3 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                    {backups.map((item) => (
                                        <tr key={item.filename} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-3.5 px-4 font-mono font-medium text-slate-800 flex items-center gap-2">
                                                <Database className="w-4 h-4 text-teal-600 flex-shrink-0" />
                                                <span className="truncate max-w-xs sm:max-w-md">{item.filename}</span>
                                                {item.filename.startsWith('safety_pre_restore') && (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                        Auto Safety
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold text-slate-600">{item.size}</td>
                                            <td className="py-3.5 px-4 text-slate-500">{item.created_at}</td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="inline-flex items-center gap-1.5 justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedLocalBackup(item);
                                                            setLocalRestoreModalOpen(true);
                                                        }}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 font-semibold transition-colors"
                                                        title="Pulihkan dari cadangan ini"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                        <span>Pulihkan</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedLocalBackup(item);
                                                            setDeleteModalOpen(true);
                                                        }}
                                                        className="inline-flex items-center p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                                                        title="Hapus snapshot"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Konfirmasi Restore File Unggahan */}
            <Modal
                isOpen={restoreModalOpen}
                onClose={() => {
                    setRestoreModalOpen(false);
                    reset('file');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                title="Konfirmasi Pemulihan Database"
            >
                <form onSubmit={handleConfirmRestoreFile} className="space-y-4">
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-amber-800">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            Peringatan Pemulihan Data
                        </div>
                        <p>
                            Anda akan mengganti database aktif dengan file: <strong className="font-mono">{data.file?.name}</strong>.
                        </p>
                        <p className="text-[11px] text-amber-700">
                            * Sistem akan secara otomatis menyimpan cadangan pengaman (safety backup) dari database aktif sebelum ditimpa.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setRestoreModalOpen(false);
                                reset('file');
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl active:scale-95 transition-all disabled:opacity-50"
                        >
                            <RotateCcw className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
                            {processing ? 'Memulihkan Data...' : 'Ya, Pulihkan Database'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Konfirmasi Restore dari Snapshot Lokal */}
            <Modal
                isOpen={localRestoreModalOpen}
                onClose={() => {
                    setLocalRestoreModalOpen(false);
                    setSelectedLocalBackup(null);
                }}
                title="Pulihkan dari Snapshot Lokal"
            >
                <form onSubmit={handleConfirmLocalRestore} className="space-y-4">
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-amber-800">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            Konfirmasi Pemulihan Snapshot
                        </div>
                        <p>
                            Apakah Anda yakin ingin memulihkan database ke kondisi snapshot:
                        </p>
                        <p className="font-mono font-bold bg-white/70 p-2 rounded border border-amber-200">
                            {selectedLocalBackup?.filename} ({selectedLocalBackup?.size})
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setLocalRestoreModalOpen(false);
                                setSelectedLocalBackup(null);
                            }}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl active:scale-95 transition-all"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Ya, Pulihkan Sekarang
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Konfirmasi Hapus Snapshot Lokal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setSelectedLocalBackup(null);
                }}
                title="Hapus File Snapshot"
            >
                <form onSubmit={handleConfirmDelete} className="space-y-4">
                    <p className="text-xs text-slate-600">
                        Apakah Anda yakin ingin menghapus file cadangan lokal: <strong className="font-mono text-slate-800">{selectedLocalBackup?.filename}</strong>?
                    </p>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setSelectedLocalBackup(null);
                            }}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl active:scale-95 transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                            Hapus File
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
