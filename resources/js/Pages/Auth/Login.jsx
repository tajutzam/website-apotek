import React, { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Activity, Mail, Lock, LogIn, ShieldAlert } from 'lucide-react';
import FlashMessage from '@/Components/FlashMessage';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: 'admin@apotek.com',
        password: 'password',
        remember: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    const fillCredentials = (email, password) => {
        setData({
            ...data,
            email: email,
            password: password,
        });
    };

    return (
        <div className="min-h-screen bg-[#1e1e2d] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased text-slate-800">
            <Head title="Masuk ke Sistem" />
            <FlashMessage />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 mb-4 shadow-lg">
                    <Activity className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white uppercase">
                    Apotek Mandiri
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                    Sistem Informasi & Manajemen Inventori Apotek
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Masuk Akun</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Silakan masukkan kredensial akun Anda untuk melanjutkan
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={submit}>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                                Alamat Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    className={`block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border ${
                                        errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                                    } focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors`}
                                    placeholder="nama@apotek.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    className={`block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border ${
                                        errors.password ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                                    } focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors`}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                />
                                <span>Ingat sesi saya</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-60 transition-colors"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>{processing ? 'Memproses...' : 'Masuk ke Sistem'}</span>
                        </button>
                    </form>

                    {/* Quick Demo Credentials */}
                    <div className="mt-6 pt-5 border-t border-slate-100">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2.5">
                            Akun Demo Siap Pakai
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => fillCredentials('admin@apotek.com', 'password')}
                                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-200 rounded-lg text-center transition-colors"
                            >
                                Admin (Apoteker)
                            </button>
                            <button
                                type="button"
                                onClick={() => fillCredentials('kasir@apotek.com', 'password')}
                                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-200 rounded-lg text-center transition-colors"
                            >
                                Akun Kasir
                            </button>
                        </div>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-slate-400">
                    &copy; {new Date().getFullYear()} Apotek Mandiri. Seluruh hak cipta dilindungi.
                </p>
            </div>
        </div>
    );
}
