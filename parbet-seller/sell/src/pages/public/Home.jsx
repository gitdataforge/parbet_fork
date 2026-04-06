import React from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const nav = useNavigate();
  return (
    <div className="animate-fade-in">
      {/* Hero Section matching screenshot 1 & 3 */}
      <div className="max-w-4xl mx-auto mt-20 px-4 text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900">Sell your tickets</h1>
        <p className="text-lg text-gray-600">parbet is the world's largest secondary marketplace for tickets to live events</p>
        
        <div className="relative max-w-2xl mx-auto mt-8">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search your event and start selling" 
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-parbetGreen focus:border-parbetGreen outline-none transition-all"
          />
        </div>

        <div className="pt-16 pb-32">
          <h2 className="text-3xl font-bold text-gray-500 mb-6">Ready to list?</h2>
          <button onClick={() => nav('/sell')} className="bg-parbetGreen hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors">
            Sell my tickets
          </button>
        </div>
      </div>

      {/* Footer matching screenshot 2 */}
      <footer className="border-t border-gray-200 bg-white mt-auto pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <span className="bg-green-100 p-1 rounded"><span className="text-parbetGreen font-bold">✓</span></span>
               <span className="font-bold text-xl">parbet guarantee</span>
            </div>
            <ul className="space-y-3 text-sm text-gray-600 font-semibold">
              <li className="flex gap-2 text-parbetGreen">✓ <span className="text-gray-700">World class security checks</span></li>
              <li className="flex gap-2 text-parbetGreen">✓ <span className="text-gray-700">Transparent pricing</span></li>
              <li className="flex gap-2 text-parbetGreen">✓ <span className="text-gray-700">100% order guarantee</span></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-gray-600">Our Company</h4>
            <ul className="space-y-3 text-sm text-gray-800">
              <li>About Us</li><li>Partners</li><li>Affiliate Programme</li><li>Careers</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-gray-600">Have Questions?</h4>
            <p className="text-sm text-gray-800">Help Centre / Contact Us</p>
          </div>
          <div className="space-y-4">
             <h4 className="font-bold text-gray-600">Live events all over the world</h4>
             <select className="w-full border p-2 rounded text-sm"><option>🇬🇧 United Kingdom</option><option>🇮🇳 India</option></select>
             <select className="w-full border p-2 rounded text-sm mt-2"><option>A English (UK)</option></select>
             <select className="w-full border p-2 rounded text-sm mt-2"><option>INR Indian Rupee</option><option>USD US Dollar</option></select>
          </div>
        </div>
      </footer>
    </div>
  );
}