import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MacsPage from './pages/MacsPage';
import GeheugenPage from './pages/GeheugenPage';
import VideokaartPage from './pages/VideokaartPage';
import HardeschijvenPage from './pages/HardeschijvenPage';
import CpuPage from './pages/CpuPage';
import CustomCategoryPage from './pages/CustomCategoryPage';
import SettingsPage from './pages/SettingsPage';
import TrashPage from './pages/TrashPage';
import ResetWachtwoordPage from './pages/ResetWachtwoordPage';
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ color: 'var(--text2)', padding: 40, fontFamily: 'var(--font-mono)' }}>Laden...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-wachtwoord" element={<ResetWachtwoordPage />} />
          <Route path="/" element={<ProtectedRoute><SettingsProvider><Layout /></SettingsProvider></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="macs" element={<MacsPage />} />
            <Route path="geheugen" element={<GeheugenPage />} />
            <Route path="videokaarten" element={<VideokaartPage />} />
            <Route path="harde-schijven" element={<HardeschijvenPage />} />
            <Route path="cpu" element={<CpuPage />} />
            <Route path="categorie/:slug" element={<CustomCategoryPage />} />
            <Route path="instellingen" element={<SettingsPage />} />
            <Route path="prullenbak" element={<TrashPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
