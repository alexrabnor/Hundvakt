import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { ChevronLeft, ChevronRight, Copy, Save, Clock } from 'lucide-react';
import { getISOWeek, getYear, addWeeks, subWeeks } from 'date-fns';

const DAYS = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag'];

function Schedule() {
    const { dogs, schedules, setSchedules, copySchedule } = useAppData();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState('plan'); // 'plan' | 'overview'

    const year = getYear(currentDate);
    const week = getISOWeek(currentDate);
    const weekKey = `${year}-W${week.toString().padStart(2, '0')}`;

    const prevDate = subWeeks(currentDate, 1);
    const prevWeekKey = `${getYear(prevDate)}-W${getISOWeek(prevDate).toString().padStart(2, '0')}`;

    const currentSchedule = schedules[weekKey] || {};
    const previousSchedule = schedules[prevWeekKey];

    // Initialize missing dogs for the week view so we have a drafted state
    const [draft, setDraft] = useState({});

    useEffect(() => {
        const initialDraft = {};
        dogs.forEach(dog => {
            initialDraft[dog.id] = currentSchedule[dog.id] || { days: [], dropOffTime: '', pickUpTime: '' };
        });
        setDraft(initialDraft);
    }, [weekKey, dogs, schedules]);

    const handleDayToggle = (dogId, day) => {
        setDraft(prev => {
            const dogData = prev[dogId];
            const hasDay = dogData.days.includes(day);
            const newDays = hasDay
                ? dogData.days.filter(d => d !== day)
                : [...dogData.days, day];

            return {
                ...prev,
                [dogId]: { ...dogData, days: newDays }
            };
        });
    };

    const handleTimeChange = (dogId, field, value) => {
        setDraft(prev => ({
            ...prev,
            [dogId]: { ...prev[dogId], [field]: value }
        }));
    };

    const handleSave = () => {
        // Only save dogs that actually have days scheduled to keep storage clean
        const toSave = {};
        Object.keys(draft).forEach(dogId => {
            if (draft[dogId].days.length > 0) {
                toSave[dogId] = draft[dogId];
            }
        });

        setSchedules(prev => ({
            ...prev,
            [weekKey]: toSave
        }));
        alert('Veckoschemat sparat!');
    };

    const handleCopyPrevious = () => {
        if (window.confirm('Vill du kopiera förra veckans schema? Detta skriver över eventuella osparade ändringar.')) {
            copySchedule(prevWeekKey, weekKey);
        }
    };

    // Derived data for the Overview tab
    const getDogsForDay = (day) => {
        return dogs.filter(dog => {
            const dogPlan = currentSchedule[dog.id];
            return dogPlan && dogPlan.days.includes(day);
        }).map(dog => {
            return {
                ...dog,
                plan: currentSchedule[dog.id]
            };
        });
    };

    return (
        <div className="space-y-6">
            {/* Header & Navigation */}
            <div className="flex flex-col space-y-4">
                <h1 className="text-2xl font-bold text-stone-800">Veckoplan</h1>

                <div className="flex items-center justify-between bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-sm border border-stone-200/50">
                    <button
                        onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
                        className="p-2 text-stone-600 hover:text-emerald-600 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="text-center">
                        <h2 className="text-lg font-bold text-emerald-800">Vecka {week}</h2>
                        <p className="text-xs text-stone-500 font-medium">{year}</p>
                    </div>
                    <button
                        onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
                        className="p-2 text-stone-600 hover:text-emerald-600 transition-colors"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-stone-200/50 rounded-xl shadow-inner">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'overview' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                    Översikt
                </button>
                <button
                    onClick={() => setActiveTab('plan')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'plan' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                    Ändra schema
                </button>
            </div>

            {activeTab === 'plan' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleCopyPrevious}
                            disabled={!previousSchedule}
                            className="flex-1 flex justify-center items-center py-3 bg-white/80 backdrop-blur-sm border border-emerald-200 text-emerald-800 font-semibold rounded-xl shadow-sm hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Copy size={18} className="mr-2" />
                            Kopiera förra veckan
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 flex justify-center items-center py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-sm hover:bg-emerald-700 transition-all hover:-translate-y-0.5"
                        >
                            <Save size={18} className="mr-2" />
                            Spara schema
                        </button>
                    </div>

                    {/* Dog List */}
                    <div className="space-y-4">
                        {dogs.length === 0 ? (
                            <div className="text-center py-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-stone-200/50">
                                <p className="text-stone-500">Inga hundar i registret ännu.</p>
                            </div>
                        ) : (
                            dogs.map(dog => {
                                const data = draft[dog.id] || { days: [], dropOffTime: '', pickUpTime: '' };
                                return (
                                    <div key={dog.id} className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-stone-200/50">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-lg text-stone-800">{dog.name}</h3>
                                            <div className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100/50">{data.days.length} dgr</div>
                                        </div>

                                        {/* Day Toggles */}
                                        <div className="flex justify-between gap-2 mb-5">
                                            {DAYS.map(day => (
                                                <button
                                                    key={day}
                                                    onClick={() => handleDayToggle(dog.id, day)}
                                                    className={`flex-1 aspect-square sm:aspect-auto sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center ${data.days.includes(day)
                                                        ? 'bg-emerald-600 text-white shadow-md scale-105'
                                                        : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                                                        }`}
                                                >
                                                    {day.substring(0, 3)}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Optional Times */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 mb-1.5 uppercase tracking-wider">Lämnas (ca)</label>
                                                <input
                                                    type="time"
                                                    value={data.dropOffTime}
                                                    onChange={(e) => handleTimeChange(dog.id, 'dropOffTime', e.target.value)}
                                                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50 text-stone-800 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-stone-500 mb-1.5 uppercase tracking-wider">Hämtas (ca)</label>
                                                <input
                                                    type="time"
                                                    value={data.pickUpTime}
                                                    onChange={(e) => handleTimeChange(dog.id, 'pickUpTime', e.target.value)}
                                                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50 text-stone-800 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {DAYS.map(day => {
                        const dogsToday = getDogsForDay(day);

                        return (
                            <div key={day} className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-stone-200/50 overflow-hidden">
                                <div className="bg-stone-100/80 px-4 py-3 border-b border-stone-200/50 flex justify-between items-center">
                                    <h3 className="font-bold text-stone-800">{day}</h3>
                                    <span className="text-xs font-bold px-2.5 py-1 bg-white text-stone-600 rounded-lg shadow-sm">
                                        {dogsToday.length} {dogsToday.length === 1 ? 'hund' : 'hundar'}
                                    </span>
                                </div>
                                <div className="p-4">
                                    {dogsToday.length === 0 ? (
                                        <p className="text-sm text-stone-400 italic text-center py-2">Inga hundar inbokade.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {dogsToday.map(dog => (
                                                <div key={dog.id} className="flex justify-between items-center p-3 rounded-xl bg-stone-50 border border-stone-100">
                                                    <span className="font-bold text-emerald-800">{dog.name}</span>
                                                    <div className="flex items-center text-xs font-semibold text-stone-500 gap-3">
                                                        <div className="flex items-center">
                                                            <Clock size={12} className="mr-1 mt-px" />
                                                            {dog.plan.dropOffTime || '-'}
                                                        </div>
                                                        <span className="text-stone-300">|</span>
                                                        <div className="flex items-center">
                                                            {dog.plan.pickUpTime || '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Schedule;
