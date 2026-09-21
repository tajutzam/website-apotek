<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashBook extends Model
{
    use HasFactory;

    protected $fillable = [
        'entry_number',
        'cash_account_id',
        'user_id',
        'type',
        'category',
        'amount',
        'balance_after',
        'reference_type',
        'reference_id',
        'reference_number',
        'description',
        'transaction_date',
    ];

    public function cashAccount()
    {
        return $this->belongsTo(CashAccount::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
