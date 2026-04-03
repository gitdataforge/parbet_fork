import os

def write_file(filepath, content):
    dir_name = os.path.dirname(filepath)
    if dir_name:  # Fix: Only attempt to create directories if the path isn't empty
        os.makedirs(dir_name, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content.strip())
    print(f"Created: {filepath}")

def main():
    print("🚀 Generating Parbet React Architecture (Light Theme Overhaul)...")

    # ==========================================
    # 1. ENV VARIABLES (VITE, FIREBASE, EMAILJS)
    # ==========================================
    
    env_content = """
# Firebase Keys (Add yours from Firebase Console)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# EmailJS Keys (Add yours from EmailJS Dashboard)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
"""
    write_file('.env.example', env_content)
    write_file('.env.local', env_content)

    # ==========================================
    # 2. CONFIGURATION & STYLING
    # ==========================================
    
    tailwind_config = """
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1A73E8', // Based on the mockup's vibrant blue
          secondary: '#DCE6F5', // The soft light blue from the UI
          dark: '#111111',
          light: '#F4F7FB', // Soft background tint
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'], // Closest web-safe modern alternative to Lufga
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
"""
    write_file('tailwind.config.js', tailwind_config)

    index_css = """
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #E5E7EB; /* Desktop background */
  color: #111111;
  margin: 0;
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow-x: hidden;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
"""
    write_file('src/index.css', index_css)

    # ==========================================
    # 3. LIB & UTILS
    # ==========================================

    firebase_js = """
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, updateDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const placeRealBet = async (userId, matchId, amount, odds, type) => {
    const userRef = doc(db, 'users', userId);
    const betsRef = collection(db, 'bets');
    await updateDoc(userRef, { balance: increment(-amount) });
    await addDoc(betsRef, { userId, matchId, amount, odds, type, status: 'pending', timestamp: serverTimestamp() });
};
"""
    write_file('src/lib/firebase.js', firebase_js)

    email_js = """
import emailjs from '@emailjs/browser';
export const sendParbetEmail = async (templateParams) => {
    try {
        const response = await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            templateParams,
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
        return { success: true, response };
    } catch (error) {
        console.error('EmailJS Error:', error);
        return { success: false, error };
    }
};
"""
    write_file('src/lib/email.js', email_js)

    store_js = """
import { create } from 'zustand';
export const useAppStore = create((set) => ({
    user: null, balance: 0, diamonds: 0, matches: [],
    setUser: (user) => set({ user }),
    setWallet: (balance, diamonds) => set({ balance, diamonds }),
    setMatches: (matches) => set({ matches }),
}));
"""
    write_file('src/store/useStore.js', store_js)

    # ==========================================
    # 4. APP & ROUTING (With New Floating Nav & Desktop Responsiveness)
    # ==========================================

    app_jsx = """
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from './lib/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAppStore } from './store/useStore';
import { Home as IconHome, Calendar as IconCalendar, Settings as IconSettings } from 'lucide-react';

import Home from './pages/Home';
import Discovery from './pages/Discovery';
import TeamFocus from './pages/TeamFocus';

const pages = import.meta.glob('./pages/*/index.jsx', { eager: true });
const routes = Object.keys(pages).map((path) => {
  const name = path.match(/\\.\\/pages\\/(.*)\\/index\\.jsx$/)[1];
  return { name, Component: pages[path].default };
});

function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="relative w-full h-full md:w-[390px] md:h-[844px] bg-brand-light md:rounded-[40px] shadow-2xl overflow-hidden md:border-[12px] md:border-[#1A1A1A]">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/discovery" element={<Discovery />} />
                <Route path="/team" element={<TeamFocus />} />
                {routes.map(({ name, Component }) => (
                    name !== 'Home' && name !== 'Discovery' && name !== 'TeamFocus' &&
                    <Route key={name} path={`/${name.toLowerCase()}`} element={<Component />} />
                ))}
            </Routes>
            
            {/* Floating Black Bottom Nav */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#111] rounded-full p-2 flex items-center space-x-2 z-50 shadow-2xl">
                <button onClick={() => navigate('/')} className={`p-3 rounded-full flex items-center space-x-2 transition-all ${location.pathname === '/' ? 'bg-white text-black' : 'text-white hover:bg-gray-800'}`}>
                    <IconHome size={20} />
                    {location.pathname === '/' && <span className="text-xs font-bold pr-2">Schedule</span>}
                </button>
                <button onClick={() => navigate('/discovery')} className={`p-3 rounded-full flex items-center space-x-2 transition-all ${location.pathname === '/discovery' ? 'bg-white text-black' : 'text-white hover:bg-gray-800'}`}>
                    <IconCalendar size={20} />
                    {location.pathname === '/discovery' && <span className="text-xs font-bold pr-2">Calendar</span>}
                </button>
                <button onClick={() => navigate('/settings')} className={`p-3 rounded-full flex items-center space-x-2 transition-all ${location.pathname.startsWith('/settings') ? 'bg-white text-black' : 'text-white hover:bg-gray-800'}`}>
                    <IconSettings size={20} />
                    {location.pathname.startsWith('/settings') && <span className="text-xs font-bold pr-2">Settings</span>}
                </button>
            </div>
        </div>
    );
}

export default function App() {
    const { setUser, setWallet } = useAppStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try { await signInAnonymously(auth); } catch (e) { console.error("Auth failed", e); }
        };
        initAuth();

        const unsubAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                const userRef = doc(db, 'users', user.uid);
                const unsubWallet = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setWallet(docSnap.data().balance, docSnap.data().diamonds);
                        setLoading(false);
                    } else {
                        setDoc(userRef, { balance: 3221.00, diamonds: 240, createdAt: serverTimestamp() });
                    }
                });
                return () => unsubWallet();
            }
        });
        return () => unsubAuth();
    }, []);

    if (loading) return <div className="min-h-screen bg-brand-light text-brand-primary flex items-center justify-center font-bold animate-pulse-slow">Loading Environment...</div>;

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-[#E5E7EB] flex items-center justify-center md:p-8">
                <MainLayout />
            </div>
        </BrowserRouter>
    );
}
"""
    write_file('src/App.jsx', app_jsx)
    
    main_jsx = """
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
"""
    write_file('src/main.jsx', main_jsx)

    # ==========================================
    # 5. CORE PAGES (Matching New UIs)
    # ==========================================
    
    home_jsx = """
import React from 'react';
import { motion } from 'framer-motion';
import { Settings, MoreVertical, Calendar } from 'lucide-react';

export default function Home() {
    return (
        <div className="h-full bg-brand-light overflow-y-auto pb-32 hide-scrollbar animate-fade-in">
            {/* Header */}
            <div className="px-6 pt-12 pb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-black">Schedule</h1>
                <div className="flex space-x-2">
                    <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white"><Settings size={14} className="text-gray-500"/></button>
                    <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white"><MoreVertical size={14} className="text-gray-500"/></button>
                </div>
            </div>
            
            {/* Month Selector */}
            <div className="px-6 mb-6 flex justify-between items-center">
                <h2 className="text-sm font-medium text-gray-500">February</h2>
                <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center bg-white"><Calendar size={14} className="text-gray-500"/></button>
            </div>

            {/* Date Pill Scroller */}
            <div className="mb-8 bg-white mx-6 rounded-[32px] p-4 shadow-sm flex justify-between items-center">
                {['M','T','W','T','F','S','S'].map((day, i) => {
                    const isActive = i === 3;
                    return (
                        <div key={i} className="flex flex-col items-center">
                            <div className={`w-1 h-1 rounded-full mb-1 ${isActive ? 'bg-brand-primary' : 'bg-transparent'}`}></div>
                            <span className="text-[10px] text-gray-400 mb-2 font-medium">{day}</span>
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${isActive ? 'bg-brand-primary text-white shadow-md shadow-blue-500/30' : 'bg-[#F4F7FB] text-gray-600'}`}>
                                {10 + i}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Tasks List */}
            <div className="px-6 space-y-6">
                {[1,2,3].map((item, i) => (
                    <div key={i}>
                        <p className="text-[10px] text-center text-gray-400 mb-2 font-medium">08:36</p>
                        <motion.div whileHover={{ scale: 0.98 }} className={`p-5 rounded-[24px] relative overflow-hidden shadow-sm border border-gray-100 ${i === 0 ? 'bg-brand-secondary' : 'bg-white'}`}>
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${i === 0 ? 'bg-brand-primary' : 'bg-brand-secondary'}`}></div>
                            <div className="flex justify-between items-start mb-2 ml-2">
                                <h3 className="font-bold text-sm text-black">Student Write Notes :</h3>
                                <button className="p-1"><MoreVertical size={14} className="text-gray-400"/></button>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed ml-2 pr-4">We need to coordinate a call with managment to understand how can start wireframes.</p>
                        </motion.div>
                    </div>
                ))}
            </div>
        </div>
    );
}
"""
    write_file('src/pages/Home/index.jsx', home_jsx)

    discovery_jsx = """
import React from 'react';
import { ChevronLeft, Bell, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Discovery() {
    const navigate = useNavigate();
    return (
        <div className="h-full bg-brand-light overflow-y-auto pb-32 hide-scrollbar animate-fade-in">
            {/* Header */}
            <div className="px-6 pt-12 pb-6 flex justify-between items-center">
                <button onClick={()=>navigate('/')} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white"><ChevronLeft size={16} className="text-gray-600"/></button>
                <h1 className="text-sm font-bold text-black">Calendar</h1>
                <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white"><Bell size={14} className="text-gray-500"/></button>
            </div>

            <div className="px-6 mb-6">
                <h2 className="text-lg font-bold text-black mb-4">Calendar & Tasks</h2>
                
                {/* Legend */}
                <div className="flex space-x-6 mb-6">
                    <div className="flex items-center space-x-2"><div className="w-2 h-2 rounded-full bg-black"></div><span className="text-[10px] font-medium text-gray-500">Class Date</span></div>
                    <div className="flex items-center space-x-2"><div className="w-2 h-2 rounded-full bg-[#82B1FF]"></div><span className="text-[10px] font-medium text-gray-500">Holl Date</span></div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center mb-8 bg-white p-5 rounded-[32px] shadow-sm border border-gray-100">
                    {Array.from({length: 31}, (_, i) => i + 1).map(day => {
                        let isSelected = day >= 1 && day <= 4;
                        let isHatched = day === 10 || day === 21 || day === 28;
                        let isCurrent = day === 29;
                        let bgClass = "bg-transparent text-gray-700 font-medium";
                        
                        if (isSelected) bgClass = "bg-brand-secondary text-brand-primary font-bold";
                        if (isCurrent) bgClass = "bg-brand-primary text-white font-bold shadow-md shadow-blue-500/30";
                        
                        return (
                            <div key={day} className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-xs transition-all ${bgClass} ${isHatched ? 'border border-dashed border-gray-300 text-gray-300 bg-gray-50' : ''}`}>
                                {day.toString().padStart(2, '0')}
                            </div>
                        )
                    })}
                </div>

                {/* Specials Filter */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-black">Today Specials</h2>
                    <button className="text-xs text-brand-primary font-bold flex items-center">See All <ArrowRight size={12} className="ml-1"/></button>
                </div>

                <div className="flex space-x-3 overflow-x-auto hide-scrollbar mb-6 -mx-6 px-6 pb-2">
                    <button className="bg-brand-primary text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md shadow-blue-500/20 whitespace-nowrap">Today</button>
                    <button className="bg-white text-gray-500 border border-gray-200 px-5 py-2.5 rounded-full text-xs font-medium whitespace-nowrap">Yesterday</button>
                    <button className="bg-white text-gray-500 border border-gray-200 px-5 py-2.5 rounded-full text-xs font-medium whitespace-nowrap">Next 7 days</button>
                </div>

                {/* Empty State Banner */}
                <div className="bg-brand-secondary rounded-[32px] p-8 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 w-8 h-1 bg-gray-300 rounded-b-lg"></div>
                    <p className="text-brand-primary text-sm font-medium mb-4 mt-2">No tasks for today</p>
                    <button className="bg-brand-primary text-white px-6 py-3 rounded-full text-xs font-bold shadow-md hover:scale-105 transition-transform">Add tasks</button>
                </div>
            </div>
        </div>
    )
}
"""
    write_file('src/pages/Discovery/index.jsx', discovery_jsx)
    write_file('src/pages/TeamFocus/index.jsx', "import React from 'react'; export default function TeamFocus() { return <div className='p-6 text-black bg-brand-light h-full'>Team Focus Page</div>; }")

    # ==========================================
    # 6. DYNAMIC GENERATION OF 50+ PAGES (LIGHT THEME)
    # ==========================================
    
    pages_list = [
        "Wallet", "AdminDashboard", "LiveMatches", "UpcomingMatches", "MatchDetails", "BetSlip", 
        "MyBets", "BetHistory", "Transactions", "Leaderboard", "Profile", "EditProfile", 
        "Settings", "Security", "Notifications", "CricketBetting", "FootballBetting", 
        "TennisBetting", "Esports", "LiveBettingScreen", "OddsMovement", "MultiBet", 
        "CashOut", "Bonuses", "Referral", "Achievements", "DailyRewards", "HelpCenter", 
        "Contact", "FAQs", "Login", "Signup", "ForgotPassword", "Promo1", "Promo2", 
        "CampaignA", "CampaignB", "EventX", "LandingUser", "LandingGuest", "AdminUsers", 
        "AdminAddMatch", "AdminEditMatch", "AdminOdds", "AdminResults", "AdminTrans", 
        "AdminFraud", "AdminReports", "AdminAnalytics", "AdminNotifs", "AdminLogs", 
        "AdminSettings", "AdminRoles", "AdminPerms", "AffiliatePortal", "VIPClub"
    ]

    page_template = """
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useStore';
import { sendParbetEmail } from '../../lib/email';
import { ChevronLeft, Send, Activity, BarChart, Bell, Zap, Trophy, Shield, Settings as SettingsIcon, Mail } from 'lucide-react';

export default function {{PAGE_NAME}}() {
    const navigate = useNavigate();
    const { balance, diamonds, user } = useAppStore();
    const [emailStatus, setEmailStatus] = useState('');

    const handleTestEmail = async () => {
        setEmailStatus('Sending...');
        const res = await sendParbetEmail({
            to_name: 'Parbet Admin',
            message: `User ${user?.uid || 'Guest'} triggered an action on {{PAGE_NAME}}.`
        });
        setEmailStatus(res.success ? 'Sent!' : 'Failed (Check .env)');
    };

    return (
        <div className="h-full flex flex-col bg-brand-light overflow-y-auto hide-scrollbar text-black font-sans">
            
            {/* SECTION 1: Header & Nav */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white/90 backdrop-blur z-40 shadow-sm">
                <button onClick={() => navigate('/')} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white"><ChevronLeft size={16} className="text-gray-600"/></button>
                <h1 className="font-bold text-sm text-brand-primary">{{PAGE_NAME}}</h1>
                <div className="w-8"></div>
            </motion.div>

            <div className="p-6 space-y-6 pb-32">
                
                {/* SECTION 2: Real-time User Stats Block */}
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center">
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">Balance</p>
                        <p className="text-xl font-black text-black">${balance.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center">
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">Diamonds</p>
                        <p className="text-xl font-black text-brand-primary">{diamonds}</p>
                    </div>
                </motion.div>

                {/* SECTION 3: Hero Action Area */}
                <motion.div whileHover={{ scale: 0.98 }} className="bg-brand-primary p-8 rounded-[32px] relative overflow-hidden shadow-lg shadow-blue-500/30">
                    <Zap className="absolute right-[-20px] bottom-[-20px] text-white/10 w-40 h-40" />
                    <h2 className="text-2xl font-black mb-2 relative z-10 text-white leading-tight">Elevate<br/>Your Game</h2>
                    <p className="text-xs text-brand-secondary mb-6 relative z-10 w-2/3">Exclusive access via the {{PAGE_NAME}} module.</p>
                    <button className="bg-white text-brand-primary font-bold py-3 px-6 rounded-full text-xs shadow-md">Action Required</button>
                </motion.div>

                {/* SECTION 4: Real-time Data Feed Placeholder */}
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Activity className="text-brand-primary" size={18} />
                        <h3 className="font-bold text-sm">Live Data Sync</h3>
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex justify-between items-center p-4 bg-brand-light rounded-2xl">
                                <span className="text-xs font-medium text-gray-600">Data Stream {i}</span>
                                <span className="text-brand-primary text-[10px] font-bold animate-pulse uppercase tracking-wider">Syncing</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* SECTION 5: Analytics & Charts Placeholder */}
                <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 h-56 flex flex-col">
                    <div className="flex items-center space-x-2 mb-6">
                        <BarChart className="text-brand-primary" size={18} />
                        <h3 className="font-bold text-sm">Module Analytics</h3>
                    </div>
                    <div className="flex-1 flex items-end justify-between space-x-2 mt-auto px-2">
                        {[40, 70, 30, 90, 60, 100, 50].map((h, i) => (
                            <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }} className="w-full bg-brand-secondary rounded-t-sm relative">
                                {i === 3 && <div className="absolute inset-0 bg-brand-primary rounded-t-sm"></div>}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* SECTION 6: Notifications & Alerts */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="bg-brand-secondary rounded-3xl p-5 flex items-start space-x-4 shadow-inner">
                    <div className="p-3 bg-white rounded-full shadow-sm"><Bell className="text-brand-primary" size={16}/></div>
                    <div>
                        <h4 className="font-bold text-sm text-brand-primary">System Alert</h4>
                        <p className="text-xs text-brand-primary/80 mt-1 font-medium">{{PAGE_NAME}} module is fully active and secured.</p>
                    </div>
                </motion.div>

                {/* SECTION 7: Feature Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center mb-3">
                            <Trophy className="text-brand-primary" size={20}/>
                        </div>
                        <span className="text-xs font-bold">Rewards</span>
                    </motion.div>
                    <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center mb-3">
                            <Shield className="text-brand-primary" size={20}/>
                        </div>
                        <span className="text-xs font-bold">Security</span>
                    </motion.div>
                </div>

                {/* SECTION 8: Module Configuration */}
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <SettingsIcon size={18} className="text-gray-400"/>
                            <h3 className="font-bold text-sm">Preferences</h3>
                        </div>
                        <div className="w-12 h-6 bg-brand-primary rounded-full relative shadow-inner"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div></div>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed font-medium">Toggle specific functionalities for the {{PAGE_NAME}} environment here. Preferences sync instantly via Firestore.</p>
                </motion.div>

                {/* SECTION 9: EmailJS Contact Integration */}
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-bold mb-2 flex items-center text-sm"><Mail className="mr-2 text-brand-primary" size={16}/> API Integration</h3>
                    <p className="text-[10px] text-gray-400 mb-6 font-medium">Send a direct ping using .env configured EmailJS.</p>
                    <button onClick={handleTestEmail} className="w-full bg-brand-light text-brand-primary font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors">
                        <Send size={14} />
                        <span className="text-xs">{emailStatus || 'Ping Administrator'}</span>
                    </button>
                </motion.div>

                {/* SECTION 10: Footer Status */}
                <div className="text-center pt-6 opacity-40">
                    <p className="text-[10px] uppercase tracking-widest font-bold">Parbet Engine v3.0</p>
                    <p className="text-[9px] mt-1 text-gray-500 font-medium">Light Theme Activated</p>
                </div>

            </div>
        </div>
    );
}
"""
    
    for page in pages_list:
        content = page_template.replace("{{PAGE_NAME}}", page)
        write_file(f'src/pages/{page}/index.jsx', content)

    print("\n✅ LIGHT THEME OVERHAUL COMPLETE!")
    print("✅ Wide Desktop responsiveness + Floating Nav added.")
    print("✅ New Color Palette and Typography strictly applied to all 60 pages.")

if __name__ == "__main__":
    main()