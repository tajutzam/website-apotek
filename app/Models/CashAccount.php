<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'account_number',
        'type',
        'opening_balance',
        'current_balance',
        'description',
        'is_active',
    ];

    public function cashBooks()
    {
        return $this->hasMany(CashBook::class);
    }
}
