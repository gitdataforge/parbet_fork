import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="w-full bg-white pt-10 md:pt-16 pb-8 md:pb-12 font-sans border-t border-[#e2e2e2] mt-auto">
            {/* Responsive Container: Fluid on mobile, fixed width on desktop */}
            <div className="w-full max-w-[1200px] mx-auto px-5 md:px-8">
                
                {/* Grid System: 
                    1 Column on Mobile (stacked). 4 Columns on Desktop.
                    We use 'order' classes to shift Localization to the top on mobile, 
                    but keep it on the far right on desktop.
                */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-y-10 md:gap-x-12 mb-2 md:mb-10">
                    
                    {/* 1:1 Replica Localization Section (Mobile: 1st, Desktop: 4th) */}
                    <div className="flex flex-col order-1 md:order-4">
                        <h3 className="text-[16px] font-bold text-[#54626c] mb-4 md:mb-6">Live events all over the world</h3>
                        
                        <button className="w-full flex items-center justify-start border border-[#cccccc] rounded-[6px] px-4 py-3.5 mb-4 hover:bg-gray-50 transition-colors shadow-sm">
                            <span className="mr-3 text-[18px] leading-none">🇺🇸</span>
                            <span className="text-[15px] text-[#54626c]">United States</span>
                        </button>
                        
                        <div className="w-full border border-[#cccccc] rounded-[6px] flex flex-col hover:bg-gray-50 transition-colors cursor-pointer shadow-sm">
                            <div className="flex items-center px-4 py-3.5 border-b border-[#cccccc]">
                                <span className="text-[15px] font-serif text-[#54626c] mr-3 shrink-0">あA</span>
                                <span className="text-[15px] text-[#54626c]">English (UK)</span>
                            </div>
                            <div className="flex items-center px-4 py-3.5">
                                <span className="text-[14px] text-gray-500 mr-3 font-mono tracking-wide w-5">INR</span>
                                <span className="text-[15px] text-[#54626c]">Indian Rupee</span>
                            </div>
                        </div>
                    </div>

                    {/* 1:1 Replica Guarantee Section (Mobile: 2nd, Desktop: 1st) */}
                    <div className="flex flex-col order-2 md:order-1">
                        <div className="flex items-center mb-5 md:mb-6">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="mr-3 shrink-0" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#8cc63f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M9 12l2 2 4-4" stroke="#8cc63f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <div className="flex flex-col leading-none mt-1">
                                <span className="text-[22px] md:text-[24px] font-black tracking-tighter text-[#1a1a1a] leading-none">
                                    <span className="text-[#54626c]">par</span><span className="text-[#8cc63f]">bet</span>
                                </span>
                                <span className="text-[17px] md:text-[18px] font-normal text-[#54626c] tracking-tight">guarantee</span>
                            </div>
                        </div>
                        
                        <ul className="space-y-4 md:space-y-5">
                            {[
                                'World class security checks', 
                                'Transparent pricing', 
                                '100% order guarantee', 
                                'Customer service from start to finish'
                            ].map(text => (
                                <li key={text} className="flex items-start text-[14px] font-bold text-[#54626c]">
                                    <Check size={18} className="text-[#8cc63f] mr-3 mt-0.5 shrink-0" strokeWidth={3} />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 1:1 Replica Our Company Links (Mobile: 3rd, Desktop: 2nd) */}
                    <div className="flex flex-col order-3 md:order-2">
                        <h3 className="text-[16px] font-bold text-[#54626c] mb-4 md:mb-6">Our Company</h3>
                        <ul className="space-y-4 md:space-y-5">
                            {[
                                'About Us', 
                                'Partners', 
                                'Affiliate Programme', 
                                'Corporate Service', 
                                'Careers', 
                                'Event Organisers'
                            ].map(text => (
                                <li key={text}>
                                    <Link to="/" className="text-[15px] md:text-[14px] text-[#1a1a1a] hover:text-[#458731] transition-colors">
                                        {text}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 1:1 Replica Have Questions Links (Mobile: 4th, Desktop: 3rd) */}
                    <div className="flex flex-col order-4 md:order-3">
                        <h3 className="text-[16px] font-bold text-[#54626c] mb-4 md:mb-6">Have Questions?</h3>
                        <ul className="space-y-4 md:space-y-5">
                            <li>
                                <Link to="/" className="text-[15px] md:text-[14px] text-[#1a1a1a] hover:text-[#458731] transition-colors">
                                    Help Centre / Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Horizontal Divider */}
                <div className="w-full h-px bg-[#cccccc] my-6 md:my-8"></div>

                {/* 1:1 Replica Legal Text */}
                <div className="flex flex-col pb-4">
                    <p className="text-[12px] text-[#54626c] leading-relaxed">
                        Copyright © parbet Entertainment Inc 2026 <Link to="/" className="text-[#458731] font-medium hover:underline">Company Details</Link><br/>
                        Use of this web site constitutes acceptance of the <Link to="/" className="text-[#458731] font-medium hover:underline">Terms and Conditions</Link> and <Link to="/" className="text-[#458731] font-medium hover:underline">Privacy Policy</Link> and <Link to="/" className="text-[#458731] font-medium hover:underline">Cookies Policy</Link> and <Link to="/" className="text-[#458731] font-medium hover:underline">Mobile Privacy Policy</Link>
                        <br className="hidden md:block"/>
                        <Link to="/" className="text-[#458731] font-medium mt-1 inline-block hover:underline">Do Not Share My Personal Information/Your Privacy Choices</Link>
                    </p>
                </div>
                
            </div>
        </footer>
    );
}