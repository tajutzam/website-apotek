<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Debt extends Model
{
    use HasFactory;

    protected $fillable = [
        'debt_number',
        'supplier_name',
        'invoice_number',
        'total_amount',
        'paid_amount',
        'remaining_amount',
        'due_date',
        'status',
        'notes',
    ];

    public function payments()
    {
        return $this->hasMany(DebtPayment::class);
    }
}
