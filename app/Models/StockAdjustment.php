<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockAdjustment extends Model
{
    use HasFactory;

    protected $fillable = [
        'medicine_id',
        'user_id',
        'type',
        'previous_stock',
        'quantity',
        'final_stock',
        'reason',
        'reference_number',
        'notes',
    ];

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
