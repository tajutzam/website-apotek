import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Printer,
    ArrowLeft,
    ShoppingCart,
    Activity,
    CheckCircle2,
    Calendar,
    User,
    CreditCard
} from 'lucide-react';

export default function TransactionShow({ transaction }) {
    const handlePrint = () => {
        window.print();
    };

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val || 0);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Struk Penjualan #${transaction.invoice_number}`} />

            {/* Print Style */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-receipt, #printable-receipt * {
                        visibility: visible;
                    }
                    #printable-receipt {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 20px;
                    }
                    header, aside, .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Action Bar */}
            <div className="no-print flex items-center justify-between">
                <Link
                    href="/transactions"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-2 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Riwayat</span>
                </Link>

                <div className="flex items-center gap-2">
                    <Link
                        href="/pos"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Transaksi Baru</span>
                    </Link>
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-colors"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Struk</span>
                    </button>
                </div>
            </div>

            {/* Printable Receipt Container */}
            <div className="flex justify-center">
                <div
                    id="printable-receipt"
                    className="w-full max-w-md bg-white rounded-xl border border-slate-200/90 shadow-lg p-6 sm:p-8"
                >
                    {/* Header */}
                    <div className="text-center border-b border-dashed border-slate-200 pb-5">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-teal-50 text-teal-600 mb-2">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                            Apotek Mandiri
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Jl. Kesehatan Raya No. 45, Jakarta Selatan
                        </p>
                        <p className="text-xs text-slate-500">Telp: (021) 7890-1234 / 0812-3456-7890</p>
                    </div>

                    {/* Metadata */}
                    <div className="py-4 border-b border-dashed border-slate-200 text-xs space-y-1 text-slate-600">
                        <div className="flex justify-between">
                            <span>No. Invoice:</span>
                            <span className="font-bold text-slate-900 font-mono">{transaction.invoice_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Waktu:</span>
                            <span>{formatDate(transaction.transaction_date)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Kasir:</span>
                            <span>{transaction.user?.name || 'Apoteker'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Pelanggan:</span>
                            <span className="font-medium text-slate-800">{transaction.customer_name}</span>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="py-4 border-b border-dashed border-slate-200">
                        <table className="w-full text-xs text-left">
                            <thead>
                                <tr className="text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-100 pb-1">
                                    <th className="pb-2">Obat</th>
                                    <th className="pb-2 text-center">Qty</th>
                                    <th className="pb-2 text-right">Harga</th>
                                    <th className="pb-2 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transaction.items.map((item) => (
                                    <tr key={item.id} className="text-slate-700">
                                        <td className="py-2 pr-2">
                                            <p className="font-semibold text-slate-900">{item.medicine?.name}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">{item.medicine?.code}</p>
                                        </td>
                                        <td className="py-2 text-center font-medium">{item.quantity}</td>
                                        <td className="py-2 text-right text-slate-500">{formatRupiah(item.unit_price)}</td>
                                        <td className="py-2 text-right font-bold text-slate-900">{formatRupiah(item.subtotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Payment Summary */}
                    <div className="pt-4 text-xs space-y-1.5 text-slate-700">
                        <div className="flex justify-between font-bold text-sm text-slate-900 pt-1">
                            <span>Total Tagihan</span>
                            <span className="text-teal-700">{formatRupiah(transaction.total_amount)}</span>
                        </div>
                        <div className="flex justify-between pt-1">
                            <span>Metode Bayar:</span>
                            <span className="font-semibold">{transaction.payment_method}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Nominal Dibayar:</span>
                            <span className="font-medium">{formatRupiah(transaction.paid_amount)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-900">
                            <span>Kembalian:</span>
                            <span>{formatRupiah(transaction.change_amount)}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400 space-y-1">
                        <p className="font-medium text-slate-600">Semoga Lekas Sembuh & Sehat Selalu</p>
                        <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan kecuali ada perjanjian khusus.</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
