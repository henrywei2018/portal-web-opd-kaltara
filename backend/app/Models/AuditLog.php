<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $table = 'audit_log';

    // Disable automatic timestamps management
    public $timestamps = false;

    protected $fillable = [
        'id_user',
        'nama_user',
        'aksi',
        'detail',
        'ip_address',
        'created_at'
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    protected static function booted()
    {
        // Timestamps are disabled, so set created_at on insert to satisfy the NOT NULL column.
        static::creating(function ($log) {
            if (empty($log->created_at)) {
                $log->created_at = now();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }
}
