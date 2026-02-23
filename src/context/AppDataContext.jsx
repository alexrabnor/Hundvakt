import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

const AppDataContext = createContext();

export function AppDataProvider({ children }) {
    const [customers, setCustomers] = useLocalStorage('hundvakt_customers', []);
    const [dogs, setDogs] = useLocalStorage('hundvakt_dogs', []);
    const [schedules, setSchedules] = useLocalStorage('hundvakt_schedules', {});
    const [attendance, setAttendance] = useLocalStorage('hundvakt_attendance', {});

    // Migration Effect: Move legacy owner data from dogs to separate customers
    useEffect(() => {
        let hasMigrated = false;
        let newCustomers = [...customers];
        let newDogs = [...dogs];

        newDogs = newDogs.map(dog => {
            if (dog.ownerName || dog.ownerPhone) {
                // Legacy dog found. Create a customer for it.
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

                // Update dog to use customerId and remove old fields
                const updatedDog = { ...dog, customerId: newCustomerId };
                delete updatedDog.ownerName;
                delete updatedDog.ownerPhone;
                return updatedDog;
            }
            return dog;
        });

        if (hasMigrated) {
            setCustomers(newCustomers);
            setDogs(newDogs);
            console.log("Migrerade gamla hundägare till kundregistret.");
        }
    }, [dogs, customers, setDogs, setCustomers]);

    // Customer actions
    const addCustomer = (customer) => setCustomers((prev) => [...prev, customer]);
    const updateCustomer = (id, updatedCustomer) => setCustomers((prev) => prev.map((c) => (c.id === id ? updatedCustomer : c)));
    const removeCustomer = (id) => setCustomers((prev) => prev.filter((c) => c.id !== id));

    // Dog actions
    const addDog = (dog) => setDogs((prev) => [...prev, dog]);
    const updateDog = (id, updatedDog) => setDogs((prev) => prev.map((d) => (d.id === id ? updatedDog : d)));
    const removeDog = (id) => setDogs((prev) => prev.filter((d) => d.id !== id));

    // Schedule actions
    const copySchedule = (fromWeek, toWeek) => {
        if (!schedules[fromWeek]) return;
        setSchedules((prev) => ({
            ...prev,
            [toWeek]: JSON.parse(JSON.stringify(schedules[fromWeek]))
        }));
    };

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
                setAttendance
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
