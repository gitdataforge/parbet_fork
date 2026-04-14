import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const { login, loading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [persistent, setPersistent] = useState(true);

  const handleAuth = (e) => { e.preventDefault(); login(email, password); };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center pt-24 px-6 antialiased">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[48px] font-black tracking-tighter mb-8"><span className="text-[#54626c]">par</span><span className="text-[#8cc63f]">bet</span></motion.div>
      <h1 className="text-[32px] font-bold mb-12">Sign in to parbet</h1>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[420px]">
        <AnimatePresence>{error && <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mb-6 bg-[#fdf2f2] border-l-4 border-[#c21c3a] p-4 text-[#c21c3a] text-[13px] font-bold">{error}</motion.div>}</AnimatePresence>
        <form onSubmit={handleAuth} className="flex flex-col gap-6">
          <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={20}/><input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 border rounded-[6px] outline-none focus:border-[#8cc63f]"/></div>
          <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" size={20}/><input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-14 py-4 border rounded-[6px] outline-none focus:border-[#8cc63f]"/><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">{showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}</button></div>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPersistent(!persistent)}><div className={`w-5 h-5 rounded border flex items-center justify-center ${persistent ? 'bg-[#8cc63f] border-[#8cc63f]' : 'bg-white border-[#e2e2e2]'}`}>{persistent && <CheckCircle2 size={14} className="text-white"/>}</div><span className="text-[14px] font-bold">Stay logged in</span></div>
          <button disabled={loading} className="w-full py-4 bg-[#e2e2e2] hover:bg-[#8cc63f] hover:text-white font-black rounded-[6px] transition-all">{loading ? 'Processing...' : 'Continue'}</button>
        </form>
        <div className="mt-12 text-center text-[12px] text-[#9ca3af] font-bold uppercase tracking-widest px-10">Authorized engineering access only. Security logs active.</div>
      </motion.div>
    </div>
  );
}