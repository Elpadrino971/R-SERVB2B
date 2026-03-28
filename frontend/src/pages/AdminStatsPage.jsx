import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Users, Calendar, DollarSign, TrendingUp, Download, RefreshCw,
  BarChart3, FileSpreadsheet, FileText
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { toast } from 'sonner';
import { exportToCSV, exportConfigs } from '../utils/exportToCSV';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminStatsPage = () => {
  const { i18n } = useTranslation();
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthsRange, setMonthsRange] = useState('12');
  const [exporting, setExporting] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, monthlyRes] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/stats/monthly?months=${monthsRange}`)
      ]);
      setStats(statsRes.data);
      setMonthlyData(monthlyRes.data.data || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors du chargement' : 'Error loading stats');
    } finally {
      setLoading(false);
    }
  }, [monthsRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async (type) => {
    setExporting(type);
    try {
      if (type === 'reservations') {
        const { data } = await axios.get(`${API}/admin/export/reservations`);
        const list = data.data || [];
        if (list.length === 0) {
          toast.error(i18n.language === 'fr' ? 'Aucune réservation à exporter' : 'No reservations to export');
          return;
        }
        const filename = `reservations_${new Date().toISOString().split('T')[0]}.csv`;
        exportToCSV(list, exportConfigs.reservations.columns, filename);
      } else if (type === 'users') {
        const { data } = await axios.get(`${API}/admin/export/users`);
        const list = data.data || [];
        if (list.length === 0) {
          toast.error(i18n.language === 'fr' ? 'Aucun utilisateur à exporter' : 'No users to export');
          return;
        }
        const filename = `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`;
        exportToCSV(list, exportConfigs.users.columns, filename);
      } else if (type === 'commissions') {
        const { data } = await axios.get(`${API}/admin/export/commissions`);
        const reservations = data.reservations || [];
        const list = reservations.map((r) => {
          const info = r.customer_info || r.driver_info || {};
          const clientName = `${info.first_name || ''} ${info.last_name || ''}`.trim() || '-';
          return {
            reservation_reference: r.reference,
            date: r.created_at,
            client_name: clientName,
            amount: r.total_price,
            commission_rate: r.commission_rate,
            commission_amount: r.commission_amount,
            status: r.status
          };
        });
        if (list.length === 0) {
          toast.error(i18n.language === 'fr' ? 'Aucune commission à exporter' : 'No commissions to export');
          return;
        }
        const filename = `commissions_${new Date().toISOString().split('T')[0]}.csv`;
        exportToCSV(list, exportConfigs.commissions.columns, filename);
      }
      toast.success(i18n.language === 'fr' ? 'Export réussi' : 'Export successful');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de l\'export' : 'Error exporting');
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isFr = i18n.language === 'fr';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {isFr ? 'Statistiques avancées' : 'Advanced Statistics'}
          </h1>
          <p className="text-slate-600">
            {isFr ? 'KPIs, graphiques et exports BI' : 'KPIs, charts and BI exports'}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={monthsRange} onValueChange={setMonthsRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">{isFr ? '6 derniers mois' : 'Last 6 months'}</SelectItem>
              <SelectItem value="12">{isFr ? '12 derniers mois' : 'Last 12 months'}</SelectItem>
              <SelectItem value="18">{isFr ? '18 derniers mois' : 'Last 18 months'}</SelectItem>
              <SelectItem value="24">{isFr ? '24 derniers mois' : 'Last 24 months'}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {isFr ? 'Actualiser' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{isFr ? 'Utilisateurs' : 'Users'}</p>
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
                <p className="text-sm text-slate-600">{isFr ? 'Réservations' : 'Reservations'}</p>
                <p className="text-3xl font-bold text-slate-800">{stats?.reservations?.total || 0}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {stats?.reservations?.pending || 0} {isFr ? 'en attente' : 'pending'}
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
                <p className="text-sm text-slate-600">{isFr ? 'CA Total' : 'Total Revenue'}</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {(stats?.revenue?.total || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                </p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stats?.reservations?.completed || 0} {isFr ? 'complétées' : 'completed'}
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
                <p className="text-sm text-slate-600">{isFr ? 'Taux complétion' : 'Completion rate'}</p>
                <p className="text-3xl font-bold text-[#F5A623]">
                  {stats?.reservations?.total
                    ? `${((stats.reservations.completed / stats.reservations.total) * 100).toFixed(1)}%`
                    : '0%'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {stats?.reservations?.completed || 0} / {stats?.reservations?.total || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[#F5A623]/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-[#F5A623]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{isFr ? 'Évolution des réservations' : 'Reservations Evolution'}</CardTitle>
            <CardDescription>
              {isFr ? 'Par mois sur la période sélectionnée' : 'By month for selected period'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="reservations"
                    name={isFr ? 'Réservations' : 'Reservations'}
                    stroke="#3D3A6B"
                    strokeWidth={2}
                    dot={{ fill: '#3D3A6B' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    name={isFr ? 'Complétées' : 'Completed'}
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: '#10B981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isFr ? 'Revenus mensuels' : 'Monthly Revenue'}</CardTitle>
            <CardDescription>
              {isFr ? 'CA par mois (réservations complétées)' : 'Revenue by month (completed reservations)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={12} tickFormatter={(v) => `${v}€`} />
                  <Tooltip formatter={(v) => [`${Number(v).toLocaleString('fr-FR')} €`, isFr ? 'Revenus' : 'Revenue']} />
                  <Bar dataKey="revenue" name={isFr ? 'Revenus (€)' : 'Revenue (€)'} fill="#F5A623" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exports BI */}
      <Card>
        <CardHeader>
          <CardTitle>{isFr ? 'Exports données' : 'Data Exports'}</CardTitle>
          <CardDescription>
            {isFr ? 'Téléchargez les données en CSV pour analyse externe ou BI' : 'Download data as CSV for external analysis or BI'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => handleExport('reservations')}
              disabled={exporting !== null}
            >
              {exporting === 'reservations' ? (
                <div className="h-8 w-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileSpreadsheet className="h-8 w-8 text-[#3D3A6B]" />
              )}
              <span className="font-medium">{isFr ? 'Réservations' : 'Reservations'}</span>
              <span className="text-xs text-slate-500">{isFr ? 'Toutes les réservations' : 'All reservations'}</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => handleExport('users')}
              disabled={exporting !== null}
            >
              {exporting === 'users' ? (
                <div className="h-8 w-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileText className="h-8 w-8 text-[#3D3A6B]" />
              )}
              <span className="font-medium">{isFr ? 'Utilisateurs' : 'Users'}</span>
              <span className="text-xs text-slate-500">{isFr ? 'Agents, entreprises, influenceurs' : 'Agents, companies, influencers'}</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => handleExport('commissions')}
              disabled={exporting !== null}
            >
              {exporting === 'commissions' ? (
                <div className="h-8 w-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="h-8 w-8 text-[#3D3A6B]" />
              )}
              <span className="font-medium">{isFr ? 'Commissions' : 'Commissions'}</span>
              <span className="text-xs text-slate-500">{isFr ? 'Détail par réservation' : 'Detail per reservation'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStatsPage;
