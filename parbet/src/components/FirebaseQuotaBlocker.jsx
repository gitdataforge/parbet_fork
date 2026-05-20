import React from 'react';
import { motion } from 'framer-motion';

/**
 * GLOBAL REBRAND: Booknshow Security & Quota Architecture (Phase 2026)
 * FEATURE 1: 1:1 Authentic Firebase Quota Exceeded UI Replication
 * FEATURE 2: High-End Ambient Illustrative Background Animations
 * FEATURE 3: 2026-Accurate Copy (Blaze Plan, Firestore Read/Write Limits)
 * FEATURE 4: Hardware-Accelerated DOM Rendering
 */

const AmbientLockdownBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[9998] bg-[#FAFAFA]">
        <motion.div
            className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#FFCA28] opacity-[0.03] blur-[120px]"
            animate={{ scale: [1, 1.05, 1], opacity: [0.02, 0.04, 0.02] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
            className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#F57C00] opacity-[0.03] blur-[100px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.01, 0.03, 0.01] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.4] mix-blend-overlay"></div>
    </div>
);

// Authentic Firebase Logo (PNG Based - 2026)
const AuthenticFirebaseLogo = () => (
    <div className="flex items-center justify-center gap-3 mt-12 select-none">
        <img 
            src="firebase-logo.png" 
            alt="Firebase" 
            width="48" 
            height="48" 
            className="w-12 h-12 object-contain"
        />
        <svg viewBox="0 0 200 48" width="140" height="34" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="36" fontFamily="Product Sans, Roboto, sans-serif" fontSize="38" fontWeight="500" fill="#626262" letterSpacing="-0.5">Firebase</text>
        </svg>
    </div>
);

export default function FirebaseQuotaBlocker() {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FFFFFF] font-sans">
            <AmbientLockdownBackground />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-[10000] w-full max-w-[800px] px-8 md:px-12 py-10"
            >
                {/* Header Section */}
                <h1 className="text-[36px] font-normal text-[#333333] mb-6 leading-tight tracking-tight">
                    Bandwidth Quota Exceeded
                </h1>
                
                <hr className="border-[#E5E5E5] mb-8" />
                
                {/* Primary Content matching exact image layout */}
                <p className="text-[18px] text-[#333333] leading-relaxed mb-10 font-normal">
                    This site has exceeded its monthly quota for bandwidth. It must be upgraded via the Firebase console before it can begin serving traffic again.
                </p>
                
                {/* Sub-header */}
                <h2 className="text-[28px] font-normal text-[#757575] mb-6 tracking-tight">
                    This is my site. What do I do?
                </h2>
                
                {/* Secondary Content with links */}
                <p className="text-[18px] text-[#333333] leading-relaxed mb-12 font-normal">
                    Visit the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-[#039BE5] hover:underline hover:text-[#0277BD] transition-colors">Firebase console</a> and upgrade the billing plan for this project. If you encounter any issues upgrading, please <a href="https://firebase.google.com/support" target="_blank" rel="noopener noreferrer" className="text-[#039BE5] hover:underline hover:text-[#0277BD] transition-colors">reach out to support</a> for additional help.
                </p>
                
                {/* Authentic Logo Injection */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    <AuthenticFirebaseLogo />
                </motion.div>
                
            </motion.div>
        </div>
    );
}