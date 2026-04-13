import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSellerStore } from '../store/useSellerStore';

export default function Header() {
    const navigate = useNavigate();
    
    // Extracted global logout mutation from the real-time data engine
    const { logout } = useSellerStore();

    const handleSignOut = async () => {
        await logout();
        navigate('/auth/login');
    };

    return (
        <header className="w-full bg-white shadow-sm border-b border-[#e2e2e2] relative z-50 font-sans">
            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 h-[72px] flex items-center justify-between">
                
                {/* Left: Parbet Logo (1:1 Layout Positioning) */}
                <div 
                    onClick={() => navigate('/')} 
                    className="cursor-pointer flex items-center h-full"
                >
                    <h1 className="text-[32px] font-black tracking-tighter leading-none mt-1 hover:scale-105 transition-transform duration-300">
                        <span className="text-[#54626c]">par</span><span className="text-[#8cc63f]">bet</span>
                    </h1>
                </div>

                {/* Right: Interactive Navigation Cluster */}
                <div className="flex items-center h-full">
                    
                    {/* FEATURE 1: Sell Menu Dropdown (Matches image_da28e7.png) */}
                    <div className="relative group h-full flex items-center px-4 lg:px-5">
                        <span className="text-[15px] font-bold text-[#1a1a1a] group-hover:text-[#458731] transition-colors cursor-pointer">
                            Sell
                        </span>
                        
                        {/* Invisible Hover Bridge & Dropdown Box */}
                        <div className="absolute top-full left-0 bg-white border border-[#cccccc] shadow-[0_8px_24px_rgba(0,0,0,0.12)] py-2 min-w-[220px] hidden group-hover:block z-50 rounded-b-[4px]">
                            <Link to="/sell" className="block px-5 py-2.5 text-[15px] text-[#0064d2] hover:bg-[#f8f9fa] hover:underline whitespace-nowrap">
                                Sell Tickets
                            </Link>
                            <Link to="/profile/listings" className="block px-5 py-2.5 text-[15px] text-[#0064d2] hover:bg-[#f8f9fa] hover:underline whitespace-nowrap">
                                My Tickets
                            </Link>
                            <Link to="/profile/sales" className="block px-5 py-2.5 text-[15px] text-[#0064d2] hover:bg-[#f8f9fa] hover:underline whitespace-nowrap">
                                My Sales
                            </Link>
                            <Link to="/profile/wallet" className="block px-5 py-2.5 text-[15px] text-[#0064d2] hover:bg-[#f8f9fa] hover:underline whitespace-nowrap">
                                Season Ticket Wallet
                            </Link>
                        </div>
                    </div>

                    {/* FEATURE 2: My Tickets Menu Dropdown (Matches image_da2c10.png) */}
                    <div className="relative group h-full flex items-center px-4 lg:px-5">
                        <span className="text-[15px] font-bold text-[#1a1a1a] group-hover:text-[#458731] transition-colors cursor-pointer">
                            My Tickets
                        </span>
                        
                        <div className="absolute top-full left-0 bg-white border border-[#cccccc] shadow-[0_8px_24px_rgba(0,0,0,0.12)] py-2 min-w-[200px] hidden group-hover:block z-50 rounded-b-[4px]">
                            <Link to="/profile/orders" className="block px-5 py-2.5 text-[15px] text-[#0064d2] hover:bg-[#f8f9fa] hover:underline whitespace-nowrap">
                                Orders
                            </Link>
                            <Link to="/profile/listings" className="block px-5 py-2.5 text-[15px] text-[#0064d2] hover:bg-[#f8f9fa] hover:underline whitespace-nowrap">
                                My Listings
                            </Link>
                            <Link to="/profile/sales" className="block px-5 py-2.5 text-[15px] text-[#0064d2] hover:bg-[#f8f9fa] hover:underline whitespace-nowrap">
                                My Sales
                            </Link>
                            <Link to="/profile/wallet" className="block px-5 py-2.5 text-[15px] text-[#0064d2] hover:bg-[#f8f9fa] hover:underline whitespace-nowrap">
                                Payments
                            </Link>
                        </div>
                    </div>

                    {/* FEATURE 3: Profile Menu & User Icon Dropdown (Matches image_da304b.png & image_da338f.png) */}
                    <div className="relative group h-full flex items-center pl-4 lg:pl-5 cursor-pointer">
                        <span className="text-[15px] font-bold text-[#1a1a1a] group-hover:text-[#458731] transition-colors mr-3">
                            Profile
                        </span>
                        
                        {/* Solid Green User Profile Icon (Exact Replica) */}
                        <div className="w-[36px] h-[36px] rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 group-hover:border-[#458731] transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#458731" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" />
                            </svg>
                        </div>

                        <div className="absolute top-full right-0 bg-white border border-[#cccccc] shadow-[0_8px_24px_rgba(0,0,0,0.12)] py-2 min-w-[180px] hidden group-hover:block z-50 rounded-b-[4px]">
                            <Link to="/profile" className="block px-5 py-2.5 text-[15px] text-[#0064d2] hover:bg-[#f8f9fa] hover:underline whitespace-nowrap text-left">
                                My Hub
                            </Link>
                            <Link to="/profile" className="block px-5 py-2.5 text-[15px] text-[#0064d2] hover:bg-[#f8f9fa] hover:underline whitespace-nowrap text-left">
                                Settings
                            </Link>
                            <button 
                                onClick={handleSignOut} 
                                className="block w-full px-5 py-2.5 text-[15px] text-[#0064d2] hover:bg-[#f8f9fa] hover:underline whitespace-nowrap text-left"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </header>
    );
}