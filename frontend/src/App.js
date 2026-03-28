import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import './i18n';

// Pages
import HomePage from './pages/HomePageNew';
import { LoginPage } from './pages/AuthPages';
import OnboardingPage from './pages/OnboardingPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import VehiclesPage from './pages/VehiclesPage';
import AgenciesPage from './pages/AgenciesPage';
import FAQPage from './pages/FAQPage';
import BlogPage from './pages/BlogPage';
import EventsPage from './pages/EventsPage';
import PartnersPage from './pages/PartnersPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';

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
import AdminSettingsHoursPage from './pages/AdminSettingsHoursPage';
import AdminAllotmentsPage from './pages/AdminAllotmentsPage';
import AdminStopSalesPage from './pages/AdminStopSalesPage';
import AdminAvailabilityPage from './pages/AdminAvailabilityPage';
import AdminPromosPage from './pages/AdminPromosPage';
import AdminAuditLogsPage from './pages/AdminAuditLogsPage';
import AdminNetworksPage from './pages/AdminNetworksPage';
import AdminStatsPage from './pages/AdminStatsPage';

// Company Pages
import CompanyDashboard from './pages/CompanyDashboard';
import CompanyReservationsPage from './pages/CompanyReservationsPage';
import CompanyDriversPage from './pages/CompanyDriversPage';
import CompanyProfilePage from './pages/CompanyProfilePage';

// Influencer Pages
import InfluencerDashboard from './pages/InfluencerDashboard';
import InfluencerCodesPage from './pages/InfluencerCodesPage';
import InfluencerProfilePage from './pages/InfluencerProfilePage';

// Intranet
import IntranetPage from './pages/IntranetPage';

// Payment
import PaymentPage from './pages/PaymentPage';

// Components
import WelcomeAuthModal from './components/WelcomeAuthModal';
import ChatWidget from './components/ChatWidget';

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

// Redirect /vehicles vers /vehicles/tourisme en gardant les paramètres de recherche
const VehiclesRedirect = () => {
  const { search } = useLocation();
  return <Navigate to={`/vehicles/tourisme${search}`} replace />;
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
      <Route path="/register" element={<OnboardingPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/vehicles" element={<VehiclesRedirect />} />
      <Route path="/vehicles/tourisme" element={<VehiclesPage type="tourisme" />} />
      <Route path="/vehicles/utilitaire" element={<VehiclesPage type="utilitaire" />} />
      <Route path="/agencies" element={<AgenciesPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/partners" element={<PartnersPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/booking" element={<BookingPage />} />

      {/* Intranet - Accessible to all authenticated users */}
      <Route
        path="/intranet"
        element={
          <ProtectedRoute allowedRoles={['admin', 'agent', 'company', 'influencer']}>
            <IntranetPage />
          </ProtectedRoute>
        }
      />

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
        <Route path="reservations/new" element={<BookingPage />} />
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
        <Route path="allotments" element={<AdminAllotmentsPage />} />
        <Route path="stop-sales" element={<AdminStopSalesPage />} />
        <Route path="availability" element={<AdminAvailabilityPage />} />
        <Route path="promos" element={<AdminPromosPage />} />
        <Route path="challenges" element={<AdminChallengesPage />} />
        <Route path="blog" element={<AdminBlogPage />} />
        <Route path="events" element={<AdminEventsPage />} />
        <Route path="settings/hours" element={<AdminSettingsHoursPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="networks" element={<AdminNetworksPage />} />
        <Route path="stats" element={<AdminStatsPage />} />
      </Route>

      {/* Payment Routes */}
      <Route path="/payment/:reservationId" element={<PaymentPage />} />
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
        <ChatWidget />
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
