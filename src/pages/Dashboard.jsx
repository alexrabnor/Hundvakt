import React, { useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useNavigate } from 'react-router-dom';
import {
    getISOWeek, getYear, format, startOfWeek, endOfWeek,
    eachDayOfInterval
} from 'date-fns';
import { sv } from 'date-fns/locale';
import { Users, Dog, CheckCircle2, TrendingUp, Calendar, ArrowRight } from 'lucide-react';

const DAYS = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag'];

function Dashboard() {
    const { dogs, customers, schedules, attendance } = useAppData();
    const navigate = useNavigate();
    const now = new Date();

    // Idag
    const dayIndex = now.getDay();
    const isWeekend = dayIndex === 0 || dayIndex === 6;
    const todayName = !isWeekend ? DAYS[dayIndex - 1] : null;
    const weekKey = `${getYear(now)}-W${getISOWeek(now).toString().padStart(2, '0')}`;
    const dateKey = format(now, 'yyyy-MM-dd');
    const weekSchedule = schedules[weekKey] || {};
    const todaysAttendance = attendance[dateKey] || {};

    const todaysDogs = useMemo(() => {
        if (!todayName) return [];
        return dogs.filter(dog => {
            const plan = weekSchedule[dog.id];
            return plan && plan.days.includes(todayName);
        });
    }, [dogs, weekSchedule, todayName]);

    const checkedInCount = todaysDogs.filter(d => todaysAttendance[d.id]?.checkedIn).length;

    // Veckans intäkter
    const weekIncome = useMemo(() => {
        const days = eachDayOfInterval({
            start: startOfWeek(now, { weekStartsOn: 1 }),
            end: endOfWeek(now, { weekStartsOn: 1 })
        });
        let expected = 0, actual = 0;
        days.forEach(day => {
            const di = day.getDay();
            if (di === 0 || di === 6) return;
            const dayName = DAYS[di - 1];
            const wk = `${getYear(day)}-W${getISOWeek(day).toString().padStart(2, '0')}`;
            const dk = format(day, 'yyyy-MM-dd');
            const ws = schedules[wk] || {};
            const da = attendance[dk] || {};
            dogs.forEach(dog => {
                const price = Number(dog.dailyPrice) || 0;
                if (ws[dog.id]?.days.includes(dayName)) expected += price;
                if (da[dog.id]?.checkedIn) actual += price;
            });
        });
        return { expected, actual };
    }, [dogs, schedules, attendance]);

    const dateLabel = format(now, 'EEEE d MMMM', { locale: sv });

    return (
        <div className="space-y-6">
            {/* Rubrik */}
            <div>
                <h1 className="text-2xl font-bold text-stone-800">Hem</h1>
                <p className="text-stone-500 capitalize mt-0.5">{dateLabel}</p>
            </div>

            {/* Snabbstat */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-stone-200/50 flex flex-col items-center justify-center text-center">
                    <div className="p-2 bg-emerald-50 rounded-xl mb-2">
                        <Users size={20} className="text-emerald-600" />
                    </div>
                    <span className="text-2xl font-black text-stone-800">{customers.length}</span>
                    <span className="text-xs text-stone-500 font-medium mt-0.5">Kunder</span>
                </div>
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-stone-200/50 flex flex-col items-center justify-center text-center">
                    <div className="p-2 bg-emerald-50 rounded-xl mb-2">
                        <Dog size={20} className="text-emerald-600" />
                    </div>
                    <span className="text-2xl font-black text-stone-800">{dogs.length}</span>
                    <span className="text-xs text-stone-500 font-medium mt-0.5">Hundar</span>
                </div>
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-stone-200/50 flex flex-col items-center justify-center text-center">
                    <div className="p-2 bg-emerald-50 rounded-xl mb-2">
                        <CheckCircle2 size={20} className="text-emerald-600" />
                    </div>
                    <span className="text-2xl font-black text-stone-800">{checkedInCount}/{todaysDogs.length}</span>
                    <span className="text-xs text-stone-500 font-medium mt-0.5">Idag</span>
                </div>
            </div>

            {/* Veckans intäkter */}
            <div
                className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-3xl shadow-lg shadow-emerald-900/20 cursor-pointer hover:from-emerald-700 hover:to-emerald-900 transition-all duration-300"
                onClick={() => navigate('/finance')}
            >
                <div className="flex items-center gap-2 mb-1 text-emerald-100">
                    <TrendingUp size={16} />
                    <span className="text-sm font-semibold">Denna vecka</span>
                </div>
                <div className="text-4xl font-black text-white mb-3">{weekIncome.actual} kr</div>
                <div className="flex justify-between items-center border-t border-emerald-500/50 pt-3">
                    <span className="text-emerald-200 text-sm">Förväntat: {weekIncome.expected} kr</span>
                    <ArrowRight size={16} className="text-emerald-300" />
                </div>
            </div>

            {/* Dagens hundar */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h2 className="font-bold text-stone-800 flex items-center gap-2">
                        <Calendar size={18} className="text-emerald-600" />
                        {isWeekend ? 'Helg – inga bokningar' : `Idag (${todaysDogs.length} ${todaysDogs.length === 1 ? 'hund' : 'hundar'})`}
                    </h2>
                    {!isWeekend && (
                        <button
                            onClick={() => navigate('/attendance')}
                            className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                        >
                            Närvaro <ArrowRight size={12} />
                        </button>
                    )}
                </div>

                {isWeekend ? (
                    <div className="bg-white/80 p-8 rounded-2xl text-center text-stone-400 border border-stone-100">
                        🐾 Njut av helgen!
                    </div>
                ) : todaysDogs.length === 0 ? (
                    <div className="bg-white/80 p-8 rounded-2xl text-center text-stone-400 border border-stone-100">
                        Inga hundar inbokade idag.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {todaysDogs.map(dog => {
                            const record = todaysAttendance[dog.id];
                            const isIn = record?.checkedIn;
                            const owner = customers.find(c => c.id === dog.customerId);
                            return (
                                <div
                                    key={dog.id}
                                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isIn ? 'bg-emerald-50 border-emerald-200' : 'bg-white/90 border-stone-200/50'}`}
                                >
                                    {/* Foto eller initial */}
                                    {dog.photoUrl ? (
                                        <img
                                            src={dog.photoUrl}
                                            alt={dog.name}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700 font-bold text-lg">
                                            {dog.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-stone-800">{dog.name}</p>
                                        {owner && <p className="text-xs text-stone-500 truncate">{owner.name}</p>}
                                    </div>
                                    {isIn ? (
                                        <span className="flex items-center text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full text-xs font-semibold gap-1 flex-shrink-0">
                                            <CheckCircle2 size={12} /> {record.checkInTime}
                                        </span>
                                    ) : (
                                        <span className="text-stone-400 text-xs flex-shrink-0">
                                            Väntas {weekSchedule[dog.id]?.dropOffTime || ''}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
