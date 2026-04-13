import React, { useState } from 'react';
import * as OTPAuth from 'otpauth';
import { QRCodeSVG } from 'qrcode.react';
import { auth, db } from '../lib/firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { sendVerificationEmail } from '../lib/email';
import { useAppStore } from '../store/useStore';
import { ShieldCheck, Mail, Key, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthFlow() {
    // Extracted closeAuthModal from the store
    const { setAuth, closeAuthModal } = useAppStore();
    
    const [step, setStep] = useState('select');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [totpSecret, setTotpSecret] = useState('');
    const [totpUri, setTotpUri] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // FEATURE 1: Secure Google OAuth Pipeline with Domain Interceptor
    const handleGoogleAuth = async () => {
        setLoading(true);
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            const userCred = await signInWithPopup(auth, provider);
            
            // Check if user exists in DB to handle 2FA routing
            const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));
            
            if (userDoc.exists() && userDoc.data().mfaSecret) {
                // Returning user with TOTP enabled
                setTotpSecret(userDoc.data().mfaSecret);
                setStep('verify_2fa');
            } else {
                // New Google User or user without 2FA: Initialize basic ledger and vault to app
                if (!userDoc.exists()) {
                    await setDoc(doc(db, 'users', userCred.user.uid), { 
                        email: userCred.user.email, 
                        balance: 0,
                        isGoogleAuth: true
                    }, { merge: true });
                }
                setAuth(true);
                closeAuthModal();
            }
        } catch (err) {
            console.error("OAuth Error:", err);
            // FEATURE 2: Graceful auth/unauthorized-domain Interceptor
            if (err.code === 'auth/unauthorized-domain') {
                setError("Google Sign-In Blocked: Your current Github Codespaces domain is not authorized. Please copy your URL and add it in Firebase Console -> Authentication -> Settings -> Authorized Domains.");
            } else if (err.code === 'auth/popup-closed-by-user') {
                setError("Sign-in popup was closed before completion.");
            } else {
                setError(err.message || "Failed to authenticate with Google.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmailCode = async () => {
        setLoading(true); setError('');
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedCode(code);
        const res = await sendVerificationEmail(email, code);
        setLoading(false);
        if (res.success) setStep('verify_email');
        else setError('Failed to send email. Check EmailJS configuration.');
    };

    const handleVerifyEmail = () => {
        if (inputCode === generatedCode) setStep('setup_pass');
        else setError('Invalid code.');
    };

    const handleSetupPassword = async () => {
        setLoading(true); setError('');
        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            const secret = new OTPAuth.Secret({ size: 20 });
            const totp = new OTPAuth.TOTP({ issuer: 'Parbet', label: email, algorithm: 'SHA1', digits: 6, period: 30, secret });
            setTotpSecret(secret.base32);
            setTotpUri(totp.toString());
            await setDoc(doc(db, 'users', userCred.user.uid), { email, mfaSecret: secret.base32, balance: 1999.98 });
            setStep('setup_2fa');
        } catch (err) { setError(err.message); }
        setLoading(false);
    };

    const handleVerify2FASetup = () => {
        const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(totpSecret) });
        if (totp.validate({ token: inputCode, window: 1 }) !== null) {
            setAuth(true);
            closeAuthModal(); // Close modal automatically
        } else {
            setError('Invalid 2FA code.');
        }
    };

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
        if (totp.validate({ token: inputCode, window: 1 }) !== null) {
            setAuth(true);
            closeAuthModal(); // Close modal automatically
        } else {
            setError('Invalid 2FA code.');
        }
    };

    return (
        <div className="w-full bg-white p-6 md:p-8">
            <div className="flex justify-center mb-6"><ShieldCheck size={48} className="text-[#114C2A]" /></div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Secure Access</h2>
            
            {/* Enhanced Error Rendering for long domain instructions */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 flex items-start gap-3 shadow-sm text-left leading-relaxed">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} key={step}>
                {step === 'select' && (
                    <div className="space-y-4">
                        <button onClick={() => setStep('login')} className="w-full bg-[#114C2A] text-white py-3.5 rounded-xl font-bold hover:bg-[#0c361d] transition-colors shadow-md">Sign In to Account</button>
                        <button onClick={() => setStep('signup_email')} className="w-full bg-white text-[#114C2A] py-3.5 rounded-xl border-2 border-gray-200 font-bold hover:border-[#114C2A] hover:bg-gray-50 transition-colors">Create New Account</button>
                        
                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-black uppercase tracking-widest">Or connect with</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        {/* FEATURE 3: Google Auth Injection */}
                        <button 
                            onClick={handleGoogleAuth} 
                            disabled={loading} 
                            className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold flex justify-center items-center gap-3 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin text-gray-500" size={20} /> : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                            )}
                            Continue with Google
                        </button>
                    </div>
                )}

                {step === 'signup_email' && (
                    <div className="space-y-4">
                        <button onClick={() => setStep('select')} className="text-[#0064d2] text-sm font-bold hover:underline mb-2 block">&larr; Back</button>
                        <div className="flex items-center bg-white rounded-xl px-4 py-3 border-2 border-gray-200 focus-within:border-[#114C2A] transition-colors"><Mail size={18} className="text-gray-400 mr-3"/><input type="email" placeholder="Enter Email Address" value={email} onChange={e=>setEmail(e.target.value)} className="bg-transparent outline-none flex-1 text-[15px] font-medium text-gray-900"/></div>
                        <button onClick={handleSendEmailCode} disabled={loading} className="w-full bg-[#114C2A] text-white py-3.5 rounded-xl font-bold hover:bg-[#0c361d] transition-colors shadow-md disabled:opacity-50 flex justify-center items-center gap-2">
                            {loading ? <><Loader2 className="animate-spin" size={18} /> Sending...</> : 'Send Verification Code'}
                        </button>
                    </div>
                )}

                {step === 'verify_email' && (
                    <div className="space-y-4">
                        <p className="text-[15px] text-gray-500 font-medium text-center mb-6">Enter the 4-digit code sent to <strong className="text-gray-900">{email}</strong></p>
                        <input type="text" placeholder="0000" maxLength="4" value={inputCode} onChange={e=>setInputCode(e.target.value)} className="w-full bg-white rounded-xl px-4 py-4 text-center tracking-[1em] text-2xl font-black outline-none border-2 border-gray-200 focus:border-[#114C2A] text-gray-900 transition-colors shadow-sm" />
                        <button onClick={handleVerifyEmail} className="w-full bg-[#114C2A] text-white py-3.5 rounded-xl font-bold hover:bg-[#0c361d] transition-colors shadow-md mt-2">Verify Email</button>
                    </div>
                )}

                {step === 'setup_pass' && (
                    <div className="space-y-4">
                        <div className="flex items-center bg-white rounded-xl px-4 py-3 border-2 border-gray-200 focus-within:border-[#114C2A] transition-colors"><Key size={18} className="text-gray-400 mr-3"/><input type="password" placeholder="Create Password" value={password} onChange={e=>setPassword(e.target.value)} className="bg-transparent outline-none flex-1 text-[15px] font-medium text-gray-900"/></div>
                        <button onClick={handleSetupPassword} disabled={loading} className="w-full bg-[#114C2A] text-white py-3.5 rounded-xl font-bold hover:bg-[#0c361d] transition-colors shadow-md disabled:opacity-50 flex justify-center items-center gap-2">
                            {loading ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : 'Set Password & Continue'}
                        </button>
                    </div>
                )}

                {step === 'setup_2fa' && (
                    <div className="space-y-6 flex flex-col items-center">
                        <p className="text-[14px] text-gray-500 font-medium text-center leading-relaxed">Scan this QR code with Google Authenticator or Authy to enable strictly required 2FA.</p>
                        <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm"><QRCodeSVG value={totpUri} size={150} /></div>
                        <input type="text" placeholder="Enter 6-digit TOTP" maxLength="6" value={inputCode} onChange={e=>setInputCode(e.target.value)} className="w-full bg-white rounded-xl px-4 py-4 text-center tracking-widest text-xl font-black outline-none border-2 border-gray-200 text-gray-900 focus:border-[#114C2A] transition-colors shadow-sm" />
                        <button onClick={handleVerify2FASetup} className="w-full bg-[#458731] text-white py-3.5 rounded-xl font-bold hover:bg-[#366a26] transition-colors shadow-md">Enable 2FA & Complete</button>
                    </div>
                )}

                {step === 'login' && (
                    <div className="space-y-4">
                        <button onClick={() => setStep('select')} className="text-[#0064d2] text-sm font-bold hover:underline mb-2 block">&larr; Back</button>
                        <div className="flex items-center bg-white rounded-xl px-4 py-3 border-2 border-gray-200 focus-within:border-[#114C2A] transition-colors"><Mail size={18} className="text-gray-400 mr-3"/><input type="email" placeholder="Email Address" value={email} onChange={e=>setEmail(e.target.value)} className="bg-transparent outline-none flex-1 text-[15px] font-medium text-gray-900"/></div>
                        <div className="flex items-center bg-white rounded-xl px-4 py-3 border-2 border-gray-200 focus-within:border-[#114C2A] transition-colors"><Lock size={18} className="text-gray-400 mr-3"/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="bg-transparent outline-none flex-1 text-[15px] font-medium text-gray-900"/></div>
                        <button onClick={handleLogin} disabled={loading} className="w-full bg-[#114C2A] text-white py-3.5 rounded-xl font-bold hover:bg-[#0c361d] transition-colors shadow-md disabled:opacity-50 flex justify-center items-center gap-2 mt-2">
                            {loading ? <><Loader2 className="animate-spin" size={18} /> Authenticating...</> : 'Sign In'}
                        </button>
                    </div>
                )}

                {step === 'verify_2fa' && (
                    <div className="space-y-4">
                        <p className="text-[15px] text-gray-500 font-medium text-center mb-6">Enter the 6-digit code from your Authenticator App</p>
                        <input type="text" placeholder="000 000" maxLength="6" value={inputCode} onChange={e=>setInputCode(e.target.value)} className="w-full bg-white rounded-xl px-4 py-4 text-center tracking-[0.5em] text-2xl font-black outline-none border-2 border-gray-200 text-gray-900 focus:border-[#114C2A] transition-colors shadow-sm" />
                        <button onClick={handleVerifyLogin2FA} className="w-full bg-[#114C2A] text-white py-3.5 rounded-xl font-bold flex justify-center items-center hover:bg-[#0c361d] transition-colors shadow-md mt-2">Unlock Account <ArrowRight size={18} className="ml-2"/></button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}