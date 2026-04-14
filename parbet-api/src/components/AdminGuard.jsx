import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function AdminGuard({ children }) {
  const { user, isAdmin, loading } = useAuthStore();
  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
  return children;
}