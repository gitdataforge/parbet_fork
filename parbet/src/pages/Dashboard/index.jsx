import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Wallet, Ticket, Activity, Clock, LogOut, Settings, 
    Camera, ShieldCheck, Download, MapPin, Smartphone, CheckCircle2, TrendingUp, AlertCircle
} from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { updateProfile, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { uploadUserAvatar } from '../../services/cloudinaryApi';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, balance, isAuthenticated, openAuthModal, setUser, setOnboarded } = useAppStore();
    
    // Core States
    const [activeTab, setActiveTab] = useState('vault'); // 'vault' | 'inventory' | 'security'
    const [myListings, setMyListings] = useState([]);
    const [myPurchases, setMyPurchases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // FEATURE 1: Cloudinary Avatar Management State
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [avatarError, setAvatarError] = useState(null);

    // FEATURE 2: Real-time Session Security Context
    const [sessionData, setSessionData] = useState({
        browser: 'Detecting...',
        os: 'Detecting...',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        loginTime: new Date().toLocaleTimeString()
    });

    useEffect(() => {
        // Parse Real User Agent Data
        const ua = navigator.userAgent;
        let browser = "Unknown Browser";
        if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Chrome")) browser = "Chrome";
        else if (ua.includes("Safari")) browser = "Safari";
        else if (ua.includes("Edge")) browser = "Edge";
        
        let os = "Unknown OS";
        if (ua.includes("Win")) os = "Windows";
        else if (ua.includes("Mac")) os = "MacOS";
        else if (ua.includes("Linux")) os = "Linux";
        else if (ua.includes("Android")) os = "Android";
        else if (ua.includes("like Mac")) os = "iOS";

        setSessionData(prev => ({ ...prev, browser, os }));
    }, []);

    // FEATURE 3: Real-Time Firestore Synchronization
    useEffect(() => {
        if (!isAuthenticated) {
            openAuthModal();
            return;
        }
        if (!user || !user.uid) return;

        // Sync Listings
        const qListings = query(collection(db, 'listings'), where('sellerId', '==', user.uid));
        const unsubListings = onSnapshot(qListings, (snapshot) => {
            setMyListings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Sync Purchases
        const qPurchases = query(collection(db, 'orders'), where('buyerId', '==', user.uid));
        const unsubPurchases = onSnapshot(qPurchases, (snapshot) => {
            setMyPurchases(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoading(false);
        });

        return () => { unsubListings(); unsubPurchases(); };
    }, [user, isAuthenticated, openAuthModal]);

    // FEATURE 4: Financial Portfolio Engine
    const financials = useMemo(() => {
        const totalSpent = myPurchases.reduce((acc, order) => acc + (Number(order.totalAmount) || Number(order.price) || 0), 0);
        const activeInventoryValue = myListings.filter(l => l.status === 'active').reduce((acc, listing) => acc + (Number(listing.price) * (Number(listing.quantity) || 1)), 0);
        const totalEarned = myListings.filter(l => l.status === 'sold').reduce((acc, listing) => acc + (Number(listing.price) * (Number(listing.quantity) || 1)), 0);
        
        return { totalSpent, activeInventoryValue, totalEarned };
    }, [myPurchases, myListings]);

    // FEATURE 5: Dynamic Cloudinary Avatar Updater
    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !user) return;

        setIsUploadingAvatar(true);
        setAvatarError(null);

        try {
            const uploadResult = await uploadUserAvatar(file, user.uid);
            const newPhotoUrl = uploadResult.url;

            // Update Firebase Auth
            await updateProfile(auth.currentUser, { photoURL: newPhotoUrl });
            
            // Update Firestore Document
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { photoURL: newPhotoUrl });

            // Update Global Zustand Store
            setUser({ ...user, photo: newPhotoUrl });
        } catch (err) {
            console.error("Avatar Upload Failed:", err);
            setAvatarError("Failed to update profile picture.");
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    // FEATURE 6: Dynamic E-Ticket Blob Generator
    const handleDownloadTicket = (order) => {
        const ticketContent = `
PARBET SECURE E-TICKET
======================
Order ID: ${order.id}
Event: ${order.eventName}
Purchased On: ${new Date(order.createdAt?.toMillis ? order.createdAt.toMillis() : order.createdAt).toLocaleString()}
Total Paid: ₹${order.totalAmount || order.price}

Ticket Holder: ${order.deliveryData?.fullName || user.name || 'Secure Buyer'}
Status: CONFIRMED & VERIFIED

Please present this secure digital document at the venue gates.
        `;
        const blob = new Blob([ticketContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Parbet_Ticket_${order.id}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
        navigate('/');
    };

    if (!isAuthenticated || !user) return null;

    return (
        <div className="min-h-screen bg-[#F4F6F8] pb-20 relative overflow-hidden font-sans">
            
            {/* SECTION 1: High-End Animated SVG Topography Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <motion.svg 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}
                    className="w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="dashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#114C2A', stopOpacity: 0.15 }} />
                            <stop offset="100%" style={{ stopColor: '#458731', stopOpacity: 0.05 }} />
                        </linearGradient>
                    </defs>
                    {[...Array(12)].map((_, i) => (
                        <motion.path
                            key={i} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                            transition={{ duration: 5 + i * 0.4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                            d={`M-200 ${100 + i * 80} Q 500 ${-100 + i * 120} 1000 ${400 + i * 50} T 2000 ${200 + i * 90}`}
                            fill="none" stroke="url(#dashGrad)" strokeWidth={1 + (i % 2)}
                        />
                    ))}
                </motion.svg>
            </div>

            <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8 pt-12 relative z-10">
                
                {/* SECTION 2: Identity & Security Hub */}
                <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between mb-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#EAF4D9] rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none"></div>
                    
                    <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 relative z-10 w-full">
                        <div className="relative group">
                            <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
                                {isUploadingAvatar ? (
                                    <div className="w-8 h-8 border-4 border-[#114C2A] border-t-transparent rounded-full animate-spin"></div>
                                ) : user.photo ? (
                                    <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={40} className="text-gray-400" />
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                    <Camera size={24} className="text-white" />
                                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isUploadingAvatar} />
                                </div>
                            </div>
                            <div className="absolute bottom-0 right-0 bg-[#458731] w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                                <ShieldCheck size={14} className="text-white" />
                            </div>
                        </div>

                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">{user.name}</h1>
                            <p className="text-gray-500 font-bold mt-1 text-[15px]">{user.email}</p>
                            <div className="flex items-center justify-center md:justify-start space-x-4 mt-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#EAF4D9] text-[#114C2A] text-xs font-black uppercase tracking-wider">
                                    <CheckCircle2 size={12} className="mr-1.5" /> Verified User
                                </span>
                                {avatarError && <span className="text-red-500 text-xs font-bold flex items-center"><AlertCircle size={12} className="mr-1"/> {avatarError}</span>}
                            </div>
                        </div>

                        <div className="flex space-x-3 shrink-0">
                            <button onClick={() => navigate('/')} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors text-sm flex items-center shadow-sm">
                                Marketplace
                            </button>
                            <button onClick={handleLogout} className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold transition-colors text-sm flex items-center shadow-sm">
                                <LogOut size={16} className="mr-2" /> Logout
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* SECTION 3: Financial Portfolio */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-gradient-to-br from-[#114C2A] to-[#0c361d] rounded-[24px] p-8 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500"><Wallet size={140}/></div>
                        <p className="text-green-100/80 font-bold text-sm uppercase tracking-widest mb-2">Available Balance</p>
                        <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">₹{balance.toLocaleString()}</h2>
                        <button className="bg-[#8bc53f] hover:bg-[#7abd36] text-white px-6 py-3 rounded-xl text-sm font-black w-max shadow-md transition-colors uppercase tracking-widest">Withdraw Funds</button>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 text-blue-500/10"><TrendingUp size={80}/></div>
                        <div className="flex items-center text-gray-500 font-bold text-sm uppercase tracking-widest mb-3 relative z-10"><Activity size={16} className="mr-2 text-blue-500"/> Total Spent</div>
                        <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight relative z-10">₹{financials.totalSpent.toLocaleString()}</h2>
                        <p className="text-xs text-gray-400 font-bold mt-3 relative z-10">Across {myPurchases.length} verified orders</p>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-[24px] p-8 shadow-sm flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 text-orange-500/10"><Ticket size={80}/></div>
                        <div className="flex items-center text-gray-500 font-bold text-sm uppercase tracking-widest mb-3 relative z-10"><Ticket size={16} className="mr-2 text-orange-500"/> Active Inventory</div>
                        <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight relative z-10">₹{financials.activeInventoryValue.toLocaleString()}</h2>
                        <p className="text-xs text-gray-400 font-bold mt-3 relative z-10">{myListings.filter(l => l.status === 'active').length} tickets currently listed</p>
                    </div>
                </div>

                {/* Dashboard Navigation Tabs */}
                <div className="flex space-x-8 border-b-2 border-gray-200 mb-8 overflow-x-auto hide-scrollbar">
                    {['vault', 'inventory', 'security'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)} 
                            className={`pb-4 font-black text-[15px] uppercase tracking-widest transition-colors relative whitespace-nowrap ${activeTab === tab ? 'text-[#114C2A]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab === 'vault' ? 'Ticket Vault' : tab === 'inventory' ? 'My Inventory' : 'Security'}
                            {activeTab === tab && <motion.div layoutId="dashTab" className="absolute bottom-[-2px] left-0 right-0 h-1 bg-[#114C2A] rounded-t-full"/>}
                        </button>
                    ))}
                </div>

                {/* Tab Content Rendering */}
                <div className="bg-white border border-gray-200 rounded-[24px] overflow-hidden shadow-sm min-h-[400px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full min-h-[400px]">
                            <div className="w-10 h-10 border-4 border-[#114C2A] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                                className="h-full"
                            >
                                {/* SECTION 4: Ticket Vault (Purchases) */}
                                {activeTab === 'vault' && (
                                    <div className="divide-y divide-gray-100">
                                        {myPurchases.length === 0 ? (
                                            <div className="p-16 text-center flex flex-col items-center">
                                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4"><Ticket size={32} className="text-gray-300"/></div>
                                                <h3 className="text-xl font-black text-gray-900 mb-2">Your vault is empty</h3>
                                                <p className="text-gray-500 font-medium max-w-md">You haven't purchased any tickets yet. Explore the marketplace to find your next unforgettable experience.</p>
                                                <button onClick={() => navigate('/')} className="mt-6 bg-[#114C2A] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-[#0c361d]">Explore Events</button>
                                            </div>
                                        ) : (
                                            myPurchases.map(order => (
                                                <div key={order.id} className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors group">
                                                    <div className="flex items-start">
                                                        <div className="w-14 h-14 rounded-2xl bg-[#F0F7FF] border border-[#D0E5FF] flex items-center justify-center mr-5 shrink-0 shadow-inner">
                                                            <Ticket size={24} className="text-blue-600"/>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-black text-xl text-gray-900 leading-tight mb-1 group-hover:text-[#114C2A] transition-colors">{order.eventName}</h3>
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-bold text-gray-500 mt-2">
                                                                <span className="flex items-center"><Clock size={14} className="mr-1.5"/> {new Date(order.createdAt?.toMillis ? order.createdAt.toMillis() : order.createdAt).toLocaleDateString()}</span>
                                                                <span className="flex items-center text-[#458731] bg-[#EAF4D9] px-2 py-0.5 rounded-md"><CheckCircle2 size={12} className="mr-1"/> Verified</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-6 md:mt-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                                                        <p className="text-2xl font-black text-gray-900">₹{(order.totalAmount || order.price).toLocaleString()}</p>
                                                        <button onClick={() => handleDownloadTicket(order)} className="mt-2 text-sm font-black text-[#1D7AF2] hover:text-blue-800 transition-colors flex items-center bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100">
                                                            <Download size={14} className="mr-2"/> Download E-Ticket
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* SECTION 5: Active Inventory (Listings) */}
                                {activeTab === 'inventory' && (
                                    <div className="divide-y divide-gray-100">
                                        {myListings.length === 0 ? (
                                            <div className="p-16 text-center flex flex-col items-center">
                                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4"><Activity size={32} className="text-gray-300"/></div>
                                                <h3 className="text-xl font-black text-gray-900 mb-2">No active inventory</h3>
                                                <p className="text-gray-500 font-medium max-w-md">You are not currently selling any tickets. List your extra tickets to reach millions of fans instantly.</p>
                                            </div>
                                        ) : (
                                            myListings.map(listing => (
                                                <div key={listing.id} className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors">
                                                    <div>
                                                        <div className="flex items-center space-x-3 mb-3">
                                                            <span className={`px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-widest shadow-sm ${listing.status === 'sold' ? 'bg-gray-200 text-gray-600' : 'bg-[#114C2A] text-white'}`}>
                                                                {listing.status}
                                                            </span>
                                                            <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest">{listing.type}</span>
                                                        </div>
                                                        <h3 className="font-black text-xl text-gray-900 leading-tight">{listing.eventName}</h3>
                                                        <p className="text-[14px] text-gray-500 font-bold mt-2 flex items-center">
                                                            <MapPin size={14} className="mr-1.5"/> Section {listing.section} • Qty: {listing.quantity || 1}
                                                        </p>
                                                    </div>
                                                    <div className="mt-4 md:mt-0 text-left md:text-right border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                                                        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1">Listing Price</p>
                                                        <p className="text-3xl font-black text-gray-900">₹{Number(listing.price).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* SECTION 6: Security & Context Panel */}
                                {activeTab === 'security' && (
                                    <div className="p-8 sm:p-12">
                                        <div className="max-w-2xl">
                                            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center"><ShieldCheck size={28} className="text-[#114C2A] mr-3"/> Session Security</h3>
                                            <div className="bg-gray-50 border border-gray-200 rounded-[20px] p-6 space-y-6">
                                                <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                                                    <div className="flex items-center"><Smartphone size={20} className="text-gray-400 mr-4"/> <span className="font-bold text-gray-700">Device OS</span></div>
                                                    <span className="font-black text-gray-900">{sessionData.os}</span>
                                                </div>
                                                <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                                                    <div className="flex items-center"><Globe size={20} className="text-gray-400 mr-4"/> <span className="font-bold text-gray-700">Browser Environment</span></div>
                                                    <span className="font-black text-gray-900">{sessionData.browser}</span>
                                                </div>
                                                <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                                                    <div className="flex items-center"><MapPin size={20} className="text-gray-400 mr-4"/> <span className="font-bold text-gray-700">Network Timezone</span></div>
                                                    <span className="font-black text-gray-900">{sessionData.timeZone}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center"><Clock size={20} className="text-gray-400 mr-4"/> <span className="font-bold text-gray-700">Authentication Time</span></div>
                                                    <span className="font-black text-gray-900">{sessionData.loginTime}</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-400 font-bold mt-6 text-center">Your active session is cryptographically secured via AES-256 encryption.</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}