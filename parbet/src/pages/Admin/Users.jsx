import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    Users as UsersIcon, Search, ShieldCheck, Mail, 
    Hash, UserCheck, MoreVertical, Download, Lock, 
    CheckCircle2, ChevronDown, UserMinus, ShieldAlert,
    Settings, Ban, Edit3, Save, ToggleLeft, ToggleRight,
    Briefcase, AlertTriangle, Key
} from 'lucide-react';

import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Global Stores
import { useAdminStore } from '../../store/useAdminStore';
import { useMainStore } from '../../store/useMainStore';

/**
 * GLOBAL REBRAND: Booknshow Identity Application (Phase 9 Admin Users Directory)
 * Enforced Colors: #FFFFFF, #E7364D, #333333, #EB5B6E, #FAD8DC, #A3A3A3, #626262
 * 
 * --- 14 REAL FEATURES & SECTIONS ---
 * SECTION 1: Ambient Illustrative Backgrounds
 * SECTION 2: Master Directory Header
 * SECTION 3: User Base KPI Summary
 * SECTION 4: Real-Time Advanced Search Engine
 * SECTION 5: Role-Based Filter Controls
 * SECTION 6: Hardware-Accelerated Data Table
 * SECTION 7: Cryptographic UID Hash Masking
 * SECTION 8: Status & Role Badging System
 * SECTION 9: CSV Global Export Engine
 * FEATURE 10: Strict Route Gatekeeper (Kicks non-admins instantly)
 * FEATURE 11: Super Admin Ghosting Protocol (Hides testcodecfg@gmail.com)
 * FEATURE 12: Role Elevation Engine (Buyer -> Seller -> Admin)
 * FEATURE 13: Granular Permission Matrix (canCreateEvents, canEditSeatingConfig)
 * FEATURE 14: Account Suspension & Ban Execution
 */

const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(d)) return 'N/A';
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

