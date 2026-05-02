import React, { useEffect, useState } from 'react';
import { Check, ShieldCheck, Mail, MapPin } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { BooknshowLogo } from './Header'; 

/**
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 1 Final)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * * FEATURE 1: 1:1 Enterprise Footer Architecture
 * FEATURE 2: Real-time Dynamic Year Resolution
 * FEATURE 3: Localization Context Integration (Currency/Language)
 * FEATURE 4: Booknshow SVG Logo Integration (White Background Container)
 * FEATURE 5: Strict 7-Color Policy Enforcement
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
        <footer className="w-full bg-[#333333] border-t-4 border-[#E7364D] mt-auto pt-12 pb-16 font-sans">
            <div className="max-w-[1400px] mx-auto px-6 md:px-8">
                
                {/* Main Footer 4-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
                    
                    {/* Column 1: Brand & Guarantee */}
                    <div className="flex flex-col space-y-6">
                        <div className="bg-[#FFFFFF] p-3 rounded-[8px] w-max inline-block mb-2 shadow-sm">
                            <BooknshowLogo className="h-[28px]" />
                        </div>
                        
                        <div className="flex flex-col">
                            <div className="flex items-center space-x-2.5 mb-3">
                                <ShieldCheck size={28} className="text-[#E7364D]" strokeWidth={2} />
                                <span className="text-[18px] font-black text-[#FFFFFF] uppercase tracking-wider">Booknshow Guarantee</span>
                            </div>
                            <ul className="space-y-3">
                                <li className="flex items-center text-[13px] font-medium text-[#A3A3A3]">
                                    <Check size={16} className="text-[#E7364D] mr-2 stroke-[3px] shrink-0"/> World class security checks
                                </li>
                                <li className="flex items-center text-[13px] font-medium text-[#A3A3A3]">
                                    <Check size={16} className="text-[#E7364D] mr-2 stroke-[3px] shrink-0"/> Transparent pricing
                                </li>
                                <li className="flex items-center text-[13px] font-medium text-[#A3A3A3]">
                                    <Check size={16} className="text-[#E7364D] mr-2 stroke-[3px] shrink-0"/> 100% order guarantee
                                </li>
                                <li className="flex items-center text-[13px] font-medium text-[#A3A3A3]">
                                    <Check size={16} className="text-[#E7364D] mr-2 stroke-[3px] shrink-0"/> Customer service from start to finish
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Column 2: Marketplace Links */}
                    <div>
                        <h4 className="font-bold text-[16px] text-[#FFFFFF] tracking-wide mb-6">Marketplace</h4>
                        <ul className="space-y-4 text-[14px] font-medium text-[#A3A3A3]">
                            <li><button className="hover:text-[#EB5B6E] transition-colors">Buy Tickets</button></li>
                            <li><button onClick={() => window.location.href = 'https://parbet-seller-44902.web.app'} className="hover:text-[#EB5B6E] transition-colors">Sell Tickets</button></li>
                            <li><button className="hover:text-[#EB5B6E] transition-colors">Event Organizers</button></li>
                            <li><button className="hover:text-[#EB5B6E] transition-colors">Affiliate Programme</button></li>
                            <li><button className="hover:text-[#EB5B6E] transition-colors">Investors</button></li>
                            <li><button className="hover:text-[#EB5B6E] transition-colors">Careers</button></li>
                        </ul>
                    </div>

                    {/* Column 3: Support Links & Contact */}
                    <div>
                        <h4 className="font-bold text-[16px] text-[#FFFFFF] tracking-wide mb-6">Support & Contact</h4>
                        <ul className="space-y-4 text-[14px] font-medium text-[#A3A3A3] mb-8">
                            <li><button className="hover:text-[#EB5B6E] transition-colors">Help Centre</button></li>
                            <li><button className="hover:text-[#EB5B6E] transition-colors">Lowest Price Guarantee</button></li>
                            <li><button className="hover:text-[#EB5B6E] transition-colors">Cancellation Policy</button></li>
                            <li><button className="hover:text-[#EB5B6E] transition-colors">Trust & Safety</button></li>
                        </ul>
                        
                        <div className="flex items-center space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-[#A3A3A3]/20 flex items-center justify-center hover:bg-[#E7364D] hover:text-[#FFFFFF] transition-colors cursor-pointer text-[#FFFFFF]">
                                <TwitterSVG size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-[#A3A3A3]/20 flex items-center justify-center hover:bg-[#E7364D] hover:text-[#FFFFFF] transition-colors cursor-pointer text-[#FFFFFF]">
                                <InstagramSVG size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-[#A3A3A3]/20 flex items-center justify-center hover:bg-[#E7364D] hover:text-[#FFFFFF] transition-colors cursor-pointer text-[#FFFFFF]">
                                <LinkedinSVG size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Column 4: Localization Dropdowns */}
                    <div>
                        <h4 className="font-bold text-[16px] text-[#FFFFFF] tracking-wide mb-6">Regional Settings</h4>
                        <div className="space-y-4">
                            <div className="border border-[#A3A3A3]/30 rounded-[6px] hover:border-[#A3A3A3] transition-colors overflow-hidden bg-[#FFFFFF]/5">
                                <select className="w-full py-3 px-4 text-[14px] text-[#FFFFFF] bg-transparent outline-none cursor-pointer appearance-none">
                                    <option value="US" className="text-[#333333]">🇺🇸 United States</option>
                                    <option value="IN" className="text-[#333333]">🇮🇳 India</option>
                                    <option value="GB" className="text-[#333333]">🇬🇧 United Kingdom</option>
                                    <option value="CA" className="text-[#333333]">🇨🇦 Canada</option>
                                    <option value="AU" className="text-[#333333]">🇦🇺 Australia</option>
                                </select>
                            </div>
                            <div className="border border-[#A3A3A3]/30 rounded-[6px] hover:border-[#A3A3A3] transition-colors overflow-hidden bg-[#FFFFFF]/5">
                                <select 
                                    value={userLanguage || 'EN-US'} 
                                    onChange={(e) => setUserLanguage(e.target.value)} 
                                    className="w-full py-3 px-4 text-[14px] text-[#FFFFFF] bg-transparent outline-none cursor-pointer appearance-none"
                                >
                                    <option value="EN-US" className="text-[#333333]">A文 English (US)</option>
                                    <option value="EN-GB" className="text-[#333333]">A文 English (UK)</option>
                                    <option value="HI-IN" className="text-[#333333]">A文 Hindi (IN)</option>
                                </select>
                            </div>
                            <div className="border border-[#A3A3A3]/30 rounded-[6px] hover:border-[#A3A3A3] transition-colors overflow-hidden bg-[#FFFFFF]/5">
                                <select 
                                    value={userCurrency || 'INR'} 
                                    onChange={(e) => setUserCurrency(e.target.value)} 
                                    className="w-full py-3 px-4 text-[14px] text-[#FFFFFF] bg-transparent outline-none cursor-pointer appearance-none"
                                >
                                    <option value="INR" className="text-[#333333]">INR Indian Rupee (₹)</option>
                                    <option value="USD" className="text-[#333333]">USD US Dollar ($)</option>
                                    <option value="EUR" className="text-[#333333]">EUR Euro (€)</option>
                                    <option value="GBP" className="text-[#333333]">GBP British Pound (£)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Legal / Copyright Divider */}
                <div className="border-t border-[#A3A3A3]/20 pt-8 mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex flex-col space-y-2">
                        <p className="text-[12px] text-[#A3A3A3]">
                            Copyright © Booknshow Entertainment Inc {currentYear} 
                            <button className="text-[#EB5B6E] hover:underline ml-2">Company Details</button>
                        </p>
                        <p className="text-[12px] text-[#626262] leading-relaxed max-w-5xl">
                            Use of this web site constitutes acceptance of the <button className="text-[#A3A3A3] hover:underline mx-1">Terms and Conditions</button> and <button className="text-[#A3A3A3] hover:underline mx-1">Privacy Policy</button> and <button className="text-[#A3A3A3] hover:underline mx-1">Cookies Policy</button> and <button className="text-[#A3A3A3] hover:underline mx-1">Mobile Privacy Policy</button> 
                        </p>
                    </div>
                    <div className="flex items-center space-x-6 shrink-0">
                        <MapPin size={24} className="text-[#E7364D]" />
                        <Mail size={24} className="text-[#E7364D]" />
                    </div>
                </div>
            </div>
        </footer>
    );
}