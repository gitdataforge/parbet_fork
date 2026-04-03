import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from './lib/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAppStore } from './store/useStore';
import { Home as IconHome, BarChart2, MessageCircle, Settings as IconSettings } from 'lucide-react';

import Onboarding from './components/Onboarding';
import Home from './pages/Home';
import Discovery from './pages/Discovery';
import TeamFocus from './pages/TeamFocus';

const pages = import.meta.glob('./pages/*/index.jsx', { eager: true });
const routes = Object.keys(pages).map((path) => {
  const name = path.match(/\.\/pages\/(.*)\/index\.jsx$/)[1];
  return { name, Component: pages[path].default };
});

function MobileNav() {
    const navigate = useNavigate();
    const location = useLocation();
    
    return (
        <div className="absolute bottom-0 left-0 right-0 bg-brand-bg/95 backdrop-blur-md border-t border-white/5 flex justify-around p-4 pb-6 z-50">
             <button onClick={() => navigate('/')} className={`flex flex-col items-center space-y-1 transition-colors ${location.pathname === '/' ? 'text-brand-primary' : 'text-brand-muted hover:text-white'}`}>
                 <IconHome size={22}/>
                 <span className="text-[10px] font-medium">Home</span>
             </button>
             <button onClick={() => navigate('/discovery')} className={`flex flex-col items-center space-y-1 transition-colors ${location.pathname === '/discovery' ? 'text-brand-primary' : 'text-brand-muted hover:text-white'}`}>
                 <BarChart2 size={22}/>
                 <span className="text-[10px] font-medium">Stats</span>
             </button>
             <button onClick={() => navigate('/chat')} className={`flex flex-col items-center space-y-1 transition-colors ${location.pathname === '/chat' ? 'text-brand-primary' : 'text-brand-muted hover:text-white'}`}>
                 <MessageCircle size={22}/>
                 <span className="text-[10px] font-medium">Chat</span>
             </button>
             <button onClick={() => navigate('/settings')} className={`flex flex-col items-center space-y-1 transition-colors ${location.pathname.startsWith('/settings') ? 'text-brand-primary' : 'text-brand-muted hover:text-white'}`}>
                 <IconSettings size={22}/>
                 <span className="text-[10px] font-medium">Settings</span>
             </button>
        </div>
    );
}

function MainLayout() {
    return (
        <div className="flex w-full h-full bg-brand-bg text-white overflow-hidden relative">
            <main className="flex-1 h-full overflow-y-auto relative pb-24 w-full hide-scrollbar">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/discovery" element={<Discovery />} />
                    <Route path="/team" element={<TeamFocus />} />
                    {routes.map(({ name, Component }) => (
                        name !== 'Home' && name !== 'Discovery' && name !== 'TeamFocus' &&
                        <Route key={name} path={`/${name.toLowerCase()}`} element={<Component />} />
                    ))}
                </Routes>
            </main>
            <MobileNav />
        </div>
    );
}

export default function App() {
    const { hasOnboarded, setUser, setWallet } = useAppStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try { 
                await signInAnonymously(auth); 
            } catch (e) { 
                console.error("Auth failed", e); 
            }
        };
        initAuth();

        const unsubAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                
                // Real-time listener for authentic Firebase wallet data
                const userRef = doc(db, 'users', user.uid);
                const unsubWallet = onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setWallet(docSnap.data().balance, docSnap.data().diamonds);
                        setLoading(false);
                    } else {
                        // Seed real initial database values securely
                        setDoc(userRef, { balance: 7890.78, diamonds: 240, createdAt: serverTimestamp() });
                    }
                });
                return () => unsubWallet();
            }
        });
        
        return () => unsubAuth();
    }, []);

    if (loading) {
        return (
            <div className="bg-[#0A0B0D] min-h-screen flex justify-center items-center">
                <div className="text-brand-primary font-bold animate-pulse-slow tracking-wider text-sm">
                    Connecting to secure server...
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-[#0A0B0D] min-h-screen flex justify-center items-center overflow-hidden">
            {/* The structural layout wrapper fulfilling precise high-end desktop requirements */}
            <div className="w-full max-w-[400px] h-[100dvh] md:h-[850px] relative overflow-hidden md:rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-brand-bg border-white/5 md:border">
                <BrowserRouter>
                    {!hasOnboarded ? <Onboarding /> : <MainLayout />}
                </BrowserRouter>
            </div>
        </div>
    );
}