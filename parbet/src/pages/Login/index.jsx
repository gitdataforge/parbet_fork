import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { auth, db } from '../../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

// Helper Component for exact input styling
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

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'parbet-44902';

    // Auto-redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/profile');
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

    // Google OAuth Integration
    const handleGoogleAuth = async () => {
        setLoading(true);
        setError(null);
        const provider = new GoogleAuthProvider();
        
        // Strict Google specific scopes
        provider.addScope('profile');
        provider.addScope('email');

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
            navigate('/profile');
        } catch (err) {
            console.error("Google Auth Error Intercepted:", err);
            setError('Failed to securely authenticate with Google.');
        } finally {
            setLoading(false);
        }
    };

    // Step 1: Email Check (With Sanitization Engine)
    const handleContinueClick = (e) => {
        e.preventDefault();
        
        // STRICT SANITIZATION: Remove invisible spaces and force lowercase
        const sanitizedEmail = email.trim().toLowerCase();
        
        if (!sanitizedEmail) return;
        
        setEmail(sanitizedEmail); // Update the visual input state to the clean version
        setError(null);
        setStep('password');
    };

    // Step 2: Finalize Login (With Sanitization & OAuth Collision Detection)
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        
        // Secondary Sanitization Check before network request
        const sanitizedEmail = email.trim().toLowerCase();
        
        if (!sanitizedEmail || !password) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, password);
            await syncUserToFirestore(userCredential.user);
            setUser({
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                name: userCredential.user.displayName || sanitizedEmail.split('@')[0],
                photo: userCredential.user.photoURL
            });
            setOnboarded();
            navigate('/profile');
        } catch (err) {
            console.error("Login Error Intercepted:", err.code, err.message);
            
            // INTELLIGENT ERROR BOUNDARY: Detect OAuth Collision or Bad Password
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                setError('Invalid credentials. Check your password, or if you registered via Google, click "Log In with Google" below.');
            } else {
                setError('Authentication failed. Please verify your details and try again.');
            }
            
            setStep('email'); // Send user back to email step to read the warning
            setPassword('');  // Wipe password memory
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center py-12 px-4 relative font-sans">
            
            {/* Floating Green Feedback Tab */}
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

                    {/* Intelligent Error Render Box */}
                    {error && (
                        <div className="mb-6 w-full p-3 bg-red-50 text-[#d32f2f] text-[13px] border border-red-200 rounded-[6px] font-bold text-center leading-relaxed">
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

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setStayLoggedIn(!stayLoggedIn)}>
                                <div className={`w-[20px] h-[20px] rounded-[4px] flex items-center justify-center transition-colors ${stayLoggedIn ? 'bg-[#8bc53f] border-[#8bc53f]' : 'border-2 border-gray-300'}`}>
                                    {stayLoggedIn && <Check size={14} className="text-white" strokeWidth={3}/>}
                                </div>
                                <span className="text-[14px] text-[#333] font-medium">Stay logged in</span>
                            </div>

                            {step === 'password' && (
                                <Link to="/forgot-password" className="text-[13px] text-[#0066c0] font-medium hover:underline">
                                    Forgot password?
                                </Link>
                            )}
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
                        By signing in or creating an account, you agree to our <button className="text-[#0066c0] hover:underline">user agreement</button> and acknowledge our <button className="text-[#0066c0] hover:underline">privacy policy</button>.
                    </p>

                    <button className="w-full py-3 rounded-[6px] border border-[#cccccc] text-[#333] font-bold text-[15px] hover:bg-gray-50 transition-colors mb-4 shadow-sm">
                        Guest purchase? Find your order
                    </button>

                    {/* Official Google Login Button */}
                    <button 
                        onClick={handleGoogleAuth} 
                        className="w-full py-3 rounded-[6px] bg-white border border-[#cccccc] hover:bg-gray-50 text-[#333] font-bold text-[15px] transition-colors flex items-center justify-center mb-8 shadow-sm"
                    >
                        <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Log In with Google
                    </button>

                    <div className="text-[14px] text-[#333]">
                        New to Parbet? <Link to="/signup" className="text-[#0066c0] hover:underline font-medium">Create an account</Link>
                    </div>
                </div>

                {/* Bottom Localization Selectors */}
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