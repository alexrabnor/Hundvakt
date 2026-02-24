import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebase';

const DEFAULT_DATA = {
    customers: [],
    dogs: [],
    schedules: {},
    attendance: {}
};

const AppDataContext = createContext();

export function AppDataProvider({ children, userId }) {
    const [localCustomers, setLocalCustomers] = useLocalStorage('hundvakt_customers', []);
    const [localDogs, setLocalDogs] = useLocalStorage('hundvakt_dogs', []);
    const [localSchedules, setLocalSchedules] = useLocalStorage('hundvakt_schedules', {});
    const [localAttendance, setLocalAttendance] = useLocalStorage('hundvakt_attendance', {});

    const [firestoreData, setFirestoreData] = useState(null);
    const firestoreDataRef = React.useRef(null);
    const [firestoreLoading, setFirestoreLoading] = useState(!!userId);

    const useFirestore = !!userId;

    const customers = useFirestore ? (firestoreData?.customers ?? []) : localCustomers;
    const dogs = useFirestore ? (firestoreData?.dogs ?? []) : localDogs;
    const schedules = useFirestore ? (firestoreData?.schedules ?? {}) : localSchedules;
    const attendance = useFirestore ? (firestoreData?.attendance ?? {}) : localAttendance;

    const setCustomers = useFirestore ? ((fn) => updateFirestore('customers', fn)) : setLocalCustomers;
    const setDogs = useFirestore ? ((fn) => updateFirestore('dogs', fn)) : setLocalDogs;
    const setSchedules = useFirestore ? ((fn) => updateFirestore('schedules', fn)) : setLocalSchedules;
    const setAttendance = useFirestore ? ((fn) => updateFirestore('attendance', fn)) : setLocalAttendance;

    useEffect(() => {
        if (!userId) {
            setFirestoreData(null);
            setFirestoreLoading(false);
            return;
        }
        const userDocRef = doc(db, 'users', userId);
        getDoc(userDocRef).then((snap) => {
            const data = snap.exists() ? snap.data() : DEFAULT_DATA;
            firestoreDataRef.current = data;
            setFirestoreData(data);
        }).catch((err) => {
            console.error('Firestore load error:', err);
            firestoreDataRef.current = DEFAULT_DATA;
            setFirestoreData(DEFAULT_DATA);
        }).finally(() => {
            setFirestoreLoading(false);
        });
    }, [userId]);

    const updateFirestore = async (field, updater) => {
        const userDocRef = doc(db, 'users', userId);
        const current = firestoreDataRef.current || DEFAULT_DATA;
        const currentVal = current[field] ?? (field === 'schedules' || field === 'attendance' ? {} : []);
        const newVal = typeof updater === 'function' ? updater(currentVal) : updater;
        const next = { ...current, [field]: newVal };
        firestoreDataRef.current = next;
        setFirestoreData(next);
        try {
            await setDoc(userDocRef, next);
        } catch (err) {
            console.error('Firestore save error:', err);
            firestoreDataRef.current = current;
            setFirestoreData(current);
        }
    };

    const addCustomer = (customer) => setCustomers((prev) => [...prev, customer]);
    const updateCustomer = (id, updatedCustomer) => setCustomers((prev) => prev.map((c) => (c.id === id ? updatedCustomer : c)));
    const removeCustomer = (id) => setCustomers((prev) => prev.filter((c) => c.id !== id));

    const addDog = (dog) => setDogs((prev) => [...prev, dog]);
    const updateDog = (id, updatedDog) => setDogs((prev) => prev.map((d) => (d.id === id ? updatedDog : d)));
    const removeDog = (id) => setDogs((prev) => prev.filter((d) => d.id !== id));

    const copySchedule = (fromWeek, toWeek) => {
        const src = schedules[fromWeek];
        if (!src) return;
        setSchedules((prev) => ({ ...prev, [toWeek]: JSON.parse(JSON.stringify(src)) }));
    };

    const importFromLocal = async () => {
        const data = {
            customers: localCustomers,
            dogs: localDogs,
            schedules: localSchedules,
            attendance: localAttendance
        };
        const userDocRef = doc(db, 'users', userId);
        await setDoc(userDocRef, data);
        firestoreDataRef.current = data;
        setFirestoreData(data);
    };

    const migrationRunRef = React.useRef(false);
    useEffect(() => {
        if (migrationRunRef.current || !customers?.length) return;
        let hasMigrated = false;
        let newCustomers = [...customers];
        let newDogs = [...dogs];

        newDogs = newDogs.map((dog) => {
            if (dog.ownerName || dog.ownerPhone) {
                hasMigrated = true;
                const newCustomerId = uuidv4();
                newCustomers.push({
                    id: newCustomerId,
                    name: dog.ownerName || 'Okänd Ägare',
                    phone: dog.ownerPhone || '',
                    email: '',
                    address: '',
                    createdAt: new Date().toISOString()
                });
                const updated = { ...dog, customerId: newCustomerId };
                delete updated.ownerName;
                delete updated.ownerPhone;
                return updated;
            }
            return dog;
        });

        if (hasMigrated) {
            migrationRunRef.current = true;
            setCustomers(() => newCustomers);
            setDogs(() => newDogs);
        }
    }, [customers, dogs, setCustomers, setDogs]);

    return (
        <AppDataContext.Provider
            value={{
                customers,
                setCustomers,
                addCustomer,
                updateCustomer,
                removeCustomer,
                dogs,
                setDogs,
                addDog,
                updateDog,
                removeDog,
                schedules,
                setSchedules,
                copySchedule,
                attendance,
                setAttendance,
                useFirestore,
                firestoreLoading,
                importFromLocal,
                hasLocalData: localCustomers.length > 0 || localDogs.length > 0
            }}
        >
            {children}
        </AppDataContext.Provider>
    );
}

export function useAppData() {
    const context = useContext(AppDataContext);
    if (context === undefined) {
        throw new Error('useAppData must be used within an AppDataProvider');
    }
    return context;
}
