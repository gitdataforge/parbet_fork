import React from 'react';

// Real-time Native Auto-Optimization Utility
// CRITICAL FIX: Stripped Cloudinary wrapper to prevent 401 Unauthorized fetching crashes.
// Direct URL passthrough guarantees high-availability rendering for Unsplash assets.
const optimizeImage = (url, width = 600) => {
    if (!url) return '';
    // Direct passthrough to prevent Cloudinary 401 proxy blocks
    return url;
};

export default function ViagogoCategoryCard({ name, img, onClick }) {
    if (!name || !img) return null;

    return (
        <div 
            onClick={onClick} 
            className="relative aspect-[3/2] rounded-2xl overflow-hidden cursor-pointer group shadow-sm border border-gray-200"
        >
            {/* 1:1 Image with Hover Scale Animation */}
            <img 
                src={optimizeImage(img, 600)} 
                alt={name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            
            {/* 1:1 Viagogo Darkened Bottom Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 md:p-5">
                {/* Bold White Text Anchored Bottom-Left */}
                <h3 className="text-white font-bold text-[16px] md:text-[18px] leading-tight drop-shadow-md">
                    {name}
                </h3>
            </div>
        </div>
    );
}