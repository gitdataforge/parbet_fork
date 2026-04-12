import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, MessageSquare, Send, CheckCircle2, ChevronRight } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function FeedbackTab() {
    // Core Engine State
    const [isOpen, setIsOpen] = useState(false);
    
    // Feature 1: Real Rating State
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    
    // Feature 2: Real Category Selection
    const [category, setCategory] = useState('');
    
    // Feature 3: Real Text Input
    const [message, setMessage] = useState('');
    
    // Feature 4: Real Follow-up Toggle
    const [includeEmail, setIncludeEmail] = useState(false);
    
    // Feature 5: Real Firebase Submission State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const categories = ['Bug Report', 'Feature Suggestion', 'General Feedback', 'Payment Issue'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating || !category || !message.trim()) return;

        setIsSubmitting(true);

        try {
            // STRICT RULE 1: Target the exact public shared path for real data
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const feedbackRef = collection(db, 'artifacts', appId, 'public', 'data', 'feedback');

            // 100% Real Database Payload
            await addDoc(feedbackRef, {
                userId: auth.currentUser?.uid || 'anonymous',
                rating,
                category,
                message: message.trim(),
                followUpRequested: includeEmail,
                status: 'unread',
                createdAt: serverTimestamp(),
            });

            setSubmitSuccess(true);
            
            // Auto-close after success animation
            setTimeout(() => {
                setIsOpen(false);
                // Reset form for next use
                setTimeout(() => {
                    setSubmitSuccess(false);
                    setRating(0);
                    setCategory('');
                    setMessage('');
                    setIncludeEmail(false);
                }, 500);
            }, 2000);

        } catch (error) {
            console.error("Failed to submit real feedback to database:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* 1:1 REPLICA: Fixed Green Viagogo Feedback Tab */}
            <div 
                onClick={() => setIsOpen(true)}
                className={`fixed right-0 top-1/4 md:top-1/3 bg-[#458731] hover:bg-[#366a26] text-white py-4 px-1.5 rounded-l-md shadow-md cursor-pointer z-40 transition-transform duration-300 ${isOpen ? 'translate-x-full' : 'translate-x-0'}`}
            >
                <div 
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} 
                    className="font-bold text-[14px] tracking-wider flex items-center justify-center uppercase"
                >
                    Feedback
                </div>
            </div>

            {/* REAL FEATURE ENGINE: Animated Slide-Out Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Mobile Background Overlay */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isSubmitting && setIsOpen(false)}
                            className="fixed inset-0 bg-black/20 z-50 md:hidden"
                        />

                        {/* Slide-Out Panel */}
                        <motion.div 
                            initial={{ x: '100%', opacity: 0.5 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0.5 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-white shadow-2xl z-[60] flex flex-col font-sans border-l border-[#e2e2e2]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-[#e2e2e2] bg-[#f8f9fa]">
                                <h2 className="text-[20px] font-bold text-[#1a1a1a] flex items-center tracking-tight">
                                    <MessageSquare size={20} className="text-[#458731] mr-2" />
                                    Your Feedback
                                </h2>
                                <button 
                                    onClick={() => !isSubmitting && setIsOpen(false)}
                                    className="p-2 text-[#54626c] hover:bg-gray-200 rounded-full transition-colors"
                                    disabled={isSubmitting}
                                >
                                    <X size={20} strokeWidth={2} />
                                </button>
                            </div>

                            {/* Content Body */}
                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                {submitSuccess ? (
                                    // Feature 5: Success Animation State
                                    <motion.div 
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="h-full flex flex-col items-center justify-center text-center pb-10"
                                    >
                                        <CheckCircle2 size={64} className="text-[#458731] mb-4" />
                                        <h3 className="text-[24px] font-bold text-[#1a1a1a] mb-2 tracking-tight">Thank You!</h3>
                                        <p className="text-[#54626c] text-[15px]">Your feedback has been securely submitted to our team.</p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="flex flex-col space-y-7">
                                        
                                        {/* Feature 1: Interactive Rating System */}
                                        <div className="flex flex-col">
                                            <label className="text-[14px] font-bold text-[#1a1a1a] mb-3 uppercase tracking-wider">1. Rate your experience</label>
                                            <div className="flex space-x-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setRating(star)}
                                                        onMouseEnter={() => setHoveredRating(star)}
                                                        onMouseLeave={() => setHoveredRating(0)}
                                                        className="focus:outline-none transition-transform hover:scale-110"
                                                    >
                                                        <Star 
                                                            size={32} 
                                                            className={`${(hoveredRating || rating) >= star ? 'fill-[#8cc63f] text-[#8cc63f]' : 'text-gray-300'} transition-colors`} 
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Feature 2: Category Logic Selection */}
                                        <div className="flex flex-col">
                                            <label className="text-[14px] font-bold text-[#1a1a1a] mb-3 uppercase tracking-wider">2. What is this regarding?</label>
                                            <div className="flex flex-wrap gap-2">
                                                {categories.map((cat) => (
                                                    <button
                                                        key={cat}
                                                        type="button"
                                                        onClick={() => setCategory(cat)}
                                                        className={`px-4 py-2 rounded-full text-[14px] font-medium transition-colors border ${category === cat ? 'bg-[#eaf4d9] border-[#458731] text-[#458731]' : 'bg-white border-[#cccccc] text-[#54626c] hover:border-gray-400'}`}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Feature 3: Deep Text Details */}
                                        <div className="flex flex-col">
                                            <label className="text-[14px] font-bold text-[#1a1a1a] mb-3 uppercase tracking-wider">3. Tell us more</label>
                                            <textarea 
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="Please share your thoughts, issues, or suggestions..."
                                                className="w-full border border-[#cccccc] rounded-[6px] p-3 h-32 resize-none text-[15px] focus:outline-none focus:border-[#458731] focus:ring-1 focus:ring-[#458731] transition-all"
                                            />
                                        </div>

                                        {/* Feature 4: Authentication/Follow-up Integration */}
                                        <div className="flex items-center mt-2">
                                            <input 
                                                type="checkbox" 
                                                id="followup"
                                                checked={includeEmail}
                                                onChange={(e) => setIncludeEmail(e.target.checked)}
                                                className="w-4 h-4 text-[#458731] rounded border-gray-300 focus:ring-[#458731] cursor-pointer"
                                            />
                                            <label htmlFor="followup" className="ml-3 text-[14px] text-[#54626c] cursor-pointer select-none">
                                                I am open to the team contacting me regarding this feedback.
                                            </label>
                                        </div>

                                    </form>
                                )}
                            </div>

                            {/* Footer Submit Area */}
                            {!submitSuccess && (
                                <div className="p-6 border-t border-[#e2e2e2] bg-[#f8f9fa]">
                                    <button 
                                        onClick={handleSubmit}
                                        disabled={!rating || !category || !message.trim() || isSubmitting}
                                        className="w-full bg-[#458731] hover:bg-[#366a26] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-[6px] flex items-center justify-center transition-colors text-[16px]"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center">Processing...</span>
                                        ) : (
                                            <span className="flex items-center">Submit Feedback <Send size={18} className="ml-2" /></span>
                                        )}
                                    </button>
                                </div>
                            )}

                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}