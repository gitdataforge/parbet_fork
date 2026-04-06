import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, AlertCircle, Eye, EyeOff, Camera, User, UploadCloud, ChevronRight, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { auth, db } from '../lib/firebase';
import { 
    signInWithPopup, 
    GoogleAuthProvider, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { uploadUserAvatar } from '../services/cloudinaryApi';
import { sendVerificationEmail, EmailVerificationGateway } from '../services/emailJsApi';

export default function AuthModal() {
    const navigate = useNavigate();
    const { isAuthModalOpen, closeAuthModal, setUser, setOnboarded } = useAppStore();
    
    // Auth Flow States (FEATURE 1: Complex Multi-Step State Machine)
    const [authStep, setAuthStep] = useState('credentials'); // 'credentials' | 'otp_verification' | 'profile_setup'
    const [isLogin, setIsLogin] = useState(true);
    const [pendingUser, setPendingUser] = useState(null);
    
    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    
    // FEATURE 2: OTP Engine States
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [expectedOtp, setExpectedOtp] = useState('');
    const [cooldown, setCooldown] = useState(0);

    // Feedback States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Prevent body scrolling & Reset states on close
    useEffect(() => {
        if (isAuthModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
            setTimeout(() => {
                setEmail('');
                setPassword('');
                setDisplayName('');
                setAvatarFile(null);
                setAvatarPreview('');
                setError(null);
                setIsLogin(true);
                setAuthStep('credentials');
                setPendingUser(null);
                setOtp(['', '', '', '', '', '']);
            }, 300);
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isAuthModalOpen]);

    // Real-time Password Strength Validation
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

    // Cooldown Timer for OTP Resend
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    // Firestore Document Sync
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
        } else if (Object.keys(additionalData).length > 0) {
            await updateDoc(userRef, additionalData);
        }
    };

    // OAuth: Google
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
            navigate('/dashboard');
        } catch (err) {
            console.error("Google Auth Error:", err);
            setError(err.message || 'Failed to authenticate with Google. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // SECTION 1: Credentials Dispatch (Halts Firebase for OTP on Sign Up)
    const handleEmailAuth = async (e) => {
        e.preventDefault();
        if (!email || !password) return setError('Please fill in all fields.');
        if (!isLogin && passwordStrength < 2) return setError('Please choose a stronger password.');

        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                // Direct Login
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                await syncUserToFirestore(userCredential.user);
                setUser({
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    name: userCredential.user.displayName || email.split('@')[0],
                    photo: userCredential.user.photoURL
                });
                setOnboarded();
                closeAuthModal();
                navigate('/dashboard');
            } else {
                // Halting Firebase -> Trigger EmailJS OTP Pipeline
                const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
                const res = await sendVerificationEmail(email, generatedCode);
                
                if (res.success) {
                    setExpectedOtp(generatedCode);
                    setCooldown(60);
                    setAuthStep('otp_verification');
                } else {
                    setError('Failed to send verification email. Check your connection.');
                }
            }
        } catch (err) {
            console.error("Auth Error:", err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') setError('Invalid email or password.');
            else if (err.code === 'auth/email-already-in-use') setError('An account with this email already exists.');
            else setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // FEATURE 3: Smart Grid OTP Parsers
    const handleOtpChange = (index, value) => {
        if (!/^[0-9]*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const handleVerifyOtp = async () => {
        const enteredCode = otp.join('');
        if (enteredCode.length !== 6) return setError("Please enter the complete 6-digit code.");
        
        setLoading(true);
        setError(null);

        // Simulate network confirmation
        await new Promise(resolve => setTimeout(resolve, 800));

        if (enteredCode === expectedOtp) {
            try {
                // Verification Passed -> Officially Create Firebase User
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await syncUserToFirestore(userCredential.user);
                setPendingUser(userCredential.user);
                setAuthStep('profile_setup');
                
                // Immediately log user in and route to dashboard upon successful verification
                setUser({
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    name: email.split('@')[0],
                    photo: ''
                });
                setOnboarded();
                closeAuthModal();
                navigate('/dashboard');
            } catch (err) {
                setError(err.message);
                setAuthStep('credentials');
            }
        } else {
            setError("Invalid verification code. Please try again.");
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0').focus();
        }
        setLoading(false);
    };

    const handleResendOtp = async () => {
        if (cooldown > 0) return;
        setError(null);
        setLoading(true);
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        const res = await sendVerificationEmail(email, generatedCode);
        if (res.success) {
            setExpectedOtp(generatedCode);
            setCooldown(60);
        } else {
            setError('Failed to resend code.');
        }
        setLoading(false);
    };

    // FEATURE 4: Cloudinary Profile Setup
    const handleProfileSetup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let photoUrl = '';
            if (avatarFile && pendingUser) {
                const uploadResult = await uploadUserAvatar(avatarFile, pendingUser.uid);
                photoUrl = uploadResult.url;
            }

            await updateProfile(pendingUser, {
                displayName: displayName || email.split('@')[0],
                photoURL: photoUrl || ''
            });

            await syncUserToFirestore(pendingUser, {
                displayName: displayName || email.split('@')[0],
                photoURL: photoUrl || ''
            });

            setUser({
                uid: pendingUser.uid,
                email: pendingUser.email,
                name: displayName || pendingUser.email.split('@')[0],
                photo: photoUrl || ''
            });
            setOnboarded();
            closeAuthModal();
            navigate('/dashboard');
        } catch (err) {
            console.error("Profile Setup Error:", err);
            setError('Failed to upload profile picture or save details.');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    return (
        <AnimatePresence>
            {isAuthModalOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[1000] bg-white flex flex-col md:flex-row w-full h-full overflow-hidden"
                >
                    {/* Absolute Close Button */}
                    <button 
                        onClick={closeAuthModal}
                        className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-gray-800 md:text-white backdrop-blur-md transition-colors z-[1010] shadow-sm border border-gray-200 md:border-white/20"
                    >
                        <X size={24} />
                    </button>

                    {/* Left Panel: Dynamic Multi-Step Wizard */}
                    <div className="w-full md:w-[45%] lg:w-[35%] h-full flex flex-col justify-center px-8 sm:px-16 overflow-y-auto hide-scrollbar bg-white relative z-10">
                        <div className="max-w-[400px] w-full mx-auto py-12">
                            
                            <h2 className="text-[32px] font-black leading-tight tracking-tight text-gray-900 mb-2">
                                {authStep === 'profile_setup' ? 'Complete Profile' : 
                                 authStep === 'otp_verification' ? 'Verify Email' : 
                                 isLogin ? 'Welcome back.' : 'Join Parbet.'}
                            </h2>
                            <p className="text-[15px] font-medium text-gray-500 mb-8">
                                {authStep === 'profile_setup' ? 'Personalize your account to get started.' : 
                                 authStep === 'otp_verification' ? `We've sent a 6-digit code to ${email}` : 
                                 'The worlds most secure secondary ticket marketplace.'}
                            </p>

                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        className="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl text-[13px] font-bold flex items-start mb-6"
                                    >
                                        <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence mode="wait">
                                
                                {/* SECTION 1: Credentials Portal */}
                                {authStep === 'credentials' && (
                                    <motion.div key="credentials" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                        <button 
                                            onClick={handleGoogleAuth} disabled={loading}
                                            className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 text-gray-800 font-bold py-4 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 mb-6"
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
                                            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Or</span>
                                            <div className="h-px bg-gray-200 flex-1"></div>
                                        </div>

                                        <form onSubmit={handleEmailAuth} className="space-y-4">
                                            <div className="relative">
                                                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input 
                                                    type="email" placeholder="Email address" value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-[15px] font-bold text-gray-900 outline-none focus:border-[#114C2A] focus:bg-white focus:ring-4 focus:ring-[#114C2A]/10 transition-all placeholder-gray-400"
                                                    required
                                                />
                                            </div>
                                            <div className="relative">
                                                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input 
                                                    type={showPassword ? "text" : "password"} placeholder="Password" value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-12 py-4 text-[15px] font-bold text-gray-900 outline-none focus:border-[#114C2A] focus:bg-white focus:ring-4 focus:ring-[#114C2A]/10 transition-all placeholder-gray-400"
                                                    required
                                                />
                                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>

                                            <AnimatePresence>
                                                {!isLogin && password.length > 0 && (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-1 pt-2">
                                                        <div className="flex gap-1.5 mb-2">
                                                            {[1, 2, 3, 4].map((level) => (
                                                                <div key={level} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${passwordStrength >= level ? (passwordStrength < 2 ? 'bg-red-400' : passwordStrength < 4 ? 'bg-yellow-400' : 'bg-[#458731]') : 'bg-gray-100'}`}/>
                                                            ))}
                                                        </div>
                                                        <p className={`text-[12px] font-bold text-right ${passwordStrength < 2 ? 'text-red-500' : passwordStrength < 4 ? 'text-yellow-600' : 'text-[#458731]'}`}>
                                                            {passwordStrength < 2 ? 'Weak' : passwordStrength < 4 ? 'Good' : 'Strong'}
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <button 
                                                type="submit" disabled={loading}
                                                className="w-full bg-[#114C2A] text-white font-black py-4 rounded-xl shadow-lg hover:bg-[#0c361d] hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center mt-4"
                                            >
                                                {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isLogin ? 'Sign In' : 'Create Account')}
                                            </button>
                                        </form>

                                        <div className="mt-8 text-center">
                                            <button onClick={() => { setIsLogin(!isLogin); setError(null); setPassword(''); }} className="text-[14px] font-bold text-gray-500 hover:text-[#114C2A] transition-colors">
                                                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* SECTION 2: OTP Verification Terminal */}
                                {authStep === 'otp_verification' && (
                                    <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                        <div className="flex justify-between space-x-2 mb-8">
                                            {otp.map((digit, i) => (
                                                <input
                                                    key={i}
                                                    id={`otp-${i}`}
                                                    type="text"
                                                    maxLength="1"
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                    disabled={loading}
                                                    className="w-12 h-14 md:w-14 md:h-16 border-2 border-gray-200 rounded-[12px] text-center text-2xl font-black text-gray-900 outline-none focus:border-[#114C2A] focus:ring-4 focus:ring-[#114C2A]/10 transition-all bg-white shadow-sm disabled:opacity-50"
                                                />
                                            ))}
                                        </div>
                                        
                                        <button 
                                            onClick={handleVerifyOtp}
                                            disabled={loading || otp.join('').length !== 6}
                                            className="w-full bg-[#114C2A] text-white font-black py-4 rounded-xl shadow-lg hover:bg-[#0c361d] transition-all disabled:opacity-50 flex justify-center items-center mb-6"
                                        >
                                            {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Verify & Continue'}
                                        </button>

                                        <div className="flex flex-col items-center justify-center space-y-4 pt-6 border-t border-gray-100">
                                            <button 
                                                onClick={handleResendOtp}
                                                disabled={cooldown > 0 || loading}
                                                className="text-[14px] font-bold text-gray-600 hover:text-[#114C2A] transition-colors disabled:text-gray-400 flex items-center"
                                            >
                                                <RefreshCw size={14} className={`mr-2 ${cooldown > 0 ? 'opacity-50' : ''}`} />
                                                {cooldown > 0 ? `Resend code available in ${cooldown}s` : 'Resend Code'}
                                            </button>

                                            <button 
                                                onClick={() => { setAuthStep('credentials'); setOtp(['','','','','','']); setError(null); }}
                                                disabled={loading}
                                                className="text-[13px] font-bold text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                Back to Sign Up
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* SECTION 3: Profile Setup Cloudinary Dropzone */}
                                {authStep === 'profile_setup' && (
                                    <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                        <form onSubmit={handleProfileSetup} className="space-y-6">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="relative group cursor-pointer">
                                                    <input 
                                                        type="file" accept="image/*" onChange={handleAvatarSelect}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                                    />
                                                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 group-hover:border-[#114C2A] group-hover:bg-[#114C2A]/5 transition-all relative">
                                                        {avatarPreview ? (
                                                            <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="flex flex-col items-center text-gray-400 group-hover:text-[#114C2A] transition-colors">
                                                                <Camera size={32} className="mb-2" />
                                                                <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                                                            </div>
                                                        )}
                                                        {avatarPreview && (
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <UploadCloud size={24} className="text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-[12px] font-medium text-gray-400 mt-3 text-center">Powered by Cloudinary CDN</p>
                                            </div>

                                            <div className="relative mt-6">
                                                <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input 
                                                    type="text" placeholder="Display Name (Optional)" value={displayName}
                                                    onChange={(e) => setDisplayName(e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-[15px] font-bold text-gray-900 outline-none focus:border-[#114C2A] focus:bg-white focus:ring-4 focus:ring-[#114C2A]/10 transition-all placeholder-gray-400"
                                                />
                                            </div>

                                            <button 
                                                type="submit" disabled={loading}
                                                className="w-full bg-[#114C2A] text-white font-black py-4 rounded-xl shadow-lg hover:bg-[#0c361d] transition-all disabled:opacity-70 flex justify-center items-center"
                                            >
                                                {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Complete Setup'}
                                            </button>
                                            
                                            <button type="button" onClick={handleProfileSetup} className="w-full py-4 text-[14px] font-bold text-gray-500 hover:text-gray-800 transition-colors">
                                                Skip for now
                                            </button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Legal Footer */}
                            <div className="mt-12 text-center">
                                <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                                    By joining, you agree to Parbet's <button className="text-gray-600 hover:underline">Terms of Service</button> and acknowledge our <button className="text-gray-600 hover:underline">Privacy Policy</button>.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: Full-Screen Animated Topography Canvas (Right Side) */}
                    <div className="hidden md:flex flex-1 bg-[#114C2A] relative overflow-hidden items-center justify-center">
                        <motion.svg 
                            initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 2, ease: "easeOut" }}
                            className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg"
                        >
                            <defs>
                                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#458731', stopOpacity: 1 }} />
                                    <stop offset="100%" style={{ stopColor: '#114C2A', stopOpacity: 1 }} />
                                </linearGradient>
                            </defs>
                            {[...Array(15)].map((_, i) => (
                                <motion.path
                                    key={i} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.5 + (Math.random() * 0.5) }}
                                    transition={{ duration: 3 + i * 0.2, ease: "easeInOut", delay: 0.2 }}
                                    d={`M-100 ${100 + i * 60} Q 300 ${-100 + i * 100} 700 ${300 + i * 40} T 1500 ${100 + i * 80}`}
                                    fill="none" stroke="url(#grad1)" strokeWidth={1 + (i % 2)}
                                />
                            ))}
                        </motion.svg>
                        
                        <div className="relative z-10 p-12 max-w-xl text-center">
                            {authStep === 'otp_verification' ? (
                                <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center">
                                    <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/20 backdrop-blur-sm">
                                        <ShieldCheck size={40} className="text-white" />
                                    </div>
                                    <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tighter mb-6">Identity Protected.</h1>
                                    <p className="text-lg text-green-100/80 font-medium max-w-md mx-auto leading-relaxed">To ensure marketplace integrity and eliminate bot scalping, every user is verified before entry.</p>
                                </motion.div>
                            ) : (
                                <>
                                    <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-white text-[12px] font-bold uppercase tracking-widest mb-8">
                                        <CheckCircle2 size={16} className="text-[#81C76B]" /> <span>Verified Secondary Market</span>
                                    </motion.div>
                                    <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="text-5xl lg:text-7xl font-black text-white leading-tight tracking-tighter mb-6">
                                        Access the inaccessible.
                                    </motion.h1>
                                    <motion.p initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }} className="text-lg text-green-100/80 font-medium max-w-md mx-auto leading-relaxed">
                                        Over 5 million authentic tickets sold. Global sports, massive concerts, and exclusive theater events all backed by our 100% Buyer Guarantee.
                                    </motion.p>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}