import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { UserCircle, Search } from 'lucide-react';
import Home from './pages/public/Home';
import Dashboard from './pages/seller/Dashboard';
import ListingWizardWrapper from './pages/seller/ListingWizardWrapper';

// Strict 2-line animated hamburger component
const Hamburger = ({ isOpen, toggle }) => (
  <button onClick={toggle} className="md:hidden relative w-6 h-5 flex flex-col justify-between items-center focus:outline-none z-50">
    <span className={`block h-0.5 w-full bg-gray-800 transition-all duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
    <span className={`block h-0.5 w-full bg-gray-800 transition-all duration-300 ease-in-out ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
  </button>
);

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigate();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        {/* Exact Typography requested */}
        <Link to="/" className="text-3xl font-extrabold tracking-tighter text-gray-800">
          par<span className="text-parbetGreen">bet</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-800">
          <Link to="/sell" className="hover:text-parbetGreen transition-colors">Sell</Link>
          <Link to="/dashboard" className="hover:text-parbetGreen transition-colors">My Tickets</Link>
          <Link to="/dashboard" className="flex items-center gap-2 hover:text-parbetGreen transition-colors">
            Profile <UserCircle className="text-parbetGreen" size={24}/>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <Hamburger isOpen={menuOpen} toggle={() => setMenuOpen(!menuOpen)} />
      </div>

      {/* Mobile Animated Dropdown */}
      <div className={`md:hidden absolute w-full bg-white border-b overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-64 shadow-lg' : 'max-h-0'}`}>
        <div className="flex flex-col p-4 space-y-4 font-semibold text-gray-800 text-center">
          <Link to="/sell" onClick={() => setMenuOpen(false)}>Sell</Link>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}>My Tickets</Link>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Profile</Link>
        </div>
      </div>
    </nav>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sell" element={<ListingWizardWrapper />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}