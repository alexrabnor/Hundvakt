import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Plus, Edit2, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

function Customers() {
    const { customers, addCustomer, updateCustomer, removeCustomer, dogs } = useAppData();
    const [isEditing, setIsEditing] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(null);

    const defaultFormState = {
        name: '',
        phone: '',
        email: '',
        address: ''
    };
    const [formData, setFormData] = useState(defaultFormState);

    const handleOpenForm = (customer = null) => {
        if (customer) {
            setFormData(customer);
            setIsEditing(true);
            setCurrentCustomer(customer.id);
        } else {
            setFormData(defaultFormState);
            setIsEditing(true);
            setCurrentCustomer(null);
        }
    };

    const handleCloseForm = () => {
        setIsEditing(false);
        setCurrentCustomer(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentCustomer) {
            updateCustomer(currentCustomer, { ...formData, id: currentCustomer });
        } else {
            addCustomer({
                ...formData,
                id: uuidv4(),
                createdAt: new Date().toISOString()
            });
        }
        handleCloseForm();
    };

    const safeRemove = (id, name) => {
        const hasDogs = dogs.some(d => d.customerId === id);
        if (hasDogs) {
            alert(`Du kan inte ta bort ${name} eftersom de har hundar registrerade. Ta bort hundarna först.`);
            return;
        }
        if (window.confirm(`Är du säker på att du vill ta bort kunden ${name}?`)) {
            removeCustomer(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-stone-800">Kundregister</h1>
                {!isEditing && (
                    <button
                        onClick={() => handleOpenForm()}
                        className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus size={20} />
                        <span className="font-medium">Ny kund</span>
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h2 className="text-xl font-semibold mb-4 text-stone-800">
                        {currentCustomer ? 'Redigera kund' : 'Lägg till ny kund'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Namn *</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
                                    placeholder="Anna Andersson"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Telefonnummer *</label>
                                <input
                                    required
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
                                    placeholder="070-123 45 67"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">E-post (frivilligt)</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
                                    placeholder="anna@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Adress/Fakturaadress (frivilligt)</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
                                    placeholder="Storgatan 1"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleCloseForm}
                                className="px-4 py-2 text-stone-600 hover:text-stone-800 font-medium"
                            >
                                Avbryt
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-colors"
                            >
                                Spara
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
                    {customers.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-sm">
                            <p className="text-stone-500">Inga kunder registrerade ännu.</p>
                        </div>
                    ) : (
                        customers.map(customer => {
                            const customerDogs = dogs.filter(d => d.customerId === customer.id);

                            return (
                                <div key={customer.id} className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-stone-800 mb-3">{customer.name}</h3>

                                        <div className="space-y-2 mt-4 text-sm text-stone-600">
                                            {customer.phone && (
                                                <a href={`tel:${customer.phone}`} className="flex items-center text-emerald-600 hover:underline">
                                                    <Phone size={14} className="mr-2" /> {customer.phone}
                                                </a>
                                            )}
                                            {customer.email && (
                                                <a href={`mailto:${customer.email}`} className="flex items-center text-stone-600 hover:underline">
                                                    <Mail size={14} className="mr-2" /> {customer.email}
                                                </a>
                                            )}
                                            {customer.address && (
                                                <p className="flex items-start text-stone-600">
                                                    <MapPin size={14} className="mr-2 mt-1 min-w-[14px]" /> {customer.address}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-5 pt-4 border-t border-stone-100">
                                            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Hundar ({customerDogs.length})</p>
                                            <div className="flex flex-wrap gap-2">
                                                {customerDogs.length > 0 ? (
                                                    customerDogs.map(d => (
                                                        <span key={d.id} className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                                                            {d.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-stone-400 text-xs italic">Inga hundar kopplade</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-stone-100">
                                        <button
                                            onClick={() => handleOpenForm(customer)}
                                            className="p-2 text-stone-500 hover:text-emerald-600 transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => safeRemove(customer.id, customer.name)}
                                            className="p-2 text-stone-500 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
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

export default Customers;
