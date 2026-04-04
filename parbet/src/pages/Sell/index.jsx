import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, DollarSign, Tag, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function Sell() {
    const navigate = useNavigate();
    const { user, isAuthenticated, openAuthModal, liveMatches, fetchLocationAndMatches } = useAppStore();
    
    // Core Wizard States
    const [step, setStep] = useState(1);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [listingData, setListingData] = useState({ type: 'ticket', section: '', row: '', quantity: 1, price: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Interactive Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated) openAuthModal();
        if (liveMatches.length === 0) fetchLocationAndMatches();
    }, [isAuthenticated, openAuthModal, liveMatches.length, fetchLocationAndMatches]);

    const filteredEvents = liveMatches.filter(m => 
        m.t1.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.t2.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.league.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 500);
    };

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
        <div className={`mx-auto w-full animate-fade-in pb-20 ${step === 1 ? 'pt-16 md:pt-28 max-w-[1200px]' : 'pt-6 max-w-4xl'}`}>
            
            {/* Header & Progress Bar (Hidden on Step 1 to match Viagogo Hero UI) */}
            {step > 1 && (
                <>
                    <h1 className="text-4xl font-black text-brand-text mb-8">Sell Tickets or Odds</h1>
                    <div className="flex items-center space-x-2 mb-10">
                        <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-[#114C2A]' : 'bg-gray-200'}`}></div>
                        <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-[#114C2A]' : 'bg-gray-200'}`}></div>
                        <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-[#114C2A]' : 'bg-gray-200'}`}></div>
                    </div>
                </>
            )}

            {/* STEP 1: Viagogo-Style Hero Search interface */}
            {step === 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center w-full px-4">
                    <h1 className="text-[44px] md:text-[64px] font-black text-brand-text mb-3 tracking-tight leading-none text-center">
                        Sell your tickets
                    </h1>
                    <p className="text-[17px] text-brand-text mb-12 text-center font-medium">
                        parbet is the world's largest secondary marketplace for tickets to live events
                    </p>

                    <div className="relative w-full max-w-4xl z-50">
                        {/* Ultra-wide Search Input */}
                        <div className={`relative flex items-center bg-white border ${isFocused ? 'border-gray-400 shadow-[0_4px_20px_rgba(0,0,0,0.08)]' : 'border-gray-300 shadow-sm'} rounded-full px-6 py-4 transition-all duration-300`}>
                            <Search size={22} className="text-gray-500 mr-3 flex-shrink-0" />
                            <input 
                                type="text" 
                                placeholder="Search your event and start selling" 
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                                className="bg-transparent outline-none flex-1 text-[17px] text-brand-text placeholder-gray-500 font-medium"
                            />
                            {isTyping ? (
                                <Loader2 size={22} className="text-gray-400 animate-spin flex-shrink-0 ml-3" />
                            ) : (
                                /* Exact visual match for Viagogo's static sync ring */
                                <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0 ml-3">
                                    <path d="M21 12a9 9 0 1 1-2.6-6.3" />
                                </svg>
                            )}
                        </div>

                        {/* Real-time Absolute Dropdown */}
                        <AnimatePresence>
                            {isFocused && searchQuery.trim().length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 max-h-[350px] overflow-y-auto text-left z-50"
                                >
                                    {filteredEvents.length > 0 ? (
                                        filteredEvents.map(event => (
                                            <div 
                                                key={event.id} 
                                                onClick={() => { setSelectedEvent(event); setStep(2); }}
                                                className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                                            >
                                                <div>
                                                    <h3 className="font-bold text-[16px] text-brand-text leading-tight">{event.t1} vs {event.t2}</h3>
                                                    <p className="text-[13px] text-brand-muted mt-1 flex items-center">
                                                        <Calendar size={12} className="mr-1.5"/> {event.dow}, {event.day} {event.month} • {event.loc}
                                                    </p>
                                                </div>
                                                <ChevronRight size={18} className="text-gray-400" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center">
                                            <p className="text-[15px] text-brand-muted font-medium">No events found matching "{searchQuery}"</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mt-24 md:mt-32 text-center w-full">
                        <h2 className="text-[28px] font-bold text-[#6A7074] mb-6">Ready to list?</h2>
                        <button 
                            onClick={() => setIsFocused(true)} // Focuses user back to the search context
                            className="bg-[#458731] hover:bg-[#386d27] text-white px-8 py-3.5 rounded-xl font-bold text-[16px] transition-colors shadow-sm"
                        >
                            Sell my tickets
                        </button>
                    </div>
                </motion.div>
            )}

            {/* STEP 2: Secure Firestore Listing Details */}
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
                        className="w-full bg-[#114C2A] text-white font-bold py-4 rounded-xl hover:bg-[#0c361d] transition-colors disabled:opacity-50 flex justify-center items-center"
                    >
                        {isSubmitting ? <Loader2 size={20} className="animate-spin"/> : 'Publish Listing'}
                    </button>
                </motion.div>
            )}

            {/* STEP 3: Confirmation State */}
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