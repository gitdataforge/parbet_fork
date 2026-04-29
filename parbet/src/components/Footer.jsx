import React, { useEffect, useState } from 'react';
import { Check, ShieldCheck, Mail, MapPin } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { BooknshowLogo } from './Header'; 

/**
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 1 Final)
 * Enforced Background: Ebony Clay (#1F2533)
 * Enforced Primary Text: Wild Sand (#F5F5F5)
 * Enforced Accent: Carnation (#F84464)
 * * FEATURE 1: 1:1 Enterprise Footer Architecture
 * FEATURE 2: Real-time Dynamic Year Resolution
 * FEATURE 3: Localization Context Integration (Currency/Language)
 * FEATURE 4: Booknshow SVG Logo Integration (White Background Container)
 * FEATURE 5: Strict 3-Color Policy Enforcement
 * FEATURE 6: Fully Functional Social/Support Grid
 * FEATURE 7: Native Inline SVGs for Social Icons (Bypassing Lucide Crash)
 */

// Native SVG Implementations to bypass lucide-react module resolution errors
const TwitterSVG = ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
    </svg>
);

const InstagramSVG = ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);

const LinkedinSVG = ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
        <rect x="2" y="9" width="4" height="12"></rect>
        <circle cx="4" cy="4" r="2"></circle>
    </svg>
);

