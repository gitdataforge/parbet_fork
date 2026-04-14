import React from 'react';
import { CheckCircle2, AlertCircle, RefreshCcw, Activity } from 'lucide-react';

export default function Status() {
  return (
    <div className="max-w-[1200px] mx-auto px-12 py-20">
      <div className="flex items-center justify-between mb-16">
        <h1 className="text-[48px] font-black tracking-tighter">System Status</h1>
        <div className="flex items-center gap-2 text-[#8cc63f] font-bold bg-[#f2f7ef] px-4 py-2 rounded-full border border-[#8cc63f]/20"><Activity size={18}/> All Systems Operational</div>
      </div>
      <div className="grid gap-6">
        <StatusRow name="Identity Service" uptime="100%" ping="12ms"/>
        <StatusRow name="Transaction Engine" uptime="99.98%" ping="45ms"/>
        <StatusRow name="Firestore Cluster" uptime="100%" ping="8ms"/>
        <StatusRow name="Email SMTP (Resend)" uptime="100%" ping="110ms"/>
        <StatusRow name="Edge Compute (Vercel)" uptime="100%" ping="4ms"/>
        <StatusRow name="Payment Webhooks" uptime="100%" ping="65ms"/>
      </div>
    </div>
  );
}

function StatusRow({ name, uptime, ping }) {
  return (
    <div className="flex items-center justify-between p-8 border rounded-[16px] bg-[#f8f9fa]/50">
      <div className="flex items-center gap-4"><CheckCircle2 className="text-[#8cc63f]"/><span className="text-[18px] font-bold">{name}</span></div>
      <div className="flex gap-12 font-bold text-[14px]">
        <div className="text-center"><div className="text-[#9ca3af] uppercase text-[10px] mb-1">Uptime</div><div>{uptime}</div></div>
        <div className="text-center"><div className="text-[#9ca3af] uppercase text-[10px] mb-1">Latency</div><div>{ping}</div></div>
      </div>
    </div>
  );
}