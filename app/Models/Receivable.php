<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Receivable extends Model
{
    use HasFactory;

    protected $fillable = [
        'receivable_number',
        'customer_name',
        'customer_phone',
        'transaction_id',
        'total_amount',
        'paid_amount',
        'remaining_amount',
        'due_date',
        'status',
        'notes',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function payments()
    {
        return $this->hasMany(ReceivablePayment::class);
    }
}
