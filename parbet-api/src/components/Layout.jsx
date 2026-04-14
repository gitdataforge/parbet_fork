import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Activity, FileText, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Layout({ children }) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <header className="h-20 border-b border-[#f0f0f0] px-12 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-50">
        <Link to="/" className="text-[32px] font-black tracking-tighter">
          <span className="text-[#54626c]">par</span><span className="text-[#8cc63f]">bet</span>
          <span className="ml-2 px-1.5 py-0.5 bg-[#f8f9fa] border border-[#e2e2e2] rounded text-[10px] font-mono font-bold uppercase tracking-widest text-[#54626c]">api</span>
        </Link>
        <nav className="flex items-center gap-10 text-[14px] font-bold">
          <Link to="/status" className="hover:text-[#8cc63f] transition-colors">Status</Link>
          <Link to="/docs" className="hover:text-[#8cc63f] transition-colors">Documentation</Link>
          <div className="flex items-center gap-4 border-l pl-10 border-[#f0f0f0]">
            <div className="w-10 h-10 rounded-full bg-[#f8f9fa] border flex items-center justify-center text-[#54626c]"><User size={20}/></div>
            <button onClick={() => { logout(); navigate('/login'); }} className="text-[#c21c3a]"><LogOut size={20}/></button>
          </div>
        </nav>
      </header>
      <main className="flex-grow">{children}</main>
      <footer className="border-t border-[#f0f0f0] py-12 px-12 bg-white mt-20">
        <div className="max-w-[1440px] mx-auto grid grid-cols-4 gap-12">
          <div><div className="text-[24px] font-black text-[#54626c] mb-4">par<span className="text-[#8cc63f]">bet</span></div><p className="text-[12px] font-bold text-[#9ca3af] uppercase">Enterprise Infrastructure Tier</p></div>
          <div className="flex flex-col gap-3 font-bold text-[14px]"><span className="text-[#9ca3af] uppercase text-[11px]">Resources</span><Link to="/status">API Status</Link><Link to="/docs">Documentation</Link></div>
          <div className="flex flex-col gap-3 font-bold text-[14px]"><span className="text-[#9ca3af] uppercase text-[11px]">Security</span><span>AES-256 GCM</span><span>SSL Certified</span></div>
          <div className="flex flex-col gap-3 font-bold text-[14px]"><span className="text-[#9ca3af] uppercase text-[11px]">Region</span><span>Global Edge</span><span>AWS / Vercel</span></div>
        </div>
      </footer>
    </div>
  );
}