import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useConfirm } from '../context/ConfirmContext';
import { Plus, Edit2, Trash2, Phone, Stethoscope, FileText } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

function Registry() {
    const { dogs, addDog, updateDog, removeDog, customers } = useAppData();
    const { confirm } = useConfirm();
    const [isEditing, setIsEditing] = useState(false);
    const [currentDog, setCurrentDog] = useState(null);

    const defaultFormState = {
        name: '',
        dailyPrice: '',
        customerId: '',
        vetPhone: '',
        birthday: '',
        notes: ''
    };
    const [formData, setFormData] = useState(defaultFormState);

    const handleOpenForm = (dog = null) => {
        if (dog) {
            setFormData(dog);
            setIsEditing(true);
            setCurrentDog(dog.id);
        } else {
            setFormData(defaultFormState);
            setIsEditing(true);
            setCurrentDog(null);
        }
    };

    const handleCloseForm = () => {
        setIsEditing(false);
        setCurrentDog(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentDog) {
            updateDog(currentDog, { ...formData, id: currentDog });
        } else {
            addDog({
                ...formData,
                id: uuidv4(),
                createdAt: new Date().toISOString()
            });
        }
        handleCloseForm();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-stone-800">Hundregister</h1>
                {/* Ny hund-knapp borttagen. Hundar läggs nu till via Kundregistret. */}
            </div>

            {isEditing ? (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h2 className="text-xl font-semibold mb-4 text-stone-800">
                        Redigera hund
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Hundens namn *</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
                                    placeholder="Fido"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Dagspris (kr) *</label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    value={formData.dailyPrice}
                                    onChange={(e) => setFormData({ ...formData, dailyPrice: e.target.value })}
                                    className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
                                    placeholder="300"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-stone-700 mb-1">Ägare (Kund)</label>
                                <select
                                    value={formData.customerId}
                                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                    className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
                                >
                                    <option value="">-- Välj en ägare --</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                                    ))}
                                </select>
                                {customers.length === 0 && (
                                    <p className="text-xs text-orange-600 mt-1">Du måste skapa en kund i Kundregistret först.</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Veterinär tel</label>
                                <input
                                    type="tel"
                                    value={formData.vetPhone}
                                    onChange={(e) => setFormData({ ...formData, vetPhone: e.target.value })}
                                    className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Födelsedatum</label>
                                <input
                                    type="date"
                                    value={formData.birthday}
                                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                                    className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Anteckningar / Varningar</label>
                            <textarea
                                rows="3"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full border border-stone-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-stone-50"
                                placeholder="Allergier, aggressiv mot andra hanar, etc..."
                            />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
                    {dogs.length === 0 ? (
                        <div className="col-span-full bg-white/80 backdrop-blur-sm p-12 rounded-3xl shadow-sm border border-stone-100/50 text-center flex flex-col items-center justify-center space-y-3">
                            <div className="p-4 bg-stone-50 rounded-full text-stone-400 mb-2">
                                <FileText size={32} />
                            </div>
                            <p className="text-stone-600 text-lg font-medium">Inga hundar ännu.</p>
                            <p className="text-stone-400 text-sm">Lägg till hundar via Kundregistret.</p>
                        </div>
                    ) : (
                        dogs.map(dog => (
                            <div key={dog.id} className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-stone-200/50 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/5">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            {dog.photoUrl ? (
                                                <img src={dog.photoUrl} alt={dog.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow flex-shrink-0" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg flex-shrink-0">
                                                    {dog.name.charAt(0)}
                                                </div>
                                            )}
                                            <h3 className="text-xl font-bold text-stone-800">{dog.name}</h3>
                                        </div>
                                        <div className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-lg text-sm">
                                            {dog.dailyPrice} kr/dag
                                        </div>
                                    </div>

                                    <div className="space-y-2 mt-4 text-sm text-stone-600">
                                        {dog.customerId && (() => {
                                            const owner = customers.find(c => c.id === dog.customerId);
                                            return owner ? (
                                                <>
                                                    <p className="flex items-center"><span className="font-semibold w-16">Ägare:</span> {owner.name}</p>
                                                    {owner.phone && (
                                                        <a href={`tel:${owner.phone}`} className="flex items-center text-emerald-600 hover:underline">
                                                            <Phone size={14} className="mr-2 w-16 text-stone-400" /> {owner.phone}
                                                        </a>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-red-500 italic">Okänd ägare</p>
                                            );
                                        })()}
                                        {dog.vetPhone && (
                                            <a href={`tel:${dog.vetPhone}`} className="flex items-center text-orange-500 hover:underline mt-1">
                                                <Stethoscope size={14} className="mr-2" /> VET: {dog.vetPhone}
                                            </a>
                                        )}
                                        {dog.birthday && (
                                            <p><span className="font-semibold">Född:</span> {dog.birthday}</p>
                                        )}
                                    </div>

                                    {dog.notes && (
                                        <div className="mt-4 p-3 bg-orange-50 text-orange-800 rounded-lg text-sm border border-orange-100">
                                            <strong>Viktigt:</strong> {dog.notes}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-stone-100">
                                    <button
                                        onClick={() => handleOpenForm(dog)}
                                        className="p-2 text-stone-500 hover:text-emerald-600 transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const ok = await confirm({
                                                title: 'Ta bort hund',
                                                message: `Är du säker på att du vill ta bort ${dog.name}?`,
                                                confirmLabel: 'Ja, ta bort',
                                                variant: 'danger'
                                            });
                                            if (ok) removeDog(dog.id);
                                        }}
                                        className="p-2 text-stone-500 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default Registry;
