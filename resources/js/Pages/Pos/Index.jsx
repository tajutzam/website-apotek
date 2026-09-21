import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Search,
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    CreditCard,
    CheckCircle2,
    Receipt,
    Pill,
    User,
    DollarSign,
    RefreshCcw
} from 'lucide-react';

export default function PosIndex({ medicines }) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('Pelanggan Umum');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [paidAmount, setPaidAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Extract unique categories
    const categories = useMemo(() => {
        const set = new Set();
        medicines.forEach((m) => {
            if (m.category?.name) set.add(m.category.name);
        });
        return Array.from(set);
    }, [medicines]);

    // Filtered medicine catalogue
    const filteredMedicines = useMemo(() => {
        return medicines.filter((m) => {
            const matchesSearch =
                m.name.toLowerCase().includes(search.toLowerCase()) ||
                m.code.toLowerCase().includes(search.toLowerCase()) ||
                (m.category?.name && m.category.name.toLowerCase().includes(search.toLowerCase()));

            const matchesCategory =
                selectedCategory === 'all' || m.category?.name === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [medicines, search, selectedCategory]);

    const addToCart = (medicine) => {
        const existing = cart.find((item) => item.id === medicine.id);
        if (existing) {
            if (existing.quantity >= medicine.stock) {
                alert(`Stok maksimal untuk ${medicine.name} adalah ${medicine.stock}`);
                return;
            }
            setCart(
                cart.map((item) =>
                    item.id === medicine.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        } else {
            setCart([
                ...cart,
                {
                    id: medicine.id,
                    name: medicine.name,
                    code: medicine.code,
                    selling_price: parseFloat(medicine.selling_price),
                    stock: medicine.stock,
                    unit_name: medicine.unit?.name || 'Unit',
                    is_prescription: medicine.is_prescription,
                    quantity: 1,
                },
            ]);
        }
    };

    const updateQuantity = (id, delta) => {
        setCart(
            cart
                .map((item) => {
                    if (item.id === id) {
                        const newQty = item.quantity + delta;
                        if (newQty > item.stock) {
                            alert(`Stok maksimal tercapai (${item.stock})`);
                            return item;
                        }
                        return newQty > 0 ? { ...item, quantity: newQty } : null;
                    }
                    return item;
                })
                .filter(Boolean)
        );
    };

    const removeFromCart = (id) => {
        setCart(cart.filter((item) => item.id !== id));
    };

    const clearCart = () => {
        if (cart.length > 0 && confirm('Kosongkan keranjang belanja?')) {
            setCart([]);
            setPaidAmount('');
        }
    };

    const totalAmount = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.selling_price * item.quantity, 0);
    }, [cart]);

    const changeAmount = useMemo(() => {
        const paid = parseFloat(paidAmount) || 0;
        return Math.max(0, paid - totalAmount);
    }, [paidAmount, totalAmount]);

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val || 0);
    };

    const handleCheckout = (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            alert('Keranjang belanja masih kosong.');
            return;
        }

        const paid = parseFloat(paidAmount) || 0;
        if (paid < totalAmount) {
            alert('Jumlah uang pembayaran masih kurang.');
            return;
        }

        setIsSubmitting(true);
        router.post(
            '/pos',
            {
                customer_name: customerName,
                payment_method: paymentMethod,
                paid_amount: paid,
                notes: notes,
                items: cart.map((item) => ({
                    medicine_id: item.id,
                    quantity: item.quantity,
                })),
            },
            {
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    // Quick cash suggestion buttons
    const setExactCash = () => setPaidAmount(totalAmount.toString());
    const setRoundCash = (round) => {
        const rounded = Math.ceil(totalAmount / round) * round;
        setPaidAmount(rounded.toString());
    };

    return (
        <AuthenticatedLayout>
            <Head title="Kasir Point of Sale (POS)" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Side: Product Catalogue (7 Cols) */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Header & Search */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-900 tracking-tight">Katalog Kasir</h2>
                            <span className="text-xs text-slate-500 font-medium">
                                {filteredMedicines.length} Obat Tersedia
                            </span>
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                placeholder="Cari nama obat, kode, atau indikasi..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            />
                        </div>

                        {/* Category Quick Badges */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('all')}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors ${
                                    selectedCategory === 'all'
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Semua
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors ${
                                        selectedCategory === cat
                                            ? 'bg-teal-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Medicines Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[650px] overflow-y-auto pr-1">
                        {filteredMedicines.map((med) => {
                            const inCart = cart.find((item) => item.id === med.id);
                            return (
                                <div
                                    key={med.id}
                                    onClick={() => addToCart(med)}
                                    className="bg-white p-3.5 rounded-xl border border-slate-200/80 hover:border-teal-400 shadow-2xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group relative"
                                >
                                    {inCart && (
                                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                                            {inCart.quantity}
                                        </span>
                                    )}
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-mono text-slate-400">{med.code}</span>
                                            {med.is_prescription && (
                                                <span className="text-[9px] font-semibold px-1 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                                    Resep
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2 group-hover:text-teal-600 transition-colors">
                                            {med.name}
                                        </h3>
                                        <p className="text-[11px] text-slate-500 mt-0.5">{med.category?.name}</p>
                                    </div>

                                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">
                                                {formatRupiah(med.selling_price)}
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                Stok: {med.stock} {med.unit?.name}
                                            </p>
                                        </div>
                                        <div className="w-7 h-7 rounded-lg bg-teal-50 group-hover:bg-teal-600 text-teal-600 group-hover:text-white flex items-center justify-center transition-colors">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Side: Cart & Checkout (5 Cols) */}
                <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
                    {/* Cart Header */}
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-teal-600" />
                            <h2 className="text-sm font-bold text-slate-900">Keranjang Transaksi</h2>
                        </div>
                        {cart.length > 0 && (
                            <button
                                type="button"
                                onClick={clearCart}
                                className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                            >
                                Kosongkan
                            </button>
                        )}
                    </div>

                    {/* Cart Items List */}
                    <div className="p-4 flex-1 min-h-[200px] max-h-[300px] overflow-y-auto divide-y divide-slate-100">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center py-10 text-slate-400 text-center">
                                <ShoppingCart className="w-8 h-8 stroke-1 text-slate-300 mb-2" />
                                <p className="text-xs font-medium">Keranjang masih kosong</p>
                                <p className="text-[11px] text-slate-400">Pilih obat di sisi kiri untuk memulai</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.id} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                                    <div className="min-w-0 pr-2">
                                        <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                                        <p className="text-[11px] text-slate-500 font-medium">
                                            {formatRupiah(item.selling_price)} / {item.unit_name}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="px-2 py-1 text-slate-600 hover:bg-slate-200"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="px-2 text-xs font-bold text-slate-800">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="px-2 py-1 text-slate-600 hover:bg-slate-200"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>

                                        <p className="text-xs font-bold text-slate-900 w-18 text-right">
                                            {formatRupiah(item.selling_price * item.quantity)}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-slate-400 hover:text-rose-600 p-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Customer & Checkout Form */}
                    <form onSubmit={handleCheckout} className="p-4 border-t border-slate-100 bg-slate-50/40 space-y-3.5 text-xs">
                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Nama Pasien / Pelanggan</label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Pelanggan Umum"
                                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-slate-700 mb-1">Metode Pembayaran</label>
                            <div className="grid grid-cols-4 gap-1.5">
                                {['Cash', 'QRIS', 'Transfer', 'Debit'].map((method) => (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => setPaymentMethod(method)}
                                        className={`py-1.5 text-xs font-semibold rounded-lg border text-center transition-colors ${
                                            paymentMethod === method
                                                ? 'bg-teal-600 border-teal-600 text-white'
                                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                        }`}
                                    >
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Amount Calculation */}
                        <div className="pt-2 border-t border-slate-200/80 space-y-2">
                            <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                                <span>Total Tagihan</span>
                                <span className="text-base text-teal-700">{formatRupiah(totalAmount)}</span>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Uang Diterima (Rp)</label>
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    placeholder="0"
                                    value={paidAmount}
                                    onChange={(e) => setPaidAmount(e.target.value)}
                                    className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 bg-white text-slate-900"
                                />

                                {/* Quick Cash Buttons */}
                                {totalAmount > 0 && (
                                    <div className="flex gap-1.5 mt-1.5">
                                        <button
                                            type="button"
                                            onClick={setExactCash}
                                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800"
                                        >
                                            Uang Pas
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRoundCash(50000)}
                                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800"
                                        >
                                            50.000
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRoundCash(100000)}
                                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800"
                                        >
                                            100.000
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 pt-1">
                                <span>Kembalian</span>
                                <span className="font-bold text-slate-900">{formatRupiah(changeAmount)}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={cart.length === 0 || isSubmitting}
                            className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <Receipt className="w-4 h-4" />
                            <span>{isSubmitting ? 'Memproses Transaksi...' : 'Bayar & Cetak Struk'}</span>
                        </button>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
