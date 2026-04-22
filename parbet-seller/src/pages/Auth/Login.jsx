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
    // FEATURE: sendPasswordResetEmail strictly removed to enforce Vercel API routing
} from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// FEATURE: Import Zustand store to access the Vercel API fetch routing
import { useSellerStore } from '../../store/useSellerStore';

export default function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Extract custom Vercel API routing function from the store
    const { resetPassword } = useSellerStore();
    
    // FEATURE 1: Authentication State Machine (1 = Email, 2 = Password, 3 = Forgot Pass, 4 = Reset Success)
    const [authStep, setAuthStep] = useState(1); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // FEATURE 2: Session Persistence & Network States
    const [stayLoggedIn, setStayLoggedIn] = useState(true);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    // FEATURE 3: Feedback Engine States
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
            if (error.code === 'auth/unauthorized-domain') {
                setAuthError("Google Sign-In Blocked: Your current Github Codespaces domain is not authorized. Please copy your URL and add it in Firebase Console -> Authentication -> Settings -> Authorized Domains.");
            } else if (error.code === 'auth/popup-closed-by-user') {
                setAuthError("Sign-in popup was closed before completion.");
            } else {
                setAuthError(error.message || "Failed to authenticate with Google. Please try again.");
            }
        } finally {
            setIsGoogleLoading(false);
        }
    };

    // FEATURE 6: Native Email/Password Authentication
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
            await setPersistence(auth, stayLoggedIn ? browserLocalPersistence : browserSessionPersistence);
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/profile');
        } catch (error) {
            // CRITICAL FIX: Robust substring matching prevents unhandled promise rejections
            console.error("Login Error Catch:", error);
            const errorCode = String(error.code || '');
            const errorMessage = String(error.message || '');

            if (
                errorCode.includes('invalid-credential') || 
                errorCode.includes('wrong-password') || 
                errorCode.includes('user-not-found') ||
                errorMessage.includes('invalid-credential')
            ) {
                setAuthError("Incorrect Email or Password. Please try again.");
            } else if (errorCode.includes('too-many-requests')) {
                setAuthError("Account temporarily locked due to too many failed attempts. Please reset your password or try again later.");
            } else {
                setAuthError("Authentication failed. Please check your connection or credentials.");
            }
        } finally {
            setIsAuthenticating(false);
        }
    };

    // FEATURE 7: Secure Password Recovery Architecture (STRICT VERCEL OVERRIDE)
    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        setAuthError('');
        if (!isValidEmail(email)) {
            setAuthError("Please enter a valid email address.");
            return;
        }
        
        setIsAuthenticating(true);
        try {
            // STRICT OVERRIDE: Trigger Zustand store to hit Vercel API instead of default Firebase
            await resetPassword(email);
            setAuthStep(4); // Advance to Success Screen
        } catch (error) {
            console.error("Password Reset Error:", error);
            setAuthError(error.message || "Failed to send reset link. Please try again.");
        } finally {
            setIsAuthenticating(false);
        }
    };

    // FEATURE 8: Secure Firestore Feedback Transmission
    const handleFeedbackSubmit = async () => {
        if (!feedbackRating) return;
        setIsFeedbackSubmitting(true);
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'parbet-44902';

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

    const shakeAnimation = {
        shake: { x: [0, -10, 10, -10, 10, -5, 5, 0], transition: { duration: 0.4 } }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans relative overflow-x-hidden">
            
            <div className="w-full max-w-[400px] px-4 py-8">
                
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <h1 className="text-[42px] font-black tracking-tighter leading-none cursor-pointer" onClick={() => navigate('/')}>
                        <span className="text-[#54626c]">par</span><span className="text-[#8cc63f]">bet</span>
                    </h1>
                </div>

                <h2 className="text-[28px] font-bold text-[#54626c] text-center mb-8">
                    {authStep === 3 ? "Reset your password" : "Sign in to parbet"}
                </h2>

                {/* Error Banner */}
                <AnimatePresence>
                    {authError && (
                        <motion.div 
                            variants={shakeAnimation}
                            animate="shake"
                            className="mb-6 p-4 bg-red-50 text-red-600 text-[13px] font-bold rounded border border-red-100 flex items-start gap-2 text-left leading-relaxed shadow-sm"
                        >
                            <AlertCircle size={18} className="shrink-0 mt-0.5" /> 
                            <span>{authError}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Dynamic State Machine Form */}
                <AnimatePresence mode="wait">
                    {authStep === 1 && (
                        <motion.form 
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleEmailSubmit}
                        >
                            <div className="mb-4">
                                <input 
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border border-[#cccccc] rounded-[4px] px-4 py-3.5 text-[15px] text-[#1a1a1a] outline-none focus:border-[#458731] transition-colors shadow-sm"
                                />
                            </div>

                            <div className="flex items-center mb-6 cursor-pointer" onClick={() => setStayLoggedIn(!stayLoggedIn)}>
                                <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 transition-colors ${stayLoggedIn ? 'bg-[#8cc63f] border-[#8cc63f]' : 'border border-[#cccccc]'}`}>
                                    {stayLoggedIn && <Check size={14} className="text-white" strokeWidth={4} />}
                                </div>
                                <span className="text-[15px] text-[#1a1a1a]">Stay logged in</span>
                            </div>

                            <button 
                                type="submit"
                                disabled={!email}
                                className={`w-full py-3.5 rounded-[4px] font-bold text-[16px] transition-all mb-6 ${email ? 'bg-[#e2e2e2] text-[#1a1a1a] hover:bg-[#d4d4d4]' : 'bg-[#f0f0f0] text-[#a0a0a0] cursor-not-allowed'}`}
                            >
                                Continue
                            </button>
                        </motion.form>
                    )}

                    {authStep === 2 && (
                        <motion.form 
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
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
                                <button type="button" onClick={() => { setAuthError(''); setAuthStep(3); }} className="text-[#0064d2] text-[13px] font-bold hover:underline">Forgot password?</button>
                            </div>
                        </motion.form>
                    )}

                    {/* FEATURE: Password Recovery Form */}
                    {authStep === 3 && (
                        <motion.form 
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleForgotPasswordSubmit}
                        >
                            <button 
                                type="button"
                                onClick={() => { setAuthError(''); setAuthStep(2); }}
                                className="flex items-center text-[#0064d2] text-[13px] font-bold hover:underline mb-4"
                            >
                                <ArrowLeft size={14} className="mr-1" /> Back to sign in
                            </button>

                            <p className="text-[14px] text-[#1a1a1a] mb-6 leading-relaxed font-medium">
                                Enter your account email address and we will securely email you a link to reset your password.
                            </p>

                            <div className="mb-6">
                                <input 
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border border-[#cccccc] rounded-[4px] px-4 py-3.5 text-[15px] text-[#1a1a1a] outline-none focus:border-[#458731] transition-colors shadow-sm"
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={isAuthenticating || !email}
                                className={`w-full py-3.5 rounded-[4px] font-bold text-[16px] transition-all mb-6 flex items-center justify-center gap-2 ${email ? 'bg-[#1a1a1a] text-white hover:bg-[#333333]' : 'bg-[#e2e2e2] text-[#a0a0a0] cursor-not-allowed'}`}
                            >
                                {isAuthenticating && <Loader2 size={18} className="animate-spin text-white" />}
                                Send Reset Link
                            </button>
                        </motion.form>
                    )}

                    {/* FEATURE: Password Recovery Success Screen */}
                    {authStep === 4 && (
                        <motion.div 
                            key="step4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center mb-6"
                        >
                            <div className="w-16 h-16 bg-[#eaf4d9] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <Check size={32} className="text-[#458731]" />
                            </div>
                            <h3 className="text-[22px] font-black text-[#1a1a1a] mb-3 tracking-tight">Check your inbox</h3>
                            <p className="text-[15px] text-[#54626c] mb-8 leading-relaxed font-medium">
                                We've sent a secure password reset link to <br/><strong className="text-[#1a1a1a]">{email}</strong>
                            </p>
                            <button 
                                onClick={() => setAuthStep(2)}
                                className="w-full bg-[#1a1a1a] text-white hover:bg-black py-3.5 rounded-[4px] font-bold text-[16px] transition-all shadow-md active:scale-95"
                            >
                                Return to Sign In
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {authStep !== 4 && (
                    <p className="text-[12px] text-[#54626c] text-center mb-6 leading-relaxed px-2 font-medium">
                        By signing in or creating an account, you agree to our <a href="#" className="text-[#0064d2] hover:underline">user agreement</a> and acknowledge our <a href="#" className="text-[#0064d2] hover:underline">privacy policy</a>. You may receive SMS notifications from us and can opt out at any time.
                    </p>
                )}

                {/* Hide Social Auth during Recovery Flow */}
                {authStep < 3 && (
                    <>
                        <button className="w-full py-3.5 bg-white border border-[#458731] rounded-[4px] text-[#458731] font-bold text-[15px] mb-4 hover:bg-[#f9fdf7] transition-colors shadow-sm">
                            Guest seller? Find your listing
                        </button>

                        <button 
                            onClick={handleGoogleLogin}
                            disabled={isGoogleLoading}
                            className="w-full py-3.5 bg-white border border-[#cccccc] rounded-[4px] text-[#54626c] font-bold text-[15px] mb-8 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 shadow-sm"
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
                            New to Parbet? <button onClick={() => navigate('/auth/signup')} className="text-[#0064d2] font-bold hover:underline">Create an account</button>
                        </p>
                    </>
                )}

                {/* Footer Configs */}
                <div className="border border-[#cccccc] rounded-[4px] overflow-hidden bg-white shadow-sm">
                    <div className="px-4 py-3 border-b border-[#cccccc] flex items-center text-[#54626c] text-[15px] font-medium hover:bg-gray-50 cursor-pointer transition-colors">
                        <Globe size={18} className="mr-3" /> English (UK)
                    </div>
                    <div className="px-4 py-3 flex items-center text-[#54626c] text-[15px] font-medium hover:bg-gray-50 cursor-pointer transition-colors">
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
                                    <p className="text-[13px] text-[#54626c] mt-1 font-medium">Your feedback helps us improve.</p>
                                </div>
                            ) : (
                                <div className="p-6">
                                    <p className="text-[15px] text-[#1a1a1a] mb-6 leading-relaxed font-medium">
                                        Please tell us more about your experience using this page to help us improve our website!
                                    </p>
                                    
                                    <div className="flex justify-between items-center mb-2 px-2">
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <button 
                                                key={num}
                                                onClick={() => setFeedbackRating(num)}
                                                className={`w-9 h-9 rounded-md flex items-center justify-center text-[14px] font-bold transition-colors ${feedbackRating === num ? 'bg-[#8cc63f] text-white shadow-inner' : 'bg-[#1a1a1a] text-white hover:bg-[#333333]'}`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-[11px] font-bold text-[#54626c] mb-6 px-1">
                                        <span>Very Dissatisfied</span>
                                        <span>Very Satisfied</span>
                                    </div>

                                    <textarea 
                                        value={feedbackText}
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                        maxLength={1000}
                                        placeholder="Please provide us more details here..."
                                        className="w-full h-32 border border-[#e2e2e2] rounded-[4px] p-3 outline-none resize-none text-[14px] text-[#1a1a1a] placeholder-gray-400 focus:border-[#458731] transition-colors shadow-sm"
                                    />
                                    <div className="text-right text-[11px] text-[#54626c] font-bold mt-2 mb-4">
                                        {1000 - feedbackText.length}/1000 characters left
                                    </div>

                                    <p className="text-[12px] font-bold text-[#1a1a1a] mb-4 leading-relaxed bg-gray-50 p-2 rounded">
                                        Please note we won't be able to reply to any questions submitted here
                                    </p>

                                    <button 
                                        onClick={handleFeedbackSubmit}
                                        disabled={!feedbackRating || isFeedbackSubmitting}
                                        className={`w-full py-3 rounded-[4px] font-bold text-[14px] transition-colors flex items-center justify-center gap-2 shadow-sm ${feedbackRating ? 'bg-[#1a1a1a] text-white hover:bg-black' : 'bg-[#f0f0f0] text-[#a0a0a0] cursor-not-allowed'}`}
                                    >
                                        {isFeedbackSubmitting && <Loader2 size={16} className="animate-spin text-white" />} Submit
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