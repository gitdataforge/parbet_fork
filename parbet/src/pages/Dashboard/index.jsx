import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Ticket, Activity, Clock } from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, balance, isAuthenticated, openAuthModal } = useAppStore();
    const [activeTab, setActiveTab] = useState('listings');
    const [myListings, setMyListings] = useState([]);
    const [myPurchases, setMyPurchases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) return openAuthModal();
        if (!user) return;

        // Fetch My Listings
        const qListings = query(collection(db, 'listings'), where('sellerId', '==', user.uid));
        const unsubListings = onSnapshot(qListings, (snapshot) => {
            setMyListings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Fetch My Purchases
        const qPurchases = query(collection(db, 'orders'), where('buyerId', '==', user.uid));
        const unsubPurchases = onSnapshot(qPurchases, (snapshot) => {
            setMyPurchases(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoading(false);
        });

        return () => { unsubListings(); unsubPurchases(); };
    }, [user, isAuthenticated]);

    if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center font-bold">Please log in.</div>;

    return (
        <div className="max-w-6xl mx-auto w-full animate-fade-in pt-6 pb-20">
            <h1 className="text-4xl font-black text-brand-text mb-8">My Dashboard</h1>
            
            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-[#114C2A] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-10"><Wallet size={120}/></div>
                    <p className="text-white/80 font-medium mb-1">Available Balance</p>
                    <h2 className="text-4xl font-black mb-4">₹{balance.toLocaleString()}</h2>
                    <button className="bg-white text-[#114C2A] px-4 py-2 rounded-lg text-sm font-bold w-max shadow-sm">Withdraw Funds</button>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center text-brand-muted mb-2"><Ticket size={18} className="mr-2"/> Active Listings</div>
                    <h2 className="text-3xl font-black text-brand-text">{myListings.filter(l => l.status === 'active').length}</h2>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center text-brand-muted mb-2"><Activity size={18} className="mr-2"/> Tickets Purchased</div>
                    <h2 className="text-3xl font-black text-brand-text">{myPurchases.length}</h2>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-6 border-b border-gray-200 mb-8">
                <button onClick={() => setActiveTab('listings')} className={`pb-4 font-bold text-lg transition-colors relative ${activeTab === 'listings' ? 'text-[#114C2A]' : 'text-gray-400'}`}>
                    My Listings
                    {activeTab === 'listings' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#114C2A] rounded-t-full"/>}
                </button>
                <button onClick={() => setActiveTab('purchases')} className={`pb-4 font-bold text-lg transition-colors relative ${activeTab === 'purchases' ? 'text-[#114C2A]' : 'text-gray-400'}`}>
                    My Purchases
                    {activeTab === 'purchases' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#114C2A] rounded-t-full"/>}
                </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-[#114C2A] border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {activeTab === 'listings' && myListings.length === 0 && <div className="p-12 text-center text-brand-muted font-medium">You have no active listings.</div>}
                        {activeTab === 'listings' && myListings.map(listing => (
                            <div key={listing.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors">
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${listing.status === 'sold' ? 'bg-gray-200 text-gray-600' : 'bg-[#E6F2D9] text-[#114C2A]'}`}>{listing.status}</span>
                                        <span className="text-xs font-bold text-brand-muted uppercase">{listing.type}</span>
                                    </div>
                                    <h3 className="font-bold text-lg text-brand-text leading-tight">{listing.eventName}</h3>
                                    <p className="text-sm text-brand-muted mt-1">{listing.eventDate} • Section: {listing.section} • Qty: {listing.quantity}</p>
                                </div>
                                <div className="mt-4 md:mt-0 text-right">
                                    <p className="text-xl font-black text-brand-text">₹{listing.price.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}

                        {activeTab === 'purchases' && myPurchases.length === 0 && <div className="p-12 text-center text-brand-muted font-medium">You haven't bought anything yet.</div>}
                        {activeTab === 'purchases' && myPurchases.map(order => (
                            <div key={order.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-start">
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mr-4 mt-1"><Ticket className="text-gray-400"/></div>
                                    <div>
                                        <h3 className="font-bold text-lg text-brand-text leading-tight">{order.eventName}</h3>
                                        <p className="text-sm text-brand-muted mt-1 flex items-center"><Clock size={14} className="mr-1"/> Ordered on {new Date(order.createdAt).toLocaleDateString()}</p>
                                        <button className="mt-3 text-sm font-bold text-[#1D7AF2] hover:underline">Download E-Ticket</button>
                                    </div>
                                </div>
                                <div className="mt-4 md:mt-0 text-right">
                                    <p className="text-xl font-black text-brand-text">₹{order.price.toLocaleString()}</p>
                                    <p className="text-xs font-bold text-green-600 uppercase mt-1">Confirmed</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}