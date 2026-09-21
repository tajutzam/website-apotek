import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import FlashMessage from '@/Components/FlashMessage';
import {
    LayoutDashboard,
    Pill,
    Tags,
    ShoppingCart,
    ReceiptText,
    LogOut,
    Menu,
    X,
    UserCircle,
    ChevronDown,
    Building2,
    Calendar,
    Activity
} from 'lucide-react';

export default function AuthenticatedLayout({ children, title }) {
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userDropdown, setUserDropdown] = useState(false);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const currentRoute = window.location.pathname;

    const navigation = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
            active: currentRoute === '/dashboard' || currentRoute === '/',
        },
        {
            name: 'Kasir / POS',
            href: '/pos',
            icon: ShoppingCart,
            active: currentRoute.startsWith('/pos'),
        },
        {
            name: 'Data Obat',
            href: '/medicines',
            icon: Pill,
            active: currentRoute.startsWith('/medicines'),
        },
        {
            name: 'Kategori & Satuan',
            href: '/categories',
            icon: Tags,
            active: currentRoute.startsWith('/categories'),
        },
        {
            name: 'Riwayat Transaksi',
            href: '/transactions',
            icon: ReceiptText,
            active: currentRoute.startsWith('/transactions'),
        },
    ];

    const todayDate = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    return (
        <div className="min-h-screen bg-[#f4f6f8] flex flex-col font-sans text-slate-700 antialiased">
            <FlashMessage />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex h-screen overflow-hidden">
                {/* Metronic Dark Sidebar */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1e1e2d] border-r border-[#2d2d3f] flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-0 -translate-x-full'
                    }`}
                >
                    {/* Brand Header */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-[#2d2d3f] bg-[#1a1a27]">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-sm">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="font-bold text-white tracking-wide text-base block leading-tight">
                                    APOTEK MANDIRI
                                </span>
                                <span className="text-[11px] font-medium text-slate-400 block tracking-wider uppercase">
                                    Sistem Manajemen
                                </span>
                            </div>
                        </Link>
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(false)}
                            className="text-slate-400 hover:text-white lg:hidden"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation Menu */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
                        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                            Menu Utama
                        </div>
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                                        item.active
                                            ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/30'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-[#27273a]'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 flex-shrink-0 ${item.active ? 'text-white' : 'text-slate-400'}`} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Current User Info at Sidebar Bottom */}
                    <div className="p-4 border-t border-[#2d2d3f] bg-[#1a1a27]">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs border border-slate-600">
                                {auth.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-200 truncate">{auth.user?.name}</p>
                                <p className="text-[11px] text-teal-400 font-medium capitalize truncate">
                                    {auth.user?.role || 'Apoteker'}
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Metronic Top Navbar */}
                    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between z-10">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(true)}
                                className="text-slate-500 hover:text-slate-700 lg:hidden p-1.5 rounded-md hover:bg-slate-100"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-md border border-slate-200/50">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>{todayDate}</span>
                            </div>
                        </div>

                        {/* Top Right User Menu */}
                        <div className="flex items-center gap-4">
                            <Link
                                href="/pos"
                                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-xs transition-colors"
                            >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Kasir Cepat</span>
                            </Link>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setUserDropdown(!userDropdown)}
                                    className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 focus:outline-hidden py-1 px-2 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 font-semibold text-xs flex items-center justify-center">
                                        {auth.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="font-medium text-xs hidden md:inline-block">{auth.user?.name}</span>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                </button>

                                {userDropdown && (
                                    <div 
                                        className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-slate-200 py-1 z-50"
                                        onMouseLeave={() => setUserDropdown(false)}
                                    >
                                        <div className="px-4 py-2 border-b border-slate-100">
                                            <p className="text-xs font-semibold text-slate-800 truncate">{auth.user?.name}</p>
                                            <p className="text-[11px] text-slate-500 truncate">{auth.user?.email}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                                        >
                                            <LogOut className="w-3.5 h-3.5" />
                                            <span>Keluar</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto p-6 bg-[#f4f6f8]">
                        <div className="max-w-7xl mx-auto space-y-6">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
