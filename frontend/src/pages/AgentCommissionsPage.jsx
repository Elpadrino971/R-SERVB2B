import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  DollarSign, TrendingUp, Calendar, Download, Filter, CheckCircle, Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AgentCommissionsPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [commissions, setCommissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [periodFilter, setPeriodFilter] = useState('current_month');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchCommissions();
  }, [periodFilter]);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (periodFilter !== 'custom') {
        params.append('period', periodFilter);
      } else {
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);
      }

      const response = await axios.get(`${API}/agents/commissions?${params.toString()}`);
      const data = response.data;

      setCommissions(data.commissions || []);
      setStats(data.stats || {});
      setChartData(data.chart_data || generateMockChartData());
    } catch (error) {
      console.error('Error fetching commissions:', error);
      toast.error(i18n.language === 'fr'
        ? 'Erreur lors du chargement des commissions'
        : 'Error loading commissions'
      );
      // Use mock data in case of error
      setStats({
        total_month: 1250.00,
        total_year: 8500.00,
        average_rate: 10
      });
      setCommissions([]);
      setChartData(generateMockChartData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockChartData = () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return months.map((month, index) => ({
      name: month,
      commission: Math.floor(Math.random() * 2000) + 500
    }));
  };

  const exportToCSV = () => {
    const headers = ['Réservation', 'Date clôture', 'Montant HT', 'Commission %', 'Montant commission', 'Statut paiement'];
    const csvData = commissions.map(comm => [
      comm.reservation_reference || '-',
      comm.completion_date || '-',
      comm.amount_ht?.toFixed(2) || '0',
      comm.commission_rate || '0',
      comm.commission_amount?.toFixed(2) || '0',
      comm.payment_status || 'pending'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commissions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast.success(i18n.language === 'fr'
      ? 'Export CSV réussi'
      : 'CSV export successful'
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      paid: { class: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Payée' },
      pending: { class: 'bg-amber-100 text-amber-800', icon: Clock, label: 'En attente' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={config.class}>
        <config.icon className="h-3 w-3 mr-1" />
        {i18n.language === 'fr' ? config.label : status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="agent-commissions-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {i18n.language === 'fr' ? 'Mes Commissions' : 'My Commissions'}
          </h1>
          <p className="text-slate-600">
            {i18n.language === 'fr'
              ? 'Suivez vos gains et commissions'
              : 'Track your earnings and commissions'}
          </p>
        </div>
        <Button variant="outline" onClick={exportToCSV} data-testid="export-csv-btn">
          <Download className="h-4 w-4 mr-2" />
          {i18n.language === 'fr' ? 'Exporter CSV' : 'Export CSV'}
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="card-hover border-[#F5A623]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {i18n.language === 'fr' ? 'Total mois en cours' : 'Current Month Total'}
                </p>
                <p className="text-3xl font-bold text-[#F5A623]">
                  {(stats?.total_month || 0).toFixed(2)} €
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[#F5A623]/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-[#F5A623]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {i18n.language === 'fr' ? 'Total année' : 'Year Total'}
                </p>
                <p className="text-3xl font-bold text-emerald-600">
                  {(stats?.total_year || 0).toFixed(2)} €
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {i18n.language === 'fr' ? 'Taux moyen' : 'Average Rate'}
                </p>
                <p className="text-3xl font-bold text-[#3D3A6B]">
                  {stats?.average_rate || 10}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[#3D3A6B]/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-[#3D3A6B]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            {i18n.language === 'fr' ? 'Évolution des commissions' : 'Commission Evolution'}
          </CardTitle>
          <CardDescription>
            {i18n.language === 'fr'
              ? 'Commissions mensuelles sur les 12 derniers mois'
              : 'Monthly commissions over the last 12 months'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  stroke="#64748B"
                  fontSize={12}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="commission"
                  stroke="#F5A623"
                  strokeWidth={3}
                  dot={{ fill: '#F5A623', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-[#3D3A6B]" />
            {i18n.language === 'fr' ? 'Filtrer par période' : 'Filter by Period'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger data-testid="period-filter">
                <SelectValue placeholder={i18n.language === 'fr' ? 'Période' : 'Period'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_month">
                  {i18n.language === 'fr' ? 'Mois en cours' : 'Current Month'}
                </SelectItem>
                <SelectItem value="last_month">
                  {i18n.language === 'fr' ? 'Mois dernier' : 'Last Month'}
                </SelectItem>
                <SelectItem value="current_year">
                  {i18n.language === 'fr' ? 'Année en cours' : 'Current Year'}
                </SelectItem>
                <SelectItem value="last_year">
                  {i18n.language === 'fr' ? 'Année dernière' : 'Last Year'}
                </SelectItem>
                <SelectItem value="custom">
                  {i18n.language === 'fr' ? 'Personnalisée' : 'Custom'}
                </SelectItem>
              </SelectContent>
            </Select>

            {periodFilter === 'custom' && (
              <>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder={i18n.language === 'fr' ? 'Du' : 'From'}
                  data-testid="date-from-input"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder={i18n.language === 'fr' ? 'Au' : 'To'}
                  data-testid="date-to-input"
                />
              </>
            )}
          </div>

          {periodFilter === 'custom' && (
            <Button
              onClick={fetchCommissions}
              className="mt-4 bg-[#F5A623] hover:bg-[#F5A623]/90"
            >
              {i18n.language === 'fr' ? 'Appliquer' : 'Apply'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {i18n.language === 'fr' ? 'Détail des commissions' : 'Commission Details'}
          </CardTitle>
          <CardDescription>
            {i18n.language === 'fr'
              ? `${commissions.length} commission(s) trouvée(s)`
              : `${commissions.length} commission(s) found`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{i18n.language === 'fr' ? 'Réservation' : 'Reservation'}</TableHead>
                  <TableHead>{i18n.language === 'fr' ? 'Date clôture' : 'Completion Date'}</TableHead>
                  <TableHead className="text-right">{i18n.language === 'fr' ? 'Montant HT' : 'Amount (excl. VAT)'}</TableHead>
                  <TableHead className="text-right">{i18n.language === 'fr' ? 'Commission %' : 'Commission %'}</TableHead>
                  <TableHead className="text-right">{i18n.language === 'fr' ? 'Montant commission' : 'Commission Amount'}</TableHead>
                  <TableHead>{i18n.language === 'fr' ? 'Statut paiement' : 'Payment Status'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.length > 0 ? (
                  commissions.map((commission, index) => (
                    <TableRow key={commission.id || index} data-testid="commission-row">
                      <TableCell className="font-mono font-medium text-[#3D3A6B]">
                        {commission.reservation_reference || '-'}
                      </TableCell>
                      <TableCell>{commission.completion_date || '-'}</TableCell>
                      <TableCell className="text-right">
                        {(commission.amount_ht || 0).toFixed(2)} €
                      </TableCell>
                      <TableCell className="text-right font-semibold text-[#F5A623]">
                        {commission.commission_rate || 10}%
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-600">
                        {(commission.commission_amount || 0).toFixed(2)} €
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(commission.payment_status || 'pending')}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      {i18n.language === 'fr'
                        ? 'Aucune commission trouvée pour cette période'
                        : 'No commissions found for this period'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentCommissionsPage;
