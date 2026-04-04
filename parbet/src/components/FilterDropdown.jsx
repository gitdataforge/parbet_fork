import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useAppStore } from '../store/useStore';

export default function FilterDropdown({ type, isOpen, onClose }) {
    // Connect directly to the global store to trigger real-time filtering updates
    const { 
        exploreDateFilter = 'All dates', 
        setExploreDateFilter, 
        explorePriceFilter = 'All', 
        setExplorePriceFilter 
    } = useAppStore();

    const dropdownRef = useRef(null);

    // Securely handle clicks outside the component to close the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Dynamically define configuration based on the requested 'type'
    const isDate = type === 'date';
    
    // Exact arrays mapping to the Viagogo interface references
    const options = isDate 
        ? ['All dates', 'Today', 'This weekend', 'This month', 'Custom Dates']
        : ['All', '$', '$$', '$$$', '$$$$'];
    
    const currentValue = isDate ? exploreDateFilter : explorePriceFilter;
    
    // Safely handle state updates (fallback in case store isn't fully updated yet)
    const handleSelect = (option) => {
        if (isDate && setExploreDateFilter) {
            setExploreDateFilter(option);
        } else if (!isDate && setExplorePriceFilter) {
            setExplorePriceFilter(option);
        }
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute top-full left-0 mt-2 min-w-[200px] bg-white rounded-[12px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-gray-100 z-50 py-2 overflow-hidden"
                    onClick={(e) => e.stopPropagation()} // Prevent internal clicks from bubbling up
                >
                    {options.map((option) => (
                        <button
                            key={option}
                            onClick={() => handleSelect(option)}
                            className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors text-left group"
                        >
                            <span className={`text-[16px] ${currentValue === option ? 'text-brand-text font-medium' : 'text-[#3B4248]'}`}>
                                {option}
                            </span>
                            
                            {/* Render the checkmark strictly if it matches the active global state */}
                            {currentValue === option && (
                                <Check size={18} className="text-[#6A7074] stroke-[2.5]" />
                            )}
                        </button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
}