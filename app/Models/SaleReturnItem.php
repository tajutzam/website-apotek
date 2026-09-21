<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaleReturnItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_return_id',
        'medicine_id',
        'quantity',
        'refund_price',
        'subtotal',
        'restore_stock',
    ];

    public function saleReturn()
    {
        return $this->belongsTo(SaleReturn::class);
    }

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }
}
