import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function BuyerReviews() {
    const reviews = [
        "Got my IPL tickets instantly. Smooth process! - Rahul M.",
        "Scanned at the gate perfectly. 10/10. - Priya S.",
        "Saved ₹500 on last minute concert tickets! - Amit D.",
        "The seating map was exactly accurate. - Karan V."
    ];

    return (
        <div className="w-full bg-[#114C2A] py-3 overflow-hidden">
            <motion.div animate={{ x: [0, -1000] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="flex whitespace-nowrap space-x-16 items-center">
                {reviews.map((r, i) => (
                    <div key={i} className="flex items-center text-white text-sm font-bold">
                        <div className="flex mr-3">{[1,2,3,4,5].map(s => <Star key={s} size={12} fill="#FDE047" className="text-[#FDE047]"/>)}</div>
                        "{r}"
                    </div>
                ))}
            </motion.div>
        </div>
    );
}