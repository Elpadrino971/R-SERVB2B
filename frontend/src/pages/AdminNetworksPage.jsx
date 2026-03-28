import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Network, Plus, MoreVertical, Edit, Trash2, Trophy, Users, RefreshCw } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const EMPTY_FORM = { name: '', description: '', manager_email: '', commission_bonus: 0 };

const AdminNetworksPage = () => {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardNetwork, setLeaderboardNetwork] = useState(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  useEffect(() => {
    fetchNetworks();
  }, []);

  const fetchNetworks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/networks`);
      setNetworks(res.data || []);
    } catch (error) {
      console.error('Error fetching networks:', error);
      toast.error('Erreur lors du chargement des réseaux');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingNetwork(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (network) => {
    setEditingNetwork(network);
    setForm({
      name: network.name || '',
      description: network.description || '',
      manager_email: network.manager_email || '',
      commission_bonus: network.commission_bonus || 0,
    });
    setDialogOpen(true);
  };

  const saveNetwork = async () => {
    if (!form.name.trim()) {
      toast.error('Le nom du réseau est requis');
      return;
    }
    setSaving(true);
    try {
      if (editingNetwork) {
        await axios.put(`${API}/admin/networks/${editingNetwork.id}`, form);
        toast.success('Réseau mis à jour');
      } else {
        await axios.post(`${API}/admin/networks`, form);
        toast.success('Réseau créé');
      }
      setDialogOpen(false);
      fetchNetworks();
    } catch (error) {
      console.error('Error saving network:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const deleteNetwork = async (network) => {
    if (!window.confirm(`Désactiver le réseau "${network.name}" ?`)) return;
    try {
      await axios.delete(`${API}/admin/networks/${network.id}`);
      toast.success('Réseau désactivé');
      fetchNetworks();
    } catch (error) {
      console.error('Error deleting network:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const openLeaderboard = async (network) => {
    setLeaderboardNetwork(network);
    setLeaderboardOpen(true);
    setLeaderboardLoading(true);
    try {
      const res = await axios.get(`${API}/networks/${network.id}/leaderboard`);
      setLeaderboard(res.data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Erreur lors du chargement du classement');
    } finally {
      setLeaderboardLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Network className="h-6 w-6 text-[#3D3A6B]" />
            Réseaux d'agents
          </h1>
          <p className="text-slate-500">{networks.length} réseau(x) actif(s)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchNetworks}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button className="bg-[#F5A623] hover:bg-[#F5A623]/90 text-black" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau réseau
          </Button>
        </div>
      </div>

      {networks.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-slate-400">
            <Network className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucun réseau d'agents</p>
            <p className="text-sm">Créez un réseau pour regrouper des agents et suivre leur performance collective.</p>
            <Button className="mt-4 bg-[#F5A623] hover:bg-[#F5A623]/90 text-black" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Créer le premier réseau
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Liste des réseaux</CardTitle>
            <CardDescription>Cliquez sur "Classement" pour voir le leaderboard des agents d'un réseau</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Email gestionnaire</TableHead>
                  <TableHead>Bonus commission</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {networks.map((network) => (
                  <TableRow key={network.id}>
                    <TableCell className="font-semibold">{network.name}</TableCell>
                    <TableCell className="text-slate-500 max-w-[200px] truncate">
                      {network.description || '—'}
                    </TableCell>
                    <TableCell className="text-slate-500">{network.manager_email || '—'}</TableCell>
                    <TableCell>
                      {network.commission_bonus ? (
                        <Badge className="bg-green-100 text-green-800">+{network.commission_bonus}%</Badge>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge className={network.is_active ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}>
                        {network.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openLeaderboard(network)}
                        >
                          <Trophy className="h-3 w-3 mr-1" />
                          Classement
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(network)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteNetwork(network)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Désactiver
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog Créer/Modifier */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingNetwork ? 'Modifier le réseau' : 'Nouveau réseau d\'agents'}</DialogTitle>
            <DialogDescription>
              Un réseau regroupe des agents partageant des objectifs communs
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">Nom du réseau *</label>
              <Input
                placeholder="Ex: Réseau Antilles"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Description optionnelle"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email du gestionnaire</label>
              <Input
                type="email"
                placeholder="gestionnaire@example.com"
                value={form.manager_email}
                onChange={(e) => setForm({ ...form, manager_email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Bonus commission réseau (%)</label>
              <Input
                type="number"
                min={0}
                max={20}
                step={0.5}
                value={form.commission_bonus}
                onChange={(e) => setForm({ ...form, commission_bonus: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">Bonus ajouté au taux de commission individuel des agents du réseau</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button
              className="bg-[#F5A623] hover:bg-[#F5A623]/90 text-black"
              onClick={saveNetwork}
              disabled={saving}
            >
              {saving ? 'Sauvegarde...' : editingNetwork ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Leaderboard */}
      <Dialog open={leaderboardOpen} onOpenChange={setLeaderboardOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#F5A623]" />
              Classement — {leaderboardNetwork?.name}
            </DialogTitle>
            <DialogDescription>Agents classés par volume de ventes</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {leaderboardLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>Aucun agent dans ce réseau</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((agent, idx) => (
                  <div
                    key={agent.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      idx === 0 ? 'bg-amber-50 border border-amber-200' :
                      idx === 1 ? 'bg-slate-50 border border-slate-200' :
                      idx === 2 ? 'bg-orange-50 border border-orange-200' :
                      'bg-white border border-gray-100'
                    }`}
                  >
                    <span className={`text-lg font-bold w-8 text-center ${
                      idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-400' : 'text-slate-300'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{agent.agency_name || agent.user_id}</p>
                      <p className="text-xs text-slate-400">Commission: {agent.commission_rate || 0}%</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#F5A623]">{(agent.total_sales || 0).toFixed(0)} €</p>
                      <p className="text-xs text-slate-400">ventes</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaderboardOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNetworksPage;
