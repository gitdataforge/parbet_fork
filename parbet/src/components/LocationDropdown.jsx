import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin } from 'lucide-react';
import { useAppStore } from '../store/useStore';

export default function LocationDropdown() {
    const { 
        isLocationDropdownOpen, 
        setLocationDropdownOpen, 
        requestDeviceLocation,
        setSearchQuery 
    } = useAppStore();
    
    const [localInput, setLocalInput] = useState('');
    const dropdownRef = useRef(null);

    // Handle clicking outside the dropdown to close it securely
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setLocationDropdownOpen(false);
            }
        };

        if (isLocationDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLocationDropdownOpen, setLocationDropdownOpen]);

    // Handle "Use my location" click
    const handleUseLocation = () => {
        requestDeviceLocation();
    };

    // Handle manual search submit (Hitting Enter)
    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter') {
            setSearchQuery(localInput);
            setLocationDropdownOpen(false);
        }
    };

    return (
        <AnimatePresence>
            {isLocationDropdownOpen && (
                <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-0 mt-3 w-[320px] bg-white rounded-[16px] shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-gray-100 z-50 overflow-hidden"
                    onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing it
                >
                    {/* Search Input Area */}
                    <div className="p-4 pb-2">
                        <div className="flex items-center border border-gray-300 focus-within:border-[#1D7AF2] focus-within:ring-1 focus-within:ring-[#1D7AF2] rounded-[12px] px-3 py-2.5 bg-white transition-all shadow-sm">
                            <Search size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search location"
                                value={localInput}
                                onChange={(e) => setLocalInput(e.target.value)}
                                onKeyDown={handleSearchSubmit}
                                className="w-full outline-none text-[15px] text-brand-text font-medium bg-transparent placeholder-gray-500"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Action List */}
                    <div className="flex flex-col pb-3 pt-1">
                        <button
                            onClick={handleUseLocation}
                            className="flex items-center px-5 py-3 hover:bg-gray-50 transition-colors w-full text-left"
                        >
                            <MapPin size={20} className="text-brand-text mr-3 opacity-90 flex-shrink-0" />
                            <span className="text-[15px] font-medium text-brand-text">Use my location</span>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}