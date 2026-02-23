import React, { useState, useEffect } from 'react';
import { useAppData } from '../context/AppDataContext';
import { getISOWeek, getYear, format, parseISO, isSameDay, isSameMonth } from 'date-fns';
import { CheckCircle2, RotateCcw, MessageSquare, Clock } from 'lucide-react';

const DAYS = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag'];

function Attendance() {
    const { dogs, schedules, attendance, setAttendance, customers } = useAppData();
    const [currentDate, setCurrentDate] = useState(new Date());

    // Date Keys
    const year = getYear(currentDate);
    const week = getISOWeek(currentDate);
    const weekKey = `${year}-W${week.toString().padStart(2, '0')}`;
    const dateKey = format(currentDate, 'yyyy-MM-dd'); // e.g. "2026-02-23"

    // What day of week is it?
    const dayIndex = currentDate.getDay(); // 0(Sun) - 6(Sat)
    const isWeekend = dayIndex === 0 || dayIndex === 6;
    const currentDayName = !isWeekend ? DAYS[dayIndex - 1] : null;

    // Expected dogs for today from schedule
    const weekSchedule = schedules[weekKey] || {};

    // Todays actual attendance record
    const todaysAttendance = attendance[dateKey] || {};

    // Check if today is dog's birthday
    const isBirthday = (dog) => {
        if (!dog.birthday) return false;
        const dogBday = parseISO(dog.birthday);
        return dogBday.getDate() === currentDate.getDate() && dogBday.getMonth() === currentDate.getMonth();
    };

    // Scheduled Dogs Data
    const scheduledDogs = dogs.filter(dog => {
        const dogPlan = weekSchedule[dog.id];
        return dogPlan && dogPlan.days.includes(currentDayName);
    });

    const handleCheckIn = (dogId) => {
        setAttendance(prev => ({
            ...prev,
            [dateKey]: {
                ...(prev[dateKey] || {}),
                [dogId]: {
                    checkedIn: true,
                    checkInTime: format(new Date(), 'HH:mm')
                }
            }
        }));
    };

    const handleUndoCheckIn = (dogId) => {
        setAttendance(prev => {
            const dayData = { ...(prev[dateKey] || {}) };
            delete dayData[dogId];
            return {
                ...prev,
                [dateKey]: dayData
            };
        });
    };

    const handleCheckOut = (dogId) => {
        setAttendance(prev => ({
            ...prev,
            [dateKey]: {
                ...(prev[dateKey] || {}),
                [dogId]: {
                    ...prev[dateKey][dogId],
                    checkedOut: true,
                    checkOutTime: format(new Date(), 'HH:mm')
                }
            }
        }));
    };

    const handleUndoCheckOut = (dogId) => {
        setAttendance(prev => ({
            ...prev,
            [dateKey]: {
                ...(prev[dateKey] || {}),
                [dogId]: {
                    ...prev[dateKey][dogId],
                    checkedOut: false,
                    checkOutTime: null
                }
            }
        }));
    };

    const getSMSHref = (dog) => {
        const owner = customers.find(c => c.id === dog.customerId);
        if (!owner || !owner.phone) return null;

        const dogPlan = weekSchedule[dog.id] || {};
        const pickUpTime = dogPlan.pickUpTime || 'i eftermiddag';
        const message = `Hej! 🐾 ${dog.name} har haft en toppenbra dag här idag. Det går jättebra att hämta kl ${pickUpTime}. Vi ses!`;
        const encodedBody = encodeURIComponent(message);
        return `sms:${owner.phone}?body=${encodedBody}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2">
                <h1 className="text-2xl font-bold text-stone-800">Dagens Närvaro</h1>
                <p className="text-stone-500 font-medium">
                    {format(currentDate, 'yyyy-MM-dd')} {currentDayName ? `(${currentDayName})` : '(Helg)'}
                </p>
            </div>

            {isWeekend ? (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 text-center">
                    <p className="text-stone-500 text-lg">Det är helg! Ingen schemalagd närvaro.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {scheduledDogs.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 text-center">
                            <p className="text-stone-500 text-lg">Inga hundar schemalagda för idag.</p>
                        </div>
                    ) : (
                        scheduledDogs.map(dog => {
                            const record = todaysAttendance[dog.id];
                            const isCheckedIn = !!record?.checkedIn;
                            const dogPlan = weekSchedule[dog.id] || {};

                            return (
                                <div
                                    key={dog.id}
                                    className={`p-5 rounded-2xl shadow-sm border transition-colors ${isCheckedIn ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-stone-200'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-xl flex items-center gap-2 text-stone-800">
                                            {dog.name} {isBirthday(dog) && <span title="Fyller år idag!">🎂</span>}
                                        </h3>

                                        {isCheckedIn ? (
                                            <div className="flex flex-col items-end">
                                                <span className="flex items-center text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full text-sm font-semibold mb-1">
                                                    <CheckCircle2 size={16} className="mr-1" />
                                                    Incheckad {record.checkInTime}
                                                </span>
                                                {record.checkedOut && (
                                                    <span className="flex items-center text-stone-600 bg-stone-100 px-3 py-1 rounded-full text-xs font-medium">
                                                        Utcheckad {record.checkOutTime}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-stone-400 text-sm font-medium flex items-center">
                                                <Clock size={16} className="mr-1" />
                                                Väntas kl {dogPlan.dropOffTime || '-'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 mt-5">
                                        {!isCheckedIn ? (
                                            <button
                                                onClick={() => handleCheckIn(dog.id)}
                                                className="flex-1 flex justify-center items-center py-3 bg-emerald-600 text-white font-medium rounded-xl shadow-sm hover:bg-emerald-700 transition-colors"
                                            >
                                                Checka in nu
                                            </button>
                                        ) : (
                                            <>
                                                {record.checkedOut ? (
                                                    <button
                                                        onClick={() => handleUndoCheckOut(dog.id)}
                                                        className="flex-1 flex justify-center items-center py-3 bg-white border border-stone-200 text-stone-600 font-medium rounded-xl shadow-sm hover:bg-stone-50 transition-colors"
                                                    >
                                                        <RotateCcw size={18} className="mr-2" />
                                                        Ångra utcheckning
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleCheckOut(dog.id)}
                                                            className="flex-1 flex justify-center items-center py-3 bg-emerald-700 text-white font-medium rounded-xl shadow-sm hover:bg-emerald-800 transition-colors"
                                                        >
                                                            Checka ut
                                                        </button>
                                                        <button
                                                            onClick={() => handleUndoCheckIn(dog.id)}
                                                            className="flex-1 flex justify-center items-center py-3 bg-white border border-stone-200 text-stone-600 font-medium rounded-xl shadow-sm hover:bg-stone-50 transition-colors"
                                                        >
                                                            <RotateCcw size={18} className="mr-2" />
                                                            Ångra
                                                        </button>
                                                    </>
                                                )}

                                                {(() => {
                                                    const owner = customers.find(c => c.id === dog.customerId);
                                                    if (owner && owner.phone) {
                                                        return (
                                                            <a
                                                                href={getSMSHref(dog)}
                                                                className="flex-1 flex justify-center items-center py-3 bg-stone-800 text-white font-medium rounded-xl shadow-sm hover:bg-stone-900 transition-colors"
                                                            >
                                                                <MessageSquare size={18} className="mr-2" />
                                                                Sms
                                                            </a>
                                                        );
                                                    } else {
                                                        return (
                                                            <div className="flex-1 py-3 text-center text-stone-400 text-sm flex items-center justify-center bg-stone-100 rounded-xl">
                                                                Inget tel
                                                            </div>
                                                        );
                                                    }
                                                })()}
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

export default Attendance;
