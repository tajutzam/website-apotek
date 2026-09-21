<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReceivablePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_number',
        'receivable_id',
        'cash_account_id',
        'user_id',
        'amount',
        'payment_date',
        'payment_method',
        'notes',
    ];

    public function receivable()
    {
        return $this->belongsTo(Receivable::class);
    }

    public function cashAccount()
    {
        return $this->belongsTo(CashAccount::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
