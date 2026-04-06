import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, limit, onSnapshot } from 'firebase/firestore';

export default function PurchaseToast() {
    const [latest, setLatest] = useState(null);

    useEffect(() => {
        // Strictly listen to public orders collection
        const q = query(collection(db, 'public_orders'), limit(1));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const data = snapshot.docs[0].data();
                setLatest(data);
                setTimeout(() => setLatest(null), 5000);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <AnimatePresence>
            {latest && (
                <motion.div 
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 20, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    className="fixed bottom-24 left-0 z-[100] bg-white rounded-2xl p-4 shadow-2xl border border-gray-100 flex items-center space-x-4 max-w-[280px]"
                >
                    <div className="w-10 h-10 bg-[#E6F2D9] rounded-xl flex items-center justify-center text-[#458731]">
                        <ShoppingBag size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Just Bought</p>
                        <p className="text-xs font-bold text-gray-800 truncate">{latest.eventName || 'IPL Tickets'}</p>
                        <p className="text-[10px] text-gray-500 font-medium">Someone in {latest.city || 'India'}</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}