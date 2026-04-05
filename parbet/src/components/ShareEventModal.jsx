import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Twitter, Facebook, Mail, MessageCircle } from 'lucide-react';

export default function ShareEventModal({ isOpen, onClose, eventData }) {
    const [isCopied, setIsCopied] = useState(false);
    const [shareUrl, setShareUrl] = useState('');

    useEffect(() => {
        if (eventData) {
            // Generate the dynamic shareable link based on current origin
            setShareUrl(`${window.location.origin}/event?id=${eventData.id}`);
        }
    }, [eventData]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            // Robust fallback for older mobile browsers or strict iframe contexts
            const textArea = document.createElement("textarea");
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand("copy");
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            } catch (fallbackErr) {
                console.error('Fallback copy failed', fallbackErr);
            }
            document.body.removeChild(textArea);
        }
    };

    const handleSocialShare = (platform) => {
        const text = encodeURIComponent(`Get tickets for ${eventData?.t1} vs ${eventData?.t2} on parbet!`);
        const url = encodeURIComponent(shareUrl);
        
        let shareEndpoint = '';
        switch (platform) {
            case 'twitter':
                shareEndpoint = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                break;
            case 'whatsapp':
                shareEndpoint = `https://api.whatsapp.com/send?text=${text} ${url}`;
                break;
            case 'facebook':
                shareEndpoint = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'email':
                shareEndpoint = `mailto:?subject=${encodeURIComponent(`Tickets: ${eventData?.t1} vs ${eventData?.t2}`)}&body=${text} ${url}`;
                break;
            default:
                return;
        }
        
        window.open(shareEndpoint, '_blank', 'noopener,noreferrer');
    };

    if (!eventData) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-[20px] p-6 w-full max-w-[400px] shadow-2xl relative"
                    >
                        <button 
                            onClick={onClose} 
                            className="absolute top-5 right-5 text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        
                        <h2 className="text-[22px] font-black text-brand-text mb-2 pr-8 leading-tight">
                            Share this event
                        </h2>
                        <p className="text-[14px] text-brand-muted font-medium mb-6">
                            {eventData.t1} vs {eventData.t2}
                        </p>
                        
                        {/* Social Icons Grid */}
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <button onClick={() => handleSocialShare('whatsapp')} className="flex flex-col items-center justify-center group">
                                <div className="w-12 h-12 rounded-full bg-[#EAF4D9] text-[#114C2A] flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                                    <MessageCircle size={22} />
                                </div>
                                <span className="text-[11px] font-bold text-gray-600">WhatsApp</span>
                            </button>
                            <button onClick={() => handleSocialShare('twitter')} className="flex flex-col items-center justify-center group">
                                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                                    <Twitter size={20} />
                                </div>
                                <span className="text-[11px] font-bold text-gray-600">X / Twitter</span>
                            </button>
                            <button onClick={() => handleSocialShare('facebook')} className="flex flex-col items-center justify-center group">
                                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                                    <Facebook size={20} />
                                </div>
                                <span className="text-[11px] font-bold text-gray-600">Facebook</span>
                            </button>
                            <button onClick={() => handleSocialShare('email')} className="flex flex-col items-center justify-center group">
                                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                                    <Mail size={20} />
                                </div>
                                <span className="text-[11px] font-bold text-gray-600">Email</span>
                            </button>
                        </div>

                        {/* Copy Link Input Bar */}
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-[12px] p-1.5 shadow-inner">
                            <div className="flex-1 px-3 truncate text-[14px] text-gray-500 font-medium select-all">
                                {shareUrl}
                            </div>
                            <button 
                                onClick={handleCopy}
                                className={`flex items-center justify-center px-4 py-2.5 rounded-[8px] font-bold text-[13px] transition-all min-w-[90px] ${
                                    isCopied 
                                        ? 'bg-[#114C2A] text-white shadow-sm' 
                                        : 'bg-white text-brand-text border border-gray-200 hover:bg-gray-100'
                                }`}
                            >
                                {isCopied ? (
                                    <><Check size={14} className="mr-1.5"/> Copied</>
                                ) : (
                                    <><Copy size={14} className="mr-1.5"/> Copy</>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}