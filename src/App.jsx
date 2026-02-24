import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Intro from './pages/Intro';
import Login from './pages/Login';
import Registry from './pages/Registry';
import Customers from './pages/Customers';
import Schedule from './pages/Schedule';
import Attendance from './pages/Attendance';
import Finance from './pages/Finance';
import { AppDataProvider } from './context/AppDataContext';
import { ImportPrompt } from './components/ImportPrompt';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';

function ProtectedLayout() {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="animate-pulse text-stone-500 font-medium">Laddar…</div>
            </div>
        );
    }
    if (!user) {
        return <Navigate to="/" replace />;
    }
    return <Layout />;
}

function App() {
    const { user, loading } = useAuth();

    return (
        <AppDataProvider userId={user?.uid ?? null}>
            <ToastProvider>
                <ConfirmProvider>
                    <ImportPrompt />
                    {loading ? (
                        <div className="min-h-screen flex items-center justify-center bg-stone-50">
                            <div className="animate-pulse text-stone-500 font-medium">Laddar…</div>
                        </div>
                    ) : (
                        <Routes>
                            <Route path="/" element={<Intro />} />
                            <Route path="/login" element={<Login />} />
                            <Route element={<ProtectedLayout />}>
                                <Route path="/attendance" element={<Attendance />} />
                                <Route path="/schedule" element={<Schedule />} />
                                <Route path="/registry" element={<Registry />} />
                                <Route path="/customers" element={<Customers />} />
                                <Route path="/finance" element={<Finance />} />
                            </Route>
                        </Routes>
                    )}
                </ConfirmProvider>
            </ToastProvider>
        </AppDataProvider>
    );
}

export default App;
