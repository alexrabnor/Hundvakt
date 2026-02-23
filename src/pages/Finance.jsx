import React, { useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
    startOfWeek, endOfWeek, startOfMonth, endOfMonth,
    eachDayOfInterval, getISOWeek, getYear, format, isSameMonth
} from 'date-fns';
import { Download, TrendingUp, Wallet, ArrowRight } from 'lucide-react';

const DAYS = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag'];

function Finance() {
    const { dogs, schedules, attendance } = useAppData();

    const currentDate = new Date();

    const getWeekKey = (date) => `${getYear(date)}-W${getISOWeek(date).toString().padStart(2, '0')}`;
    const getDayName = (date) => {
        const day = date.getDay();
        if (day === 0 || day === 6) return null;
        return DAYS[day - 1];
    };

    const calculateIncome = (startDate, endDate) => {
        let expected = 0;
        let actual = 0;

        const days = eachDayOfInterval({ start: startDate, end: endDate });

        days.forEach(day => {
            const dayName = getDayName(day);
            if (!dayName) return; // Skip weekends

            const weekKey = getWeekKey(day);
            const dateKey = format(day, 'yyyy-MM-dd');

            const weekSchedule = schedules[weekKey] || {};
            const dayAttendance = attendance[dateKey] || {};

            dogs.forEach(dog => {
                const dogPrice = Number(dog.dailyPrice) || 0;

                // Expected
                const dogPlan = weekSchedule[dog.id];
                if (dogPlan && dogPlan.days.includes(dayName)) {
                    expected += dogPrice;
                }

                // Actual
                const record = dayAttendance[dog.id];
                if (record && record.checkedIn) {
                    actual += dogPrice;
                }
            });
        });

        return { expected, actual };
    };

    const weekIncome = useMemo(() => {
        return calculateIncome(
            startOfWeek(currentDate, { weekStartsOn: 1 }),
            endOfWeek(currentDate, { weekStartsOn: 1 })
        );
    }, [dogs, schedules, attendance]);

    const monthIncome = useMemo(() => {
        return calculateIncome(
            startOfMonth(currentDate),
            endOfMonth(currentDate)
        );
    }, [dogs, schedules, attendance]);

    const handleExportCSV = () => {
        const days = eachDayOfInterval({
            start: startOfMonth(currentDate),
            end: endOfMonth(currentDate)
        });

        let csvContent = "Datum,Hund,Pris,Status\n";

        days.forEach(day => {
            const dayName = getDayName(day);
            if (!dayName) return;

            const dateKey = format(day, 'yyyy-MM-dd');
            const dayAttendance = attendance[dateKey] || {};

            dogs.forEach(dog => {
                const record = dayAttendance[dog.id];
                if (record && record.checkedIn) {
                    csvContent += `${dateKey},${dog.name},${dog.dailyPrice},Närvarande\n`;
                }
            });
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Hundvakt_Ekonomi_${format(currentDate, 'yyyy_MM')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-stone-800">Ekonomi & Budget</h1>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center space-x-2 bg-stone-800 hover:bg-stone-900 text-white px-4 py-2 rounded-xl shadow-sm transition-colors text-sm font-medium"
                >
                    <Download size={16} />
                    <span className="hidden sm:inline">Exportera Månad (CSV)</span>
                    <span className="sm:hidden">CSV</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
                {/* Denna Vecka */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-stone-500 font-medium">
                            <TrendingUp size={18} />
                            <h2>Denna Vecka</h2>
                        </div>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-4xl font-black text-emerald-600">{weekIncome.actual} kr</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                        <span className="text-sm text-stone-500 font-medium">Förväntat enligt schema</span>
                        <span className="text-stone-800 font-semibold">{weekIncome.expected} kr</span>
                    </div>
                </div>

                {/* Denna Månad */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-stone-500 font-medium">
                            <Wallet size={18} />
                            <h2>Denna Månad</h2>
                        </div>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-4xl font-black text-emerald-600">{monthIncome.actual} kr</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                        <span className="text-sm text-stone-500 font-medium">Förväntat enligt schema</span>
                        <span className="text-stone-800 font-semibold">{monthIncome.expected} kr</span>
                    </div>
                </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl">
                <div className="flex items-start">
                    <div className="bg-emerald-100 p-2 rounded-full mr-4 mt-1">
                        <ArrowRight size={16} className="text-emerald-700" />
                    </div>
                    <div>
                        <h4 className="font-bold text-emerald-900 mb-1">Hur beräknas inkomsten?</h4>
                        <p className="text-sm text-emerald-800 leading-relaxed">
                            <strong>Faktisk inkomst (stora siffran)</strong> baseras <em>endast</em> på hundar som har checkats in på Närvaro-fliken. <strong>Förväntad inkomst</strong> beräknas utifrån hur du har lagt Veckoplanen. Differensen visar om det blivit avbokningar eller sjukdom.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Finance;
