import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAppStore } from '../store/useStore';

export default function LanguageCurrencyModal({ isOpen, onClose }) {
    const { userLanguage, setUserLanguage, userCurrency, setUserCurrency } = useAppStore();

    // Local state buffers to hold selections before strictly confirming
    const [localLang, setLocalLang] = useState(userLanguage || 'EN');
    const [localCurr, setLocalCurr] = useState(userCurrency || 'USD');

    // Sync local state precisely when modal opens to reflect current global store
    useEffect(() => {
        if (isOpen) {
            setLocalLang(userLanguage || 'EN');
            setLocalCurr(userCurrency || 'USD');
        }
    }, [isOpen, userLanguage, userCurrency]);

    const handleConfirm = () => {
        setUserLanguage(localLang);
        setUserCurrency(localCurr);
        onClose();
    };

    const languages = [
        { code: 'EN', label: 'English (UK)' },
        { code: 'EN-US', label: 'English (US)' },
        { code: 'HI', label: 'Hindi (India)' },
        { code: 'ES', label: 'Spanish (Spain)' },
        { code: 'FR', label: 'French (France)' }
    ];

    const currencies = [
        { code: 'USD', label: 'United States Dollar' },
        { code: 'INR', label: 'Indian Rupee' },
        { code: 'GBP', label: 'British Pound' },
        { code: 'EUR', label: 'Euro' },
        { code: 'AUD', label: 'Australian Dollar' },
        { code: 'CAD', label: 'Canadian Dollar' }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-[16px] p-6 w-full max-w-[440px] shadow-2xl relative"
                    >
                        <button 
                            onClick={onClose} 
                            className="absolute top-5 right-5 text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        
                        <h2 className="text-[22px] font-bold text-brand-text mb-6 pr-8">
                            Select language and currency
                        </h2>
                        
                        <div className="space-y-5 mb-8">
                            {/* Language Dropdown */}
                            <div className="flex flex-col">
                                <label className="text-[13px] font-bold text-brand-text mb-2">Language</label>
                                <div className="relative">
                                    <select 
                                        value={localLang}
                                        onChange={(e) => setLocalLang(e.target.value)}
                                        className="w-full appearance-none bg-white border border-gray-300 text-brand-text text-[15px] rounded-[8px] px-4 py-3 outline-none focus:border-[#458731] focus:ring-1 focus:ring-[#458731] transition-colors cursor-pointer"
                                    >
                                        {languages.map(lang => (
                                            <option key={lang.code} value={lang.code}>{lang.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1.5L6 6.5L11 1.5" stroke="#3B4248" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Currency Dropdown */}
                            <div className="flex flex-col">
                                <label className="text-[13px] font-bold text-brand-text mb-2">Currency</label>
                                <div className="relative">
                                    <select 
                                        value={localCurr}
                                        onChange={(e) => setLocalCurr(e.target.value)}
                                        className="w-full appearance-none bg-white border border-gray-300 text-brand-text text-[15px] rounded-[8px] px-4 py-3 outline-none focus:border-[#458731] focus:ring-1 focus:ring-[#458731] transition-colors cursor-pointer"
                                    >
                                        {currencies.map(curr => (
                                            <option key={curr.code} value={curr.code}>{curr.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 1.5L6 6.5L11 1.5" stroke="#3B4248" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleConfirm}
                            className="w-full bg-[#458731] text-white font-bold py-3.5 rounded-[10px] hover:bg-[#386d27] transition-colors text-[16px] shadow-sm"
                        >
                            Confirm Preferences
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}