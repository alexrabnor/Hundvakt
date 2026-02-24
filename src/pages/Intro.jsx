import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight } from 'lucide-react';

function Intro() {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background: url visas överst, gradient under (syns om bilden saknas) */}
            <div
                className="absolute inset-0 z-0 animate-in fade-in duration-1000"
                style={{
                    backgroundImage: 'url("/intro-bg.jpg"), linear-gradient(135deg, rgba(6, 78, 59, 0.95), rgba(41, 37, 36, 0.9), rgba(28, 25, 23, 0.95))',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 40%',
                    backgroundRepeat: 'no-repeat'
                }}
            />

            {/* Dark/Warm gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-stone-900/20 to-stone-900/80 z-10" />

            {/* Content content */}
            <div className="relative z-20 flex flex-col items-center justify-between h-screen py-16 px-6 text-center w-full">

                {/* Removed Header Section since text is baked into the image */}
                <div className="flex-1"></div>

                {/* Footer Section & CTA */}
                <div className="w-full max-w-sm animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-500 fill-mode-both pb-8 space-y-3">
                    <button
                        onClick={() => navigate(user ? '/attendance' : '/login')}
                        className="group w-full flex items-center justify-center p-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
                    >
                        {user ? 'Kom igång' : 'Logga in för att komma igång'}
                        <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                    {!user && (
                        <p className="text-stone-300 text-xs font-medium opacity-80 backdrop-blur-sm">
                            Synka mellan iPhone, iPad och dator
                        </p>
                    )}
                    <p className="text-stone-300 text-xs font-medium opacity-80 backdrop-blur-sm">
                        Designad för proffsiga hundvakter
                    </p>
                </div>

            </div>
        </div>
    );
}

export default Intro;
