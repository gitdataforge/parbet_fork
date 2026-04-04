import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, DollarSign, Tag, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function Sell() {
    const navigate = useNavigate();
    const { user, isAuthenticated, openAuthModal, liveMatches, fetchLocationAndMatches } = useAppStore();
    const [step, setStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [listingData, setListingData] = useState({ type: 'ticket', section: '', row: '', quantity: 1, price: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) openAuthModal();
        if (liveMatches.length === 0) fetchLocationAndMatches();
    }, [isAuthenticated, openAuthModal, liveMatches.length, fetchLocationAndMatches]);

    const filteredEvents = liveMatches.filter(m => 
        m.t1.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.t2.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.league.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async () => {
        if (!user) return openAuthModal();
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'listings'), {
                eventId: selectedEvent.id,
                eventName: `${selectedEvent.t1} vs ${selectedEvent.t2}`,
                eventDate: `${selectedEvent.dow}, ${selectedEvent.day} ${selectedEvent.month}`,
                eventLoc: selectedEvent.loc,
                sellerId: user.uid,
                ...listingData,
                price: parseFloat(listingData.price),
                status: 'active',
                createdAt: new Date().toISOString()
            });
            setStep(3);
        } catch (error) {
            console.error("Error creating listing:", error);
            alert("Failed to create listing.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center font-bold">Please log in to sell.</div>;

    return (
        <div className="max-w-4xl mx-auto w-full animate-fade-in pt-6 pb-20">
            <h1 className="text-4xl font-black text-brand-text mb-8">Sell Tickets or Odds</h1>
            
            {/* Progress Bar */}
            <div className="flex items-center space-x-2 mb-10">
                <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-[#114C2A]' : 'bg-gray-200'}`}></div>
                <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-[#114C2A]' : 'bg-gray-200'}`}></div>
                <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-[#114C2A]' : 'bg-gray-200'}`}></div>
            </div>

            {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="text-2xl font-bold mb-4 text-brand-text">1. Select an Event</h2>
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by team, artist, or league..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:border-[#458731] focus:ring-1 focus:ring-[#458731] outline-none transition-all font-medium text-lg"
                        />
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto hide-scrollbar pr-2">
                        {filteredEvents.map(event => (
                            <div 
                                key={event.id} 
                                onClick={() => { setSelectedEvent(event); setStep(2); }}
                                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-[#458731] hover:bg-gray-50 cursor-pointer transition-all"
                            >
                                <div>
                                    <h3 className="font-bold text-lg text-brand-text mb-1">{event.t1} vs {event.t2}</h3>
                                    <p className="text-sm text-brand-muted flex items-center"><Calendar size={14} className="mr-1.5"/> {event.dow}, {event.day} {event.month} • {event.time}</p>
                                    <p className="text-sm text-brand-muted flex items-center mt-1"><MapPin size={14} className="mr-1.5"/> {event.loc}</p>
                                </div>
                                <ChevronRight className="text-gray-400" />
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {step === 2 && selectedEvent && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
                        <h2 className="text-2xl font-bold text-brand-text">2. Listing Details</h2>
                        <button onClick={() => setStep(1)} className="text-sm font-bold text-brand-primary">Change Event</button>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 mb-8">
                        <h3 className="font-bold text-brand-text">{selectedEvent.t1} vs {selectedEvent.t2}</h3>
                        <p className="text-sm text-brand-muted">{selectedEvent.dow}, {selectedEvent.day} {selectedEvent.month} • {selectedEvent.loc}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-bold text-brand-text mb-2 flex items-center"><Tag size={16} className="mr-2"/> Listing Type</label>
                            <select 
                                value={listingData.type}
                                onChange={(e) => setListingData({...listingData, type: e.target.value})}
                                className="w-full p-4 rounded-xl border border-gray-300 outline-none focus:border-[#458731] font-medium bg-white"
                            >
                                <option value="ticket">Event Ticket</option>
                                <option value="odds">Custom Odds/Bet</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-brand-text mb-2 flex items-center"><DollarSign size={16} className="mr-2"/> Price per item (₹)</label>
                            <input 
                                type="number" 
                                placeholder="Enter price"
                                value={listingData.price}
                                onChange={(e) => setListingData({...listingData, price: e.target.value})}
                                className="w-full p-4 rounded-xl border border-gray-300 outline-none focus:border-[#458731] font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-brand-text mb-2">Section / Area</label>
                            <input 
                                type="text" 
                                placeholder="e.g. VIP, North Stand"
                                value={listingData.section}
                                onChange={(e) => setListingData({...listingData, section: e.target.value})}
                                className="w-full p-4 rounded-xl border border-gray-300 outline-none focus:border-[#458731] font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-brand-text mb-2">Quantity</label>
                            <input 
                                type="number" 
                                min="1"
                                value={listingData.quantity}
                                onChange={(e) => setListingData({...listingData, quantity: e.target.value})}
                                className="w-full p-4 rounded-xl border border-gray-300 outline-none focus:border-[#458731] font-medium"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleSubmit}
                        disabled={!listingData.price || isSubmitting}
                        className="w-full bg-[#114C2A] text-white font-bold py-4 rounded-xl hover:bg-[#0c361d] transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Publishing...' : 'Publish Listing'}
                    </button>
                </motion.div>
            )}

            {step === 3 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl border border-gray-200 p-12 shadow-sm text-center">
                    <div className="w-20 h-20 bg-[#E6F2D9] rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} className="text-[#458731]" />
                    </div>
                    <h2 className="text-3xl font-black text-brand-text mb-4">Listing Published!</h2>
                    <p className="text-brand-muted text-lg mb-8">Your {listingData.type} for {selectedEvent?.t1} is now live on the marketplace.</p>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="bg-[#114C2A] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#0c361d] transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </motion.div>
            )}
        </div>
    );
}