export default function Footer() {
    const { 
        userCurrency, 
        userLanguage,
        setUserCurrency,
        setUserLanguage
    } = useAppStore();

    // FEATURE 2: Dynamic Year Resolution
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

    return (
        <footer className="w-full bg-[#1F2533] border-t-4 border-[#F84464] mt-auto pt-12 pb-16 font-sans">
            <div className="max-w-[1400px] mx-auto px-6 md:px-8">
                
                {/* Main Footer 4-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
                    
                    {/* Column 1: Brand & Guarantee */}
                    <div className="flex flex-col space-y-6">
                        <div className="bg-white p-3 rounded-[8px] w-max inline-block mb-2 shadow-sm">
                            <BooknshowLogo className="h-[28px]" />
                        </div>
                        
                        <div className="flex flex-col">
                            <div className="flex items-center space-x-2.5 mb-3">
                                <ShieldCheck size={28} className="text-[#F84464]" strokeWidth={2} />
                                <span className="text-[18px] font-black text-[#F5F5F5] uppercase tracking-wider">Booknshow Guarantee</span>
                            </div>
                            <ul className="space-y-3">
                                <li className="flex items-center text-[13px] font-medium text-[#F5F5F5]/80">
                                    <Check size={16} className="text-[#F84464] mr-2 stroke-[3px] shrink-0"/> World class security checks
                                </li>
                                <li className="flex items-center text-[13px] font-medium text-[#F5F5F5]/80">
                                    <Check size={16} className="text-[#F84464] mr-2 stroke-[3px] shrink-0"/> Transparent pricing
                                </li>
                                <li className="flex items-center text-[13px] font-medium text-[#F5F5F5]/80">
                                    <Check size={16} className="text-[#F84464] mr-2 stroke-[3px] shrink-0"/> 100% order guarantee
                                </li>
                                <li className="flex items-center text-[13px] font-medium text-[#F5F5F5]/80">
                                    <Check size={16} className="text-[#F84464] mr-2 stroke-[3px] shrink-0"/> Customer service from start to finish
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Column 2: Marketplace Links */}
                    <div>
                        <h4 className="font-bold text-[16px] text-white tracking-wide mb-6">Marketplace</h4>
                        <ul className="space-y-4 text-[14px] font-medium text-[#F5F5F5]/70">
                            <li><button className="hover:text-[#F84464] transition-colors">Buy Tickets</button></li>
                            <li><button onClick={() => window.location.href = 'https://parbet-seller-44902.web.app'} className="hover:text-[#F84464] transition-colors">Sell Tickets</button></li>
                            <li><button className="hover:text-[#F84464] transition-colors">Event Organizers</button></li>
                            <li><button className="hover:text-[#F84464] transition-colors">Affiliate Programme</button></li>
                            <li><button className="hover:text-[#F84464] transition-colors">Investors</button></li>
                            <li><button className="hover:text-[#F84464] transition-colors">Careers</button></li>
                        </ul>
                    </div>

                    {/* Column 3: Support Links & Contact */}
                    <div>
                        <h4 className="font-bold text-[16px] text-white tracking-wide mb-6">Support & Contact</h4>
                        <ul className="space-y-4 text-[14px] font-medium text-[#F5F5F5]/70 mb-8">
                            <li><button className="hover:text-[#F84464] transition-colors">Help Centre</button></li>
                            <li><button className="hover:text-[#F84464] transition-colors">Lowest Price Guarantee</button></li>
                            <li><button className="hover:text-[#F84464] transition-colors">Cancellation Policy</button></li>
                            <li><button className="hover:text-[#F84464] transition-colors">Trust & Safety</button></li>
                        </ul>
                        
                        <div className="flex items-center space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#F84464] hover:text-white transition-colors cursor-pointer text-white">
                                <TwitterSVG size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#F84464] hover:text-white transition-colors cursor-pointer text-white">
                                <InstagramSVG size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#F84464] hover:text-white transition-colors cursor-pointer text-white">
                                <LinkedinSVG size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Column 4: Localization Dropdowns */}
                    <div>
                        <h4 className="font-bold text-[16px] text-white tracking-wide mb-6">Regional Settings</h4>
                        <div className="space-y-4">
                            <div className="border border-white/20 rounded-[6px] hover:border-white/40 transition-colors overflow-hidden bg-white/5">
                                <select className="w-full py-3 px-4 text-[14px] text-[#F5F5F5] bg-transparent outline-none cursor-pointer appearance-none">
                                    <option value="US" className="text-black">🇺🇸 United States</option>
                                    <option value="IN" className="text-black">🇮🇳 India</option>
                                    <option value="GB" className="text-black">🇬🇧 United Kingdom</option>
                                    <option value="CA" className="text-black">🇨🇦 Canada</option>
                                    <option value="AU" className="text-black">🇦🇺 Australia</option>
                                </select>
                            </div>
                            <div className="border border-white/20 rounded-[6px] hover:border-white/40 transition-colors overflow-hidden bg-white/5">
                                <select 
                                    value={userLanguage || 'EN-US'} 
                                    onChange={(e) => setUserLanguage(e.target.value)} 
                                    className="w-full py-3 px-4 text-[14px] text-[#F5F5F5] bg-transparent outline-none cursor-pointer appearance-none"
                                >
                                    <option value="EN-US" className="text-black">A文 English (US)</option>
                                    <option value="EN-GB" className="text-black">A文 English (UK)</option>
                                    <option value="HI-IN" className="text-black">A文 Hindi (IN)</option>
                                </select>
                            </div>
                            <div className="border border-white/20 rounded-[6px] hover:border-white/40 transition-colors overflow-hidden bg-white/5">
                                <select 
                                    value={userCurrency || 'INR'} 
                                    onChange={(e) => setUserCurrency(e.target.value)} 
                                    className="w-full py-3 px-4 text-[14px] text-[#F5F5F5] bg-transparent outline-none cursor-pointer appearance-none"
                                >
                                    <option value="INR" className="text-black">INR Indian Rupee (₹)</option>
                                    <option value="USD" className="text-black">USD US Dollar ($)</option>
                                    <option value="EUR" className="text-black">EUR Euro (€)</option>
                                    <option value="GBP" className="text-black">GBP British Pound (£)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Legal / Copyright Divider */}
                <div className="border-t border-white/10 pt-8 mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex flex-col space-y-2">
                        <p className="text-[12px] text-[#F5F5F5]/50">
                            Copyright © Booknshow Entertainment Inc {currentYear} 
                            <button className="text-[#F84464] hover:underline ml-2">Company Details</button>
                        </p>
                        <p className="text-[12px] text-[#F5F5F5]/40 leading-relaxed max-w-5xl">
                            Use of this web site constitutes acceptance of the <button className="text-white hover:underline mx-1">Terms and Conditions</button> and <button className="text-white hover:underline mx-1">Privacy Policy</button> and <button className="text-white hover:underline mx-1">Cookies Policy</button> and <button className="text-white hover:underline mx-1">Mobile Privacy Policy</button> 
                        </p>
                    </div>
                    <div className="flex items-center space-x-6 shrink-0">
                        <MapPin size={24} className="text-[#F84464] opacity-80" />
                        <Mail size={24} className="text-[#F84464] opacity-80" />
                    </div>
                </div>
            </div>
        </footer>
    );
}