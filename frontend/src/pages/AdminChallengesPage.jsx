import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Trophy, Plus, Edit, Calendar, DollarSign, Target, Trash2, Play, StopCircle
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminChallengesPage = () => {
  const { i18n } = useTranslation();
  const [challenges, setChallenges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [challengeForm, setChallengeForm] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    target_categories: [],
    reward_tiers: [
      { threshold: 10, description: 'Bronze', bonus: 50 },
      { threshold: 25, description: 'Argent', bonus: 150 },
      { threshold: 50, description: 'Or', bonus: 300 }
    ],
    status: 'draft'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [challengesRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/challenges`).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/vehicles/categories`).catch(() => ({ data: [] }))
      ]);
      setChallenges(challengesRes.data.challenges || challengesRes.data || []);
      setCategories(categoriesRes.data.categories || categoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors du chargement' : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (challenge = null) => {
    if (challenge) {
      setEditingChallenge(challenge);
      setChallengeForm({
        name: challenge.name,
        description: challenge.description,
        start_date: challenge.start_date?.split('T')[0] || '',
        end_date: challenge.end_date?.split('T')[0] || '',
        target_categories: challenge.target_categories || [],
        reward_tiers: challenge.reward_tiers || [
          { threshold: 10, description: 'Bronze', bonus: 50 },
          { threshold: 25, description: 'Argent', bonus: 150 },
          { threshold: 50, description: 'Or', bonus: 300 }
        ],
        status: challenge.status || 'draft'
      });
    } else {
      setEditingChallenge(null);
      setChallengeForm({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        target_categories: [],
        reward_tiers: [
          { threshold: 10, description: 'Bronze', bonus: 50 },
          { threshold: 25, description: 'Argent', bonus: 150 },
          { threshold: 50, description: 'Or', bonus: 300 }
        ],
        status: 'draft'
      });
    }
    setDialogOpen(true);
  };

  const saveChallenge = async () => {
    try {
      if (editingChallenge) {
        await axios.put(`${API}/admin/challenges/${editingChallenge.id}`, challengeForm);
        toast.success(i18n.language === 'fr' ? 'Challenge mis à jour' : 'Challenge updated');
      } else {
        await axios.post(`${API}/admin/challenges`, challengeForm);
        toast.success(i18n.language === 'fr' ? 'Challenge créé' : 'Challenge created');
      }
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving challenge:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de la sauvegarde' : 'Error saving challenge');
    }
  };

  const updateChallengeStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API}/admin/challenges/${id}`, { status: newStatus });
      toast.success(i18n.language === 'fr' ? 'Statut mis à jour' : 'Status updated');
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de la mise à jour' : 'Error updating status');
    }
  };

  const deleteChallenge = async (id) => {
    if (!window.confirm(i18n.language === 'fr' ? 'Confirmer la suppression ?' : 'Confirm deletion?')) {
      return;
    }
    try {
      await axios.delete(`${API}/admin/challenges/${id}`);
      toast.success(i18n.language === 'fr' ? 'Challenge supprimé' : 'Challenge deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de la suppression' : 'Error deleting challenge');
    }
  };

  const toggleCategory = (categoryId) => {
    setChallengeForm(prev => ({
      ...prev,
      target_categories: prev.target_categories.includes(categoryId)
        ? prev.target_categories.filter(id => id !== categoryId)
        : [...prev.target_categories, categoryId]
    }));
  };

  const updateRewardTier = (index, field, value) => {
    setChallengeForm(prev => ({
      ...prev,
      reward_tiers: prev.reward_tiers.map((tier, i) =>
        i === index ? { ...tier, [field]: field === 'threshold' || field === 'bonus' ? parseFloat(value) : value } : tier
      )
    }));
  };

  const addRewardTier = () => {
    setChallengeForm(prev => ({
      ...prev,
      reward_tiers: [...prev.reward_tiers, { threshold: 0, description: '', bonus: 0 }]
    }));
  };

  const removeRewardTier = (index) => {
    setChallengeForm(prev => ({
      ...prev,
      reward_tiers: prev.reward_tiers.filter((_, i) => i !== index)
    }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { class: 'bg-slate-100 text-slate-800', label: 'Brouillon' },
      active: { class: 'bg-emerald-100 text-emerald-800', label: 'Actif' },
      upcoming: { class: 'bg-blue-100 text-blue-800', label: 'À venir' },
      completed: { class: 'bg-purple-100 text-purple-800', label: 'Terminé' },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return <Badge className={config.class}>{i18n.language === 'fr' ? config.label : status}</Badge>;
  };

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const upcomingChallenges = challenges.filter(c => c.status === 'upcoming');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-challenges-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {i18n.language === 'fr' ? 'Gestion des Challenges' : 'Challenges Management'}
          </h1>
          <p className="text-slate-600">
            {i18n.language === 'fr'
              ? `${activeChallenges.length} actif(s) • ${upcomingChallenges.length} à venir • ${completedChallenges.length} terminé(s)`
              : `${activeChallenges.length} active • ${upcomingChallenges.length} upcoming • ${completedChallenges.length} completed`}
          </p>
        </div>
        <Button onClick={() => openDialog()} className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90" data-testid="create-challenge-btn">
          <Plus className="h-4 w-4 mr-2" />
          {i18n.language === 'fr' ? 'Créer challenge' : 'Create Challenge'}
        </Button>
      </div>

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">
            {i18n.language === 'fr' ? 'Challenges actifs' : 'Active Challenges'}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {activeChallenges.map((challenge) => (
              <Card key={challenge.id} className="card-hover border-[#F5A623]" data-testid={`challenge-card-${challenge.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#F5A623]/10 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-[#F5A623]" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{challenge.name}</CardTitle>
                        <CardDescription className="mt-1">{challenge.description}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(challenge.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(challenge.start_date).toLocaleDateString()} → {new Date(challenge.end_date).toLocaleDateString()}</span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      {i18n.language === 'fr' ? 'Paliers de récompenses :' : 'Reward Tiers:'}
                    </p>
                    <div className="space-y-1">
                      {challenge.reward_tiers?.map((tier, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">
                            <Target className="h-3 w-3 inline mr-1" />
                            {tier.threshold} {i18n.language === 'fr' ? 'réservations' : 'reservations'} - {tier.description}
                          </span>
                          <span className="font-medium text-emerald-600">+{tier.bonus}€</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openDialog(challenge)}
                      data-testid={`edit-challenge-${challenge.id}`}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {i18n.language === 'fr' ? 'Modifier' : 'Edit'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateChallengeStatus(challenge.id, 'completed')}
                      data-testid={`complete-challenge-${challenge.id}`}
                    >
                      <StopCircle className="h-4 w-4 text-purple-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Challenges */}
      {upcomingChallenges.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">
            {i18n.language === 'fr' ? 'Challenges à venir' : 'Upcoming Challenges'}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {upcomingChallenges.map((challenge) => (
              <Card key={challenge.id} className="card-hover" data-testid={`challenge-card-${challenge.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{challenge.name}</CardTitle>
                    {getStatusBadge(challenge.status)}
                  </div>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(challenge.start_date).toLocaleDateString()} → {new Date(challenge.end_date).toLocaleDateString()}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openDialog(challenge)}
                      data-testid={`edit-challenge-${challenge.id}`}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {i18n.language === 'fr' ? 'Modifier' : 'Edit'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateChallengeStatus(challenge.id, 'active')}
                      data-testid={`activate-challenge-${challenge.id}`}
                    >
                      <Play className="h-4 w-4 text-emerald-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteChallenge(challenge.id)}
                      data-testid={`delete-challenge-${challenge.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">
            {i18n.language === 'fr' ? 'Challenges terminés' : 'Completed Challenges'}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {completedChallenges.map((challenge) => (
              <Card key={challenge.id} className="opacity-75" data-testid={`challenge-card-${challenge.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{challenge.name}</CardTitle>
                    {getStatusBadge(challenge.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(challenge.start_date).toLocaleDateString()} → {new Date(challenge.end_date).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {challenges.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            {i18n.language === 'fr' ? 'Aucun challenge trouvé' : 'No challenges found'}
          </CardContent>
        </Card>
      )}

      {/* Challenge Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="challenge-dialog">
          <DialogHeader>
            <DialogTitle>
              {editingChallenge
                ? (i18n.language === 'fr' ? 'Modifier le challenge' : 'Edit Challenge')
                : (i18n.language === 'fr' ? 'Créer un challenge' : 'Create Challenge')}
            </DialogTitle>
            <DialogDescription>
              {i18n.language === 'fr'
                ? 'Définissez les objectifs et récompenses du challenge'
                : 'Define challenge goals and rewards'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {i18n.language === 'fr' ? 'Nom du challenge' : 'Challenge Name'} *
              </label>
              <Input
                value={challengeForm.name}
                onChange={(e) => setChallengeForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Challenge été 2024"
                data-testid="challenge-name-input"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {i18n.language === 'fr' ? 'Description' : 'Description'} *
              </label>
              <textarea
                className="w-full min-h-[80px] p-2 border rounded-md text-sm"
                value={challengeForm.description}
                onChange={(e) => setChallengeForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez l'objectif du challenge..."
                data-testid="challenge-description-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Date début' : 'Start Date'} *
                </label>
                <Input
                  type="date"
                  value={challengeForm.start_date}
                  onChange={(e) => setChallengeForm(prev => ({ ...prev, start_date: e.target.value }))}
                  data-testid="challenge-start-input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Date fin' : 'End Date'} *
                </label>
                <Input
                  type="date"
                  value={challengeForm.end_date}
                  onChange={(e) => setChallengeForm(prev => ({ ...prev, end_date: e.target.value }))}
                  data-testid="challenge-end-input"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {i18n.language === 'fr' ? 'Statut' : 'Status'}
              </label>
              <Select
                value={challengeForm.status}
                onValueChange={(value) => setChallengeForm(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger data-testid="challenge-status-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{i18n.language === 'fr' ? 'Brouillon' : 'Draft'}</SelectItem>
                  <SelectItem value="upcoming">{i18n.language === 'fr' ? 'À venir' : 'Upcoming'}</SelectItem>
                  <SelectItem value="active">{i18n.language === 'fr' ? 'Actif' : 'Active'}</SelectItem>
                  <SelectItem value="completed">{i18n.language === 'fr' ? 'Terminé' : 'Completed'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {i18n.language === 'fr' ? 'Catégories cibles' : 'Target Categories'}
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <Button
                    key={cat.id}
                    type="button"
                    variant={challengeForm.target_categories.includes(cat.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleCategory(cat.id)}
                    className={challengeForm.target_categories.includes(cat.id) ? 'bg-[#3D3A6B] hover:bg-[#3D3A6B]/90' : ''}
                    data-testid={`category-${cat.id}`}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  {i18n.language === 'fr' ? 'Paliers de récompenses' : 'Reward Tiers'}
                </label>
                <Button type="button" variant="outline" size="sm" onClick={addRewardTier} data-testid="add-tier-btn">
                  <Plus className="h-4 w-4 mr-1" />
                  {i18n.language === 'fr' ? 'Ajouter palier' : 'Add Tier'}
                </Button>
              </div>
              <div className="space-y-2">
                {challengeForm.reward_tiers.map((tier, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <Input
                      type="number"
                      className="col-span-3"
                      placeholder="Seuil"
                      value={tier.threshold}
                      onChange={(e) => updateRewardTier(idx, 'threshold', e.target.value)}
                      data-testid={`tier-threshold-${idx}`}
                    />
                    <Input
                      className="col-span-4"
                      placeholder="Description"
                      value={tier.description}
                      onChange={(e) => updateRewardTier(idx, 'description', e.target.value)}
                      data-testid={`tier-description-${idx}`}
                    />
                    <Input
                      type="number"
                      className="col-span-3"
                      placeholder="Bonus €"
                      value={tier.bonus}
                      onChange={(e) => updateRewardTier(idx, 'bonus', e.target.value)}
                      data-testid={`tier-bonus-${idx}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="col-span-2"
                      onClick={() => removeRewardTier(idx)}
                      data-testid={`remove-tier-${idx}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {i18n.language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button onClick={saveChallenge} className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90" data-testid="save-challenge-btn">
              {i18n.language === 'fr' ? 'Enregistrer' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminChallengesPage;
