import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  Calendar, DollarSign, Trophy, TrendingUp, Clock, CheckCircle, 
  XCircle, AlertCircle, ArrowRight, Plus, Eye
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AgentDashboard = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API}/agents/dashboard`);
      setDashboard(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-pending', icon: Clock },
      confirmed: { class: 'status-confirmed', icon: CheckCircle },
      prepaid: { class: 'status-prepaid', icon: DollarSign },
      completed: { class: 'status-completed', icon: CheckCircle },
      cancelled: { class: 'status-cancelled', icon: XCircle },
      no_show: { class: 'status-no_show', icon: AlertCircle },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={config.class}>
        <config.icon className="h-3 w-3 mr-1" />
        {t(`status.${status}`)}
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

  const stats = dashboard?.stats || {};
  const reservations = dashboard?.recent_reservations || [];
  const challenges = dashboard?.active_challenges || [];

  return (
    <div className="space-y-6" data-testid="agent-dashboard-content">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {i18n.language === 'fr' ? 'Bonjour' : 'Hello'}, {user?.first_name} 👋
          </h1>
          <p className="text-slate-600">
            {i18n.language === 'fr' 
              ? 'Voici le résumé de votre activité'
              : 'Here is your activity summary'}
          </p>
        </div>
        <Button asChild className="btn-primary">
          <Link to="/agent/reservations/new">
            <Plus className="h-4 w-4 mr-2" />
            {t('reservation.new')}
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t('dashboard.total_bookings')}</p>
                <p className="text-3xl font-bold text-slate-800">{stats.total_bookings || 0}</p>
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
                <p className="text-sm text-slate-600">{t('dashboard.pending')}</p>
                <p className="text-3xl font-bold text-amber-600">{stats.pending_bookings || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t('dashboard.completed')}</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.completed_bookings || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-[#F5A623]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t('dashboard.total_commission')}</p>
                <p className="text-3xl font-bold text-[#F5A623]">
                  {(stats.total_commission || 0).toFixed(2)} €
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[#F5A623]/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-[#F5A623]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Reservations */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{i18n.language === 'fr' ? 'Réservations récentes' : 'Recent Reservations'}</CardTitle>
              <CardDescription>
                {i18n.language === 'fr' ? 'Vos dernières réservations' : 'Your latest bookings'}
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/agent/reservations">
                {i18n.language === 'fr' ? 'Voir tout' : 'View all'}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {reservations.length > 0 ? (
              <div className="space-y-3">
                {reservations.slice(0, 5).map((res) => (
                  <div 
                    key={res.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#3D3A6B] flex items-center justify-center text-white text-xs font-bold">
                        {res.reference?.slice(-4)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{res.reference}</p>
                        <p className="text-sm text-slate-500">
                          {res.pickup_date} - {res.return_date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(res.status)}
                      <span className="font-semibold text-slate-800">
                        {res.total_price?.toFixed(2)} €
                      </span>
                      <Button asChild variant="ghost" size="icon">
                        <Link to={`/agent/reservations/${res.id}`}>
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

        {/* Active Challenges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#F5A623]" />
              {t('dashboard.challenges')}
            </CardTitle>
            <CardDescription>
              {i18n.language === 'fr' ? 'Vos challenges en cours' : 'Your active challenges'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {challenges.length > 0 ? (
              <div className="space-y-4">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="p-4 rounded-lg border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-2">
                      {i18n.language === 'fr' ? challenge.title_fr : challenge.title_en}
                    </h4>
                    <p className="text-sm text-slate-600 mb-3">
                      {challenge.description_fr?.slice(0, 100)}...
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          {i18n.language === 'fr' ? 'Progression' : 'Progress'}
                        </span>
                        <span className="font-medium">0 / {challenge.tiers?.[0]?.min_bookings || 10}</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge className="bg-[#F5A623]/10 text-[#F5A623]">
                        +{challenge.bonus_commission_rate}% bonus
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {i18n.language === 'fr' ? 'Fin le' : 'Ends'} {challenge.end_date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">
                  {i18n.language === 'fr' ? 'Aucun challenge actif' : 'No active challenges'}
                </p>
                <Button asChild variant="link" className="mt-2">
                  <Link to="/agent/challenges">
                    {i18n.language === 'fr' ? 'Voir les challenges' : 'View challenges'}
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Commission Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            {i18n.language === 'fr' ? 'Résumé des commissions' : 'Commission Summary'}
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
                {i18n.language === 'fr' ? 'CA total généré' : 'Total revenue generated'}
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {(stats.total_revenue || 0).toFixed(2)} €
              </p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-50">
              <p className="text-sm text-emerald-600 mb-1">
                {i18n.language === 'fr' ? 'Commission à percevoir' : 'Commission to receive'}
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                {(stats.total_commission || 0).toFixed(2)} €
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentDashboard;
