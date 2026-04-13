import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Globe, DollarSign, Loader2, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    setPersistence, 
    browserLocalPersistence, 
    browserSessionPersistence 
} from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // FEATURE 1: 2-Step Authentication State Machine
    const [authStep, setAuthStep] = useState(1); // 1 = Email, 2 = Password
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // FEATURE 2: Session Persistence & Network States
    const [stayLoggedIn, setStayLoggedIn] = useState(true);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    // FEATURE 3: Feedback Engine States (1:1 Viagogo Replica)
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [feedbackRating, setFeedbackRating] = useState(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
    const [feedbackSuccess, setFeedbackSuccess] = useState(false);

    // Regex Validation
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // FEATURE 4: Dynamic URL Parameter Interception
    useEffect(() => {
        const urlEmail = searchParams.get('email');
        if (urlEmail && isValidEmail(urlEmail)) {
            setEmail(urlEmail);
            setAuthStep(2); // Auto-advance to password step if email is passed
        }
    }, [searchParams]);

    // FEATURE 5: Secure Google Auth Pipeline
    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        setAuthError('');
        const provider = new GoogleAuthProvider();
        try {
            await setPersistence(auth, stayLoggedIn ? browserLocalPersistence : browserSessionPersistence);
            await signInWithPopup(auth, provider);
            navigate('/profile'); // Vault to dashboard on success
        } catch (error) {
            console.error("Google Auth Error:", error);
            setAuthError("Failed to authenticate with Google. Please try again.");
        } finally {
            setIsGoogleLoading(false);
        }
    };

    // FEATURE 6: Native Email/Password Authentication with Persistence
    const handleEmailSubmit = (e) => {
        e.preventDefault();
        setAuthError('');
        if (!isValidEmail(email)) {
            setAuthError("Please enter a valid email address.");
            return;
        }
        setAuthStep(2);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setAuthError('');
        if (!password) {
            setAuthError("Please enter your password.");
            return;
        }

        setIsAuthenticating(true);
        try {
            // Apply strict persistence rules based on UI checkbox
            await setPersistence(auth, stayLoggedIn ? browserLocalPersistence : browserSessionPersistence);
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/profile');
        } catch (error) {
            console.error("Login Error:", error);
            if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                setAuthError("Invalid email or password. Please try again.");
            } else {
                setAuthError("Authentication failed. Please check your connection.");
            }
        } finally {
            setIsAuthenticating(false);
        }
    };

    // FEATURE 7: Secure Firestore Feedback Transmission
    const handleFeedbackSubmit = async () => {
        if (!feedbackRating) return;
        setIsFeedbackSubmitting(true);
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'parbet-seller-app';

        try {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'feedback'), {
                rating: feedbackRating,
                comment: feedbackText,
                source: 'login_page',
                timestamp: serverTimestamp()
            });
            setFeedbackSuccess(true);
            setTimeout(() => {
                setIsFeedbackOpen(false);
                setFeedbackSuccess(false);
                setFeedbackRating(null);
                setFeedbackText('');
            }, 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setIsFeedbackSubmitting(false);
        }
    };

    // FEATURE 8: Framer Motion Shake Animation for Errors
    const shakeAnimation = {
        shake: { x: [0, -10, 10, -10, 10, -5, 5, 0], transition: { duration: 0.4 } }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans relative overflow-x-hidden">
            
            {/* FEATURE 9: 1:1 Viagogo UI Architecture */}
            <div className="w-full max-w-[400px] px-4 py-8">
                
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <h1 className="text-[42px] font-black tracking-tighter leading-none cursor-pointer" onClick={() => navigate('/')}>
                        <span className="text-[#54626c]">par</span><span className="text-[#8cc63f]">bet</span>
                    </h1>
                </div>

                <h2 className="text-[28px] font-bold text-[#54626c] text-center mb-8">Sign in to parbet</h2>

                {/* Error Banner */}
                <AnimatePresence>
                    {authError && (
                        <motion.div 
                            variants={shakeAnimation}
                            animate="shake"
                            className="mb-6 p-3 bg-red-50 text-red-600 text-[13px] font-bold rounded border border-red-100 flex items-center justify-center gap-2"
                        >
                            <AlertCircle size={16} /> {authError}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Dynamic 2-Step Form */}
                <AnimatePresence mode="wait">
                    {authStep === 1 ? (
                        <motion.form 
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleEmailSubmit}
                        >
                            {/* Email Input */}
                            <div className="mb-4">
                                <input 
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border border-[#cccccc] rounded-[4px] px-4 py-3.5 text-[15px] text-[#1a1a1a] outline-none focus:border-[#458731] transition-colors shadow-sm"
                                />
                            </div>

                            {/* Checkbox */}
                            <div className="flex items-center mb-6 cursor-pointer" onClick={() => setStayLoggedIn(!stayLoggedIn)}>
                                <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 transition-colors ${stayLoggedIn ? 'bg-[#8cc63f] border-[#8cc63f]' : 'border border-[#cccccc]'}`}>
                                    {stayLoggedIn && <Check size={14} className="text-white" strokeWidth={4} />}
                                </div>
                                <span className="text-[15px] text-[#1a1a1a]">Stay logged in</span>
                            </div>

                            {/* Continue Button */}
                            <button 
                                type="submit"
                                disabled={!email}
                                className={`w-full py-3.5 rounded-[4px] font-bold text-[16px] transition-all mb-6 ${email ? 'bg-[#e2e2e2] text-[#1a1a1a] hover:bg-[#d4d4d4]' : 'bg-[#f0f0f0] text-[#a0a0a0] cursor-not-allowed'}`}
                            >
                                Continue
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form 
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handlePasswordSubmit}
                        >
                            <button 
                                type="button"
                                onClick={() => setAuthStep(1)}
                                className="flex items-center text-[#0064d2] text-[13px] font-bold hover:underline mb-4"
                            >
                                <ArrowLeft size={14} className="mr-1" /> {email}
                            </button>

                            <div className="mb-6 relative border border-[#cccccc] rounded-[4px] focus-within:border-[#458731] transition-all shadow-sm">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 text-[15px] text-[#1a1a1a] outline-none bg-transparent pr-12"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a1a1a] p-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <button 
                                type="submit"
                                disabled={isAuthenticating || !password}
                                className={`w-full py-3.5 rounded-[4px] font-bold text-[16px] transition-all mb-4 flex items-center justify-center gap-2 ${password ? 'bg-[#1a1a1a] text-white hover:bg-[#333333]' : 'bg-[#e2e2e2] text-[#a0a0a0] cursor-not-allowed'}`}
                            >
                                {isAuthenticating && <Loader2 size={18} className="animate-spin text-white" />}
                                Sign In
                            </button>
                            
                            <div className="flex justify-end mb-6">
                                <button type="button" className="text-[#0064d2] text-[13px] hover:underline">Forgot password?</button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Legal Text */}
                <p className="text-[12px] text-[#54626c] text-center mb-6 leading-relaxed px-2">
                    By signing in or creating an account, you agree to our <a href="#" className="text-[#0064d2] hover:underline">user agreement</a> and acknowledge our <a href="#" className="text-[#0064d2] hover:underline">privacy policy</a>. You may receive SMS notifications from us and can opt out at any time.
                </p>

                {/* Third-Party Authentication Logic */}
                <button className="w-full py-3.5 bg-white border border-[#458731] rounded-[4px] text-[#458731] font-bold text-[15px] mb-4 hover:bg-[#f9fdf7] transition-colors">
                    Guest seller? Find your listing
                </button>

                <button 
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading}
                    className="w-full py-3.5 bg-white border border-[#cccccc] rounded-[4px] text-[#54626c] font-bold text-[15px] mb-8 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
                >
                    {isGoogleLoading ? <Loader2 size={18} className="animate-spin" /> : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                    )}
                    Log In with Google
                </button>

                <p className="text-center text-[15px] text-[#1a1a1a] font-medium mb-6">
                    New to Parbet? <button onClick={() => navigate('/auth/signup')} className="text-[#0064d2] hover:underline">Create an account</button>
                </p>

                {/* Footer Configs */}
                <div className="border border-[#cccccc] rounded-[4px] overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#cccccc] flex items-center text-[#54626c] text-[15px] hover:bg-gray-50 cursor-pointer">
                        <Globe size={18} className="mr-3" /> English (UK)
                    </div>
                    <div className="px-4 py-3 flex items-center text-[#54626c] text-[15px] hover:bg-gray-50 cursor-pointer">
                        <DollarSign size={18} className="mr-3" /> Rs. Indian Rupee
                    </div>
                </div>
            </div>

            {/* FEATURE 10: Interactive Feedback Tab Panel */}
            <div className="fixed right-0 top-[20%] z-[200] flex">
                <div 
                    onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
                    className="bg-[#458731] text-white w-10 h-28 cursor-pointer rounded-l-md flex items-center justify-center shadow-lg hover:w-11 transition-all"
                >
                    <span className="rotate-[-90deg] whitespace-nowrap font-bold text-[14px] tracking-wider">Feedback</span>
                </div>

                <AnimatePresence>
                    {isFeedbackOpen && (
                        <motion.div 
                            initial={{ x: 350, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 350, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute right-10 top-0 bg-white border border-[#1a1a1a] shadow-2xl w-[320px] rounded-bl-lg"
                        >
                            <div className="p-1 flex justify-end bg-gray-50 border-b border-[#e2e2e2]">
                                <button onClick={() => setIsFeedbackOpen(false)} className="text-gray-500 hover:text-[#1a1a1a] p-1"><X size={16}/></button>
                            </div>
                            
                            {feedbackSuccess ? (
                                <div className="p-6 text-center">
                                    <div className="w-12 h-12 bg-[#eaf4d9] rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Check size={24} className="text-[#458731]" />
                                    </div>
                                    <p className="text-[15px] font-bold text-[#1a1a1a]">Thank you!</p>
                                    <p className="text-[13px] text-[#54626c] mt-1">Your feedback helps us improve.</p>
                                </div>
                            ) : (
                                <div className="p-6">
                                    <p className="text-[15px] text-[#1a1a1a] mb-6 leading-relaxed">
                                        Please tell us more about your experience using this page to help us improve our website!
                                    </p>
                                    
                                    <div className="flex justify-between items-center mb-2 px-2">
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <button 
                                                key={num}
                                                onClick={() => setFeedbackRating(num)}
                                                className={`w-9 h-9 rounded-md flex items-center justify-center text-[14px] font-bold transition-colors ${feedbackRating === num ? 'bg-[#8cc63f] text-white' : 'bg-[#1a1a1a] text-white hover:bg-[#333333]'}`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-[11px] text-[#54626c] mb-6">
                                        <span>Very Dissatisfied</span>
                                        <span>Very Satisfied</span>
                                    </div>

                                    <textarea 
                                        value={feedbackText}
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                        maxLength={1000}
                                        placeholder="Please provide us more details here..."
                                        className="w-full h-32 border-none outline-none resize-none text-[14px] text-[#1a1a1a] placeholder-gray-400"
                                    />
                                    <div className="text-right text-[11px] text-[#1a1a1a] font-bold mb-4">
                                        {1000 - feedbackText.length}/1000 characters left
                                    </div>

                                    <p className="text-[13px] font-bold text-[#1a1a1a] mb-4 leading-tight">
                                        Please note we won't be able to reply to any questions submitted here
                                    </p>

                                    <button 
                                        onClick={handleFeedbackSubmit}
                                        disabled={!feedbackRating || isFeedbackSubmitting}
                                        className={`w-full py-3 rounded-[4px] font-bold text-[14px] transition-colors flex items-center justify-center gap-2 ${feedbackRating ? 'bg-[#e2e2e2] text-[#1a1a1a] hover:bg-[#d4d4d4]' : 'bg-[#f0f0f0] text-[#a0a0a0] cursor-not-allowed'}`}
                                    >
                                        {isFeedbackSubmitting && <Loader2 size={16} className="animate-spin" />} Submit
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}