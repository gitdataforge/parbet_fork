import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';

export default function DiscountWheel() {
    const [discount, setDiscount] = useState(null);

    useEffect(() => {
        // Logic: Apply 5% night owl discount if browsing between Midnight and 5 AM
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 5) {
            setDiscount('NIGHTOWL5');
        }
    }, []);

    if (!discount) return null;

    return (
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-full bg-gradient-to-r from-[#114C2A] to-[#458731] rounded-[24px] p-6 text-white shadow-xl flex items-center justify-between mt-8"
        >
            <div>
                <h3 className="font-black text-xl flex items-center"><Tag size={20} className="mr-2"/> Night Owl Special</h3>
                <p className="text-white/80 text-sm font-medium">Use code <span className="font-black bg-white text-[#114C2A] px-2 py-0.5 rounded">NIGHTOWL5</span> for 5% off</p>
            </div>
        </motion.div>
    );
}