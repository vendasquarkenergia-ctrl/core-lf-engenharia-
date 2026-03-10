/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './core/auth/AuthContext';
import { MainLayout } from './core/components/layout/MainLayout';
import AcompanhamentoObra from './modules/lf-engenharia/acompanhamento/AcompanhamentoObra';
import FinanceiroDashboard from './modules/lf-engenharia/financeiro/FinanceiroDashboard';
import { TasksPage } from './modules/lf-engenharia/tasks/TasksPage';
import { TeamPage } from './modules/lf-engenharia/team/TeamPage';
import { ProfilePage } from './modules/lf-engenharia/profile/ProfilePage';
import { LoginPage } from './modules/lf-engenharia/auth/LoginPage';
import { MasterDashboardPage } from './modules/lf-engenharia/master/MasterDashboardPage';
import { AnimatePresence } from 'motion/react';
import { syncManager } from './core/sync/OfflineSync';

const AppRoutes = ({ location }: { location: any }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
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
          <Route index element={<AcompanhamentoObra />} />
          <Route path="timeline" element={<AcompanhamentoObra />} />
          <Route path="master" element={<MasterDashboardPage />} />
          <Route path="dashboard" element={<FinanceiroDashboard />} />
          <Route path="users" element={<TeamPage />} />
          <Route path="tasks" element={<TasksPage />} />
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
  React.useEffect(() => {
    // Tenta sincronizar a fila offline toda vez que o app principal é inicializado
    if (navigator.onLine) {
      syncManager.processQueue();
    }
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutesWrapper />
      </BrowserRouter>
    </AuthProvider>
  );
}
