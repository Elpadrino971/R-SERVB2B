import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Infinity, Clock, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const STATUS_CONFIG = {
  freesale: {
    label: 'Freesale',
    color: 'bg-green-100 text-green-700 border-green-300',
    badgeVariant: 'outline',
    icon: Infinity,
    desc: 'Ventes illimitées, bypass allotement',
  },
  on_request: {
    label: 'Sur demande',
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    badgeVariant: 'outline',
    icon: Clock,
    desc: 'Réservation soumise à confirmation manuelle',
  },
  non_available: {
    label: 'Non disponible',
    color: 'bg-red-100 text-red-700 border-red-300',
    badgeVariant: 'destructive',
    icon: XCircle,
    desc: 'Catégorie fermée à la vente',
  },
};

const defaultForm = {
  category_id: '',
  agency_id: '',
  period_start: '',
  period_end: '',
  status: 'freesale',
  notes: '',
  is_active: true,
};

export default function AdminAvailabilityPage() {
  const [statuses, setStatuses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState('all');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [sRes, cRes, aRes] = await Promise.all([
        axios.get(`${API}/admin/availability-status`, { headers }),
        axios.get(`${API}/vehicles/categories`),
        axios.get(`${API}/agencies`),
      ]);
      setStatuses(sRes.data);
      setCategories(cRes.data);
      setAgencies(aRes.data);
    } catch (e) {
      toast.error('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      category_id: s.category_id || '',
      agency_id: s.agency_id || '',
      period_start: s.period_start || '',
      period_end: s.period_end || '',
      status: s.status || 'freesale',
      notes: s.notes || '',
      is_active: s.is_active !== false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.category_id || !form.period_start || !form.period_end) {
      toast.error('Catégorie et dates requises');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      agency_id: form.agency_id || null,
    };
    try {
      if (editing) {
        await axios.put(`${API}/admin/availability-status/${editing.id}`, payload, { headers });
        toast.success('Statut mis à jour');
      } else {
        await axios.post(`${API}/admin/availability-status`, payload, { headers });
        toast.success('Statut créé');
      }
      setDialogOpen(false);
      fetchAll();
    } catch (e) {
      toast.error('Erreur sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce statut ?')) return;
    try {
      await axios.delete(`${API}/admin/availability-status/${id}`, { headers });
      toast.success('Statut supprimé');
      fetchAll();
    } catch (e) {
      toast.error('Erreur suppression');
    }
  };

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name_fr || id;
  const getAgencyName = (id) => id ? (agencies.find(a => a.id === id)?.name || id) : 'Toutes les agences';

  const filtered = filterCat === 'all' ? statuses : statuses.filter(s => s.category_id === filterCat);

  // Comptes par statut
  const today = new Date().toISOString().slice(0, 10);
  const activeByStatus = {
    freesale: statuses.filter(s => s.is_active && s.status === 'freesale' && s.period_start <= today && s.period_end >= today).length,
    on_request: statuses.filter(s => s.is_active && s.status === 'on_request' && s.period_start <= today && s.period_end >= today).length,
    non_available: statuses.filter(s => s.is_active && s.status === 'non_available' && s.period_start <= today && s.period_end >= today).length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#3D3A6B]">Disponibilité des catégories</h1>
          <p className="text-sm text-slate-500 mt-1">
            Définissez les statuts Freesale / Sur demande / Non disponible par catégorie et période
          </p>
        </div>
        <Button onClick={openCreate} className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90">
          <Plus className="h-4 w-4 mr-2" /> Nouveau statut
        </Button>
      </div>

      {/* Résumé des statuts actifs */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <Card key={key}>
              <CardContent className="pt-4">
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${cfg.color}`}>
                  <Icon className="h-5 w-5" />
                  <div>
                    <p className="text-xl font-bold">{activeByStatus[key]}</p>
                    <p className="text-xs font-medium">{cfg.label} actifs</p>
                    <p className="text-xs opacity-75">{cfg.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filtre catégorie */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCat('all')}
          className={`px-3 py-1 rounded-full text-sm border transition-colors ${filterCat === 'all' ? 'bg-[#3D3A6B] text-white border-[#3D3A6B]' : 'bg-white border-slate-200 text-slate-600'}`}
        >
          Toutes
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCat(cat.id)}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${filterCat === cat.id ? 'bg-[#3D3A6B] text-white border-[#3D3A6B]' : 'bg-white border-slate-200 text-slate-600'}`}
          >
            {cat.name_fr}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>Aucun statut configuré</p>
              <p className="text-xs mt-1">Par défaut, toutes les catégories suivent les règles d'allotement normales</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Agence</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => {
                  const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.freesale;
                  const Icon = cfg.icon;
                  const isCurrentlyActive = s.is_active && s.period_start <= today && s.period_end >= today;
                  return (
                    <TableRow key={s.id} className={!s.is_active ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">{getCategoryName(s.category_id)}</TableCell>
                      <TableCell className="text-sm text-slate-600">{getAgencyName(s.agency_id)}</TableCell>
                      <TableCell className="text-sm">{s.period_start} → {s.period_end}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border font-medium ${cfg.color}`}>
                          <Icon className="h-3 w-3" />
                          {cfg.label}
                          {isCurrentlyActive && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">{s.notes || '—'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDelete(s.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier le statut' : 'Nouveau statut de disponibilité'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Catégorie *</Label>
              <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name_fr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Agence (optionnel — vide = toutes agences)</Label>
              <Select value={form.agency_id || 'all'} onValueChange={v => setForm(f => ({ ...f, agency_id: v === 'all' ? '' : v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les agences" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les agences</SelectItem>
                  {agencies.map(ag => (
                    <SelectItem key={ag.id} value={ag.id}>{ag.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date début *</Label>
                <Input type="date" value={form.period_start} onChange={e => setForm(f => ({ ...f, period_start: e.target.value }))} />
              </div>
              <div>
                <Label>Date fin *</Label>
                <Input type="date" value={form.period_end} onChange={e => setForm(f => ({ ...f, period_end: e.target.value }))} />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Statut de disponibilité *</Label>
              <div className="space-y-2">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, status: key }))}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                        form.status === key
                          ? `${cfg.color} border-2`
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{cfg.label}</p>
                        <p className="text-xs opacity-75">{cfg.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label>Notes internes</Label>
              <Input
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="ex: Pic de demande prévu, liste d'attente active..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90">
              {saving ? 'Enregistrement...' : (editing ? 'Mettre à jour' : 'Créer')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
