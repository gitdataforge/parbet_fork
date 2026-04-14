import React from 'react';
import { Book, Code, Terminal, Key, Shield } from 'lucide-react';

export default function Docs() {
  return (
    <div className="max-w-[1200px] mx-auto px-12 py-20 flex gap-20">
      <aside className="w-[280px] sticky top-32 h-fit flex flex-col gap-8">
        <div className="font-black text-[12px] uppercase text-[#9ca3af] tracking-widest">Introduction</div>
        <div className="flex flex-col gap-4 font-bold text-[15px]"><span className="text-[#8cc63f]">Getting Started</span><span>Authentication</span><span>Error Codes</span><span>Rate Limits</span></div>
        <div className="font-black text-[12px] uppercase text-[#9ca3af] tracking-widest">Endpoints</div>
        <div className="flex flex-col gap-4 font-bold text-[15px]"><span>User API</span><span>Ticket API</span><span>Financial API</span></div>
      </aside>
      <main className="flex-1 space-y-16">
        <section>
          <h1 className="text-[48px] font-black tracking-tighter mb-6">Getting Started</h1>
          <p className="text-[18px] text-[#54626c] font-medium leading-relaxed">The Parbet API is organized around REST. Our API has predictable resource-oriented URLs, accepts form-encoded request bodies, and returns JSON-encoded responses.</p>
        </section>
        <section className="bg-[#1a1a1a] p-8 rounded-[12px] text-[#8cc63f] font-mono text-[14px] shadow-2xl">
          <div className="flex items-center gap-2 mb-4 text-[#9ca3af] uppercase text-[10px] font-bold"><Terminal size={14}/> Authentication Header</div>
          <div className="text-white">Authorization: <span className="text-[#8cc63f]">Bearer</span> parbet_live_sk_84hd...</div>
        </section>
        <section className="space-y-6">
          <h2 className="text-[32px] font-black tracking-tighter">Security Standards</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="border p-6 rounded-[12px] font-bold"><Shield className="mb-3 text-[#8cc63f]"/> AES-256 Encryption</div>
            <div className="border p-6 rounded-[12px] font-bold"><Key className="mb-3 text-[#8cc63f]"/> RSA Key Rotation</div>
          </div>
        </section>
      </main>
    </div>
  );
}