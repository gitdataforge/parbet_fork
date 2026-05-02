import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store/useStore';

/**
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 6 Quantity Modal)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * FEATURE 1: Framer Motion Hardware-Accelerated Overlay
 * FEATURE 2: Dynamic Quantity Selection Logic
 * FEATURE 3: Contiguous Seating Toggle Logic
 * FEATURE 4: Expanded 7-Section Layout
 */

export default function TicketQuantityModal({ sitTogether, setSitTogether }) {
    const { 
        isTicketQuantityModalOpen, 
        setTicketQuantityModalOpen, 
        selectedTicketQuantity, 
        setSelectedTicketQuantity 
    } = useAppStore();

    return (
        <AnimatePresence>
            {isTicketQuantityModalOpen && (
                // SECTION 1: Fixed Backdrop
                <div className="fixed inset-0 bg-[#333333]/80 z-[200] flex items-center justify-center backdrop-blur-sm p-4">
                    
                    {/* SECTION 2: Modal Container */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-[#FFFFFF] rounded-[24px] p-6 md:p-8 w-full max-w-md shadow-[0_20px_60px_rgba(51,51,51,0.2)] relative overflow-hidden border border-[#A3A3A3]/20"
                    >
                        {/* SECTION 3: Ambient Illustration */}
                        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#FAD8DC]/30 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                        
                        <button onClick={() => setTicketQuantityModalOpen(false)} className="absolute top-5 right-5 text-[#A3A3A3] hover:text-[#E7364D] transition-colors z-10">
                            <X size={24} />
                        </button>
                        
                        {/* SECTION 4: Header */}
                        <h2 className="text-2xl font-black text-[#333333] mb-6 text-center mt-2 relative z-10">How many tickets?</h2>
                        
                        {/* SECTION 5: Dynamic Quantity Selector */}
                        <div className="flex justify-center flex-wrap gap-3 mb-8 relative z-10">
                            {[1, 2, 3, 4, 5, '6+'].map(qty => {
                                const value = qty === '6+' ? 6 : qty;
                                const isSelected = selectedTicketQuantity === value;
                                return (
                                    <button
                                        key={qty}
                                        onClick={() => setSelectedTicketQuantity(value)}
                                        className={`w-14 h-14 rounded-full font-black text-lg transition-all border-2 ${
                                            isSelected 
                                                ? 'bg-[#E7364D] border-[#E7364D] text-[#FFFFFF] shadow-md transform scale-110' 
                                                : 'bg-[#FFFFFF] border-[#A3A3A3]/30 text-[#333333] hover:border-[#E7364D] hover:text-[#E7364D] hover:bg-[#FAD8DC]/10'
                                        }`}
                                    >
                                        {qty}
                                    </button>
                                );
                            })}
                        </div>
                        
                        {/* SECTION 6: Contiguous Seating Toggle & Info */}
                        <div className="flex flex-col gap-3 mb-8 relative z-10">
                            <div className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-xl border border-[#A3A3A3]/20 shadow-sm">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center mr-3 border border-[#A3A3A3]/20">
                                        <Users size={20} className="text-[#333333]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#333333] text-[15px] mb-0.5">We want to sit together</h4>
                                        <p className="text-[13px] text-[#626262] font-medium">Ensures your seats are adjacent</p>
                                    </div>
                                </div>
                                
                                {/* Fully Functional Toggle Switch */}
                                <div 
                                    onClick={() => setSitTogether(!sitTogether)}
                                    className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors duration-300 ${sitTogether ? 'bg-[#E7364D]' : 'bg-[#A3A3A3]/50'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-[#FFFFFF] rounded-full shadow-sm transition-all duration-300 ${sitTogether ? 'right-1' : 'left-1'}`}></div>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-2 px-2">
                                <AlertCircle size={14} className="text-[#E7364D] mt-0.5 shrink-0" />
                                <p className="text-[11px] text-[#626262] leading-tight font-medium">
                                    Booknshow algorithm guarantees seats will be together unless otherwise explicitly stated by the seller in the listing details.
                                </p>
                            </div>
                        </div>
                        
                        {/* SECTION 7: Action Button */}
                        <button 
                            onClick={() => setTicketQuantityModalOpen(false)} 
                            className="w-full bg-[#333333] text-[#FFFFFF] font-black py-4 rounded-[12px] hover:bg-[#E7364D] transition-colors text-[16px] shadow-[0_8px_20px_rgba(51,51,51,0.2)] relative z-10"
                        >
                            Continue to Tickets
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}