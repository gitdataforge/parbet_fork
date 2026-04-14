import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Globe, Zap, Server, Code, Database, Lock, Cpu, Terminal } from 'lucide-react';

export default function Gateway() {
  const [time, setTime] = useState(new Date().toISOString().split('T')[1].split('.')[0] + ' Z');
  useEffect(() => { const t = setInterval(() => setTime(new Date().toISOString().split('T')[1].split('.')[0] + ' Z'), 1000); return () => clearInterval(t); }, []);

  return (
    <div className="max-w-[1280px] mx-auto px-12 py-16">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-20">
        <h1 className="text-[64px] font-black tracking-tighter leading-none mb-6">API Gateway Restricted</h1>
        <p className="text-[20px] text-[#54626c] font-medium max-w-[800px]">Strategic microservices routing for the Parbet Global Marketplace. Secure transaction processing and identity verification engine.</p>
      </motion.div>
      <div className="grid grid-cols-3 gap-8 mb-20">
        <div className="border border-[#e2e2e2] p-8 rounded-[16px] hover:border-[#8cc63f] transition-all"><Globe className="text-[#8cc63f] mb-4"/><div className="text-[11px] font-black text-[#9ca3af] uppercase mb-2">System Time (UTC)</div><div className="text-[32px] font-black">{time}</div></div>
        <div className="border border-[#e2e2e2] p-8 rounded-[16px] hover:border-[#8cc63f] transition-all"><Zap className="text-[#c21c3a] mb-4"/><div className="text-[11px] font-black text-[#9ca3af] uppercase mb-2">Network Latency</div><div className="text-[32px] font-black">1904 ms</div></div>
        <div className="border border-[#e2e2e2] p-8 rounded-[16px] hover:border-[#8cc63f] transition-all"><Server className="text-[#8cc63f] mb-4"/><div className="text-[11px] font-black text-[#9ca3af] uppercase mb-2">Environment</div><div className="text-[32px] font-black text-[#8cc63f]">Production</div></div>
      </div>
      <div className="bg-[#fdf2f2] border border-[#fecaca] rounded-[16px] p-10 mb-24">
        <h3 className="text-[#c21c3a] text-[20px] font-black mb-6 flex items-center gap-3"><ShieldCheck/> Strict Origin Policy Enforced</h3>
        <div className="grid grid-cols-2 gap-6 text-[15px] font-bold">
          <div className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#c21c3a]"/> CORS validation active</div>
          <div className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#c21c3a]"/> Vercel Domain verification</div>
          <div className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#c21c3a]"/> Firebase Admin Handshake</div>
          <div className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-[#c21c3a]"/> Rate Limiting Active</div>
        </div>
      </div>
      <div className="space-y-12">
        <h2 className="text-[32px] font-black border-b pb-4">1. Security & Identity</h2>
        <div className="grid gap-4">
          <Endpoint method="POST" path="/api/v1/auth/verify" status="LIVE" desc="Cryptographic verification of session tokens."/>
          <Endpoint method="POST" path="/api/v1/auth/reset" status="LIVE" desc="Global password recovery synchronization."/>
        </div>
      </div>
    </div>
  );
}

function Endpoint({ method, path, status, desc }) {
  return (
    <div className="border p-6 rounded-[12px] flex items-center justify-between hover:shadow-lg transition-all group">
      <div className="flex items-center gap-6">
        <span className="bg-[#1a1a1a] text-white px-3 py-1 rounded text-[11px] font-black">{method}</span>
        <span className="text-[18px] font-bold text-[#2563eb] group-hover:underline">{path}</span>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-black uppercase text-[#8cc63f] mb-1">{status}</div>
        <div className="text-[14px] text-[#54626c] font-medium">{desc}</div>
      </div>
    </div>
  );
}