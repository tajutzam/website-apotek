<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'string', 'in:admin,kasir,apoteker'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        ActivityLogger::log(
            'create',
            'Pengguna',
            "Menambahkan akun pengguna baru: {$user->name} ({$user->email}) - Role: {$user->role}",
            ['user_id' => $user->id, 'email' => $user->email, 'role' => $user->role]
        );

        return redirect()->back()->with('success', "Pengguna {$user->name} berhasil didaftarkan.");
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', 'string', 'in:admin,kasir,apoteker'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $old = $user->only(['name', 'email', 'role', 'phone']);
        $user->update($validated);

        ActivityLogger::log(
            'update',
            'Pengguna',
            "Memperbarui profil pengguna: {$user->name} ({$user->email})",
            ['old' => $old, 'new' => $validated]
        );

        return redirect()->back()->with('success', "Data pengguna {$user->name} berhasil diperbarui.");
    }

    public function destroy(User $user)
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $name = $user->name;
        $email = $user->email;
        $user->delete();

        ActivityLogger::log(
            'delete',
            'Pengguna',
            "Menghapus akun pengguna: {$name} ({$email})",
            ['email' => $email, 'name' => $name]
        );

        return redirect()->back()->with('success', "Pengguna {$name} berhasil dihapus.");
    }
}
