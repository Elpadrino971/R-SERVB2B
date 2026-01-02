import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Calendar, DollarSign, Users, TrendingDown, FileText,
  UserPlus, Download, Plus, Eye, Car
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CompanyDashboard = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentReservations, setRecentReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [profileRes, reservationsRes] = await Promise.all([
        axios.get(`${API}/companies/profile`),
        axios.get(`${API}/reservations?limit=5`)
      ]);

      setProfile(profileRes.data);
      setRecentReservations(reservationsRes.data.reservations || []);

      // Calculate stats from reservations
      const currentMonth = new Date().getMonth();
      const monthReservations = reservationsRes.data.reservations?.filter(r => {
        const resMonth = new Date(r.pickup_date).getMonth();
        return resMonth === currentMonth;
      }) || [];

      const monthTotal = monthReservations.reduce((sum, r) => sum + (r.total_price || 0), 0);
      const savings = monthTotal * 0.15; // Assume 15% discount

      setStats({
        month_reservations: monthReservations.length,
        month_expenses: monthTotal,
        active_drivers: profileRes.data.drivers?.length || 0,
        savings: savings
      });
    } catch (error) {
      console.error('Error fetching company dashboard:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors du chargement' : 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Mock chart data
  const expensesData = [
    { month: 'Jan', expenses: 4500 },
    { month: 'Fev', expenses: 5200 },
    { month: 'Mar', expenses: 4800 },
    { month: 'Avr', expenses: 6100 },
    { month: 'Mai', expenses: 7300 },
    { month: 'Juin', expenses: 6800 },
  ];

  const categoriesData = [
    { category: 'Berline', count: 12 },
    { category: 'SUV', count: 8 },
    { category: 'Utilitaire', count: 5 },
    { category: 'Premium', count: 3 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="company-dashboard-content">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {i18n.language === 'fr' ? 'Tableau de bord Entreprise' : 'Company Dashboard'}
          </h1>
          <p className="text-slate-600">
            {profile?.company_name || user?.first_name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="btn-primary">
            <Link to="/company/reservations/new">
              <Plus className="h-4 w-4 mr-2" />
              {i18n.language === 'fr' ? 'Nouvelle réservation' : 'New reservation'}
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {i18n.language === 'fr' ? 'Réservations ce mois' : 'Reservations this month'}
                </p>
                <p className="text-3xl font-bold text-slate-800">{stats?.month_reservations || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[#3D3A6B]/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-[#3D3A6B]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {i18n.language === 'fr' ? 'Dépenses totales' : 'Total expenses'}
                </p>
                <p className="text-3xl font-bold text-slate-800">
                  {(stats?.month_expenses || 0).toFixed(0)} €
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {i18n.language === 'fr' ? 'Conducteurs actifs' : 'Active drivers'}
                </p>
                <p className="text-3xl font-bold text-slate-800">{stats?.active_drivers || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-[#F5A623]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {i18n.language === 'fr' ? 'Économies' : 'Savings'}
                </p>
                <p className="text-3xl font-bold text-[#F5A623]">
                  {(stats?.savings || 0).toFixed(0)} €
                </p>
                <p className="text-xs text-slate-500">vs tarif public</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[#F5A623]/10 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-[#F5A623]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {i18n.language === 'fr' ? 'Évolution des dépenses' : 'Expenses evolution'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={expensesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#3D3A6B"
                    strokeWidth={2}
                    dot={{ fill: '#3D3A6B' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {i18n.language === 'fr' ? 'Top catégories louées' : 'Top rented categories'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="category" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#F5A623" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Reservations */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                {i18n.language === 'fr' ? 'Dernières réservations' : 'Recent reservations'}
              </CardTitle>
              <CardDescription>
                {i18n.language === 'fr' ? '5 dernières réservations' : 'Last 5 reservations'}
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/company/reservations">
                {i18n.language === 'fr' ? 'Voir tout' : 'View all'}
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentReservations.length > 0 ? (
              <div className="space-y-3">
                {recentReservations.map((res) => (
                  <div
                    key={res.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                    data-testid={`reservation-${res.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#3D3A6B] flex items-center justify-center text-white text-xs font-bold">
                        <Car className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{res.reference}</p>
                        <p className="text-sm text-slate-500">
                          {res.pickup_date} - {res.return_date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-100 text-blue-800">
                        {res.status}
                      </Badge>
                      <span className="font-semibold text-slate-800">
                        {res.total_price?.toFixed(2)} €
                      </span>
                      <Button asChild variant="ghost" size="icon">
                        <Link to={`/company/reservations/${res.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                {i18n.language === 'fr' ? 'Aucune réservation' : 'No reservations yet'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Grid */}
        <Card>
          <CardHeader>
            <CardTitle>
              {i18n.language === 'fr' ? 'Grille tarifaire' : 'Pricing grid'}
            </CardTitle>
            <CardDescription>
              {i18n.language === 'fr' ? 'Vos remises négociées' : 'Your negotiated discounts'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Économique', 'Berline', 'SUV', 'Premium', 'Utilitaire'].map((category, idx) => (
                <div key={category} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                  <span className="text-sm font-medium text-slate-700">{category}</span>
                  <Badge className="bg-emerald-100 text-emerald-700">
                    -{10 + idx * 2}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link to="/company/reservations/new">
          <Card className="card-hover cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#3D3A6B]/10 flex items-center justify-center">
                <Plus className="h-5 w-5 text-[#3D3A6B]" />
              </div>
              <div>
                <p className="font-medium text-slate-800">
                  {i18n.language === 'fr' ? 'Nouvelle réservation' : 'New reservation'}
                </p>
                <p className="text-sm text-slate-500">
                  {i18n.language === 'fr' ? 'Réserver un véhicule' : 'Book a vehicle'}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/company/drivers">
          <Card className="card-hover cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">
                  {i18n.language === 'fr' ? 'Gérer conducteurs' : 'Manage drivers'}
                </p>
                <p className="text-sm text-slate-500">{stats?.active_drivers || 0} conducteurs</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="card-hover cursor-pointer" onClick={() => toast.info('Fonctionnalité en développement')}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Download className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-slate-800">
                {i18n.language === 'fr' ? 'Télécharger factures' : 'Download invoices'}
              </p>
              <p className="text-sm text-slate-500">
                {i18n.language === 'fr' ? 'Historique PDF' : 'PDF history'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyDashboard;
