import os
import subprocess

def run_command(command, description):
    print(f"EXECUTING: {description}...")
    try:
        subprocess.run(command, shell=True, check=True)
    except subprocess.CalledProcessError as e:
        print(f"ERROR during {description}: {e}")

def create_file(path, content):
    # FIXED: Check if directory name is not empty before creating
    dir_name = os.path.dirname(path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip())

def main():
    # 1. INITIALIZATION & CORE INSTALLATION
    print("--- PARBET API GATEWAY: ENTERPRISE DEPLOYMENT SCRIPT ---")
    
    # Dependencies: Vite, React, Tailwind v4, Lucide, Framer Motion, Zustand, Firebase SDK
    run_command("npm install -D vite @vitejs/plugin-react tailwindcss @tailwindcss/postcss postcss autoprefixer", "Installing Compiler Stack")
    run_command("npm install firebase lucide-react framer-motion zustand react-router-dom", "Installing Application Framework")
    run_command("npm install -g firebase-tools vercel", "Installing Global Infrastructure CLI")

    # 2. CONFIGURATION FILES (ROOT)
    create_file("postcss.config.js", """
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
""")

    create_file("tailwind.config.js", """
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        parbetGreen: '#8cc63f',
        parbetHover: '#458731',
        parbetDark: '#1a1a1a',
        parbetMuted: '#54626c',
        parbetBorder: '#e2e2e2',
        parbetBg: '#f8f9fa'
      },
      fontWeight: { black: '900', extrabold: '800' }
    },
  },
  plugins: [],
}
""")

    create_file(".env", """
VITE_FIREBASE_API_KEY="YOUR_ACTUAL_KEY"
VITE_FIREBASE_AUTH_DOMAIN="parbet-auth.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="parbet-api"
VITE_FIREBASE_STORAGE_BUCKET="parbet-api.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="SENDER_ID"
VITE_FIREBASE_APP_ID="APP_ID"
""")

    # 3. GLOBAL STYLES (Tailwind v4)
    create_file("src/index.css", """
@import "tailwindcss";

@layer base {
  :root {
    --brand-green: #8cc63f;
    --brand-dark: #1a1a1a;
  }
  html, body {
    background-color: #ffffff;
    color: #1a1a1a;
    -webkit-font-smoothing: antialiased;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    margin: 0;
    padding: 0;
  }
}

@layer utilities {
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
}
""")

    # 4. INFRASTRUCTURE & STATE
    create_file("src/lib/firebase.js", """
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
""")

    create_file("src/store/useAuthStore.js", """
import { create } from 'zustand';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

export const useAuthStore = create((set) => ({
  user: null,
  isAdmin: false,
  loading: true,
  error: null,
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      if (email !== 'testcodecfg@gmail.com') throw new Error('Unauthorized Access');
      const res = await signInWithEmailAndPassword(auth, email, password);
      set({ user: res.user, isAdmin: true, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  logout: async () => {
    await signOut(auth);
    set({ user: null, isAdmin: false });
  },
  init: () => {
    onAuthStateChanged(auth, (user) => {
      if (user && user.email === 'testcodecfg@gmail.com') {
        set({ user, isAdmin: true, loading: false });
      } else {
        set({ user: null, isAdmin: false, loading: false });
      }
    });
  }
}));
""")

    # 5. COMPONENTS
    create_file("src/components/AdminGuard.jsx", """
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function AdminGuard({ children }) {
  const { user, isAdmin, loading } = useAuthStore();
  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
  return children;
}
""")

    create_file("src/components/Layout.jsx", """
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
""")

    # 6. PAGES (10+ FEATURES EACH)
    create_file("src/pages/Login.jsx", """
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
""")

    create_file("src/pages/Gateway.jsx", """
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
""")

    create_file("src/pages/Status.jsx", """
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
""")

    create_file("src/pages/Docs.jsx", """
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
""")

    # 7. ROUTING (App.jsx)
    create_file("src/App.jsx", """
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import AdminGuard from './components/AdminGuard';
import Layout from './components/Layout';
import Login from './pages/Login';
import Gateway from './pages/Gateway';
import Status from './pages/Status';
import Docs from './pages/Docs';

export default function App() {
  const { init } = useAuthStore();
  useEffect(() => { init(); }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AdminGuard><Layout><Gateway /></Layout></AdminGuard>} />
        <Route path="/status" element={<AdminGuard><Layout><Status /></Layout></AdminGuard>} />
        <Route path="/docs" element={<AdminGuard><Layout><Docs /></Layout></AdminGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
""")

    create_file("src/main.jsx", """
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
""")

    create_file("index.html", """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Parbet API Gateway | Restricted Access</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
</body>
</html>
""")

    print("\n--- SETUP COMPLETE ---")
    print("Next Steps:")
    print("1. npm run dev (Start Development Server)")
    print("2. npm run build (Compile Production Build)")
    print("3. vercel --prod (Deploy Live)")

if __name__ == "__main__":
    main()