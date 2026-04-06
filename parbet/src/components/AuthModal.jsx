import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { auth, db } from '../lib/firebase';
import { 
    signInWithPopup, 
    GoogleAuthProvider, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function AuthModal() {
    const { isAuthModalOpen, closeAuthModal, setUser, setOnboarded } = useAppStore();
    
    // Auth Flow States
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // Real-time Validation & Feedback States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [passwordStrength, setPasswordStrength] = useState(0);

    // FEATURE 1: Prevent body scrolling when the authentication modal is active
    useEffect(() => {
        if (isAuthModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
            // Reset states on close
            setTimeout(() => {
                setEmail('');
                setPassword('');
                setError(null);
                setIsLogin(true);
            }, 300);
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isAuthModalOpen]);

    // FEATURE 2: Real-time Password Strength Validation Logic
    useEffect(() => {
        if (!password) {
            setPasswordStrength(0);
            return;
        }
        let score = 0;
        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        setPasswordStrength(score);
    }, [password]);

    // Firestore User Document Sync
    const syncUserToFirestore = async (user, additionalData = {}) => {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        
        if (!docSnap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || '',
                photoURL: user.photoURL || '',
                balance: 0,
                favorites: [],
                createdAt: new Date().toISOString(),
                ...additionalData
            });
        }
    };

    // FEATURE 3: Real Firebase Google OAuth Logic
    const handleGoogleAuth = async () => {
        setLoading(true);
        setError(null);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await syncUserToFirestore(result.user);
            setUser({
                uid: result.user.uid,
                email: result.user.email,
                name: result.user.displayName,
                photo: result.user.photoURL
            });
            setOnboarded();
            closeAuthModal();
        } catch (err) {
            console.error("Google Auth Error:", err);
            setError(err.message || 'Failed to authenticate with Google. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // FEATURE 4: Real Firebase Email/Password Auth Logic
    const handleEmailAuth = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in all fields.');
            return;
        }
        if (!isLogin && passwordStrength < 2) {
            setError('Please choose a stronger password.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let userCredential;
            if (isLogin) {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            } else {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
            }
            
            await syncUserToFirestore(userCredential.user);
            setUser({
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                name: userCredential.user.displayName || email.split('@')[0],
                photo: userCredential.user.photoURL
            });
            setOnboarded();
            closeAuthModal();
        } catch (err) {
            console.error("Email Auth Error:", err);
            // Translate Firebase error codes to human-readable messages
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Invalid email or password.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists.');
            } else {
                setError('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isAuthModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
                    {/* Dark Glassmorphic Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        onClick={closeAuthModal}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
                    />
                    
                    {/* Modal Content Container */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-gray-200"
                    >
                        {/* Close Button */}
                        <button 
                            onClick={closeAuthModal}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors z-20 shadow-sm"
                        >
                            <X size={18} />
                        </button>
                        
                        {/* SECTION 1: Animated High-End SVG Topography Header */}
                        <div className="relative h-[140px] bg-[#114C2A] overflow-hidden flex items-end px-8 pb-6">
                            <motion.svg 
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                viewBox="0 0 400 200" 
                                className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
                            >
                                <path d="M0 150 Q100 50 200 150 T400 150" fill="none" stroke="white" strokeWidth="2"/>
                                <path d="M0 170 Q100 70 200 170 T400 170" fill="none" stroke="white" strokeWidth="1"/>
                                <path d="M0 190 Q100 90 200 190 T400 190" fill="none" stroke="white" strokeWidth="0.5"/>
                                <circle cx="200" cy="150" r="40" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 4"/>
                            </motion.svg>
                            <div className="relative z-10 text-white">
                                <h2 className="text-[28px] font-black leading-none tracking-tight">parbet</h2>
                                <p className="text-[13px] font-medium text-green-100 mt-1">
                                    {isLogin ? 'Welcome back to the action.' : 'Join the ultimate ticket marketplace.'}
                                </p>
                            </div>
                        </div>

                        <div className="p-8">
                            {/* Dynamic Error Toast */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0, mb: 0 }}
                                        animate={{ opacity: 1, height: 'auto', mb: 16 }}
                                        exit={{ opacity: 0, height: 0, mb: 0 }}
                                        className="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl text-[13px] font-bold flex items-center overflow-hidden"
                                    >
                                        <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* SECTION 2: OAuth Provider Portal */}
                            <button 
                                onClick={handleGoogleAuth}
                                disabled={loading}
                                className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                <span>Continue with Google</span>
                            </button>

                            <div className="flex items-center justify-center space-x-4 mb-6">
                                <div className="h-px bg-gray-200 flex-1"></div>
                                <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Or email</span>
                                <div className="h-px bg-gray-200 flex-1"></div>
                            </div>

                            {/* SECTION 3: Secure Credentials Form */}
                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                <div className="relative">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="email" 
                                        placeholder="Email address" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-[15px] font-medium text-gray-900 outline-none focus:border-[#114C2A] focus:ring-1 focus:ring-[#114C2A] transition-all placeholder-gray-400"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="Password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-12 py-3.5 text-[15px] font-medium text-gray-900 outline-none focus:border-[#114C2A] focus:ring-1 focus:ring-[#114C2A] transition-all placeholder-gray-400"
                                        required
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {/* SECTION 4: Live Password Strength Progress Bar (Only on Sign Up) */}
                                <AnimatePresence>
                                    {!isLogin && password.length > 0 && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="px-1"
                                        >
                                            <div className="flex gap-1 mb-1.5">
                                                {[1, 2, 3, 4].map((level) => (
                                                    <div 
                                                        key={level} 
                                                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                                                            passwordStrength >= level 
                                                                ? (passwordStrength < 2 ? 'bg-red-400' : passwordStrength < 4 ? 'bg-yellow-400' : 'bg-[#458731]') 
                                                                : 'bg-gray-200'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <p className={`text-[11px] font-bold text-right ${passwordStrength < 2 ? 'text-red-500' : passwordStrength < 4 ? 'text-yellow-600' : 'text-[#458731]'}`}>
                                                {passwordStrength < 2 ? 'Weak' : passwordStrength < 4 ? 'Good' : 'Strong'}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#114C2A] text-white font-black py-4 rounded-xl shadow-lg hover:bg-[#0c361d] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center mt-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        isLogin ? 'Sign In' : 'Create Account'
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <button 
                                    onClick={() => { setIsLogin(!isLogin); setError(null); setPassword(''); }}
                                    className="text-[14px] font-bold text-gray-600 hover:text-[#114C2A] transition-colors"
                                >
                                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                                </button>
                            </div>
                        </div>

                        {/* SECTION 5: Legal Footer */}
                        <div className="bg-gray-50 border-t border-gray-100 p-5 text-center">
                            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                                By continuing, you agree to Parbet's <button className="text-[#1D7AF2] hover:underline">Terms of Service</button> and acknowledge you've read our <button className="text-[#1D7AF2] hover:underline">Privacy Policy</button>.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}