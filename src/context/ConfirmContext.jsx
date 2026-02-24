import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
    const [modal, setModal] = useState(null);
    const resolveRef = React.useRef(null);

    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setModal({
                title: options.title || 'Bekräfta',
                message: options.message || '',
                confirmLabel: options.confirmLabel || 'Ja',
                cancelLabel: options.cancelLabel || 'Avbryt',
                variant: options.variant || 'default' // default | danger
            });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (resolveRef.current) resolveRef.current(true);
        setModal(null);
    }, []);

    const handleCancel = useCallback(() => {
        if (resolveRef.current) resolveRef.current(false);
        setModal(null);
    }, []);

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {modal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 fade-in duration-200"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="confirm-title"
                    >
                        <div className="flex gap-4">
                            <div className={`p-3 rounded-full flex-shrink-0 ${modal.variant === 'danger' ? 'bg-red-100' : 'bg-emerald-100'}`}>
                                <AlertTriangle size={24} className={modal.variant === 'danger' ? 'text-red-600' : 'text-emerald-600'} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 id="confirm-title" className="text-lg font-bold text-stone-800 mb-2">
                                    {modal.title}
                                </h2>
                                <p className="text-stone-600 text-sm mb-6">
                                    {modal.message}
                                </p>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2.5 text-stone-600 font-medium rounded-xl hover:bg-stone-100 transition-colors"
                                    >
                                        {modal.cancelLabel}
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className={`px-4 py-2.5 font-medium rounded-xl transition-colors ${
                                            modal.variant === 'danger'
                                                ? 'bg-red-600 text-white hover:bg-red-700'
                                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        }`}
                                    >
                                        {modal.confirmLabel}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within ConfirmProvider');
    }
    return context;
}
