import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, Calendar, CheckSquare, DollarSign, LogOut } from 'lucide-react';

function Layout() {
    const { user, logOut } = useAuth();
    const navItems = [
        { name: 'Närvaro', path: '/attendance', icon: CheckSquare },
        { name: 'Veckoplan', path: '/schedule', icon: Calendar },
        { name: 'Ekonomi', path: '/finance', icon: DollarSign },
        { name: 'Hundar', path: '/registry', icon: FileText },
        { name: 'Kunder', path: '/customers', icon: Users },
    ];

    return (
        <div className="flex flex-col min-h-screen text-stone-800 pb-24 md:pb-0 selection:bg-emerald-200">
            {/* Top bar with logout */}
            <div className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-800 flex items-center justify-end pr-2 py-1.5 md:py-1">
                {user && (
                    <button
                        onClick={() => logOut()}
                        className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                        title="Logga ut"
                        aria-label="Logga ut"
                    >
                        <LogOut size={18} />
                    </button>
                )}
            </div>

            <main className="flex-1 overflow-auto p-4 md:p-8 max-w-4xl mx-auto w-full animate-in fade-in duration-500">
                <Outlet />
            </main>

            {/* Navigation for both Mobile and Desktop */}
            <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 md:relative md:bottom-0 md:px-0 md:bg-white md:border-t md:border-stone-200">
                <nav className="bg-white/90 backdrop-blur-md border border-stone-200/50 shadow-lg shadow-stone-200/50 rounded-full md:rounded-none md:shadow-none w-full max-w-md md:max-w-full overflow-hidden">
                    <div className="flex justify-around items-center h-16 px-2 md:px-0">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex flex-col items-center justify-center w-full h-full p-2 text-xs font-medium space-y-1 transition-all duration-300 md:text-sm hover:scale-105 active:scale-95 ${isActive ? 'text-emerald-600 drop-shadow-sm' : 'text-stone-500 hover:text-stone-800'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon size={22} className={isActive ? "mb-0.5" : ""} />
                                        <span>{item.name}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </nav>
            </div>
        </div>
    );
}

export default Layout;
