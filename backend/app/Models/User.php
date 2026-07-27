<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $table = 'user';
    protected $primaryKey = 'id_user';

    public $timestamps = false;

    protected $fillable = [
        'nama',
        'username',
        'password',
        'level',
        'role',
        'status',
        'last_login'
    ];

    protected $hidden = [
        'password'
    ];

    protected $appends = ['abilities'];

    protected $casts = [
        'last_login' => 'datetime',
        'status' => 'integer',
        'level' => 'integer',
    ];

    public function getAbilitiesAttribute(): array
    {
        return \App\Support\Roles::abilities($this->role);
    }

    public function hasAbility(string $ability): bool
    {
        return \App\Support\Roles::can($this, $ability);
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    public function berita()
    {
        return $this->hasMany(Berita::class, 'id_user');
    }
}
