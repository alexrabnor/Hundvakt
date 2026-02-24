import React, { useEffect, useRef } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';

export function ImportPrompt() {
    const { useFirestore, firestoreLoading, hasLocalData, importFromLocal, customers, dogs } = useAppData();
    const firestoreEmpty = customers.length === 0 && dogs.length === 0;
    const { confirm } = useConfirm();
    const { toast } = useToast();
    const askedRef = useRef(false);

    useEffect(() => {
        if (askedRef.current || !useFirestore || firestoreLoading || !hasLocalData || !firestoreEmpty) return;

        const timer = setTimeout(async () => {
            const ok = await confirm({
                title: 'Importera lokal data?',
                message: 'Du har data sparad på denna enhet. Vill du importera den till molnet så att den synkas mellan alla dina enheter?',
                confirmLabel: 'Ja, importera',
                cancelLabel: 'Nej, börja från början'
            });
            askedRef.current = true;
            if (ok) {
                try {
                    await importFromLocal();
                    toast('Data importerad! Synkas nu mellan enheter.');
                } catch (err) {
                    toast('Import misslyckades. Försök igen.');
                }
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [useFirestore, firestoreLoading, hasLocalData, importFromLocal, confirm, toast]);

    return null;
}
