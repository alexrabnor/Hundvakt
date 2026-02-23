import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AppDataContext = createContext();

export function AppDataProvider({ children }) {
    const [dogs, setDogs] = useLocalStorage('hundvakt_dogs', []);
    const [schedules, setSchedules] = useLocalStorage('hundvakt_schedules', {});
    const [attendance, setAttendance] = useLocalStorage('hundvakt_attendance', {});

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
