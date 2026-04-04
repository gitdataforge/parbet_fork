import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ShieldCheck, Ticket } from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function Event() {
    const [searchParams] = useSearchParams();
    const eventId = searchParams.get('id');
    const navigate = useNavigate();
    
    const { liveMatches, fetchLocationAndMatches } = useAppStore();
    const [eventData, setEventData] = useState(null);
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (liveMatches.length === 0) {
            fetchLocationAndMatches();
        } else if (eventId) {
            const found = liveMatches.find(m => m.id === eventId);
            setEventData(found);
            
            // Fetch real P2P listings for this event from Firebase
            const q = query(collection(db, 'listings'), where('eventId', '==', eventId), where('status', '==', 'active'));
            const unsub = onSnapshot(q, (snapshot) => {
                const fetchedListings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Sort by cheapest first
                setListings(fetchedListings.sort((a, b) => a.price - b.price));
                setIsLoading(false);
            });
            return () => unsub();
        }
    }, [eventId, liveMatches, fetchLocationAndMatches]);

    if (!eventId || (!eventData && !isLoading)) return <div className="min-h-screen p-10 font-bold">Event not found.</div>;

    return (
        <div className="w-full animate-fade-in pb-20">
            {/* Dynamic Premium Header */}
            <div className="relative w-full h-[300px] md:h-[400px] bg-[#114C2A] rounded-[24px] overflow-hidden mb-10 shadow-lg">
                {eventData && (
                    <>
                        <img 
                            src={`https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1600&q=80`} 
                            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" 
                            alt="Stadium" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                            <span className="px-3 py-1 bg-[#E6F2D9] text-[#114C2A] text-xs font-bold uppercase tracking-wider rounded-md mb-4 inline-block">{eventData.league}</span>
                            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-3 drop-shadow-md">{eventData.t1} <span className="text-gray-400 text-3xl">vs</span> {eventData.t2}</h1>
                            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6 text-white/90">
                                <span className="flex items-center font-medium"><Calendar size={18} className="mr-2"/> {eventData.dow}, {eventData.day} {eventData.month} • {eventData.time}</span>
                                <span className="flex items-center font-medium"><MapPin size={18} className="mr-2"/> {eventData.loc}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Listings */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-brand-text">Available Tickets</h2>
                        <span className="text-sm font-bold text-brand-muted">{listings.length} listings</span>
                    </div>

                    {isLoading ? (
                        <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-[#114C2A] border-t-transparent rounded-full animate-spin"></div></div>
                    ) : listings.length === 0 ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 text-center">
                            <Ticket size={40} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-bold text-brand-text mb-2">No tickets available right now</h3>
                            <p className="text-brand-muted mb-6">Be the first to list a ticket for this event.</p>
                            <button onClick={() => navigate('/sell')} className="bg-white border border-gray-300 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm">Sell Tickets</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {listings.map((list) => (
                                <motion.div 
                                    whileHover={{ scale: 1.01 }}
                                    key={list.id} 
                                    className="bg-white border border-gray-200 rounded-[16px] p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:border-[#458731] hover:shadow-md transition-all cursor-pointer"
                                >
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">Sec {list.section}</span>
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">Qty: {list.quantity}</span>
                                        </div>
                                        <p className="text-sm text-brand-muted flex items-center"><ShieldCheck size={14} className="text-[#458731] mr-1.5"/> Verified P2P Seller</p>
                                    </div>
                                    <div className="mt-4 sm:mt-0 flex flex-col sm:items-end">
                                        <span className="text-2xl font-black text-brand-text mb-2">₹{list.price.toLocaleString()} <span className="text-xs text-gray-400 font-medium">/ea</span></span>
                                        <button 
                                            onClick={() => navigate(`/checkout?listingId=${list.id}`)}
                                            className="bg-[#114C2A] text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-[#0c361d] transition-colors"
                                        >
                                            Buy Now
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Security info */}
                <div className="w-full lg:w-[350px]">
                    <div className="bg-[#E6F2D9] rounded-2xl p-6 border border-[#C5E1A5] sticky top-24">
                        <ShieldCheck size={32} className="text-[#114C2A] mb-4" />
                        <h3 className="font-bold text-lg text-[#114C2A] mb-2">Parbet Guarantee</h3>
                        <p className="text-sm text-[#114C2A]/80 mb-4 leading-relaxed">
                            Every transaction is secured by smart contracts. You will receive valid tickets in time for the event, or your money back.
                        </p>
                        <ul className="space-y-2 text-sm font-medium text-[#114C2A]">
                            <li className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-[#458731] mr-2"></div> 100% secure checkout</li>
                            <li className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-[#458731] mr-2"></div> Instant digital delivery</li>
                            <li className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-[#458731] mr-2"></div> 24/7 customer support</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}