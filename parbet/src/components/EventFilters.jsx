import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Eye, TrendingUp, TrendingDown, Armchair, Info } from 'lucide-react';
import { useAppStore } from '../store/useStore';

/**
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 6 Event Filters)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * FEATURE 1: Framer Motion Sliding Sidebar
 * FEATURE 2: Dynamic Currency Resolution (Tied to user selection)
 * FEATURE 3: Expanding 9-Section Layout
 */

export default function EventFilters({ 
    isOpen, onClose, 
    instantDownloadOnly, setInstantDownloadOnly,
    clearViewOnly, setClearViewOnly,
    sortOrder, setSortOrder,
    filteredCount
}) {
    const { userCurrency } = useAppStore();

    // Resolve proper localized currency symbol dynamically
    const currencySymbol = useMemo(() => {
        switch(userCurrency) {
            case 'USD': return '$';
            case 'GBP': return '£';
            case 'EUR': return '€';
            case 'AUD': return 'A$';
            default: return '₹';
        }
    }, [userCurrency]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* SECTION 1: Fixed Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#333333]/80 z-[150] backdrop-blur-sm" 
                        onClick={onClose} 
                    />
                    
                    {/* SECTION 2: Sidebar Container */}
                    <motion.div 
                        initial={{ x: '100%' }} 
                        animate={{ x: 0 }} 
                        exit={{ x: '100%' }} 
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-[#FFFFFF] z-[160] shadow-[-10px_0_40px_rgba(51,51,51,0.2)] flex flex-col border-l border-[#A3A3A3]/20"
                    >
                        {/* SECTION 3: Header */}
                        <div className="p-6 border-b border-[#A3A3A3]/20 flex justify-between items-center bg-[#F5F5F5] z-10">
                            <h2 className="text-xl font-black text-[#333333]">Filters & Sorting</h2>
                            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FFFFFF] border border-[#A3A3A3]/30 hover:border-[#E7364D] hover:text-[#E7364D] transition-colors shadow-sm">
                                <X size={18} />
                            </button>
                        </div>
                        
                        <div className="p-6 flex-1 overflow-y-auto space-y-8 bg-[#FFFFFF] custom-scrollbar">
                            
                            {/* SECTION 4: Sort Ordering */}
                            <div>
                                <h3 className="font-bold text-[#333333] mb-3 text-[15px]">Sort By</h3>
                                <div className="flex bg-[#F5F5F5] p-1.5 rounded-[12px] border border-[#A3A3A3]/20">
                                    <button 
                                        onClick={() => setSortOrder('asc')} 
                                        className={`flex-1 py-2.5 flex items-center justify-center text-sm font-bold rounded-[8px] transition-all ${sortOrder === 'asc' ? 'bg-[#FFFFFF] text-[#333333] shadow-sm border border-[#A3A3A3]/20' : 'text-[#626262] hover:text-[#E7364D]'}`}
                                    >
                                        <TrendingDown size={16} className="mr-2"/> Lowest Price
                                    </button>
                                    <button 
                                        onClick={() => setSortOrder('desc')} 
                                        className={`flex-1 py-2.5 flex items-center justify-center text-sm font-bold rounded-[8px] transition-all ${sortOrder === 'desc' ? 'bg-[#FFFFFF] text-[#333333] shadow-sm border border-[#A3A3A3]/20' : 'text-[#626262] hover:text-[#E7364D]'}`}
                                    >
                                        <TrendingUp size={16} className="mr-2"/> Highest Price
                                    </button>
                                </div>
                            </div>

                            {/* SECTION 5: Ticket Features Checklist */}
                            <div className="space-y-4 pt-6 border-t border-[#A3A3A3]/20">
                                <h3 className="font-bold text-[#333333] text-[15px] mb-2">Ticket Features</h3>
                                
                                <label className={`flex items-center justify-between cursor-pointer p-4 rounded-[12px] border transition-colors shadow-sm ${instantDownloadOnly ? 'bg-[#FAD8DC]/20 border-[#E7364D]' : 'bg-[#F5F5F5] border-[#A3A3A3]/30 hover:border-[#E7364D]/50'}`}>
                                    <span className="font-bold text-[#333333] text-sm flex items-center"><Zap size={18} className="text-[#E7364D] mr-3 fill-[#E7364D]"/> Instant Download</span>
                                    <input 
                                        type="checkbox" 
                                        checked={instantDownloadOnly}
                                        onChange={(e) => setInstantDownloadOnly(e.target.checked)}
                                        className="w-5 h-5 rounded border-[#A3A3A3]/50 text-[#E7364D] focus:ring-[#E7364D] accent-[#E7364D] cursor-pointer" 
                                    />
                                </label>
                                
                                <label className={`flex items-center justify-between cursor-pointer p-4 rounded-[12px] border transition-colors shadow-sm ${clearViewOnly ? 'bg-[#FAD8DC]/20 border-[#E7364D]' : 'bg-[#F5F5F5] border-[#A3A3A3]/30 hover:border-[#E7364D]/50'}`}>
                                    <span className="font-bold text-[#333333] text-sm flex items-center"><Eye size={18} className="text-[#626262] mr-3"/> Clear View Only</span>
                                    <input 
                                        type="checkbox" 
                                        checked={clearViewOnly}
                                        onChange={(e) => setClearViewOnly(e.target.checked)}
                                        className="w-5 h-5 rounded border-[#A3A3A3]/50 text-[#E7364D] focus:ring-[#E7364D] accent-[#E7364D] cursor-pointer" 
                                    />
                                </label>
                            </div>

                            {/* SECTION 6: Seat Filter Toggle (Placeholder Layout Extension) */}
                            <div className="space-y-4 pt-6 border-t border-[#A3A3A3]/20">
                                <h3 className="font-bold text-[#333333] text-[15px] mb-2">Seating Preferences</h3>
                                <label className={`flex items-center justify-between cursor-pointer p-4 rounded-[12px] border transition-colors shadow-sm bg-[#F5F5F5] border-[#A3A3A3]/30 hover:border-[#E7364D]/50`}>
                                    <span className="font-bold text-[#333333] text-sm flex items-center"><Armchair size={18} className="text-[#626262] mr-3"/> Aisle Seats Only</span>
                                    <input 
                                        type="checkbox" 
                                        disabled
                                        className="w-5 h-5 rounded border-[#A3A3A3]/30 bg-[#FFFFFF] cursor-not-allowed opacity-50" 
                                    />
                                </label>
                            </div>

                            {/* SECTION 7: Dynamic Localized Price Range */}
                            <div className="pt-6 border-t border-[#A3A3A3]/20">
                                <h3 className="font-bold text-[#333333] mb-4 text-[15px]">Price Range</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="relative w-full">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3A3A3] font-bold">{currencySymbol}</span>
                                        <input 
                                            type="number" 
                                            placeholder="Min" 
                                            className="w-full pl-8 p-3.5 border border-[#A3A3A3]/50 rounded-[12px] outline-none focus:border-[#E7364D] focus:ring-1 focus:ring-[#E7364D] font-bold text-[#333333] bg-[#FFFFFF] shadow-sm transition-all" 
                                        />
                                    </div>
                                    <span className="text-[#A3A3A3] font-bold">-</span>
                                    <div className="relative w-full">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3A3A3] font-bold">{currencySymbol}</span>
                                        <input 
                                            type="number" 
                                            placeholder="Max" 
                                            className="w-full pl-8 p-3.5 border border-[#A3A3A3]/50 rounded-[12px] outline-none focus:border-[#E7364D] focus:ring-1 focus:ring-[#E7364D] font-bold text-[#333333] bg-[#FFFFFF] shadow-sm transition-all" 
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* SECTION 8: Info Banner */}
                            <div className="flex items-start gap-2 p-3 bg-[#F5F5F5] border border-[#A3A3A3]/20 rounded-[8px]">
                                <Info size={14} className="text-[#626262] mt-0.5 shrink-0" />
                                <p className="text-[11px] text-[#626262] leading-tight font-medium">Prices may be subject to additional platform fees and live currency exchange rates.</p>
                            </div>

                        </div>
                        
                        {/* SECTION 9: Action Button */}
                        <div className="p-6 border-t border-[#A3A3A3]/20 bg-[#F5F5F5]">
                            <button onClick={onClose} className="w-full bg-[#333333] text-[#FFFFFF] font-black py-4 rounded-[12px] hover:bg-[#E7364D] transition-colors shadow-[0_8px_20px_rgba(51,51,51,0.2)]">
                                Show {filteredCount} Tickets
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}