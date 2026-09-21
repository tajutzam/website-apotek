<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name')->nullable();
            $table->string('action'); // 'create', 'update', 'delete', 'login', 'logout', 'transaction', 'inventory'
            $table->string('module'); // 'Obat', 'Kategori', 'Satuan', 'Penjualan', 'Persediaan', 'Pengguna', 'Autentikasi'
            $table->text('description'); // Deskripsi ringkas aktivitas
            $table->json('properties')->nullable(); // Data lama/baru atau detail info
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
