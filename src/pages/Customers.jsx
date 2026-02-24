import React, { useRef, useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useConfirm } from '../context/ConfirmContext';
import { Plus, Edit2, Trash2, Phone, Mail, MapPin, Users, Camera } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

function Customers() {
    const { customers, addCustomer, updateCustomer, removeCustomer, dogs, addDog, updateDog, removeDog, uploadDogPhoto } = useAppData();
    const { confirm } = useConfirm();
    const [isEditing, setIsEditing] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(null);
    const [uploadingPhotoFor, setUploadingPhotoFor] = useState(null);
    const fileInputRef = useRef(null);
    const [pendingPhotoIndex, setPendingPhotoIndex] = useState(null);

    const defaultFormState = {
        name: '',
        phone: '',
        email: '',
        address: ''
    };
    const [formData, setFormData] = useState(defaultFormState);
    const [formDogs, setFormDogs] = useState([]);

    const handleOpenForm = (customer = null) => {
        if (customer) {
            setFormData(customer);
            setFormDogs(dogs.filter(d => d.customerId === customer.id));
            setIsEditing(true);
            setCurrentCustomer(customer.id);
        } else {
            setFormData(defaultFormState);
            setFormDogs([]);
            setIsEditing(true);
            setCurrentCustomer(null);
        }
    };

    const handleCloseForm = () => {
        setIsEditing(false);
        setCurrentCustomer(null);
    };

    const addFormDog = () => {
        setFormDogs([...formDogs, { id: uuidv4(), name: '', dailyPrice: '', notes: '', vetPhone: '', birthday: '' }]);
    };

    const updateFormDog = (index, field, value) => {
        const newDogs = [...formDogs];
        newDogs[index] = { ...newDogs[index], [field]: value };
        setFormDogs(newDogs);
    };

    const removeFormDog = async (index) => {
        const dogToRemove = formDogs[index];
        if (dogToRemove.createdAt) {
            const ok = await confirm({
                title: 'Ta bort hund',
                message: `Vill du ta bort hunden ${dogToRemove.name} från systemet helt?`,
                confirmLabel: 'Ja, ta bort',
                variant: 'danger'
            });
            if (ok) {
                removeDog(dogToRemove.id);
                const newDogs = [...formDogs];
                newDogs.splice(index, 1);
                setFormDogs(newDogs);
            }
        } else {
            const newDogs = [...formDogs];
            newDogs.splice(index, 1);
            setFormDogs(newDogs);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let customerIdToUse = currentCustomer;

        if (currentCustomer) {
            updateCustomer(currentCustomer, { ...formData, id: currentCustomer });
        } else {
            customerIdToUse = uuidv4();
            addCustomer({
                ...formData,
                id: customerIdToUse,
                createdAt: new Date().toISOString()
            });
        }

        // Spara hundar och ladda upp foton om pending
        for (const dog of formDogs) {
            const dogId = dog.id;
            if (dog.createdAt) {
                updateDog(dogId, { ...dog, customerId: customerIdToUse });
            } else {
                addDog({ ...dog, customerId: customerIdToUse, createdAt: new Date().toISOString() });
            }
            // Ladda upp foto om ett finns i _pendingFile
            if (dog._pendingFile) {
                setUploadingPhotoFor(dogId);
                try {
                    await uploadDogPhoto(dogId, dog._pendingFile);
                } catch (err) {
                    console.error('Foto-uppladdning misslyckades:', err);
                }
                setUploadingPhotoFor(null);
            }
        }

        handleCloseForm();
    };

    const safeRemove = async (id, name) => {
        const hasDogs = dogs.some(d => d.customerId === id);
        const message = hasDogs
            ? `Kunden ${name} har hundar kopplade. Vill du ta bort kunden OCH alla dess hundar permanent?`
            : `Är du säker på att du vill ta bort kunden ${name}?`;
        const ok = await confirm({
            title: 'Ta bort kund',
            message,
            confirmLabel: 'Ja, ta bort',
            variant: 'danger'
        });
        if (ok) {
            if (hasDogs) {
                const customerDogs = dogs.filter(d => d.customerId === id);
                customerDogs.forEach(d => removeDog(d.id));
            }
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
                        className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-emerald-900/20 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
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

                        {/* Hund-sektion i formuläret */}
                        <div className="mt-8 pt-6 border-t border-stone-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-stone-800">Kopplade hundar</h3>
                            </div>

                            {formDogs.map((dog, index) => (
                                <div key={dog.id} className="p-4 bg-stone-50 border border-stone-200 rounded-xl mb-3 space-y-3 relative group">
                                    <button
                                        type="button"
                                        onClick={() => removeFormDog(index)}
                                        className="absolute top-4 right-4 text-stone-400 hover:text-red-500"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <div className="flex items-center gap-3">
                                        {/* Profilbild / kamera-knapp */}
                                        <div className="relative flex-shrink-0">
                                            {dog._previewUrl || dog.photoUrl ? (
                                                <img
                                                    src={dog._previewUrl || dog.photoUrl}
                                                    alt={dog.name}
                                                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                                                    {dog.name ? dog.name.charAt(0).toUpperCase() : '🐶'}
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPendingPhotoIndex(index);
                                                    fileInputRef.current?.click();
                                                }}
                                                className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 shadow hover:bg-emerald-700 transition-colors"
                                                title="Lägg till foto"
                                            >
                                                <Camera size={12} />
                                            </button>
                                        </div>
                                        <h4 className="font-medium text-emerald-800">Hund {index + 1}</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-stone-500 mb-1">Namn *</label>
                                            <input required type="text" placeholder="Fido" value={dog.name} onChange={(e) => updateFormDog(index, 'name', e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-stone-500 mb-1">Dagspris (kr) *</label>
                                            <input required type="number" placeholder="300" value={dog.dailyPrice} onChange={(e) => updateFormDog(index, 'dailyPrice', e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-stone-500 mb-1">Ev. Anteckningar / Varningar</label>
                                            <input type="text" placeholder="Allergier..." value={dog.notes || ''} onChange={(e) => updateFormDog(index, 'notes', e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Dold fil-input för fotouppladdning */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file || pendingPhotoIndex === null) return;
                                    const previewUrl = URL.createObjectURL(file);
                                    const newDogs = [...formDogs];
                                    newDogs[pendingPhotoIndex] = {
                                        ...newDogs[pendingPhotoIndex],
                                        _pendingFile: file,
                                        _previewUrl: previewUrl
                                    };
                                    setFormDogs(newDogs);
                                    setPendingPhotoIndex(null);
                                    e.target.value = '';
                                }}
                            />

                            <button
                                type="button"
                                onClick={addFormDog}
                                className="text-emerald-600 font-medium hover:text-emerald-700 text-sm flex items-center mt-2 px-2 py-1 bg-emerald-50 rounded bg-opacity-50 hover:bg-opacity-100 transition-colors"
                            >
                                <Plus size={16} className="mr-1" /> Lägg till ännu en hund
                            </button>
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 mt-4">
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
                                Spara Kund & Hundar
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
                    {customers.length === 0 ? (
                        <div className="col-span-full bg-white/80 backdrop-blur-sm p-12 rounded-3xl shadow-sm border border-stone-100/50 text-center flex flex-col items-center justify-center space-y-3">
                            <div className="p-4 bg-stone-50 rounded-full text-stone-400 mb-2">
                                <Users size={32} />
                            </div>
                            <p className="text-stone-600 text-lg font-medium">Inga kunder ännu.</p>
                            <p className="text-stone-400 text-sm">Klicka på "Ny kund" för att komma igång.</p>
                        </div>
                    ) : (
                        customers.map(customer => {
                            const customerDogs = dogs.filter(d => d.customerId === customer.id);

                            return (
                                <div key={customer.id} className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-stone-200/50 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/5">
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
                                                            {d.name} ({d.dailyPrice} kr)
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