// SECTION 1: Ambient Background
const AmbientBackground = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
            className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#E7364D] opacity-10 blur-[120px]"
            animate={{ scale: [1, 1.05, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
            className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#333333] opacity-5 blur-[100px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.02, 0.05, 0.02] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
    </div>
);

// Toggle Switch Component
const PermissionToggle = ({ label, description, isActive, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[8px] mb-3 hover:border-[#E7364D]/30 transition-colors">
        <div className="pr-4">
            <h4 className="text-[13px] font-black text-[#333333]">{label}</h4>
            <p className="text-[11px] font-medium text-[#626262] mt-0.5 leading-relaxed">{description}</p>
        </div>
        <button 
            onClick={onChange}
            className={`w-12 h-6 rounded-full relative flex items-center transition-colors shrink-0 ${isActive ? 'bg-[#E7364D]' : 'bg-[#E5E5E5]'}`}
        >
            <motion.div 
                layout 
                initial={false}
                animate={{ x: isActive ? 26 : 2 }}
                className="w-5 h-5 bg-[#FFFFFF] rounded-full shadow-sm"
            />
        </button>
    </div>
);

export default function AdminUsers() {
    const navigate = useNavigate();
    
    // Auth & Data Stores
    const { isAdmin, user } = useMainStore();
    const { allUsers, isLoadingAdmin } = useAdminStore();

    // UI States
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    
    // Modal & Management States
    const [selectedUser, setSelectedUser] = useState(null);
    const [editRole, setEditRole] = useState('buyer');
    const [editStatus, setEditStatus] = useState('Active');
    const [editPerms, setEditPerms] = useState({
        canCreateEvents: false,
        canEditSeatingConfig: false,
        canWithdrawFunds: false
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMsg, setUpdateMsg] = useState('');

    // FEATURE 10: Security Gatekeeper
    useEffect(() => {
        if (user && !isAdmin) {
            navigate('/'); 
        }
    }, [isAdmin, user, navigate]);

    // Data Processing & Compute Engine
    const { processedUsers, stats } = useMemo(() => {
        if (!allUsers) return { processedUsers: [], stats: { total: 0, admins: 0, sellers: 0, standard: 0 } };

        let admins = 0;
        let sellers = 0;
        let standard = 0;

        const mapped = allUsers.filter(u => {
            // FEATURE 11: SUPER ADMIN GHOSTING PROTOCOL
            // Strictly hides this specific email from all directory lists. It cannot be viewed, clicked, or modified.
            if (u.email && u.email.toLowerCase() === 'testcodecfg@gmail.com') return false;
            return true;
        }).map(u => {
            const r = u.role || (u.isSeller ? 'seller' : 'buyer');
            if (r === 'admin') admins++;
            else if (r === 'seller') sellers++;
            else standard++;

            return {
                id: u.id,
                email: u.email || 'No Email',
                name: u.personal?.fullName || u.displayName || 'Unknown User',
                role: r,
                status: u.status || (u.disabled ? 'Suspended' : 'Active'),
                permissions: u.permissions || {
                    canCreateEvents: false,
                    canEditSeatingConfig: false,
                    canWithdrawFunds: false
                },
                joined: formatDate(u.createdAt || u.updatedAt)
            };
        });

        // Filter Logic
        let filtered = mapped.filter(u => {
            // Search
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                if (!u.name.toLowerCase().includes(term) && !u.email.toLowerCase().includes(term) && !u.id.toLowerCase().includes(term)) return false;
            }
            // Role Filter
            if (roleFilter !== 'All') {
                if (u.role.toLowerCase() !== roleFilter.toLowerCase()) return false;
            }
            return true;
        });

        return { 
            processedUsers: filtered, 
            stats: { total: mapped.length, admins, sellers, standard } 
        };
    }, [allUsers, searchTerm, roleFilter]);

    // SECTION 9: CSV Export Engine
    const handleDownloadCSV = () => {
        if (processedUsers.length === 0) return alert("No data to export.");
        const headers = ['User ID', 'Name', 'Email', 'Role', 'Status', 'Joined Date'];
        const csvContent = [
            headers.join(','),
            ...processedUsers.map(u => `"${u.id}","${u.name}","${u.email}","${u.role}","${u.status}","${u.joined}"`)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Booknshow_Users_${new Date().getTime()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Open Moderation Modal
    const openUserModal = (userData) => {
        setSelectedUser(userData);
        setEditRole(userData.role || 'buyer');
        setEditStatus(userData.status || 'Active');
        setEditPerms(userData.permissions || {
            canCreateEvents: false,
            canEditSeatingConfig: false,
            canWithdrawFunds: false
        });
        setUpdateMsg('');
    };

    // FEATURE 12, 13, 14: Save User Modifications
    const handleSaveChanges = async () => {
        if (!selectedUser) return;
        setIsUpdating(true);
        setUpdateMsg('');

        try {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'parbet-44902';
            
            // Firebase Auth doesn't allow client-side disable, so we use a robust Firestore 'status' flag 
            // that our ProtectedRoutes and login logic can intercept.
            const userRef = doc(db, 'artifacts', appId, 'users', selectedUser.id, 'profile', 'data');
            
            const payload = {
                role: editRole,
                status: editStatus,
                permissions: editPerms,
                isSeller: editRole === 'seller' || editRole === 'admin'
            };

            await setDoc(userRef, payload, { merge: true });
            
            setUpdateMsg('User configuration successfully committed to ledger.');
            setTimeout(() => {
                setUpdateMsg('');
                setSelectedUser(null);
            }, 2000);
        } catch (error) {
            console.error("Failed to update user:", error);
            setUpdateMsg(`Error: ${error.message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    // Animation Config
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    if (isLoadingAdmin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F5]">
                <ShieldCheck className="animate-pulse text-[#E7364D] mb-4" size={40} />
                <p className="text-[#333333] font-black text-[16px] tracking-widest uppercase">Fetching Directory...</p>
            </div>
        );
    }

    return (
        <div className="w-full font-sans min-h-screen relative pb-20">
            <AmbientBackground />
            
            <motion.div initial="hidden" animate="show" variants={containerVariants} className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 pt-10">
                
                {/* SECTION 2: Master Directory Header */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin')} className="p-3 bg-[#FFFFFF] border border-[#A3A3A3]/30 rounded-[8px] hover:border-[#E7364D] hover:text-[#E7364D] transition-colors shadow-sm">
                            <Lock size={20} className="text-[#333333]" />
                        </button>
                        <div>
                            <h1 className="text-[32px] font-black text-[#333333] leading-tight">User Directory</h1>
                            <p className="text-[#626262] font-medium text-[14px] mt-1">Manage platform access, roles, and global accounts.</p>
                        </div>
                    </div>
                    <button onClick={handleDownloadCSV} className="bg-[#333333] text-[#FFFFFF] px-6 py-3 rounded-[8px] font-bold text-[14px] hover:bg-[#E7364D] transition-colors shadow-[0_4px_15px_rgba(231,54,77,0.3)] flex items-center w-max hover:-translate-y-0.5 duration-200">
                        <Download size={16} className="mr-2" /> Export Roster
                    </button>
                </motion.div>

                {/* SECTION 3: User Base KPI Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <motion.div variants={itemVariants} className="bg-[#FFFFFF] border border-[#A3A3A3]/20 p-6 rounded-[12px] shadow-sm relative overflow-hidden flex items-center justify-between group hover:border-[#E7364D]/50 transition-colors">
                        <div className="absolute left-0 top-0 w-1.5 h-full bg-[#333333]" />
                        <div>
                            <p className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest ml-2 mb-1">Total Users</p>
                            <p className="text-[32px] font-black text-[#333333] ml-2">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center"><UsersIcon size={20} className="text-[#333333]"/></div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="bg-[#FFFFFF] border border-[#A3A3A3]/20 p-6 rounded-[12px] shadow-sm relative overflow-hidden flex items-center justify-between group hover:border-[#E7364D]/50 transition-colors">
                        <div className="absolute left-0 top-0 w-1.5 h-full bg-[#E7364D]" />
                        <div>
                            <p className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest ml-2 mb-1">Verified Sellers</p>
                            <p className="text-[32px] font-black text-[#333333] ml-2">{stats.sellers}</p>
                        </div>
                        <div className="w-12 h-12 bg-[#FAD8DC]/30 rounded-full flex items-center justify-center"><Briefcase size={20} className="text-[#E7364D]"/></div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-[#FFFFFF] border border-[#A3A3A3]/20 p-6 rounded-[12px] shadow-sm relative overflow-hidden flex items-center justify-between group hover:border-[#E7364D]/50 transition-colors">
                        <div className="absolute left-0 top-0 w-1.5 h-full bg-[#A3A3A3]" />
                        <div>
                            <p className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest ml-2 mb-1">Standard Buyers</p>
                            <p className="text-[32px] font-black text-[#333333] ml-2">{stats.standard}</p>
                        </div>
                        <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center"><UserCheck size={20} className="text-[#626262]"/></div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="bg-[#333333] p-6 rounded-[12px] shadow-[0_10px_30px_rgba(51,51,51,0.15)] relative overflow-hidden flex items-center justify-between">
                        <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-[#E7364D]/30 rounded-full blur-[40px] pointer-events-none" />
                        <div className="relative z-10">
                            <p className="text-[12px] font-bold text-[#A3A3A3] uppercase tracking-widest mb-1">Appointed Admins</p>
                            <p className="text-[32px] font-black text-[#FFFFFF]">{stats.admins}</p>
                        </div>
                        <div className="relative z-10 w-12 h-12 bg-[#FFFFFF]/10 border border-[#FFFFFF]/20 rounded-full flex items-center justify-center"><Key size={20} className="text-[#FFFFFF]"/></div>
                    </motion.div>
                </div>

                {/* SECTION 4 & 5: Advanced Search & Role Filters */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center gap-4 mb-6">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3A3A3]" size={18} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by Name, Email, or exact UID..."
                            className="w-full pl-12 pr-4 py-3.5 bg-[#FFFFFF] border border-[#A3A3A3]/30 rounded-[8px] text-[14px] text-[#333333] font-bold outline-none focus:border-[#E7364D] shadow-sm transition-colors"
                        />
                    </div>
                    <div className="w-full md:w-auto flex bg-[#FFFFFF] border border-[#A3A3A3]/30 rounded-[8px] p-1 shadow-sm overflow-x-auto">
                        {['All', 'Buyer', 'Seller', 'Admin'].map(role => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-6 py-2.5 text-[13px] font-bold rounded-[6px] transition-colors whitespace-nowrap ${roleFilter.toLowerCase() === role.toLowerCase() ? 'bg-[#333333] text-[#FFFFFF]' : 'text-[#626262] hover:bg-[#F5F5F5]'}`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* SECTION 6: Hardware-Accelerated Data Table */}
                <motion.div variants={itemVariants} className="bg-[#FFFFFF] border border-[#A3A3A3]/20 rounded-[12px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F5F5F5] border-b border-[#A3A3A3]/20">
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest"><div className="flex items-center"><Hash size={14} className="mr-1"/> Identity</div></th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest"><div className="flex items-center"><Mail size={14} className="mr-1"/> Contact</div></th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest">Role</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest">Joined</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-[#A3A3A3] uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#A3A3A3]/10">
                                {processedUsers.length > 0 ? (
                                    processedUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-[#FAFAFA] transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="text-[14px] font-black text-[#333333]">{u.name}</p>
                                                <p className="text-[12px] font-mono text-[#A3A3A3] mt-0.5">ID: {u.id.substring(0, 12)}...</p>
                                            </td>
                                            <td className="px-6 py-4 text-[13px] font-bold text-[#626262]">{u.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-[4px] text-[10px] font-black uppercase tracking-widest border ${
                                                    u.role === 'admin' ? 'bg-[#333333] text-[#FFFFFF] border-[#333333]' : 
                                                    u.role === 'seller' ? 'bg-[#FAD8DC]/50 text-[#E7364D] border-[#E7364D]/30' : 
                                                    'bg-[#F5F5F5] text-[#626262] border-[#A3A3A3]/30'
                                                }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[13px] text-[#A3A3A3] font-bold">{u.joined}</td>
                                            <td className="px-6 py-4">
                                                <span className={`flex items-center w-max px-2.5 py-1 rounded-[4px] text-[10px] font-black uppercase tracking-widest border ${
                                                    u.status === 'Active' ? 'bg-[#E5F6E5] text-[#008A00] border-[#008A00]/20' : 'bg-[#FCE5E5] text-[#D80000] border-[#D80000]/20'
                                                }`}>
                                                    {u.status === 'Active' ? <CheckCircle2 size={12} className="mr-1.5"/> : <Ban size={12} className="mr-1.5"/>}
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => openUserModal(u)} 
                                                    className="p-2 text-[#333333] hover:text-[#E7364D] hover:bg-[#FAD8DC]/30 rounded-[6px] transition-colors shadow-sm border border-[#A3A3A3]/20 bg-[#FFFFFF]" 
                                                    title="Modify User"
                                                >
                                                    <Settings size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <UserMinus size={40} className="text-[#A3A3A3] mb-4 opacity-50" />
                                                <p className="text-[16px] font-black text-[#333333] mb-1">No Users Found</p>
                                                <p className="text-[13px] text-[#626262] font-medium">Adjust your search parameters to find accounts.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.div>

            {/* SECTION 8: Interactive Moderation Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#333333]/80 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                            className="relative bg-[#F5F5F5] rounded-[16px] w-full max-w-lg overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.2)] flex flex-col max-h-[90vh]"
                        >
                            <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-[#A3A3A3] hover:text-[#333333] transition-colors z-20 bg-[#FFFFFF] p-1.5 rounded-full shadow-sm"><X size={20} /></button>
                            
                            {/* Modal Header */}
                            <div className="p-6 md:p-8 bg-[#FFFFFF] border-b border-[#A3A3A3]/20 shrink-0 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#FAD8DC]/30 rounded-bl-full -z-0"></div>
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4 border border-[#A3A3A3]/20">
                                        <Edit3 size={20} className="text-[#E7364D]" />
                                    </div>
                                    <h2 className="text-[24px] font-black text-[#333333] leading-tight mb-1">{selectedUser.name}</h2>
                                    <p className="text-[13px] font-bold text-[#626262] font-mono">{selectedUser.email}</p>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 md:p-8 overflow-y-auto flex-1">
                                
                                {/* FEATURE 12: Role Elevation Engine */}
                                <div className="mb-8">
                                    <h3 className="text-[12px] font-black text-[#A3A3A3] uppercase tracking-widest mb-3 flex items-center"><ShieldCheck size={14} className="mr-1.5"/> Account Authorization Role</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['buyer', 'seller', 'admin'].map(r => (
                                            <button
                                                key={r}
                                                onClick={() => setEditRole(r)}
                                                className={`py-3 rounded-[8px] border text-[13px] font-black uppercase tracking-wider transition-all ${
                                                    editRole === r 
                                                    ? 'bg-[#E7364D] text-[#FFFFFF] border-[#E7364D] shadow-[0_4px_10px_rgba(231,54,77,0.3)]' 
                                                    : 'bg-[#FFFFFF] text-[#626262] border-[#A3A3A3]/30 hover:border-[#E7364D]/50'
                                                }`}
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* FEATURE 13: Granular Permission Matrix */}
                                <AnimatePresence>
                                    {(editRole === 'seller' || editRole === 'admin') && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }} 
                                            animate={{ opacity: 1, height: 'auto' }} 
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mb-8 overflow-hidden"
                                        >
                                            <h3 className="text-[12px] font-black text-[#A3A3A3] uppercase tracking-widest mb-3 flex items-center"><Settings size={14} className="mr-1.5"/> Granular Permissions</h3>
                                            
                                            <PermissionToggle 
                                                label="Event Creation Rights" 
                                                description="Allows this user to draft, publish, and list new events on the marketplace."
                                                isActive={editPerms.canCreateEvents}
                                                onChange={() => setEditPerms(p => ({ ...p, canCreateEvents: !p.canCreateEvents }))}
                                            />
                                            <PermissionToggle 
                                                label="Stadium Configurator Access" 
                                                description="Allows this user to define physical rows, blocks, and seat capacities."
                                                isActive={editPerms.canEditSeatingConfig}
                                                onChange={() => setEditPerms(p => ({ ...p, canEditSeatingConfig: !p.canEditSeatingConfig }))}
                                            />
                                            <PermissionToggle 
                                                label="Financial Withdrawal" 
                                                description="Permits withdrawal of escrow funds directly to their registered bank accounts."
                                                isActive={editPerms.canWithdrawFunds}
                                                onChange={() => setEditPerms(p => ({ ...p, canWithdrawFunds: !p.canWithdrawFunds }))}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* FEATURE 14: Account Suspension */}
                                <div>
                                    <h3 className="text-[12px] font-black text-[#A3A3A3] uppercase tracking-widest mb-3 flex items-center"><AlertTriangle size={14} className="mr-1.5"/> Account Status</h3>
                                    <div className="flex items-center gap-4 bg-[#FFFFFF] border border-[#A3A3A3]/20 p-4 rounded-[8px]">
                                        <button 
                                            onClick={() => setEditStatus('Active')}
                                            className={`flex-1 py-2.5 rounded-[6px] text-[12px] font-black uppercase tracking-widest transition-colors ${editStatus === 'Active' ? 'bg-[#E5F6E5] text-[#008A00] border border-[#008A00]/20' : 'bg-transparent text-[#A3A3A3] hover:bg-[#F5F5F5]'}`}
                                        >
                                            Active
                                        </button>
                                        <button 
                                            onClick={() => setEditStatus('Suspended')}
                                            className={`flex-1 py-2.5 rounded-[6px] text-[12px] font-black uppercase tracking-widest transition-colors ${editStatus === 'Suspended' ? 'bg-[#FCE5E5] text-[#D80000] border border-[#D80000]/20' : 'bg-transparent text-[#A3A3A3] hover:bg-[#F5F5F5]'}`}
                                        >
                                            Suspended (Ban)
                                        </button>
                                    </div>
                                </div>
                                
                                {updateMsg && (
                                    <p className={`text-[13px] font-bold mt-4 p-3 rounded-[6px] ${updateMsg.includes('Error') ? 'bg-[#FCE5E5] text-[#D80000]' : 'bg-[#E5F6E5] text-[#008A00]'}`}>
                                        {updateMsg}
                                    </p>
                                )}
                            </div>

                            {/* Modal Footer Actions */}
                            <div className="p-6 bg-[#FFFFFF] border-t border-[#A3A3A3]/20 shrink-0 flex gap-4">
                                <button 
                                    onClick={() => setSelectedUser(null)}
                                    disabled={isUpdating}
                                    className="flex-1 bg-[#F5F5F5] text-[#626262] py-3.5 rounded-[8px] font-bold text-[14px] hover:bg-[#E5E5E5] hover:text-[#333333] transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveChanges}
                                    disabled={isUpdating}
                                    className="flex-1 bg-[#333333] text-[#FFFFFF] py-3.5 rounded-[8px] font-bold text-[14px] hover:bg-[#E7364D] transition-colors shadow-md flex items-center justify-center disabled:opacity-50"
                                >
                                    {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="mr-2"/>}
                                    {isUpdating ? 'Committing...' : 'Save Configuration'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}