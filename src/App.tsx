/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './core/auth/AuthContext';
import { MainLayout } from './core/components/layout/MainLayout';
import { RdoMobileEngine } from './modules/lf-engenharia/timeline/RdoMobileEngine';
import { DashboardPage } from './modules/lf-engenharia/dashboard/DashboardPage';
import { CaixaMaster } from './modules/lf-engenharia/financas/CaixaMaster';
import { ObrasPipeline } from './modules/lf-engenharia/portfolio/ObrasPipeline';
import { ProfilePage } from './modules/lf-engenharia/profile/ProfilePage';
import { LoginPage } from './modules/lf-engenharia/auth/LoginPage';
import { DynamicTacticalMap } from './modules/lf-engenharia/map/DynamicTacticalMap';
import { AnimatePresence } from 'motion/react';

const AppRoutes = ({ location }: { location: any }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-lf-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-lf-gold/30 border-t-lf-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={user.role === 'ADMIN' ? <Navigate to="/master" replace /> : <Navigate to="/timeline" replace />} />
          <Route path="master" element={<DashboardPage />} />
          <Route path="portfolio" element={<ObrasPipeline />} />
          <Route path="timeline" element={<RdoMobileEngine />} />
          <Route path="dashboard" element={<CaixaMaster />} />
          <Route path="implantacao" element={<DynamicTacticalMap />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

const AppRoutesWrapper = () => {
  const location = useLocation();
  return <AppRoutes location={location} />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutesWrapper />
      </BrowserRouter>
    </AuthProvider>
  );
}
