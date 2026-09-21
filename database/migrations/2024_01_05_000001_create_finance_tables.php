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
        // 1. Akun Kas & Bank
        Schema::create('cash_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g. KAS-01, BANK-BCA, QRIS
            $table->string('name'); // e.g. Kas Kasir Utama, Rekening BCA Operasional
            $table->string('account_number')->nullable();
            $table->enum('type', ['cash', 'bank', 'e-wallet'])->default('cash');
            $table->decimal('opening_balance', 15, 2)->default(0);
            $table->decimal('current_balance', 15, 2)->default(0);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Buku Kas & Mutasi Kas (Cash Book)
        Schema::create('cash_books', function (Blueprint $table) {
            $table->id();
            $table->string('entry_number')->unique();
            $table->foreignId('cash_account_id')->constrained('cash_accounts')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('type', ['in', 'out']); // Masuk / Keluar
            $table->string('category'); // 'penjualan', 'retur_penjualan', 'pembayaran_utang', 'pelunasan_piutang', 'operasional', 'transfer_kas', 'lainnya'
            $table->decimal('amount', 15, 2)->default(0);
            $table->decimal('balance_after', 15, 2)->default(0);
            $table->string('reference_type')->nullable(); // Model reference e.g. Transaction, Debt, Receivable
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('reference_number')->nullable();
            $table->text('description');
            $table->timestamp('transaction_date')->useCurrent();
            $table->timestamps();
        });

        // 3. Utang Usaha (Accounts Payable / Utang Supplier)
        Schema::create('debts', function (Blueprint $table) {
            $table->id();
            $table->string('debt_number')->unique();
            $table->string('supplier_name');
            $table->string('invoice_number')->nullable();
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->decimal('remaining_amount', 15, 2)->default(0);
            $table->date('due_date')->nullable();
            $table->enum('status', ['unpaid', 'partial', 'paid'])->default('unpaid');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 4. Riwayat Pembayaran Utang Usaha
        Schema::create('debt_payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_number')->unique();
            $table->foreignId('debt_id')->constrained('debts')->cascadeOnDelete();
            $table->foreignId('cash_account_id')->constrained('cash_accounts')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('amount', 15, 2)->default(0);
            $table->date('payment_date');
            $table->string('payment_method')->default('Cash');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 5. Piutang Usaha (Accounts Receivable / Piutang Pasien / Resep)
        Schema::create('receivables', function (Blueprint $table) {
            $table->id();
            $table->string('receivable_number')->unique();
            $table->string('customer_name');
            $table->string('customer_phone')->nullable();
            $table->foreignId('transaction_id')->nullable()->constrained('transactions')->nullOnDelete();
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->decimal('remaining_amount', 15, 2)->default(0);
            $table->date('due_date')->nullable();
            $table->enum('status', ['unpaid', 'partial', 'paid'])->default('unpaid');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 6. Riwayat Penerimaan Pembayaran Piutang Usaha
        Schema::create('receivable_payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_number')->unique();
            $table->foreignId('receivable_id')->constrained('receivables')->cascadeOnDelete();
            $table->foreignId('cash_account_id')->constrained('cash_accounts')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('amount', 15, 2)->default(0);
            $table->date('payment_date');
            $table->string('payment_method')->default('Cash');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receivable_payments');
        Schema::dropIfExists('receivables');
        Schema::dropIfExists('debt_payments');
        Schema::dropIfExists('debts');
        Schema::dropIfExists('cash_books');
        Schema::dropIfExists('cash_accounts');
    }
};
