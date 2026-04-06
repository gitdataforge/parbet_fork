import React, { useEffect, useState } from 'react';
import { Check, Smartphone, ArrowUp, ShieldCheck, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useStore';

export default function Footer() {
    const { 
        userCountry, 
        userCurrency, 
        userLanguage,
        setUserCurrency,
        setUserLanguage
    } = useAppStore();

    // FEATURE 1: Dynamic Year Resolution
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    // FEATURE 2: Smooth Scroll-to-Top Interaction
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="w-full bg-[#FAFAFA] border-t border-gray-200 mt-auto relative overflow-hidden">
            
            {/* NEW SECTION 1: High-End SVG Background Illustration */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 1400 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
                    <path d="M-100 400C150 400 350 100 600 100C850 100 1050 400 1300 400C1550 400 1750 100 2000 100" stroke="#114C2A" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M-100 450C150 450 350 150 600 150C850 150 1050 450 1300 450C1550 450 1750 150 2000 150" stroke="#114C2A" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M-100 500C150 500 350 200 600 200C850 200 1050 500 1300 500C1550 500 1750 200 2000 200" stroke="#114C2A" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="200" cy="600" r="300" stroke="#114C2A" strokeWidth="1" strokeDasharray="4 4"/>
                    <circle cx="1200" cy="200" r="400" stroke="#114C2A" strokeWidth="1" strokeDasharray="4 4"/>
                </svg>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-16 relative z-10">
                
                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 mb-16">
                    
                    {/* Guarantee Column */}
                    <div className="flex flex-col space-y-6 lg:col-span-1">
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={scrollToTop}>
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                                <path d="M12 22S4 16 4 9V5L12 2L20 5V9C20 16 12 22 12 22Z" stroke="#114C2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M9 12L11 14L15 10" stroke="#114C2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 leading-none tracking-tighter">parbet</h3>
                                <p className="text-[12px] font-bold text-[#458731] uppercase tracking-widest mt-0.5">guarantee</p>
                            </div>
                        </div>
                        <ul className="space-y-3.5">
                            <li className="flex items-center text-[13px] font-bold text-gray-700 hover:text-gray-900 transition-colors"><Check size={16} className="text-[#458731] mr-2 flex-shrink-0"/> World class security checks</li>
                            <li className="flex items-center text-[13px] font-bold text-gray-700 hover:text-gray-900 transition-colors"><Check size={16} className="text-[#458731] mr-2 flex-shrink-0"/> Transparent pricing</li>
                            <li className="flex items-center text-[13px] font-bold text-gray-700 hover:text-gray-900 transition-colors"><Check size={16} className="text-[#458731] mr-2 flex-shrink-0"/> 100% order guarantee</li>
                            <li className="flex items-center text-[13px] font-bold text-gray-700 hover:text-gray-900 transition-colors"><Check size={16} className="text-[#458731] mr-2 flex-shrink-0"/> 24/7 Customer support</li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h4 className="font-black text-[15px] text-gray-900 mb-6 uppercase tracking-wider">Our Company</h4>
                        <ul className="space-y-3.5 text-[14px] font-medium text-gray-600">
                            <li><button className="hover:text-[#114C2A] transition-colors hover:underline underline-offset-2">About Us</button></li>
                            <li><button className="hover:text-[#114C2A] transition-colors hover:underline underline-offset-2">Open Distribution</button></li>
                            <li><button className="hover:text-[#114C2A] transition-colors hover:underline underline-offset-2">Affiliate Programme</button></li>
                            <li><button className="hover:text-[#114C2A] transition-colors hover:underline underline-offset-2">Investors</button></li>
                            <li><button className="hover:text-[#114C2A] transition-colors hover:underline underline-offset-2">Corporate Service</button></li>
                            <li><button className="hover:text-[#114C2A] transition-colors hover:underline underline-offset-2">Careers</button></li>
                        </ul>
                    </div>

                    {/* Questions Column */}
                    <div>
                        <h4 className="font-black text-[15px] text-gray-900 mb-6 uppercase tracking-wider">Help & Support</h4>
                        <ul className="space-y-3.5 text-[14px] font-medium text-gray-600">
                            <li><button className="hover:text-[#114C2A] transition-colors hover:underline underline-offset-2">Help Centre</button></li>
                            <li><button className="hover:text-[#114C2A] transition-colors hover:underline underline-offset-2">Contact Us</button></li>
                            <li><button className="hover:text-[#114C2A] transition-colors hover:underline underline-offset-2">Refund Policy</button></li>
                            <li><button className="hover:text-[#114C2A] transition-colors hover:underline underline-offset-2">Sell Tickets</button></li>
                        </ul>
                    </div>

                    {/* NEW SECTION 2: App Download Box */}
                    <div>
                        <h4 className="font-black text-[15px] text-gray-900 mb-6 uppercase tracking-wider">Get The App</h4>
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                            <div className="flex items-center space-x-3 mb-2">
                                <Smartphone size={24} className="text-[#114C2A]" />
                                <span className="text-[13px] font-bold text-gray-800 leading-tight">Your tickets, always in your pocket.</span>
                            </div>
                            <button className="w-full flex items-center justify-center space-x-2 bg-black text-white py-2.5 rounded-xl hover:bg-gray-800 transition-colors">
                                <svg viewBox="0 0 384 512" fill="currentColor" className="w-4 h-4"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                                <span className="text-[12px] font-bold">App Store</span>
                            </button>
                            <button className="w-full flex items-center justify-center space-x-2 bg-black text-white py-2.5 rounded-xl hover:bg-gray-800 transition-colors">
                                <svg viewBox="0 0 512 512" fill="currentColor" className="w-4 h-4"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
                                <span className="text-[12px] font-bold">Google Play</span>
                            </button>
                        </div>
                    </div>

                    {/* Region / Selectors Column */}
                    <div className="flex flex-col lg:col-span-1">
                        <h4 className="font-black text-[15px] text-gray-900 mb-6 uppercase tracking-wider">Localization</h4>
                        
                        {/* FEATURE 3 & 4: Geo-Auto-Select Defaults & Global State Binding */}
                        <div className="space-y-4 w-full">
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden focus-within:ring-2 focus-within:ring-[#114C2A] transition-all">
                                <select 
                                    value={userLanguage || 'EN'}
                                    onChange={(e) => setUserLanguage(e.target.value)}
                                    className="w-full appearance-none bg-transparent text-gray-800 py-3.5 px-4 outline-none font-bold text-[13px] cursor-pointer border-b border-gray-100"
                                >
                                    <option value="EN">A 文 English (UK)</option>
                                    <option value="EN-US">A 文 English (US)</option>
                                    <option value="HI">A 文 Hindi (IN)</option>
                                </select>
                                <select 
                                    value={userCurrency || 'INR'}
                                    onChange={(e) => setUserCurrency(e.target.value)}
                                    className="w-full appearance-none bg-transparent text-gray-600 py-3.5 px-4 outline-none font-bold text-[13px] cursor-pointer"
                                >
                                    <option value="INR">₹ INR Indian Rupee</option>
                                    <option value="USD">$ USD US Dollar</option>
                                    <option value="EUR">€ EUR Euro</option>
                                    <option value="GBP">£ GBP British Pound</option>
                                    <option value="AUD">A$ AUD Australian Dollar</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* NEW SECTION 3: Social Media & Trust Badges */}
                <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-200 py-8 gap-6">
                    <div className="flex items-center space-x-4">
                        <motion.a 
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            href="#" 
                            className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-md hover:shadow-lg transition-shadow"
                        >
                            <svg viewBox="0 0 320 512" fill="currentColor" className="w-5 h-5"><path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/></svg>
                        </motion.a>
                        
                        {/* STRICTLY IMPLEMENTED: Latest X (Twitter) Logo */}
                        <motion.a 
                            whileHover={{ scale: 1.1, rotate: -5 }}
                            href="#" 
                            className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white shadow-md hover:shadow-lg transition-shadow"
                        >
                            <svg viewBox="0 0 1200 1227" fill="currentColor" className="w-4 h-4"><path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/></svg>
                        </motion.a>
                    </div>

                    <div className="flex items-center space-x-4 text-gray-500">
                        <div className="flex items-center space-x-1.5 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                            <ShieldCheck size={16} className="text-[#114C2A]" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">Verified Secure</span>
                        </div>
                        <div className="flex items-center space-x-1.5 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                            <Lock size={16} className="text-gray-600" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">256-Bit SSL</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Legal Row */}
                <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
                    <div className="flex flex-col text-[12px] text-gray-500 font-medium space-y-3">
                        <p>Copyright © parbet GmbH {currentYear}. All Rights Reserved. <button className="text-[#1D7AF2] hover:underline font-bold ml-1">Company Details</button></p>
                        <p className="leading-relaxed max-w-4xl">
                            Use of this web site constitutes acceptance of the <button className="text-[#1D7AF2] hover:underline">Terms and Conditions</button>, <button className="text-[#1D7AF2] hover:underline">Privacy Policy</button>, <button className="text-[#1D7AF2] hover:underline">Cookies Policy</button>, and <button className="text-[#1D7AF2] hover:underline">Mobile Privacy Policy</button>. <button className="text-[#1D7AF2] hover:underline">Do Not Share My Personal Information / Your Privacy Choices</button>.
                        </p>
                    </div>

                    <motion.button 
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={scrollToTop}
                        className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-600 hover:text-[#114C2A] hover:border-[#114C2A] transition-colors absolute right-0 md:static -top-6 md:top-0"
                    >
                        <ArrowUp size={20} />
                    </motion.button>
                </div>
            </div>
        </footer>
    );
}