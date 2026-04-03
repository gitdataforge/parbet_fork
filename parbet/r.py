import os

def write_file(filepath, content):
    dir_name = os.path.dirname(filepath)
    if dir_name:  
        os.makedirs(dir_name, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content.strip())
    print(f"Created: {filepath}")

def main():
    print("🚀 Generating Parbet React Architecture (Pro Sportsbook Theme & 2FA Flow)...")

    # ==========================================
    # 1. ENV VARIABLES
    # ==========================================
    env_content = """
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
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
          bg: '#0E1015',
          panel: '#16181D',
          card: '#1E2026',
          primary: '#1D7AF2',
          accent: '#7000FF',
          text: '#FFFFFF',
          muted: '#8E8E93',
          green: '#22C55E',
          neon: '#D9F950',
          red: '#FF3B30'
        }
      },
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'sans-serif'] },
      animation: { 'fade-in': 'fadeIn 0.5s ease-out' },
      keyframes: { fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } } }
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

body { background-color: #0E1015; color: #FFFFFF; margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.odds-btn { @apply bg-[#2A2D35] hover:bg-brand-primary hover:text-white transition-colors rounded text-xs font-bold flex justify-between items-center px-2 py-1.5 w-full; }
.odds-val { @apply text-brand-neon; }
"""
    write_file('src/index.css', index_css)

    # ==========================================
    # 3. STATE, FIREBASE & EMAILJS
    # ==========================================
    store_js = """
import { create } from 'zustand';
export const useAppStore = create((set) => ({
    user: null, balance: 0, diamonds: 0, matches: [],
    hasOnboarded: localStorage.getItem('parbet_onboarded') === 'true',
    isAuthenticated: false,
    betslip: [],
    setOnboarded: () => { localStorage.setItem('parbet_onboarded', 'true'); set({ hasOnboarded: true }); },
    setAuth: (status) => set({ isAuthenticated: status }),
    setUser: (user) => set({ user }),
    setWallet: (balance, diamonds) => set({ balance, diamonds }),
    addToBetslip: (bet) => set((state) => ({ betslip: [...state.betslip, bet] })),
    clearBetslip: () => set({ betslip: [] })
}));
"""
    write_file('src/store/useStore.js', store_js)

    firebase_js = """
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

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
"""
    write_file('src/lib/firebase.js', firebase_js)

    email_js = """
import emailjs from '@emailjs/browser';
export const sendVerificationEmail = async (email, code) => {
    try {
        await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            { to_email: email, verification_code: code },
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
        return { success: true };
    } catch (e) { console.error('EmailJS Error:', e); return { success: false }; }
};
"""
    write_file('src/lib/email.js', email_js)

    # ==========================================
    # 4. AUTH FLOW (Email OTP + Password + TOTP 2FA)
    # ==========================================
    authflow_jsx = """
import React, { useState } from 'react';
import * as OTPAuth from 'otpauth';
import { QRCodeSVG } from 'qrcode.react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { sendVerificationEmail } from '../lib/email';
import { useAppStore } from '../store/useStore';
import { ShieldCheck, Mail, Key, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthFlow() {
    const setAuth = useAppStore(state => state.setAuth);
    const [step, setStep] = useState('select'); // select, signup_email, verify_email, setup_pass, setup_2fa, login, verify_2fa
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [totpSecret, setTotpSecret] = useState('');
    const [totpUri, setTotpUri] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // SIGNUP FLOW
    const handleSendEmailCode = async () => {
        setLoading(true); setError('');
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedCode(code);
        const res = await sendVerificationEmail(email, code);
        setLoading(false);
        if (res.success) setStep('verify_email');
        else setError('Failed to send email. Check EmailJS config.');
    };

    const handleVerifyEmail = () => {
        if (inputCode === generatedCode) setStep('setup_pass');
        else setError('Invalid code.');
    };

    const handleSetupPassword = async () => {
        setLoading(true); setError('');
        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            // Generate 2FA Secret
            const secret = new OTPAuth.Secret({ size: 20 });
            const totp = new OTPAuth.TOTP({ issuer: 'Parbet', label: email, algorithm: 'SHA1', digits: 6, period: 30, secret });
            setTotpSecret(secret.base32);
            setTotpUri(totp.toString());
            // Save initial user doc
            await setDoc(doc(db, 'users', userCred.user.uid), { email, mfaSecret: secret.base32, balance: 1999.98 });
            setStep('setup_2fa');
        } catch (err) { setError(err.message); }
        setLoading(false);
    };

    const handleVerify2FASetup = () => {
        const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(totpSecret) });
        if (totp.validate({ token: inputCode, window: 1 }) !== null) setAuth(true);
        else setError('Invalid 2FA code.');
    };

    // LOGIN FLOW
    const handleLogin = async () => {
        setLoading(true); setError('');
        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));
            if (userDoc.exists()) {
                setTotpSecret(userDoc.data().mfaSecret);
                setStep('verify_2fa');
            } else { setError('User data not found.'); }
        } catch (err) { setError(err.message); }
        setLoading(false);
    };

    const handleVerifyLogin2FA = () => {
        const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(totpSecret) });
        if (totp.validate({ token: inputCode, window: 1 }) !== null) setAuth(true);
        else setError('Invalid 2FA code.');
    };

    return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-brand-panel p-8 rounded-3xl w-full max-w-md shadow-2xl border border-white/5">
                <div className="flex justify-center mb-6"><ShieldCheck size={48} className="text-brand-primary" /></div>
                <h2 className="text-2xl font-bold text-center mb-8">Secure Access</h2>
                
                {error && <div className="bg-brand-red/10 text-brand-red p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}

                {step === 'select' && (
                    <div className="space-y-4">
                        <button onClick={() => setStep('login')} className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold">Login to Account</button>
                        <button onClick={() => setStep('signup_email')} className="w-full bg-brand-card text-white py-3 rounded-xl border border-white/10 font-bold hover:bg-white/5">Create New Account</button>
                    </div>
                )}

                {step === 'signup_email' && (
                    <div className="space-y-4">
                        <div className="flex items-center bg-brand-card rounded-xl px-4 py-3 border border-white/5"><Mail size={18} className="text-brand-muted mr-3"/><input type="email" placeholder="Enter Email" value={email} onChange={e=>setEmail(e.target.value)} className="bg-transparent outline-none flex-1 text-sm text-white"/></div>
                        <button onClick={handleSendEmailCode} disabled={loading} className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold">{loading ? 'Sending...' : 'Send Code'}</button>
                    </div>
                )}

                {step === 'verify_email' && (
                    <div className="space-y-4">
                        <p className="text-sm text-brand-muted text-center">Enter the 4-digit code sent to {email}</p>
                        <input type="text" placeholder="0000" maxLength="4" value={inputCode} onChange={e=>setInputCode(e.target.value)} className="w-full bg-brand-card rounded-xl px-4 py-3 text-center tracking-[1em] text-xl font-bold outline-none border border-white/5 focus:border-brand-primary" />
                        <button onClick={handleVerifyEmail} className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold">Verify Email</button>
                    </div>
                )}

                {step === 'setup_pass' && (
                    <div className="space-y-4">
                        <div className="flex items-center bg-brand-card rounded-xl px-4 py-3 border border-white/5"><Key size={18} className="text-brand-muted mr-3"/><input type="password" placeholder="Create Password" value={password} onChange={e=>setPassword(e.target.value)} className="bg-transparent outline-none flex-1 text-sm text-white"/></div>
                        <button onClick={handleSetupPassword} disabled={loading} className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold">{loading ? 'Saving...' : 'Set Password'}</button>
                    </div>
                )}

                {step === 'setup_2fa' && (
                    <div className="space-y-4 flex flex-col items-center">
                        <p className="text-sm text-brand-muted text-center">Scan this QR code with Google Authenticator or Authy to enable Real 2FA.</p>
                        <div className="bg-white p-4 rounded-xl"><QRCodeSVG value={totpUri} size={150} /></div>
                        <input type="text" placeholder="Enter 6-digit TOTP" maxLength="6" value={inputCode} onChange={e=>setInputCode(e.target.value)} className="w-full bg-brand-card rounded-xl px-4 py-3 text-center tracking-widest text-lg font-bold outline-none border border-white/5" />
                        <button onClick={handleVerify2FASetup} className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold">Enable 2FA & Complete</button>
                    </div>
                )}

                {step === 'login' && (
                    <div className="space-y-4">
                        <div className="flex items-center bg-brand-card rounded-xl px-4 py-3 border border-white/5"><Mail size={18} className="text-brand-muted mr-3"/><input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="bg-transparent outline-none flex-1 text-sm text-white"/></div>
                        <div className="flex items-center bg-brand-card rounded-xl px-4 py-3 border border-white/5"><Lock size={18} className="text-brand-muted mr-3"/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="bg-transparent outline-none flex-1 text-sm text-white"/></div>
                        <button onClick={handleLogin} disabled={loading} className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold">{loading ? 'Authenticating...' : 'Login'}</button>
                    </div>
                )}

                {step === 'verify_2fa' && (
                    <div className="space-y-4">
                        <p className="text-sm text-brand-muted text-center">Enter the 6-digit code from your Authenticator App</p>
                        <input type="text" placeholder="000 000" maxLength="6" value={inputCode} onChange={e=>setInputCode(e.target.value)} className="w-full bg-brand-card rounded-xl px-4 py-3 text-center tracking-[0.5em] text-xl font-bold outline-none border border-white/5 focus:border-brand-primary" />
                        <button onClick={handleVerifyLogin2FA} className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold flex justify-center items-center">Unlock Wallet <ArrowRight size={16} className="ml-2"/></button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
"""
    write_file('src/components/AuthFlow.jsx', authflow_jsx)

    # ==========================================
    # 5. ONBOARDING (8 SLIDES)
    # ==========================================
    onboarding_jsx = """
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { useAppStore } from '../store/useStore';

const SVGShape = ({ children, color }) => (
    <motion.svg viewBox="0 0 200 200" className="w-64 h-64 overflow-visible" animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
        {children}
    </motion.svg>
);

const slides = [
    { title: "Pro Sportsbook\\nArchitecture", desc: "Experience a dense, trading-grade interface designed for high-volume bettors.", graphic: <SVGShape><motion.circle cx="100" cy="100" r="70" fill="none" stroke="#1D7AF2" strokeWidth="12" className="drop-shadow-[0_0_30px_rgba(29,122,242,0.6)]" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }} /></SVGShape> },
    { title: "Real-Time\\nLive Odds Grid", desc: "Instantaneous updates for Asian Handicaps and Over/Under lines.", graphic: <SVGShape><motion.path d="M 20 150 L 70 90 L 110 110 L 170 40" fill="none" stroke="#22C55E" strokeWidth="10" className="drop-shadow-[0_0_25px_rgba(34,197,94,0.8)]" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity }} /></SVGShape> },
    { title: "Mollybet\\nTrade Engine", desc: "Mirrored functionality of the world's leading sports trading software.", graphic: <SVGShape><motion.polygon points="100,20 180,180 20,180" fill="none" stroke="#D9F950" strokeWidth="10" className="drop-shadow-[0_0_30px_rgba(217,249,80,0.8)]" animate={{ rotate: -360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} /></SVGShape> },
    { title: "Bank-Grade\\n2FA Security", desc: "Secured via strict Firebase rules and OTPAuth TOTP authentication.", graphic: <SVGShape><motion.circle cx="100" cy="100" r="50" fill="none" stroke="#7000FF" strokeWidth="16" className="drop-shadow-[0_0_40px_rgba(112,0,255,0.8)]" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} /></SVGShape> },
    { title: "Lightning Fast\\nExecution", desc: "One-click bet placement with zero latency via global edge routing.", graphic: <SVGShape><motion.path d="M 100 0 L 100 200 M 0 100 L 200 100" stroke="#FF3B30" strokeWidth="8" className="drop-shadow-[0_0_20px_rgba(255,59,48,0.8)]" animate={{ rotate: 45 }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} /></SVGShape> },
    { title: "Global\\nLiquidity", desc: "Aggregated odds from top global bookmakers in one interface.", graphic: <SVGShape><motion.ellipse cx="100" cy="100" rx="90" ry="30" fill="none" stroke="#1D7AF2" strokeWidth="6" animate={{ ry: [30, 90, 30] }} transition={{ duration: 4, repeat: Infinity }} /></SVGShape> },
    { title: "Customizable\\nDashboards", desc: "Tailor your layout, timezone, and price formats perfectly.", graphic: <SVGShape><motion.rect x="40" y="40" width="120" height="120" fill="none" stroke="#22C55E" strokeWidth="10" animate={{ rotate: 90 }} transition={{ duration: 3, repeat: Infinity }} /></SVGShape> },
    { title: "Secure Your\\nBankroll", desc: "Sign up now and lock down your account with real 2-Factor Authentication.", graphic: <SVGShape><motion.circle cx="100" cy="100" r="80" fill="none" stroke="#D9F950" strokeWidth="8" animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }} transition={{ duration: 2, repeat: Infinity }} /><circle cx="100" cy="100" r="10" fill="#FFF"/></SVGShape> }
];

export default function Onboarding() {
    const [index, setIndex] = useState(0);
    const setOnboarded = useAppStore(state => state.setOnboarded);

    return (
        <div className="relative w-full h-screen bg-brand-bg flex flex-col justify-between p-8 z-50 items-center text-center overflow-hidden">
            <div className="flex-1 flex flex-col justify-center items-center w-full max-w-md">
                <AnimatePresence mode="wait">
                    <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.3 }} className="flex flex-col items-center w-full">
                        <div className="w-full flex justify-center mb-8 h-64">{slides[index].graphic}</div>
                        <h1 className="text-4xl font-black whitespace-pre-line mt-8 leading-tight tracking-tight text-white">{slides[index].title}</h1>
                        <p className="text-brand-muted mt-4 text-sm leading-relaxed max-w-xs mx-auto">{slides[index].desc}</p>
                    </motion.div>
                </AnimatePresence>
            </div>
            
            <div className="w-full max-w-md pb-8">
                <div className="flex justify-center space-x-2 mb-8">
                    {slides.map((_, i) => (<div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-brand-primary' : 'w-2 bg-brand-panel border border-white/10'}`} />))}
                </div>
                {index < slides.length - 1 ? (
                    <button onClick={() => setIndex(i => i + 1)} className="w-full bg-brand-panel border border-white/10 text-white font-bold py-4 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors">
                        <span>Continue</span><ArrowRight size={18} className="ml-2 text-brand-muted" />
                    </button>
                ) : (
                    <button onClick={() => setOnboarded()} className="w-full bg-brand-neon text-black font-black py-4 rounded-xl flex items-center justify-center hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(217,249,80,0.3)]">
                        <Play size={18} className="mr-2" fill="currentColor" /><span>GET STARTED</span>
                    </button>
                )}
            </div>
        </div>
    );
}
"""
    write_file('src/components/Onboarding.jsx', onboarding_jsx)

    # ==========================================
    # 6. APP LAYOUT (Sidebar, Center Grid, Betslip)
    # ==========================================
    app_jsx = """
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
"""
    write_file('src/App.jsx', app_jsx)
    write_file('src/main.jsx', "import React from 'react'; import ReactDOM from 'react-dom/client'; import App from './App.jsx'; import './index.css'; ReactDOM.createRoot(document.getElementById('root')).render(<App />);")

    # ==========================================
    # 7. SPORTSBOOK HOME PAGE (Dense Mollybet UI)
    # ==========================================
    home_jsx = """
import React from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/useStore';

const matches = [
    { id: 1, time: "64'", league: "UEFA Champions League", t1: "Paris St. Germain", t2: "FC Barcelona", s1: 2, s2: 1, odds: { o1: 2.315, ox: 4.851, o2: 4.001, ah1: 1.101, ah2: 9.216, o_ou: 1.5, u_ou: 8.214 } },
    { id: 2, time: "19:00", league: "UEFA Champions League", t1: "Manchester City", t2: "Chelsea", s1: 0, s2: 0, odds: { o1: 1.954, ox: 3.200, o2: 4.500, ah1: 1.850, ah2: 1.950, o_ou: 2.5, u_ou: 1.850 } },
    { id: 3, time: "88'", league: "Serie A", t1: "Fiorentina", t2: "AC Milan", s1: 3, s2: 1, odds: { o1: 1.050, ox: 15.00, o2: 55.00, ah1: "-", ah2: "-", o_ou: 4.5, u_ou: 1.100 } },
    { id: 4, time: "45'", league: "Premier League", t1: "Liverpool", t2: "Arsenal", s1: 1, s2: 1, odds: { o1: 2.500, ox: 3.100, o2: 2.800, ah1: 1.900, ah2: 1.950, o_ou: 3.5, u_ou: 2.100 } }
];

export default function Home() {
    const addToBetslip = useAppStore(state => state.addToBetslip);

    const handleOddsClick = (team, oddsVal, market) => {
        if(oddsVal !== "-") addToBetslip({ team, odds: oddsVal, market });
    };

    return (
        <div className="animate-fade-in w-full max-w-[1200px] mx-auto">
            {/* Filters Row */}
            <div className="flex space-x-2 mb-4 overflow-x-auto hide-scrollbar pb-2">
                <button className="bg-brand-primary text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center whitespace-nowrap"><div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div> Live events</button>
                {['Football', 'Basketball', 'Tennis', 'American Football', 'E-Sports'].map(s => (
                    <button key={s} className="bg-brand-card border border-white/5 text-brand-muted hover:text-white px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors">{s}</button>
                ))}
            </div>

            {/* Match Grid Header */}
            <div className="bg-[#1A1C23] rounded-t-xl border border-white/5 p-3 flex text-[10px] font-bold text-brand-muted uppercase tracking-wider sticky top-0 z-10">
                <div className="w-2/5">Match</div>
                <div className="w-3/5 grid grid-cols-7 gap-1 text-center items-center">
                    <div>1</div><div>X</div><div>2</div>
                    <div className="col-span-2">A/1 &nbsp;&nbsp;&nbsp; A/2</div>
                    <div className="col-span-2">O &nbsp;&nbsp;&nbsp; U</div>
                </div>
            </div>

            {/* Match List */}
            <div className="space-y-1">
                {matches.map(m => (
                    <div key={m.id} className="bg-brand-card hover:bg-[#1E2129] border border-white/5 rounded-lg p-3 flex items-center transition-colors group">
                        {/* Match Info */}
                        <div className="w-2/5 flex pr-4">
                            <div className="flex flex-col items-center justify-center mr-3 w-8">
                                <Star size={12} className="text-brand-muted/30 hover:text-brand-neon cursor-pointer mb-1"/>
                                <span className={`text-[10px] font-bold ${m.time.includes("'") ? 'text-brand-red animate-pulse' : 'text-brand-muted'}`}>{m.time}</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] text-brand-muted mb-1 flex items-center">{m.league} <ChevronRight size={10} className="mx-1"/> </p>
                                <div className="flex justify-between items-center"><span className="text-xs font-bold text-white">{m.t1}</span><span className="text-brand-neon text-xs font-bold">{m.s1}</span></div>
                                <div className="flex justify-between items-center mt-1"><span className="text-xs font-bold text-white">{m.t2}</span><span className="text-brand-neon text-xs font-bold">{m.s2}</span></div>
                            </div>
                        </div>

                        {/* Odds Grid */}
                        <div className="w-3/5 grid grid-cols-7 gap-1.5">
                            <button onClick={()=>handleOddsClick(m.t1, m.odds.o1, 'Match Winner')} className="odds-btn"><span></span><span className="odds-val">{m.odds.o1}</span></button>
                            <button onClick={()=>handleOddsClick('Draw', m.odds.ox, 'Match Winner')} className="odds-btn bg-[#22242B]"><span></span><span className="odds-val text-brand-muted">{m.odds.ox}</span></button>
                            <button onClick={()=>handleOddsClick(m.t2, m.odds.o2, 'Match Winner')} className="odds-btn"><span></span><span className="odds-val">{m.odds.o2}</span></button>
                            
                            <button onClick={()=>handleOddsClick(m.t1, m.odds.ah1, 'Asian Hcap')} className="odds-btn col-span-1"><span>-1.5</span><span className="odds-val">{m.odds.ah1}</span></button>
                            <button onClick={()=>handleOddsClick(m.t2, m.odds.ah2, 'Asian Hcap')} className="odds-btn col-span-1"><span>+1.5</span><span className="odds-val">{m.odds.ah2}</span></button>
                            
                            <button onClick={()=>handleOddsClick('Over', m.odds.o_ou, 'Total Goals')} className="odds-btn col-span-1"><span>2.5</span><span className="odds-val text-white">{m.odds.o_ou}</span></button>
                            <button onClick={()=>handleOddsClick('Under', m.odds.u_ou, 'Total Goals')} className="odds-btn col-span-1"><span>2.5</span><span className="odds-val text-white">{m.odds.u_ou}</span></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Graphics Block */}
            <div className="mt-6 flex space-x-4">
                <div className="flex-1 bg-gradient-to-r from-[#171A21] to-brand-bg rounded-xl border border-white/5 p-6 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-20"><svg width="150" height="150" viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" stroke="#1D7AF2" strokeWidth="20" fill="none"/></svg></div>
                    <div className="relative z-10">
                        <h3 className="text-lg font-black text-white mb-1">Mollybet Pro Engine</h3>
                        <p className="text-xs text-brand-muted">Trade like a professional with direct API access.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
"""
    write_file('src/pages/Home/index.jsx', home_jsx)

    # Fill out required dummy files to prevent compilation errors
    write_file('src/pages/Discovery/index.jsx', "export default function Discovery() { return <div className='p-4 text-white text-xs'>Statistics Engine Loading...</div>; }")
    write_file('src/pages/Settings/index.jsx', "export default function Settings() { return <div className='p-4 text-white text-xs'>System Preferences</div>; }")

    print("\n✅ PRO SPORTSBOOK ARCHITECTURE COMPLETE!")
    print("✅ Full Authentication Flow (EmailJS + OTPAuth 2FA) Integrated.")
    print("✅ Dense Mollybet Grid Layout + Asian Handicap configurations added.")

if __name__ == "__main__":
    main()