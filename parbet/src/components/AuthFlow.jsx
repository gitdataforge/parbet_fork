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
            <div className="flex justify-center mb-6"><ShieldCheck size={48} className="text-brand-primary" /></div>
            <h2 className="text-2xl font-bold text-center text-brand-text mb-8">Secure Access</h2>
            
            {error && <div className="bg-brand-red/10 text-brand-red p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}

            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} key={step}>
                {step === 'select' && (
                    <div className="space-y-4">
                        <button onClick={() => setStep('login')} className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold hover:bg-brand-primary/90 transition-colors">Sign In to Account</button>
                        <button onClick={() => setStep('signup_email')} className="w-full bg-white text-brand-primary py-3 rounded-xl border border-brand-border font-bold hover:bg-brand-panel transition-colors">Create New Account</button>
                    </div>
                )}

                {step === 'signup_email' && (
                    <div className="space-y-4">
                        <div className="flex items-center bg-white rounded-xl px-4 py-3 border border-brand-border"><Mail size={18} className="text-brand-muted mr-3"/><input type="email" placeholder="Enter Email Address" value={email} onChange={e=>setEmail(e.target.value)} className="bg-transparent outline-none flex-1 text-sm text-brand-text"/></div>
                        <button onClick={handleSendEmailCode} disabled={loading} className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold hover:bg-brand-primary/90 transition-colors">{loading ? 'Sending...' : 'Send Verification Code'}</button>
                    </div>
                )}

                {step === 'verify_email' && (
                    <div className="space-y-4">
                        <p className="text-sm text-brand-muted text-center">Enter the 4-digit code sent to {email}</p>
                        <input type="text" placeholder="0000" maxLength="4" value={inputCode} onChange={e=>setInputCode(e.target.value)} className="w-full bg-white rounded-xl px-4 py-3 text-center tracking-[1em] text-xl font-bold outline-none border border-brand-border focus:border-brand-primary text-brand-text" />
                        <button onClick={handleVerifyEmail} className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold hover:bg-brand-primary/90 transition-colors">Verify Email</button>
                    </div>
                )}

                {step === 'setup_pass' && (
                    <div className="space-y-4">
                        <div className="flex items-center bg-white rounded-xl px-4 py-3 border border-brand-border"><Key size={18} className="text-brand-muted mr-3"/><input type="password" placeholder="Create Password" value={password} onChange={e=>setPassword(e.target.value)} className="bg-transparent outline-none flex-1 text-sm text-brand-text"/></div>
                        <button onClick={handleSetupPassword} disabled={loading} className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold hover:bg-brand-primary/90 transition-colors">{loading ? 'Saving...' : 'Set Password & Continue'}</button>
                    </div>
                )}

                {step === 'setup_2fa' && (
                    <div className="space-y-4 flex flex-col items-center">
                        <p className="text-sm text-brand-muted text-center">Scan this QR code with Google Authenticator or Authy to enable strictly required 2FA.</p>
                        <div className="bg-white p-4 rounded-xl border border-brand-border shadow-sm"><QRCodeSVG value={totpUri} size={150} /></div>
                        <input type="text" placeholder="Enter 6-digit TOTP" maxLength="6" value={inputCode} onChange={e=>setInputCode(e.target.value)} className="w-full bg-white rounded-xl px-4 py-3 text-center tracking-widest text-lg font-bold outline-none border border-brand-border text-brand-text focus:border-brand-primary" />
                        <button onClick={handleVerify2FASetup} className="w-full bg-brand-accent text-white py-3 rounded-xl font-bold hover:bg-brand-accent/90 transition-colors">Enable 2FA & Complete</button>
                    </div>
                )}

                {step === 'login' && (
                    <div className="space-y-4">
                        <div className="flex items-center bg-white rounded-xl px-4 py-3 border border-brand-border"><Mail size={18} className="text-brand-muted mr-3"/><input type="email" placeholder="Email Address" value={email} onChange={e=>setEmail(e.target.value)} className="bg-transparent outline-none flex-1 text-sm text-brand-text"/></div>
                        <div className="flex items-center bg-white rounded-xl px-4 py-3 border border-brand-border"><Lock size={18} className="text-brand-muted mr-3"/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="bg-transparent outline-none flex-1 text-sm text-brand-text"/></div>
                        <button onClick={handleLogin} disabled={loading} className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold hover:bg-brand-primary/90 transition-colors">{loading ? 'Authenticating...' : 'Sign In'}</button>
                    </div>
                )}

                {step === 'verify_2fa' && (
                    <div className="space-y-4">
                        <p className="text-sm text-brand-muted text-center">Enter the 6-digit code from your Authenticator App</p>
                        <input type="text" placeholder="000 000" maxLength="6" value={inputCode} onChange={e=>setInputCode(e.target.value)} className="w-full bg-white rounded-xl px-4 py-3 text-center tracking-[0.5em] text-xl font-bold outline-none border border-brand-border text-brand-text focus:border-brand-primary" />
                        <button onClick={handleVerifyLogin2FA} className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold flex justify-center items-center hover:bg-brand-primary/90 transition-colors">Unlock Account <ArrowRight size={16} className="ml-2"/></button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}