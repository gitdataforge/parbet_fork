import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';
import { fetchPerformerNews } from '../services/newsApi';

export default function NewsMarquee({ query }) {
    const [news, setNews] = useState([]);

    useEffect(() => {
        if (query) fetchPerformerNews(query).then(setNews);
    }, [query]);

    if (news.length === 0) return null;

    return (
        <div className="w-full bg-gray-50 border-y border-gray-100 py-3 mt-10 overflow-hidden group">
            <motion.div 
                animate={{ x: [0, -800] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="flex space-x-16 whitespace-nowrap"
            >
                {news.map((item, i) => (
                    <div key={i} className="flex items-center space-x-3 cursor-pointer hover:text-[#458731] transition-colors">
                        <Newspaper size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{item.title}</span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}