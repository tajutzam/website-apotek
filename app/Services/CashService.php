<?php

namespace App\Services;

use App\Models\CashAccount;
use App\Models\CashBook;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CashService
{
    /**
     * Get or create default cash account
     */
    public static function getDefaultCashAccount(): CashAccount
    {
        return CashAccount::firstOrCreate(
            ['code' => 'KAS-KASIR'],
            [
                'name' => 'Kasir Utama (Tunai)',
                'type' => 'cash',
                'opening_balance' => 1000000,
                'current_balance' => 1000000,
                'description' => 'Kas tunai operasional kasir apotek',
                'is_active' => true,
            ]
        );
    }

    /**
     * Get or create default bank account
     */
    public static function getDefaultBankAccount(string $type = 'bank'): CashAccount
    {
        $code = $type === 'bank' ? 'BANK-BCA' : 'QRIS-GOPAY';
        $name = $type === 'bank' ? 'Bank BCA Operasional' : 'QRIS / E-Wallet';

        return CashAccount::firstOrCreate(
            ['code' => $code],
            [
                'name' => $name,
                'type' => $type === 'bank' ? 'bank' : 'e-wallet',
                'opening_balance' => 5000000,
                'current_balance' => 5000000,
                'description' => "Akun {$name} apotek",
                'is_active' => true,
            ]
        );
    }

    /**
     * Record cash book mutation & update account balance
     */
    public static function recordMutation(
        CashAccount $account,
        string $type, // 'in' or 'out'
        string $category,
        float $amount,
        string $description,
        ?string $referenceType = null,
        ?int $referenceId = null,
        ?string $referenceNumber = null
    ): CashBook {
        $account = CashAccount::lockForUpdate()->find($account->id);

        if ($type === 'in') {
            $newBalance = $account->current_balance + $amount;
        } else {
            $newBalance = $account->current_balance - $amount;
        }

        $account->update(['current_balance' => $newBalance]);

        $entryNumber = 'CB-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

        return CashBook::create([
            'entry_number' => $entryNumber,
            'cash_account_id' => $account->id,
            'user_id' => Auth::id(),
            'type' => $type,
            'category' => $category,
            'amount' => $amount,
            'balance_after' => $newBalance,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'reference_number' => $referenceNumber,
            'description' => $description,
            'transaction_date' => now(),
        ]);
    }
}
