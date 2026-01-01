import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import './i18n';

// Pages
import HomePage from './pages/HomePage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import VehiclesPage from './pages/VehiclesPage';
import AgenciesPage from './pages/AgenciesPage';
import FAQPage from './pages/FAQPage';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Dashboard Pages
import AgentDashboard from './pages/AgentDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-12 w-12 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Placeholder pages for routes not yet fully implemented
const PlaceholderPage = ({ title }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-slate-800 mb-4">{title}</h1>
    <p className="text-slate-600">Cette page est en cours de développement.</p>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/vehicles" element={<VehiclesPage />} />
      <Route path="/agencies" element={<AgenciesPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/blog" element={<PlaceholderPage title="Blog" />} />
      <Route path="/partners" element={<PlaceholderPage title="Partenaires" />} />
      <Route path="/events" element={<PlaceholderPage title="Événements" />} />
      <Route path="/contact" element={<PlaceholderPage title="Contact" />} />

      {/* Agent Dashboard */}
      <Route
        path="/agent"
        element={
          <ProtectedRoute allowedRoles={['agent']}>
            <DashboardLayout role="agent" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AgentDashboard />} />
        <Route path="reservations" element={<PlaceholderPage title="Mes Réservations" />} />
        <Route path="reservations/new" element={<PlaceholderPage title="Nouvelle Réservation" />} />
        <Route path="commissions" element={<PlaceholderPage title="Mes Commissions" />} />
        <Route path="challenges" element={<PlaceholderPage title="Challenges" />} />
        <Route path="profile" element={<PlaceholderPage title="Mon Profil" />} />
      </Route>

      {/* Company Dashboard */}
      <Route
        path="/company"
        element={
          <ProtectedRoute allowedRoles={['company']}>
            <DashboardLayout role="company" />
          </ProtectedRoute>
        }
      >
        <Route index element={<PlaceholderPage title="Dashboard Entreprise" />} />
        <Route path="reservations" element={<PlaceholderPage title="Réservations" />} />
        <Route path="drivers" element={<PlaceholderPage title="Conducteurs" />} />
        <Route path="profile" element={<PlaceholderPage title="Profil Entreprise" />} />
      </Route>

      {/* Influencer Dashboard */}
      <Route
        path="/influencer"
        element={
          <ProtectedRoute allowedRoles={['influencer']}>
            <DashboardLayout role="influencer" />
          </ProtectedRoute>
        }
      >
        <Route index element={<PlaceholderPage title="Dashboard Influenceur" />} />
        <Route path="codes" element={<PlaceholderPage title="Mes Codes Promo" />} />
        <Route path="profile" element={<PlaceholderPage title="Mon Profil" />} />
      </Route>

      {/* Admin Dashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="reservations" element={<PlaceholderPage title="Toutes les Réservations" />} />
        <Route path="users" element={<PlaceholderPage title="Gestion Utilisateurs" />} />
        <Route path="vehicles" element={<PlaceholderPage title="Gestion Véhicules" />} />
        <Route path="agencies" element={<PlaceholderPage title="Gestion Agences" />} />
        <Route path="pricing" element={<PlaceholderPage title="Gestion Tarifs" />} />
        <Route path="challenges" element={<PlaceholderPage title="Gestion Challenges" />} />
        <Route path="blog" element={<PlaceholderPage title="Gestion Blog" />} />
        <Route path="events" element={<PlaceholderPage title="Gestion Événements" />} />
        <Route path="stats" element={<PlaceholderPage title="Statistiques" />} />
      </Route>

      {/* Payment Routes */}
      <Route path="/payment/success" element={<PlaceholderPage title="Paiement réussi" />} />
      <Route path="/payment/cancel" element={<PlaceholderPage title="Paiement annulé" />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
