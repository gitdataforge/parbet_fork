import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import AuthFlow from './AuthFlow';

export default function AuthModal() {
    const { isAuthModalOpen, closeAuthModal } = useAppStore();

    // Prevent body scrolling when the authentication modal is active
    useEffect(() => {
        if (isAuthModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { 
            document.body.style.overflow = 'auto'; 
        };
    }, [isAuthModalOpen]);

    return (
        <AnimatePresence>
            {isAuthModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
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
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-brand-border"
                    >
                        {/* Close Button */}
                        <button 
                            onClick={closeAuthModal}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-brand-panel text-brand-muted hover:bg-gray-200 hover:text-brand-text transition-colors z-20 shadow-sm"
                        >
                            <X size={18} />
                        </button>
                        
                        {/* Interactive Authentication Engine */}
                        <div className="p-2 max-h-[90vh] overflow-y-auto hide-scrollbar">
                            <AuthFlow />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}