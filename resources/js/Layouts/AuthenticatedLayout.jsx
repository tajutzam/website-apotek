import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import FlashMessage from '@/Components/FlashMessage';
import {
    LayoutDashboard,
    Pill,
    Tags,
    ShoppingCart,
    ReceiptText,
    BarChart3,
    LogOut,
    Menu,
    X,
    UserCircle,
    ChevronDown,
    ChevronRight,
    Building2,
    Calendar,
    Clock,
    Activity,
    FolderKanban,
    BadgeDollarSign,
    Layers,
    Boxes,
    FileSpreadsheet,
    Users,
    History,
    ShieldCheck,
    RotateCcw,
    XCircle,
    ListOrdered,
    Landmark,
    Wallet,
    BookOpen,
    ArrowUpRight,
    ArrowDownRight,
    PanelLeftClose,
    PanelLeftOpen,
    Database
} from 'lucide-react';

export default function AuthenticatedLayout({ children, title }) {
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
    const [isCollapsed, setIsCollapsed] = useState(false); // desktop mini sidebar (icons only)
    const [userDropdown, setUserDropdown] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const currentRoute = window.location.pathname;

    const formattedDate = new Intl.DateTimeFormat('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(currentTime);

    const formattedTime = new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(currentTime).replace(/\./g, ':');

    const navigationGroups = [
        {
            id: 'main',
            title: 'Menu Utama',
            icon: LayoutDashboard,
            items: [
                {
                    name: 'Dashboard',
                    href: '/dashboard',
                    icon: LayoutDashboard,
                    active: currentRoute === '/dashboard' || currentRoute === '/',
                },
            ],
        },
        {
            id: 'sales',
            title: 'Penjualan & Kasir',
            icon: BadgeDollarSign,
            items: [
                {
                    name: 'Kasir / POS',
                    href: '/pos',
                    icon: ShoppingCart,
                    active: currentRoute.startsWith('/pos'),
                },
                {
                    name: 'Daftar Penjualan',
                    href: '/sales',
                    icon: ListOrdered,
                    active: currentRoute === '/sales' || currentRoute.startsWith('/transactions'),
                },
                {
                    name: 'Retur Penjualan',
                    href: '/sales-returns',
                    icon: RotateCcw,
                    active: currentRoute.startsWith('/sales-returns'),
                },
                {
                    name: 'Penjualan Tertolak',
                    href: '/sales-rejected',
                    icon: XCircle,
                    active: currentRoute.startsWith('/sales-rejected'),
                },
            ],
        },
        {
            id: 'inventory',
            title: 'Persediaan & Stok',
            icon: Boxes,
            items: [
                {
                    name: 'Stok & Kartu Persediaan',
                    href: '/inventory',
                    icon: Boxes,
                    active: currentRoute.startsWith('/inventory'),
                },
            ],
        },
        {
            id: 'finance',
            title: 'Keuangan & Kas',
            icon: Landmark,
            items: [
                {
                    name: 'Daftar Akun Kas',
                    href: '/finance/accounts',
                    icon: Wallet,
                    active: currentRoute === '/finance/accounts',
                },
                {
                    name: 'Buku Kas & Mutasi',
                    href: '/finance/cash-book',
                    icon: BookOpen,
                    active: currentRoute === '/finance/cash-book',
                },
                {
                    name: 'Utang Usaha (Supplier)',
                    href: '/finance/debts',
                    icon: ArrowDownRight,
                    active: currentRoute === '/finance/debts',
                },
                {
                    name: 'Piutang Usaha (Pasien)',
                    href: '/finance/receivables',
                    icon: ArrowUpRight,
                    active: currentRoute === '/finance/receivables',
                },
            ],
        },
        {
            id: 'master',
            title: 'Master Data',
            icon: Layers,
            items: [
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
            ],
        },
        {
            id: 'reports',
            title: 'Laporan & Analitik',
            icon: FileSpreadsheet,
            items: [
                {
                    name: 'Laporan Penjualan & Stok',
                    href: '/reports',
                    icon: BarChart3,
                    active: currentRoute.startsWith('/reports'),
                },
            ],
        },
        {
            id: 'system',
            title: 'Pengaturan & Audit',
            icon: ShieldCheck,
            items: [
                ...(auth?.user?.role === 'admin' ? [
                    {
                        name: 'Backup & Restore DB',
                        href: '/settings/database',
                        icon: Database,
                        active: currentRoute.startsWith('/settings/database'),
                    },
                ] : []),
                {
                    name: 'Manajemen Pengguna',
                    href: '/users',
                    icon: Users,
                    active: currentRoute.startsWith('/users'),
                },
                {
                    name: 'Log Aktivitas',
                    href: '/activity-logs',
                    icon: History,
                    active: currentRoute.startsWith('/activity-logs'),
                },
            ],
        },
    ];

    const [openGroups, setOpenGroups] = useState(() => {
        const initial = {};
        navigationGroups.forEach((group) => {
            const hasActive = group.items.some((item) => item.active);
            initial[group.id] = hasActive; // Hanya true jika ada item aktif di dalamnya
        });
        return initial;
    });

    const toggleGroup = (groupId) => {
        setOpenGroups((prev) => ({
            ...prev,
            [groupId]: !prev[groupId],
        }));
    };

    const todayDate = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    return (
        <div className="min-h-screen bg-[#f4f6f8] flex flex-col font-sans text-slate-700 antialiased">
            <FlashMessage />

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex h-screen overflow-hidden">
                {/* Clean White Sidebar matching MEDIKASA logo - Collapsible to icons only */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col transition-all duration-200 ease-in-out lg:static ${
                        isCollapsed ? 'w-20' : 'w-64'
                    } ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}
                >
                    {/* Brand Header */}
                    <div className={`h-16 flex items-center justify-between border-b border-slate-100 bg-white ${isCollapsed ? 'px-3 justify-center' : 'px-5'}`}>
                        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
                            <div className="h-10 flex items-center justify-center flex-shrink-0">
                                <img
                                    src="/medikasa.png"
                                    alt="MEDIKASA"
                                    className={`h-9 w-auto object-contain transition-all ${
                                        isCollapsed ? 'max-w-[40px]' : 'max-w-[140px]'
                                    }`}
                                />
                            </div>
                        </Link>
                        {!isCollapsed && (
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(false)}
                                className="text-slate-400 hover:text-slate-600 lg:hidden p-1 rounded-md hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Navigation Menu */}
                    <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2 py-4 space-y-4' : 'px-3.5 py-4 space-y-2.5'}`}>
                        {navigationGroups.map((group) => {
                            const isOpen = openGroups[group.id];
                            const hasActiveItem = group.items.some((item) => item.active);
                            const GroupIcon = group.icon;

                            // When collapsed to mini mode (Icons Only)
                            if (isCollapsed) {
                                return (
                                    <div key={group.id} className="space-y-1.5 flex flex-col items-center">
                                        {group.items.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    title={item.name}
                                                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all group relative ${
                                                        item.active
                                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                                            : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                                                    }`}
                                                >
                                                    <Icon className="w-5 h-5 flex-shrink-0" />

                                                    {/* Tooltip on hover */}
                                                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                                                        {item.name}
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                );
                            }

                            // Full Expanded Mode
                            return (
                                <div key={group.id} className="space-y-1">
                                    {/* Group Header with toggle */}
                                    <button
                                        type="button"
                                        onClick={() => toggleGroup(group.id)}
                                        className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all group ${
                                            hasActiveItem
                                                ? 'text-blue-700 bg-blue-50/80 font-extrabold'
                                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            {GroupIcon && (
                                                <GroupIcon
                                                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                                                        hasActiveItem
                                                            ? 'text-blue-600'
                                                            : 'text-slate-400 group-hover:text-slate-600'
                                                    }`}
                                                />
                                            )}
                                            <span className="truncate">{group.title}</span>
                                        </div>
                                        <ChevronDown
                                            className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${
                                                hasActiveItem
                                                    ? 'text-blue-600'
                                                    : 'text-slate-400 group-hover:text-slate-600'
                                            } ${isOpen ? 'rotate-0' : '-rotate-90'}`}
                                        />
                                    </button>

                                    {/* Group Items */}
                                    {isOpen && (
                                        <div className="space-y-1 pt-0.5 pl-3 transition-all border-l-2 border-slate-100 ml-4">
                                            {group.items.map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                                                            item.active
                                                                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                                                                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/60'
                                                        }`}
                                                    >
                                                        <Icon
                                                            className={`w-3.5 h-3.5 flex-shrink-0 ${
                                                                item.active ? 'text-white' : 'text-slate-400'
                                                            }`}
                                                        />
                                                        <span>{item.name}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Current User Info at Sidebar Bottom */}
                    <div className={`p-3.5 border-t border-slate-100 bg-slate-50/80 ${isCollapsed ? 'flex justify-center' : ''}`}>
                        <div className="flex items-center gap-3 px-1">
                            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-800 font-bold text-xs flex-shrink-0">
                                {auth.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate">{auth.user?.name}</p>
                                    <p className="text-[11px] text-emerald-600 font-semibold capitalize truncate">
                                        {auth.user?.role || 'Apoteker'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {/* Top Navbar */}
                    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between z-10">
                        <div className="flex items-center gap-3">
                            {/* Mobile Drawer Toggle */}
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(true)}
                                className="text-slate-500 hover:text-slate-700 lg:hidden p-1.5 rounded-md hover:bg-slate-100"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            {/* Desktop Sidebar Collapse Toggle */}
                            <button
                                type="button"
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                title={isCollapsed ? "Buka Sidebar Penuh" : "Kecilkan Sidebar (Hanya Ikon)"}
                                className="hidden lg:inline-flex items-center justify-center text-slate-500 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                {isCollapsed ? (
                                    <PanelLeftOpen className="w-5 h-5" />
                                ) : (
                                    <PanelLeftClose className="w-5 h-5" />
                                )}
                            </button>

                            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 bg-slate-100/90 px-3 py-1.5 rounded-lg border border-slate-200/70">
                                <div className="flex items-center gap-1.5 text-slate-600">
                                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                    <span>{formattedDate}</span>
                                </div>
                                <span className="text-slate-300">|</span>
                                <div className="flex items-center gap-1 font-mono text-blue-700 font-bold tracking-wider">
                                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>{formattedTime} WIB</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Right User Menu */}
                        <div className="flex items-center gap-4">
                            <Link
                                href="/pos"
                                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors"
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
                                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
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
