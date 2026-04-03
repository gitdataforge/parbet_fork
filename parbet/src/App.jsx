import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAppStore } from './store/useStore';
import { Trophy, Activity, Settings, AlignLeft, ShieldCheck, Search, Download } from 'lucide-react';

import Onboarding from './components/Onboarding';
import AuthFlow from './components/AuthFlow';
import Home from './pages/Home';

function Sidebar() {
    const navigate = useNavigate();
    return (
        <div className="hidden lg:flex w-64 h-screen bg-brand-panel border-r border-white/5 flex-col shrink-0">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h1 className="text-xl font-black tracking-tight text-white flex items-center"><Trophy size={18} className="mr-2 text-brand-neon"/> PARBET</h1>
            </div>
            <div className="p-4 overflow-y-auto flex-1 hide-scrollbar">
                <p className="text-[10px] font-bold text-brand-muted mb-2 uppercase tracking-wider">Top Leagues</p>
                <div className="space-y-1 mb-6">
                    {['Premier League', 'La Liga', 'NBA', 'ATP Championship'].map(l => (
                        <button key={l} className="w-full text-left px-3 py-2 text-xs font-medium text-white hover:bg-white/5 rounded-lg flex items-center"><div className="w-4 h-4 rounded bg-brand-card mr-3"></div> {l}</button>
                    ))}
                </div>
            </div>
            <div className="p-4 border-t border-white/5">
                <button onClick={() => navigate('/settings')} className="w-full flex items-center px-3 py-2 text-xs text-brand-muted hover:text-white"><Settings size={14} className="mr-3"/> Settings</button>
            </div>
        </div>
    );
}

function Betslip() {
    const { betslip, balance } = useAppStore();
    return (
        <div className="hidden xl:flex w-80 h-screen bg-brand-panel border-l border-white/5 flex-col shrink-0">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <div className="flex space-x-1 bg-brand-card p-1 rounded-lg">
                    <button className="px-4 py-1 text-xs font-bold bg-brand-bg rounded text-white shadow">Betslip</button>
                    <button className="px-4 py-1 text-xs font-bold text-brand-muted">Recent</button>
                </div>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
                {betslip.length === 0 ? (
                    <div className="text-center mt-10">
                        <AlignLeft size={32} className="mx-auto text-brand-muted/30 mb-3" />
                        <p className="text-xs text-brand-muted">Betslip is empty</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {betslip.map((b, i) => (
                            <div key={i} className="bg-brand-card p-3 rounded-xl border border-white/5">
                                <div className="flex justify-between items-start mb-2"><span className="text-xs font-bold">{b.team}</span><span className="text-brand-neon font-bold text-xs">{b.odds}</span></div>
                                <p className="text-[10px] text-brand-muted">{b.market}</p>
                            </div>
                        ))}
                        <div className="pt-4 border-t border-white/5 mt-4">
                            <button className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg text-sm hover:bg-brand-primaryLight transition-colors shadow-[0_0_15px_rgba(29,122,242,0.3)]">PLACE ORDER</button>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-white/5 bg-brand-card flex justify-between items-center">
                <span className="text-xs text-brand-muted">Balance</span>
                <span className="text-sm font-bold text-brand-neon">€ {balance.toFixed(2)}</span>
            </div>
        </div>
    );
}

function MainLayout() {
    return (
        <div className="flex w-full h-screen bg-brand-bg overflow-hidden">
            <Sidebar />
            <main className="flex-1 h-full overflow-y-auto hide-scrollbar flex flex-col relative">
                {/* Top Nav */}
                <div className="h-14 border-b border-white/5 bg-brand-panel flex items-center justify-between px-4 sticky top-0 z-20">
                    <div className="flex space-x-4">
                        <button className="text-xs font-bold text-brand-primary flex items-center"><Activity size={14} className="mr-2"/> SPORTBOOK</button>
                        <button className="text-xs font-bold text-brand-muted hover:text-white">TRADE</button>
                        <button className="text-xs font-bold text-brand-muted hover:text-white">MY ORDERS</button>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="bg-brand-green/20 text-brand-green px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center"><Download size={12} className="mr-1"/> DEPOSIT</button>
                        <Search size={16} className="text-brand-muted cursor-pointer"/>
                    </div>
                </div>
                <div className="p-2 md:p-4 flex-1">
                    <Routes><Route path="/" element={<Home />} /></Routes>
                </div>
            </main>
            <Betslip />
        </div>
    );
}

export default function App() {
    const { hasOnboarded, isAuthenticated, setAuth, setWallet } = useAppStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Note: user is Firebase authenticated, but 2FA state (isAuthenticated) must be verified via AuthFlow.
                const userRef = doc(db, 'users', user.uid);
                const unsubWallet = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) setWallet(docSnap.data().balance, 0);
                });
                setLoading(false);
                return () => unsubWallet();
            } else {
                setAuth(false);
                setLoading(false);
            }
        });
        return () => unsubAuth();
    }, []);

    if (loading) return <div className="min-h-screen bg-brand-bg flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div></div>;
    
    return (
        <BrowserRouter>
            {!hasOnboarded ? <Onboarding /> : (!isAuthenticated ? <AuthFlow /> : <MainLayout />)}
        </BrowserRouter>
    );
}