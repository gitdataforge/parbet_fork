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