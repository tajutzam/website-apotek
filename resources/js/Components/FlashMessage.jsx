import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function FlashMessage() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (flash?.success) {
            setMessage({ type: 'success', text: flash.success });
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 4000);
            return () => clearTimeout(timer);
        } else if (flash?.error) {
            setMessage({ type: 'error', text: flash.error });
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!visible || !message.text) return null;

    return (
        <div className="fixed top-5 right-5 z-50 transition-all transform ease-out duration-300">
            <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium ${
                    message.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
            >
                {message.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                )}
                <span className="flex-1">{message.text}</span>
                <button
                    onClick={() => setVisible(false)}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
