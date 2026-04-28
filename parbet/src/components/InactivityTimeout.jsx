import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, LogOut, MousePointerClick } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAppStore } from '../store/useStore';

/**
 * FEATURE 1: Strict Global Inactivity Tracker (60 Seconds)
 * FEATURE 2: Omnipresent Event Listeners (Mouse, Keyboard, Touch, Scroll)
 * FEATURE 3: Graceful Pre-Logout Warning Modal (15 Second Countdown)
 * FEATURE 4: Hardware-Accelerated Framer Motion Animations
 * FEATURE 5: Absolute Firebase Auth Severance & Local State Purge
 * FEATURE 6: Route-Aware Execution (Ignores public pages when logged out)
 */

const INACTIVITY_LIMIT_MS = 60000; // 60 seconds total allowed inactivity
const WARNING_THRESHOLD_MS = 45000; // Show warning after 45 seconds (15s to react)

export default function InactivityTimeout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAppStore();

    const [isWarningVisible, setIsWarningVisible] = useState(false);
    const [countdown, setCountdown] = useState(15);
    
    const warningTimerRef = useRef(null);
    const logoutTimerRef = useRef(null);
    const countdownIntervalRef = useRef(null);

    // FEATURE 5: Absolute Auth Severance
    const executeForceLogout = useCallback(async () => {
        try {
            await signOut(auth);
            // Local state will naturally clear via the onAuthStateChanged listener in useStore
            setIsWarningVisible(false);
            
            // Redirect to login only if not already on a public auth route to prevent looping
            if (location.pathname !== '/login' && location.pathname !== '/register') {
                navigate('/login?reason=inactivity_timeout');
            }
        } catch (error) {
            console.error("[Security] Force logout execution failed:", error);
        }
    }, [navigate, location.pathname]);

    // FEATURE 1 & 2: Omnipresent Tracker Engine
    const resetTimers = useCallback(() => {
        // Do not track inactivity if the user is not authenticated
        if (!isAuthenticated) return;

        // Clear existing timers
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

        // Hide warning if user becomes active again
        setIsWarningVisible(false);
        setCountdown((INACTIVITY_LIMIT_MS - WARNING_THRESHOLD_MS) / 1000);

        // Set Warning Timer (45 Seconds)
        warningTimerRef.current = setTimeout(() => {
            setIsWarningVisible(true);
            
            // Start visual countdown for the remaining 15 seconds
            countdownIntervalRef.current = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdownIntervalRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }, WARNING_THRESHOLD_MS);

        // Set Hard Logout Timer (60 Seconds)
        logoutTimerRef.current = setTimeout(() => {
            executeForceLogout();
        }, INACTIVITY_LIMIT_MS);
        
    }, [isAuthenticated, executeForceLogout]);

    useEffect(() => {
        if (!isAuthenticated) {
            // Clean up all timers if user logs out manually
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            setIsWarningVisible(false);
            return;
        }

        const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
        
        // Throttled event listener to prevent extreme CPU overload from rapid mouse movements
        let throttleTimer;
        const handleActivity = () => {
            if (throttleTimer) return;
            throttleTimer = setTimeout(() => {
                resetTimers();
                throttleTimer = null;
            }, 500); // Only reset timers max twice per second
        };

        // Attach listeners
        events.forEach(event => window.addEventListener(event, handleActivity));

        // Initial timer start
        resetTimers();

        // Cleanup on unmount
        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            if (throttleTimer) clearTimeout(throttleTimer);
            if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, [isAuthenticated, resetTimers]);

    // Explicit manual extension handler
    const handleStayLoggedIn = () => {
        resetTimers();
    };

    return (
        <>
            {children}

            {/* FEATURE 3 & 4: Hardware-Accelerated Graceful Warning Modal */}
            <AnimatePresence>
                {isWarningVisible && isAuthenticated && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-sans">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                            className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-2xl border border-red-100 text-center relative overflow-hidden"
                        >
                            {/* Animated background progress bar */}
                            <motion.div 
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{ duration: 15, ease: "linear" }}
                                className="absolute top-0 left-0 h-1.5 bg-red-600 z-10"
                            />
                            
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                <ShieldAlert className="text-red-600" size={40} />
                                <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-black text-[14px] shadow-lg border-2 border-white">
                                    {countdown}
                                </div>
                            </div>
                            
                            <h2 className="text-[24px] font-black text-[#1a1a1a] mb-3 leading-tight">Session Expiring</h2>
                            <p className="text-[#54626c] font-medium mb-8 leading-relaxed">
                                For your security, you will be logged out automatically in <strong className="text-red-600">{countdown} seconds</strong> due to inactivity.
                            </p>
                            
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={handleStayLoggedIn} 
                                    className="w-full bg-[#1a1a1a] text-white font-black py-4 rounded-[14px] shadow-lg hover:bg-black transition-colors flex items-center justify-center gap-2"
                                >
                                    <MousePointerClick size={18} /> Keep Me Logged In
                                </button>
                                <button 
                                    onClick={executeForceLogout} 
                                    className="w-full bg-white text-gray-500 font-bold py-4 rounded-[14px] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 border border-gray-200"
                                >
                                    <LogOut size={18} /> Log Out Now
                                </button>
                            </div>
                            
                            <p className="text-[11px] text-gray-400 mt-6 font-bold uppercase tracking-widest">
                                Parbet Security Infrastructure
                            </p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}