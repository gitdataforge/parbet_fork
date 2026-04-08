import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { auth, db } from '../../lib/firebase';
import { signInWithPopup, FacebookAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

// Helper Component for exact Viagogo input styling
const CustomInput = ({ label, required, type = "text", value, onChange, disabled, ...props }) => (
    <div className="relative w-full mb-4">
        <input 
            type={type} 
            value={value} 
            onChange={onChange} 
            disabled={disabled}
            placeholder={label}
            className="w-full border border-[#cccccc] rounded-[6px] px-3 py-3.5 text-[15px] text-[#333] outline-none focus:border-[#114C2A] focus:ring-1 focus:ring-[#114C2A] transition-all bg-white disabled:bg-gray-50 disabled:text-gray-500 placeholder-gray-500"
            {...props}
        />
    </div>
);

export default function Login() {
    const navigate = useNavigate();
    const { isAuthenticated, setUser, setOnboarded } = useAppStore();
    
    // Exact View States: 'email' -> 'password'
    const [step, setStep] = useState('email');
    
    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [stayLoggedIn, setStayLoggedIn] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    // Auto-redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    // Secure Firestore 6-Segment Path Sync
    const syncUserToFirestore = async (user, additionalData = {}) => {
        const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
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

    // Facebook OAuth
    const handleFacebookAuth = async () => {
        setLoading(true);
        setError(null);
        const provider = new FacebookAuthProvider();
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
            navigate('/dashboard');
        } catch (err) {
            console.error("Facebook Auth Error:", err);
            setError('Failed to authenticate with Facebook.');
        } finally {
            setLoading(false);
        }
    };

    // Step 1: Email Check
    const handleContinueClick = (e) => {
        e.preventDefault();
        if (!email) return;
        setError(null);
        setStep('password');
    };

    // Step 2: Finalize Login
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return;
        setLoading(true);
        setError(null);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await syncUserToFirestore(userCredential.user);
            setUser({
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                name: userCredential.user.displayName || email.split('@')[0],
                photo: userCredential.user.photoURL
            });
            setOnboarded();
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid email or password.');
            setStep('email'); // Reset to allow email correction if needed
            setPassword('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center py-12 px-4 relative font-sans">
            
            {/* Floating Green Feedback Tab (Exact Match from Screenshot) */}
            <div 
                className="fixed right-0 top-[30%] bg-[#458731] text-white text-[13px] font-bold py-3 px-1.5 rounded-l-[4px] cursor-pointer shadow-md hover:bg-[#366a26] transition-colors z-50 flex items-center justify-center"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
            >
                Feedback
            </div>

            {/* Main Centered Login Card */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white w-full max-w-[440px] rounded-[12px] shadow-[0_2px_15px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col border border-gray-100"
            >
                <div className="px-10 pt-10 pb-6 flex flex-col items-center">
                    
                    {/* Replicated Logo Styling */}
                    <div className="cursor-pointer mb-2" onClick={() => navigate('/')}>
                        <h1 className="text-[42px] font-black tracking-tighter leading-none">
                            <span className="text-[#1a1a1a]">par</span><span className="text-[#8bc53f]">bet</span>
                        </h1>
                    </div>
                    
                    <h2 className="text-[24px] font-bold text-[#333] mb-8">Sign in to parbet</h2>

                    {error && (
                        <div className="mb-6 w-full p-3 bg-red-50 text-[#d32f2f] text-[13px] border border-red-200 rounded-[6px] font-bold text-center">
                            {error}
                        </div>
                    )}

                    <form className="w-full" onSubmit={step === 'email' ? handleContinueClick : handleLoginSubmit}>
                        <CustomInput 
                            label="Email" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            disabled={step === 'password'} 
                        />
                        
                        <AnimatePresence>
                            {step === 'password' && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <CustomInput 
                                        label="Password" 
                                        type="password" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        autoFocus
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center space-x-2.5 mb-6 cursor-pointer" onClick={() => setStayLoggedIn(!stayLoggedIn)}>
                            <div className={`w-[20px] h-[20px] rounded-[4px] flex items-center justify-center transition-colors ${stayLoggedIn ? 'bg-[#8bc53f] border-[#8bc53f]' : 'border-2 border-gray-300'}`}>
                                {stayLoggedIn && <Check size={14} className="text-white" strokeWidth={3}/>}
                            </div>
                            <span className="text-[14px] text-[#333] font-medium">Stay logged in</span>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || (step === 'email' ? !email : !password)}
                            className={`w-full py-3 rounded-[6px] font-bold text-[15px] transition-colors mb-6 flex justify-center items-center ${((step === 'email' && email) || (step === 'password' && password)) ? 'bg-[#8bc53f] text-white hover:bg-[#7cbd34] shadow-sm' : 'bg-[#e0e0e0] text-[#a6a6a6]'}`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                'Continue'
                            )}
                        </button>
                    </form>

                    <p className="text-[12px] text-[#666] text-center leading-relaxed mb-6">
                        By signing in or creating an account, you agree to our <button className="text-[#0066c0] hover:underline">user agreement</button> and acknowledge our <button className="text-[#0066c0] hover:underline">privacy policy</button>. You may receive SMS notifications from us and can opt out at any time.
                    </p>

                    <button className="w-full py-3 rounded-[6px] border border-[#cccccc] text-[#333] font-bold text-[15px] hover:bg-gray-50 transition-colors mb-4 shadow-sm">
                        Guest purchase? Find your order
                    </button>

                    <button onClick={handleFacebookAuth} className="w-full py-3 rounded-[6px] bg-[#3b5998] hover:bg-[#2d4373] text-white font-bold text-[15px] transition-colors flex items-center justify-center mb-8 shadow-sm">
                        <svg viewBox="0 0 320 512" fill="currentColor" className="w-4 h-4 mr-2.5"><path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/></svg>
                        Log In with Facebook
                    </button>

                    <div className="text-[14px] text-[#333]">
                        New to Parbet? <Link to="/signup" className="text-[#0066c0] hover:underline font-medium">Create an account</Link>
                    </div>
                </div>

                {/* Bottom Localization Selectors (Exact Replica) */}
                <div className="border-t border-gray-200 bg-white px-10 py-5 space-y-3 mt-auto">
                    <div className="flex items-center text-[14px] text-[#555] cursor-pointer pb-3 border-b border-gray-100 hover:text-gray-900 transition-colors">
                        <span className="mr-3 font-serif">A文</span> English (US)
                    </div>
                    <div className="flex items-center text-[14px] text-[#555] cursor-pointer pt-1 hover:text-gray-900 transition-colors">
                        <span className="mr-3 font-medium text-[13px]">Rs.</span> Indian Rupee
                    </div>
                </div>
            </motion.div>
        </div>
    );
}