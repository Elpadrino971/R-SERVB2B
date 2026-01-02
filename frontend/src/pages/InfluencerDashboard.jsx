import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  TrendingUp, DollarSign, Target, Percent, Plus,
  Trophy, Tag, Users, Eye, ArrowRight
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const InfluencerDashboard = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API}/influencers/dashboard`);
      setDashboard(response.data);
    } catch (error) {
      console.error('Error fetching influencer dashboard:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors du chargement' : 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts
  const conversionsData = [
    { month: 'Jan', conversions: 5 },
    { month: 'Fev', conversions: 8 },
    { month: 'Mar', conversions: 12 },
    { month: 'Avr', conversions: 15 },
    { month: 'Mai', conversions: 22 },
    { month: 'Juin', conversions: 28 },
  ];

  const codesPerformance = [
    { code: 'INFLUENCER10', uses: 45, revenue: 12500 },
    { code: 'SUMMER2024', uses: 32, revenue: 8900 },
    { code: 'SPECIAL15', uses: 28, revenue: 7600 },
    { code: 'VIP20', uses: 18, revenue: 6200 },
  ];

  // Mock stats
  const stats = {
    total_conversions: dashboard?.stats?.total_conversions || 125,
    total_revenue: dashboard?.stats?.total_revenue || 35200,
    estimated_commission: dashboard?.stats?.estimated_commission || 3520,
    conversion_rate: dashboard?.stats?.conversion_rate || 12.5
  };

  const topCodes = dashboard?.top_codes || [
    { code: 'INFLUENCER10', uses: 45, revenue: 12500, commission: 1250 },
    { code: 'SUMMER2024', uses: 32, revenue: 8900, commission: 890 },
    { code: 'SPECIAL15', uses: 28, revenue: 7600, commission: 760 },
  ];

  const activeChallenges = dashboard?.active_challenges || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="influencer-dashboard-content">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {i18n.language === 'fr' ? 'Bonjour' : 'Hello'}, {user?.first_name} ✨
          </h1>
          <p className="text-slate-600">
            {i18n.language === 'fr'
              ? 'Suivez vos performances et commissions'
              : 'Track your performance and commissions'}
          </p>
        </div>
        <Button asChild className="btn-primary">
          <Link to="/influencer/codes/new">
            <Plus className="h-4 w-4 mr-2" />
            {i18n.language === 'fr' ? 'Créer nouveau code' : 'Create new code'}
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {i18n.language === 'fr' ? 'Conversions totales' : 'Total conversions'}
                </p>
                <p className="text-3xl font-bold text-slate-800">{stats.total_conversions}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[#3D3A6B]/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-[#3D3A6B]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {i18n.language === 'fr' ? 'CA généré' : 'Revenue generated'}
                </p>
                <p className="text-3xl font-bold text-slate-800">
                  {stats.total_revenue.toFixed(0)} €
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-[#F5A623]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  {i18n.language === 'fr' ? 'Commission estimée' : 'Estimated commission'}
                </p>
                <p className="text-3xl font-bold text-[#F5A623]">
                  {stats.estimated_commission.toFixed(0)} €
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
                  {i18n.language === 'fr' ? 'Taux de conversion' : 'Conversion rate'}
                </p>
                <p className="text-3xl font-bold text-emerald-600">
                  {stats.conversion_rate.toFixed(1)}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Percent className="h-6 w-6 text-emerald-600" />
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
              {i18n.language === 'fr' ? 'Évolution des conversions' : 'Conversions evolution'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={conversionsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="conversions"
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
              {i18n.language === 'fr' ? 'Performance par code' : 'Performance by code'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={codesPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="code" stroke="#64748B" fontSize={10} angle={-15} textAnchor="end" height={80} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="uses" fill="#F5A623" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Promo Codes */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                {i18n.language === 'fr' ? 'Top codes promo' : 'Top promo codes'}
              </CardTitle>
              <CardDescription>
                {i18n.language === 'fr' ? 'Vos codes les plus performants' : 'Your best performing codes'}
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/influencer/codes">
                {i18n.language === 'fr' ? 'Voir tout' : 'View all'}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="top-codes-table">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Code</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Utilisations</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">CA généré</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {topCodes.map((code, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-[#F5A623]/10 flex items-center justify-center">
                            <Tag className="h-4 w-4 text-[#F5A623]" />
                          </div>
                          <span className="font-mono font-medium text-[#3D3A6B]">{code.code}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700">
                        {code.uses}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {code.revenue.toFixed(0)} €
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#F5A623]">
                        {code.commission.toFixed(0)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Active Challenges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#F5A623]" />
              {i18n.language === 'fr' ? 'Challenges en cours' : 'Active challenges'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeChallenges.length > 0 ? (
              <div className="space-y-4">
                {activeChallenges.map((challenge) => (
                  <div key={challenge.id} className="p-4 rounded-lg border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-2">
                      {i18n.language === 'fr' ? challenge.title_fr : challenge.title_en}
                    </h4>
                    <p className="text-sm text-slate-600 mb-3">
                      {challenge.description_fr?.slice(0, 80)}...
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          {i18n.language === 'fr' ? 'Progression' : 'Progress'}
                        </span>
                        <span className="font-medium">
                          {challenge.current || 0} / {challenge.target || 20}
                        </span>
                      </div>
                      <Progress value={((challenge.current || 0) / (challenge.target || 20)) * 100} className="h-2" />
                    </div>
                    <div className="mt-3">
                      <Badge className="bg-[#F5A623]/10 text-[#F5A623]">
                        +{challenge.bonus_rate || 5}% bonus
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-4">
                  {i18n.language === 'fr' ? 'Aucun challenge actif' : 'No active challenges'}
                </p>
                <Button asChild variant="link">
                  <Link to="/influencer/challenges">
                    {i18n.language === 'fr' ? 'Voir les challenges disponibles' : 'View available challenges'}
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>
            {i18n.language === 'fr' ? 'Statistiques détaillées' : 'Detailed statistics'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="text-sm text-slate-600 mb-1">
                {i18n.language === 'fr' ? 'Taux de commission' : 'Commission rate'}
              </p>
              <p className="text-2xl font-bold text-[#3D3A6B]">
                {dashboard?.profile?.commission_rate || 10}%
              </p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="text-sm text-slate-600 mb-1">
                {i18n.language === 'fr' ? 'Codes actifs' : 'Active codes'}
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {dashboard?.active_codes || 4}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-50">
              <p className="text-sm text-emerald-600 mb-1">
                {i18n.language === 'fr' ? 'Paiement prochain' : 'Next payment'}
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                {stats.estimated_commission.toFixed(0)} €
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                {i18n.language === 'fr' ? 'Fin du mois' : 'End of month'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfluencerDashboard;
