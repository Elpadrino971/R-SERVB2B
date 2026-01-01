import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Users, Calendar, DollarSign, Car, TrendingUp, AlertCircle,
  Plus, Search, Download, RefreshCw, Eye, CheckCircle, Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = () => {
  const { i18n } = useTranslation();
  const [stats, setStats] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, reservationsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/reservations?limit=10`)
      ]);
      setStats(statsRes.data);
      setReservations(reservationsRes.data.reservations || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    try {
      await axios.post(`${API}/admin/seed`);
      fetchData();
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-amber-100 text-amber-800', icon: Clock },
      confirmed: { class: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      completed: { class: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
      cancelled: { class: 'bg-red-100 text-red-800', icon: AlertCircle },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={config.class}>
        <config.icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  // Mock chart data
  const chartData = [
    { name: 'Jan', reservations: 12, revenue: 3400 },
    { name: 'Feb', reservations: 19, revenue: 4800 },
    { name: 'Mar', reservations: 15, revenue: 3900 },
    { name: 'Apr', reservations: 25, revenue: 6200 },
    { name: 'May', reservations: 32, revenue: 8100 },
    { name: 'Jun', reservations: 28, revenue: 7200 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-dashboard-content">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {i18n.language === 'fr' ? 'Tableau de bord Admin' : 'Admin Dashboard'}
          </h1>
          <p className="text-slate-600">
            {i18n.language === 'fr' 
              ? 'Vue d\'ensemble de l\'activité'
              : 'Activity overview'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={seedDatabase} data-testid="seed-btn">
            <RefreshCw className="h-4 w-4 mr-2" />
            {i18n.language === 'fr' ? 'Données test' : 'Seed Data'}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {i18n.language === 'fr' ? 'Utilisateurs' : 'Users'}
                </p>
                <p className="text-3xl font-bold text-slate-800">{stats?.users?.total || 0}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {stats?.users?.agents || 0} agents, {stats?.users?.companies || 0} entreprises
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[#3D3A6B]/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-[#3D3A6B]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {i18n.language === 'fr' ? 'Réservations' : 'Reservations'}
                </p>
                <p className="text-3xl font-bold text-slate-800">{stats?.reservations?.total || 0}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {stats?.reservations?.pending || 0} {i18n.language === 'fr' ? 'en attente' : 'pending'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {i18n.language === 'fr' ? 'CA Total' : 'Total Revenue'}
                </p>
                <p className="text-3xl font-bold text-emerald-600">
                  {(stats?.revenue?.total || 0).toFixed(0)} €
                </p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12.5%
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-[#F5A623]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {i18n.language === 'fr' ? 'Complétées' : 'Completed'}
                </p>
                <p className="text-3xl font-bold text-[#F5A623]">{stats?.reservations?.completed || 0}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {((stats?.reservations?.completed / (stats?.reservations?.total || 1)) * 100).toFixed(0)}% {i18n.language === 'fr' ? 'taux' : 'rate'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[#F5A623]/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-[#F5A623]" />
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
              {i18n.language === 'fr' ? 'Évolution des réservations' : 'Reservations Evolution'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="reservations" 
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
              {i18n.language === 'fr' ? 'Revenus mensuels' : 'Monthly Revenue'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#F5A623" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reservations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {i18n.language === 'fr' ? 'Dernières réservations' : 'Recent Reservations'}
            </CardTitle>
            <CardDescription>
              {i18n.language === 'fr' ? 'Les 10 dernières réservations' : 'Last 10 reservations'}
            </CardDescription>
          </div>
          <Button asChild variant="outline">
            <Link to="/admin/reservations">
              {i18n.language === 'fr' ? 'Voir tout' : 'View all'}
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Référence</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Dates</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Agent</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Statut</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Total</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((res) => (
                  <tr key={res.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="font-mono font-medium text-[#3D3A6B]">{res.reference}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {res.pickup_date} → {res.return_date}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {res.agent_id ? res.agent_id.slice(0, 8) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(res.status)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {res.total_price?.toFixed(2)} €
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/admin/reservations/${res.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {reservations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      {i18n.language === 'fr' ? 'Aucune réservation' : 'No reservations'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/users">
          <Card className="card-hover cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#3D3A6B]/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-[#3D3A6B]" />
              </div>
              <div>
                <p className="font-medium text-slate-800">
                  {i18n.language === 'fr' ? 'Gérer utilisateurs' : 'Manage users'}
                </p>
                <p className="text-sm text-slate-500">{stats?.users?.total || 0} utilisateurs</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/vehicles">
          <Card className="card-hover cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Car className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">
                  {i18n.language === 'fr' ? 'Gérer véhicules' : 'Manage vehicles'}
                </p>
                <p className="text-sm text-slate-500">Catalogue</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/pricing">
          <Card className="card-hover cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">
                  {i18n.language === 'fr' ? 'Gérer tarifs' : 'Manage pricing'}
                </p>
                <p className="text-sm text-slate-500">Saisons & Prix</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/challenges">
          <Card className="card-hover cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#F5A623]/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-[#F5A623]" />
              </div>
              <div>
                <p className="font-medium text-slate-800">
                  {i18n.language === 'fr' ? 'Gérer challenges' : 'Manage challenges'}
                </p>
                <p className="text-sm text-slate-500">Animations</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
