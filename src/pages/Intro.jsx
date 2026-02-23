import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

function Intro() {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image (User provided picture) */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 scale-105 animate-in fade-in zoom-in duration-1000"
                style={{
                    backgroundImage: 'url("/intro-bg.jpg")',
                    backgroundPosition: 'center 40%'
                }}
            />

            {/* Dark/Warm gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-stone-900/20 to-stone-900/80 z-10" />

            {/* Content content */}
            <div className="relative z-20 flex flex-col items-center justify-between h-screen py-16 px-6 text-center w-full">

                {/* Removed Header Section since text is baked into the image */}
                <div className="flex-1"></div>

                {/* Footer Section & CTA */}
                <div className="w-full max-w-sm animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-500 fill-mode-both pb-8">
                    <button
                        onClick={() => navigate('/attendance')}
                        className="group w-full flex items-center justify-center p-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
                    >
                        Kom igång
                        <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="mt-6 text-stone-300 text-xs font-medium opacity-80 backdrop-blur-sm">
                        Designad för proffsiga hundvakter
                    </p>
                </div>

            </div>
        </div>
    );
}

export default Intro;
