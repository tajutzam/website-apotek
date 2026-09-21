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
        // Add status to transactions (completed, returned, rejected)
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('status')->default('completed')->after('payment_method'); // 'completed', 'returned', 'rejected'
            $table->text('rejection_reason')->nullable()->after('status');
        });

        // Table for Sales Returns (Retur Penjualan)
        Schema::create('sale_returns', function (Blueprint $table) {
            $table->id();
            $table->string('return_number')->unique();
            $table->foreignId('transaction_id')->constrained('transactions')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('total_refund', 15, 2)->default(0);
            $table->string('reason');
            $table->string('refund_method')->default('Cash'); // Cash, Transfer, Voucher
            $table->text('notes')->nullable();
            $table->timestamp('return_date')->useCurrent();
            $table->timestamps();
        });

        // Table for Sales Return Items
        Schema::create('sale_return_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_return_id')->constrained('sale_returns')->cascadeOnDelete();
            $table->foreignId('medicine_id')->constrained('medicines')->cascadeOnDelete();
            $table->integer('quantity')->default(1);
            $table->decimal('refund_price', 15, 2)->default(0);
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->boolean('restore_stock')->default(true); // apakah stok dikembalikan ke inventori
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_return_items');
        Schema::dropIfExists('sale_returns');
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['status', 'rejection_reason']);
        });
    }
};
