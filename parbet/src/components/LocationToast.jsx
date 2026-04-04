import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X } from 'lucide-react';
import { useAppStore } from '../store/useStore';

export default function LocationToast() {
    const { locationError, setLocationError } = useAppStore();

    // Auto-dismiss the toast after 8 seconds so it doesn't permanently block the UI
    useEffect(() => {
        if (locationError) {
            const timer = setTimeout(() => {
                setLocationError(null);
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [locationError, setLocationError]);

    return (
        <AnimatePresence>
            {locationError && (
                <div className="fixed bottom-6 left-0 right-0 z-[110] flex justify-center px-4 pointer-events-none">
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-[#1A2327] text-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] flex items-center px-5 py-4 max-w-[800px] w-full pointer-events-auto border border-[#2D373C]"
                    >
                        {/* Icon exactly as referenced */}
                        <div className="flex-shrink-0 mr-4">
                            <MapPin size={22} className="text-white opacity-90" />
                        </div>
                        
                        {/* Exact Error Message */}
                        <div className="flex-1 mr-4">
                            <p className="text-[15px] font-medium leading-snug tracking-wide">
                                {locationError}
                            </p>
                        </div>
                        
                        {/* Close Button */}
                        <button 
                            onClick={() => setLocationError(null)}
                            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                        >
                            <X size={20} className="text-white opacity-80 hover:opacity-100" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}