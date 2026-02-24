import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { db, storage } from '../firebase';

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
    const firestoreDataRef = useRef(null);
    const [firestoreLoading, setFirestoreLoading] = useState(!!userId);

    const useFirestore = !!userId;

    const customers = useFirestore ? (firestoreData?.customers ?? []) : localCustomers;
    const dogs = useFirestore ? (firestoreData?.dogs ?? []) : localDogs;
    const schedules = useFirestore ? (firestoreData?.schedules ?? {}) : localSchedules;
    const attendance = useFirestore ? (firestoreData?.attendance ?? {}) : localAttendance;

    useEffect(() => {
        if (!userId) {
            firestoreDataRef.current = null;
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

    // updateFirestore läser alltid från ref för att undvika stale closure
    const updateFirestore = useCallback(async (field, updater) => {
        if (!userId) return;
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
    }, [userId]);

    // Stabila setters med useCallback
    const setCustomers = useCallback((fn) => {
        if (useFirestore) updateFirestore('customers', fn);
        else setLocalCustomers(fn);
    }, [useFirestore, updateFirestore, setLocalCustomers]);

    const setDogs = useCallback((fn) => {
        if (useFirestore) updateFirestore('dogs', fn);
        else setLocalDogs(fn);
    }, [useFirestore, updateFirestore, setLocalDogs]);

    const setSchedules = useCallback((fn) => {
        if (useFirestore) updateFirestore('schedules', fn);
        else setLocalSchedules(fn);
    }, [useFirestore, updateFirestore, setLocalSchedules]);

    const setAttendance = useCallback((fn) => {
        if (useFirestore) updateFirestore('attendance', fn);
        else setLocalAttendance(fn);
    }, [useFirestore, updateFirestore, setLocalAttendance]);

    const addCustomer = useCallback((customer) => setCustomers((prev) => [...prev, customer]), [setCustomers]);
    const updateCustomer = useCallback((id, updated) => setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c))), [setCustomers]);
    const removeCustomer = useCallback((id) => setCustomers((prev) => prev.filter((c) => c.id !== id)), [setCustomers]);

    const addDog = useCallback((dog) => setDogs((prev) => [...prev, dog]), [setDogs]);
    const updateDog = useCallback((id, updated) => setDogs((prev) => prev.map((d) => (d.id === id ? updated : d))), [setDogs]);
    const removeDog = useCallback((id) => setDogs((prev) => prev.filter((d) => d.id !== id)), [setDogs]);

    const copySchedule = useCallback((fromWeek, toWeek) => {
        const src = (firestoreDataRef.current?.schedules ?? {})[fromWeek];
        if (!src) return;
        setSchedules((prev) => ({ ...prev, [toWeek]: JSON.parse(JSON.stringify(src)) }));
    }, [setSchedules]);

    const importFromLocal = useCallback(async () => {
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
    }, [localCustomers, localDogs, localSchedules, localAttendance, userId]);

    const uploadDogPhoto = useCallback(async (dogId, file) => {
        if (!userId || !file) return;
        const path = `users/${userId}/dogs/${dogId}`;
        const fileRef = storageRef(storage, path);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        // Uppdatera hundens photoUrl i Firestore
        updateFirestore('dogs', (prev) =>
            prev.map((d) => (d.id === dogId ? { ...d, photoUrl: url } : d))
        );
        return url;
    }, [userId, updateFirestore]);

    // Engångsmigration: hundar med ownerName/ownerPhone -> kunder
    const migrationRunRef = useRef(false);
    useEffect(() => {
        if (migrationRunRef.current) return;
        if (!firestoreData) return;
        const currentDogs = firestoreData.dogs ?? [];
        const currentCustomers = firestoreData.customers ?? [];
        if (!currentDogs.length) return;

        let hasMigrated = false;
        const newCustomers = [...currentCustomers];
        const newDogs = currentDogs.map((dog) => {
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
            // Spara båda fälten i en enda uppdatering för att undvika stale state
            const userDocRef = doc(db, 'users', userId);
            const next = { ...firestoreData, customers: newCustomers, dogs: newDogs };
            firestoreDataRef.current = next;
            setFirestoreData(next);
            setDoc(userDocRef, next).catch(console.error);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firestoreData]);

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
                uploadDogPhoto,
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
