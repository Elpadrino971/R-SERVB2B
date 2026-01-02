import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Trophy, Calendar, Target, Award, TrendingUp, Users, CheckCircle, Clock, Filter
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AgentChallengesPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active');
  const [participatingChallenges, setParticipatingChallenges] = useState(new Set());

  useEffect(() => {
    fetchChallenges();
    fetchLeaderboard();
  }, [statusFilter]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await axios.get(`${API}/challenges?${params.toString()}`);
      const data = response.data.challenges || response.data || [];

      setChallenges(data);

      // Track which challenges the user is participating in
      const participating = new Set(
        data.filter(c => c.is_participating).map(c => c.id)
      );
      setParticipatingChallenges(participating);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast.error(i18n.language === 'fr'
        ? 'Erreur lors du chargement des challenges'
        : 'Error loading challenges'
      );
      // Use mock data in case of error
      setChallenges([
        {
          id: '1',
          title_fr: 'Challenge Summer 2024',
          title_en: 'Summer Challenge 2024',
          description_fr: 'Réalisez 10 réservations ce mois-ci pour gagner un bonus de commission de 5%',
          description_en: 'Complete 10 reservations this month to earn a 5% commission bonus',
          start_date: '2024-06-01',
          end_date: '2024-06-30',
          status: 'active',
          bonus_commission_rate: 5,
          target_categories: ['compact', 'sedan', 'suv'],
          tiers: [
            { level: 1, min_bookings: 5, max_bookings: 9, bonus_rate: 2 },
            { level: 2, min_bookings: 10, max_bookings: 19, bonus_rate: 5 },
            { level: 3, min_bookings: 20, max_bookings: null, bonus_rate: 10 }
          ],
          current_progress: 3,
          is_participating: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API}/challenges/leaderboard`);
      setLeaderboard(response.data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Mock leaderboard data
      setLeaderboard([
        { rank: 1, agent_name: 'Marie Dupont', total_bookings: 45, total_commission: 4500 },
        { rank: 2, agent_name: 'Jean Martin', total_bookings: 38, total_commission: 3800 },
        { rank: 3, agent_name: 'Sophie Bernard', total_bookings: 32, total_commission: 3200 },
      ]);
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    try {
      await axios.post(`${API}/challenges/${challengeId}/join`);

      toast.success(i18n.language === 'fr'
        ? 'Vous participez maintenant à ce challenge!'
        : 'You are now participating in this challenge!'
      );

      setParticipatingChallenges(prev => new Set([...prev, challengeId]));
      fetchChallenges();
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast.error(i18n.language === 'fr'
        ? 'Erreur lors de l\'inscription au challenge'
        : 'Error joining challenge'
      );
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Actif' },
      upcoming: { class: 'bg-blue-100 text-blue-800', icon: Clock, label: 'À venir' },
      completed: { class: 'bg-slate-100 text-slate-800', icon: Trophy, label: 'Terminé' },
    };
    const config = statusConfig[status] || statusConfig.active;
    return (
      <Badge className={config.class}>
        <config.icon className="h-3 w-3 mr-1" />
        {i18n.language === 'fr' ? config.label : status}
      </Badge>
    );
  };

  const calculateProgress = (challenge) => {
    const currentProgress = challenge.current_progress || 0;
    const firstTier = challenge.tiers?.[0]?.min_bookings || 10;
    return Math.min((currentProgress / firstTier) * 100, 100);
  };

  const filteredChallenges = challenges;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="agent-challenges-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {i18n.language === 'fr' ? 'Challenges' : 'Challenges'}
          </h1>
          <p className="text-slate-600">
            {i18n.language === 'fr'
              ? 'Participez aux challenges pour augmenter vos commissions'
              : 'Join challenges to boost your commissions'}
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-[#3D3A6B] to-[#F5A623] text-white text-base px-4 py-2">
          <Trophy className="h-4 w-4 mr-2" />
          {participatingChallenges.size} {i18n.language === 'fr' ? 'actif(s)' : 'active'}
        </Badge>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-[#3D3A6B]" />
            {i18n.language === 'fr' ? 'Filtrer' : 'Filter'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="max-w-xs" data-testid="status-filter">
              <SelectValue placeholder={i18n.language === 'fr' ? 'Statut' : 'Status'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{i18n.language === 'fr' ? 'Tous' : 'All'}</SelectItem>
              <SelectItem value="active">{i18n.language === 'fr' ? 'Actifs' : 'Active'}</SelectItem>
              <SelectItem value="upcoming">{i18n.language === 'fr' ? 'À venir' : 'Upcoming'}</SelectItem>
              <SelectItem value="completed">{i18n.language === 'fr' ? 'Terminés' : 'Completed'}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Challenges Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {filteredChallenges.length > 0 ? (
          filteredChallenges.map((challenge) => {
            const isParticipating = participatingChallenges.has(challenge.id) || challenge.is_participating;
            const progress = calculateProgress(challenge);

            return (
              <Card
                key={challenge.id}
                className={`card-hover ${isParticipating ? 'border-[#F5A623] border-2' : ''}`}
                data-testid="challenge-card"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-[#F5A623]" />
                        {i18n.language === 'fr' ? challenge.title_fr : challenge.title_en}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {i18n.language === 'fr' ? challenge.description_fr : challenge.description_en}
                      </CardDescription>
                    </div>
                    {getStatusBadge(challenge.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Period */}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {challenge.start_date} {i18n.language === 'fr' ? 'au' : 'to'} {challenge.end_date}
                    </span>
                  </div>

                  {/* Target Categories */}
                  {challenge.target_categories && challenge.target_categories.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-2">
                        {i18n.language === 'fr' ? 'Catégories cibles:' : 'Target categories:'}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {challenge.target_categories.map((cat, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tiers */}
                  {challenge.tiers && challenge.tiers.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-2">
                        {i18n.language === 'fr' ? 'Paliers de récompense:' : 'Reward tiers:'}
                      </p>
                      <div className="space-y-2">
                        {challenge.tiers.map((tier, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-sm"
                          >
                            <span className="text-slate-700">
                              <Target className="h-3 w-3 inline mr-1" />
                              {tier.min_bookings}
                              {tier.max_bookings ? `-${tier.max_bookings}` : '+'}
                              {i18n.language === 'fr' ? ' réservations' : ' bookings'}
                            </span>
                            <Badge className="bg-[#F5A623]/10 text-[#F5A623]">
                              +{tier.bonus_rate}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Progress */}
                  {isParticipating && challenge.status === 'active' && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">
                          {i18n.language === 'fr' ? 'Votre progression' : 'Your progress'}
                        </span>
                        <span className="font-medium">
                          {challenge.current_progress || 0} / {challenge.tiers?.[0]?.min_bookings || 10}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2">
                    {isParticipating ? (
                      <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">
                          {i18n.language === 'fr' ? 'Vous participez' : 'Participating'}
                        </span>
                      </div>
                    ) : challenge.status === 'active' ? (
                      <Button
                        onClick={() => handleJoinChallenge(challenge.id)}
                        className="w-full bg-[#F5A623] hover:bg-[#F5A623]/90"
                        data-testid="join-challenge-btn"
                      >
                        <Award className="h-4 w-4 mr-2" />
                        {i18n.language === 'fr' ? 'Participer' : 'Join Challenge'}
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        {challenge.status === 'upcoming'
                          ? (i18n.language === 'fr' ? 'Bientôt disponible' : 'Coming Soon')
                          : (i18n.language === 'fr' ? 'Terminé' : 'Completed')
                        }
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="lg:col-span-2">
            <CardContent className="py-12 text-center">
              <Trophy className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                {i18n.language === 'fr'
                  ? 'Aucun challenge trouvé pour ce filtre'
                  : 'No challenges found for this filter'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#3D3A6B]" />
              {i18n.language === 'fr' ? 'Classement du réseau' : 'Network Leaderboard'}
            </CardTitle>
            <CardDescription>
              {i18n.language === 'fr'
                ? 'Top agents du réseau ce mois-ci'
                : 'Top agents of the network this month'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">{i18n.language === 'fr' ? 'Rang' : 'Rank'}</TableHead>
                    <TableHead>{i18n.language === 'fr' ? 'Agent' : 'Agent'}</TableHead>
                    <TableHead className="text-right">{i18n.language === 'fr' ? 'Réservations' : 'Bookings'}</TableHead>
                    <TableHead className="text-right">{i18n.language === 'fr' ? 'Commission' : 'Commission'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((entry) => (
                    <TableRow
                      key={entry.rank}
                      className={entry.agent_name === `${user?.first_name} ${user?.last_name}` ? 'bg-[#F5A623]/10' : ''}
                    >
                      <TableCell>
                        <div className="flex items-center justify-center">
                          {entry.rank <= 3 ? (
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-white ${
                              entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                              entry.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                              'bg-gradient-to-br from-amber-600 to-amber-800'
                            }`}>
                              {entry.rank}
                            </div>
                          ) : (
                            <span className="font-semibold text-slate-600">{entry.rank}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{entry.agent_name}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{entry.total_bookings}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-emerald-600">
                        {entry.total_commission?.toFixed(2)} €
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentChallengesPage;
