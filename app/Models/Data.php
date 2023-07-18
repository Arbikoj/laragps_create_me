<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Data extends Model
{
    use HasFactory;

    protected $fillable = [
        'uid',
        'employees_id',
        'sn',
        'lat',
        'long',
        'date',
    ];
}
