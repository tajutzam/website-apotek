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
        Schema::create('stock_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medicine_id')->constrained('medicines')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('type', ['in', 'out', 'adjustment']); // in: barang masuk/restock, out: rusak/buang, adjustment: stock opname penyesuaian
            $table->integer('previous_stock');
            $table->integer('quantity'); // jumlah selisih/penambahan/pengurangan
            $table->integer('final_stock');
            $table->string('reason')->nullable(); // restock supplier, opname bulanan, obat rusak/pecah, kedaluwarsa, dll
            $table->string('reference_number')->nullable(); // no faktur supplier / surat jalan
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_adjustments');
    }
};
