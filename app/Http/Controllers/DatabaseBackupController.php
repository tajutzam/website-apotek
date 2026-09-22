<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Medicine;
use App\Models\Transaction;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class DatabaseBackupController extends Controller
{
    /**
     * Get the active database file path.
     */
    protected function getActiveDatabasePath(): string
    {
        $path = config('nativephp-internal.database_path');

        if (empty($path) || ! file_exists($path)) {
            $defaultConn = config('database.default', 'sqlite');
            $path = config("database.connections.{$defaultConn}.database");
        }

        if (empty($path) || ! file_exists($path)) {
            $path = database_path('database.sqlite');
        }

        return $path;
    }

    /**
     * Ensure the backups directory exists.
     */
    protected function getBackupsDirectory(): string
    {
        $dir = storage_path('app/backups');
        if (! File::exists($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        return $dir;
    }

    /**
     * Display the database backup & restore management page.
     */
    public function index()
    {
        $dbPath = $this->getActiveDatabasePath();
        $dbExists = file_exists($dbPath);
        $dbSize = $dbExists ? filesize($dbPath) : 0;
        $dbLastModified = $dbExists ? filemtime($dbPath) : null;

        $stats = [
            'users_count' => Schema::hasTable('users') ? User::count() : 0,
            'medicines_count' => Schema::hasTable('medicines') ? Medicine::count() : 0,
            'categories_count' => Schema::hasTable('categories') ? Category::count() : 0,
            'transactions_count' => Schema::hasTable('transactions') ? Transaction::count() : 0,
        ];

        $backupsDir = $this->getBackupsDirectory();
        $backupFiles = [];

        if (File::exists($backupsDir)) {
            $files = File::files($backupsDir);
            foreach ($files as $file) {
                if (in_array(strtolower($file->getExtension()), ['sqlite', 'db', 'sqlite3'])) {
                    $backupFiles[] = [
                        'filename' => $file->getFilename(),
                        'size' => $this->formatBytes($file->getSize()),
                        'raw_size' => $file->getSize(),
                        'created_at' => date('Y-m-d H:i:s', $file->getMTime()),
                        'timestamp' => $file->getMTime(),
                    ];
                }
            }
            // Sort latest first
            usort($backupFiles, fn ($a, $b) => $b['timestamp'] <=> $a['timestamp']);
        }

        return Inertia::render('Settings/Database', [
            'databaseInfo' => [
                'path' => $dbPath,
                'exists' => $dbExists,
                'size' => $this->formatBytes($dbSize),
                'raw_size' => $dbSize,
                'last_modified' => $dbLastModified ? date('Y-m-d H:i:s', $dbLastModified) : null,
                'connection' => config('database.default', 'sqlite'),
            ],
            'stats' => $stats,
            'backups' => $backupFiles,
        ]);
    }

    /**
     * Create and download a fresh database backup.
     */
    public function downloadBackup()
    {
        $backupPath = $this->performBackup();
        $filename = basename($backupPath);

        ActivityLogger::log(
            'backup',
            'Database',
            "Mengunduh file cadangan database: {$filename}",
            ['filename' => $filename, 'size' => filesize($backupPath)]
        );

        return response()->download($backupPath, $filename);
    }

    /**
     * Create a snapshot backup file in the local storage directory.
     */
    public function createBackup()
    {
        $backupPath = $this->performBackup();
        $filename = basename($backupPath);

        ActivityLogger::log(
            'backup',
            'Database',
            "Membuat snapshot cadangan database: {$filename}",
            ['filename' => $filename, 'size' => filesize($backupPath)]
        );

        return redirect()->back()->with('success', "Cadangan database '{$filename}' berhasil dibuat.");
    }

    /**
     * Restore database from an uploaded file.
     */
    public function restore(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'max:102400'], // max 100MB
        ]);

        $uploadedFile = $request->file('file');
        $tempPath = $uploadedFile->getRealPath();

        // 1. Validate SQLite header magic bytes
        if (! $this->isValidSqliteFile($tempPath)) {
            return redirect()->back()->with('error', 'File tidak valid. Pastikan file yang diunggah adalah file database SQLite (.sqlite / .db).');
        }

        // 2. Perform restoration
        $success = $this->applyDatabaseRestore($tempPath);

        if (! $success) {
            return redirect()->back()->with('error', 'Gagal memulihkan database. Terjadi kesalahan saat menimpa file database.');
        }

        ActivityLogger::log(
            'restore',
            'Database',
            "Memulihkan database dari file unggahan: {$uploadedFile->getClientOriginalName()}",
            ['original_name' => $uploadedFile->getClientOriginalName()]
        );

        return redirect()->back()->with('success', 'Database berhasil dipulihkan! Seluruh data telah diperbarui sesuai cadangan.');
    }

    /**
     * Restore database from an existing local backup file.
     */
    public function restoreFromLocal(Request $request)
    {
        $request->validate([
            'filename' => ['required', 'string'],
        ]);

        $filename = basename($request->filename);
        $backupPath = $this->getBackupsDirectory().'/'.$filename;

        if (! File::exists($backupPath)) {
            return redirect()->back()->with('error', 'File cadangan yang dipilih tidak ditemukan.');
        }

        if (! $this->isValidSqliteFile($backupPath)) {
            return redirect()->back()->with('error', 'File cadangan tidak valid atau rusak.');
        }

        $success = $this->applyDatabaseRestore($backupPath);

        if (! $success) {
            return redirect()->back()->with('error', 'Gagal memulihkan database dari cadangan lokal.');
        }

        ActivityLogger::log(
            'restore',
            'Database',
            "Memulihkan database dari cadangan lokal: {$filename}",
            ['filename' => $filename]
        );

        return redirect()->back()->with('success', "Database berhasil dipulihkan dari cadangan '{$filename}'.");
    }

    /**
     * Delete a local backup file.
     */
    public function deleteLocalBackup(string $filename)
    {
        $safeFilename = basename($filename);
        $filePath = $this->getBackupsDirectory().'/'.$safeFilename;

        if (File::exists($filePath)) {
            File::delete($filePath);

            ActivityLogger::log(
                'delete',
                'Database',
                "Menghapus file cadangan database: {$safeFilename}",
                ['filename' => $safeFilename]
            );

            return redirect()->back()->with('success', "File cadangan '{$safeFilename}' berhasil dihapus.");
        }

        return redirect()->back()->with('error', 'File cadangan tidak ditemukan.');
    }

    /**
     * Helper: Core backup logic.
     */
    protected function performBackup(): string
    {
        $dbPath = $this->getActiveDatabasePath();

        if (! file_exists($dbPath)) {
            touch($dbPath);
        }

        // Flush WAL (Write-Ahead Logging) to sync database to main file
        try {
            DB::statement('PRAGMA wal_checkpoint(FULL);');
        } catch (\Throwable $e) {
            // Ignore if not in WAL mode
        }

        $backupsDir = $this->getBackupsDirectory();
        $filename = 'apotek_backup_'.date('Y-m-d_His').'.sqlite';
        $destination = $backupsDir.'/'.$filename;

        File::copy($dbPath, $destination);

        return $destination;
    }

    /**
     * Helper: Core restore logic with pre-restore safety copy.
     */
    protected function applyDatabaseRestore(string $sourceFilePath): bool
    {
        $targetDbPath = $this->getActiveDatabasePath();

        try {
            // Safety snapshot of current database before restoring
            if (file_exists($targetDbPath) && filesize($targetDbPath) > 0) {
                $safetyBackupName = 'safety_pre_restore_'.date('Y-m-d_His').'.sqlite';
                @File::copy($targetDbPath, $this->getBackupsDirectory().'/'.$safetyBackupName);
            }

            // Disconnect active connection
            DB::disconnect();

            // Replace active database file
            File::copy($sourceFilePath, $targetDbPath);

            // Clean up temporary WAL and SHM journal files
            @unlink($targetDbPath.'-wal');
            @unlink($targetDbPath.'-shm');

            // Reconnect and configure WAL
            DB::reconnect();
            try {
                DB::statement('PRAGMA journal_mode=WAL;');
                DB::statement('PRAGMA busy_timeout=5000;');
            } catch (\Throwable $e) {
                // Ignore
            }

            return true;
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Validate whether a file has a valid SQLite header.
     */
    protected function isValidSqliteFile(string $filePath): bool
    {
        if (! file_exists($filePath) || filesize($filePath) < 16) {
            return false;
        }

        $handle = fopen($filePath, 'rb');
        if (! $handle) {
            return false;
        }

        $header = fread($handle, 16);
        fclose($handle);

        return $header === "SQLite format 3\000";
    }

    /**
     * Format bytes to readable size string.
     */
    protected function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= (1 << (10 * $pow));

        return round($bytes, $precision).' '.$units[$pow];
    }
}
