import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2 } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const toast = useCallback((message, options = {}) => {
        const id = Date.now();
        const { duration = 3000 } = options;
        setToasts(prev => [...prev, { id, message, duration }]);
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
        return id;
    }, []);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast, dismiss }}>
            {children}
            <div className="fixed bottom-24 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none md:bottom-6 md:left-auto md:right-6 md:max-w-sm">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className="pointer-events-auto flex items-center gap-3 bg-stone-800 text-white px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-300"
                    >
                        <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
                        <span className="font-medium text-sm">{t.message}</span>
                        <button
                            onClick={() => dismiss(t.id)}
                            className="ml-auto text-stone-400 hover:text-white p-1"
                            aria-label="Stäng"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
