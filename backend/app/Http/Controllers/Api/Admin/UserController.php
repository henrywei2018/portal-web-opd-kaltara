<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(User::orderBy('id_user', 'asc')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama' => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:user,username',
            'password' => 'required|string|min:6',
            'role' => ['required', \Illuminate\Validation\Rule::in(\App\Support\Roles::ROLES)],
            'status' => 'nullable|integer',
        ]);

        if ($data['role'] === 'super_admin' && !$this->isSuperAdmin()) {
            return response()->json(['error' => 'Hanya Super Admin yang dapat membuat Super Admin'], 403);
        }

        $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
        $data['status'] = $data['status'] ?? 1;
        $data['level'] = $this->levelForRole($data['role']);

        $user = User::create($data);

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'tambah_user',
            'detail' => "User baru: {$data['username']} (role {$data['role']})",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($user, 201);
    }

    public function show($id)
    {
        return response()->json(User::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($user->role === 'super_admin' && !$this->isSuperAdmin()) {
            return response()->json(['error' => 'Hanya Super Admin yang dapat mengubah akun Super Admin'], 403);
        }

        $data = $request->validate([
            'nama' => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:user,username,' . $id . ',id_user',
            'password' => 'nullable|string|min:6',
            'role' => ['required', \Illuminate\Validation\Rule::in(\App\Support\Roles::ROLES)],
            'status' => 'nullable|integer',
        ]);

        if ($data['role'] === 'super_admin' && !$this->isSuperAdmin()) {
            return response()->json(['error' => 'Hanya Super Admin yang dapat menetapkan peran Super Admin'], 403);
        }
        if ($user->role === 'super_admin' && $data['role'] !== 'super_admin' && User::where('role', 'super_admin')->count() <= 1) {
            return response()->json(['error' => 'Tidak dapat menurunkan Super Admin terakhir'], 422);
        }

        $data['level'] = $this->levelForRole($data['role']);

        if (!empty($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
        } else {
            unset($data['password']);
        }

        if (!isset($data['status'])) {
            $data['status'] = $user->status;
        }

        $user->update($data);

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'edit_user',
            'detail' => "Update user id={$id} ({$data['username']}, role {$data['role']})",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($user);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($id == auth()->user()->id_user) {
            return response()->json(['error' => 'Cannot delete own account'], 403);
        }
        if ($user->role === 'super_admin' && !$this->isSuperAdmin()) {
            return response()->json(['error' => 'Hanya Super Admin yang dapat menghapus Super Admin'], 403);
        }
        if ($user->role === 'super_admin' && User::where('role', 'super_admin')->count() <= 1) {
            return response()->json(['error' => 'Tidak dapat menghapus Super Admin terakhir'], 422);
        }

        $username = $user->username;
        $user->delete();

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'hapus_user',
            'detail' => "Hapus user {$username} (id={$id})",
            'ip_address' => request()->ip(),
        ]);

        return response()->json(null, 204);
    }

    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);

        if ($id == auth()->user()->id_user) {
            return response()->json(['error' => 'Cannot deactivate own account'], 403);
        }

        $user->update(['status' => $user->status ? 0 : 1]);

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'toggle_status_user',
            'detail' => "User {$user->username} " . ($user->status ? 'diaktifkan' : 'dinonaktifkan') . " (id={$id})",
            'ip_address' => request()->ip(),
        ]);

        return response()->json($user);
    }

    public function resetPassword($id)
    {
        $user = User::findOrFail($id);

        $newPass = $this->generatePassword(14);
        $user->update(['password' => password_hash($newPass, PASSWORD_BCRYPT)]);

        // Log audit
        AuditLog::create([
            'id_user' => auth()->user()->id_user,
            'nama_user' => auth()->user()->nama,
            'aksi' => 'reset_password',
            'detail' => "Reset password user {$user->username} (id={$id})",
            'ip_address' => request()->ip(),
        ]);

        return response()->json([
            'username' => $user->username,
            'new_password' => $newPass,
        ]);
    }

    private function isSuperAdmin(): bool
    {
        return optional(auth()->user())->role === 'super_admin';
    }

    private function levelForRole(string $role): int
    {
        return match ($role) {
            'super_admin', 'admin' => 1,
            'editor' => 2,
            default => 3,
        };
    }

    private function generatePassword($length = 14)
    {
        $lower = 'abcdefghjkmnpqrstuvwxyz';
        $upper = 'ABCDEFGHJKMNPQRSTUVWXYZ';
        $nums = '23456789';
        $special = '@#$!%*?&';
        $all = $lower . $upper . $nums . $special;

        $password = $lower[random_int(0, strlen($lower) - 1)];
        $password .= $upper[random_int(0, strlen($upper) - 1)];
        $password .= $nums[random_int(0, strlen($nums) - 1)];
        $password .= $special[random_int(0, strlen($special) - 1)];

        while (strlen($password) < $length) {
            $password .= $all[random_int(0, strlen($all) - 1)];
        }

        return str_shuffle($password);
    }
}
