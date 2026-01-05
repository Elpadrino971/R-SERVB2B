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
import BlogPage from './pages/BlogPage';
import EventsPage from './pages/EventsPage';
import PartnersPage from './pages/PartnersPage';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Agent Pages
import AgentDashboard from './pages/AgentDashboard';
import AgentReservationsPage from './pages/AgentReservationsPage';
import BookingPage from './pages/BookingPage';
import AgentCommissionsPage from './pages/AgentCommissionsPage';
import AgentChallengesPage from './pages/AgentChallengesPage';
import AgentProfilePage from './pages/AgentProfilePage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminReservationsPage from './pages/AdminReservationsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminVehiclesPage from './pages/AdminVehiclesAdvancedPage'; // Version avancée avec stock et photos
import AdminAgenciesPage from './pages/AdminAgenciesPage';
import AdminPricingPage from './pages/AdminPricingPage';
import AdminChallengesPage from './pages/AdminChallengesPage';
import AdminBlogPage from './pages/AdminBlogPage';
import AdminEventsPage from './pages/AdminEventsPage';

// Company Pages
import CompanyDashboard from './pages/CompanyDashboard';
import CompanyReservationsPage from './pages/CompanyReservationsPage';
import CompanyDriversPage from './pages/CompanyDriversPage';
import CompanyProfilePage from './pages/CompanyProfilePage';

// Influencer Pages
import InfluencerDashboard from './pages/InfluencerDashboard';
import InfluencerCodesPage from './pages/InfluencerCodesPage';
import InfluencerProfilePage from './pages/InfluencerProfilePage';

// Components
import WelcomeAuthModal from './components/WelcomeAuthModal';

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
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/partners" element={<PartnersPage />} />
      <Route path="/events" element={<EventsPage />} />
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
        <Route path="reservations" element={<AgentReservationsPage />} />
        <Route path="reservations/new" element={<BookingPage />} />
        <Route path="commissions" element={<AgentCommissionsPage />} />
        <Route path="challenges" element={<AgentChallengesPage />} />
        <Route path="profile" element={<AgentProfilePage />} />
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
        <Route index element={<CompanyDashboard />} />
        <Route path="reservations" element={<CompanyReservationsPage />} />
        <Route path="drivers" element={<CompanyDriversPage />} />
        <Route path="profile" element={<CompanyProfilePage />} />
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
        <Route index element={<InfluencerDashboard />} />
        <Route path="codes" element={<InfluencerCodesPage />} />
        <Route path="profile" element={<InfluencerProfilePage />} />
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
        <Route path="reservations" element={<AdminReservationsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="vehicles" element={<AdminVehiclesPage />} />
        <Route path="agencies" element={<AdminAgenciesPage />} />
        <Route path="pricing" element={<AdminPricingPage />} />
        <Route path="challenges" element={<AdminChallengesPage />} />
        <Route path="blog" element={<AdminBlogPage />} />
        <Route path="events" element={<AdminEventsPage />} />
        <Route path="stats" element={<PlaceholderPage title="Statistiques Avancées" />} />
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
        <WelcomeAuthModal />
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
