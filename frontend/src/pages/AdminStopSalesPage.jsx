import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Ban, Plus, Pencil, Trash2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Checkbox } from '../components/ui/checkbox';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const AXES_OPTIONS = [
  { value: 'booking_date', label: 'Date de réservation', description: 'Date à laquelle le client réserve' },
  { value: 'checkout_date', label: 'Date de départ', description: 'Date de départ du véhicule (checkout)' },
  { value: 'checkin_date', label: 'Date de retour', description: 'Date de retour du véhicule (checkin)' },
];

const ROLE_OPTIONS = [
  { value: 'agent', label: 'Agents de voyage' },
  { value: 'company', label: 'Entreprises B2B' },
  { value: 'influencer', label: 'Influenceurs' },
];

const defaultForm = {
  name: '',
  axes: [],
  period_start: '',
  period_end: '',
  target_type: 'all',
  target_ids: [],
  category_ids: [],
  agency_ids: [],
  reason: '',
  is_active: true,
};

function getStopSaleStatus(ss) {
  const today = new Date().toISOString().slice(0, 10);
  if (!ss.is_active) return { label: 'Désactivé', color: 'secondary' };
  if (ss.period_end < today) return { label: 'Expiré', color: 'secondary' };
  if (ss.period_start > today) return { label: 'À venir', color: 'outline' };
  return { label: 'Actif', color: 'destructive' };
}

export default function AdminStopSalesPage() {
  const [stopSales, setStopSales] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [ssRes, catRes, agRes, netRes] = await Promise.all([
        axios.get(`${API}/admin/stop-sales`, { headers }),
        axios.get(`${API}/vehicles/categories`),
        axios.get(`${API}/agencies`),
        axios.get(`${API}/networks`),
      ]);
      setStopSales(ssRes.data);
      setCategories(catRes.data);
      setAgencies(agRes.data);
      setNetworks(netRes.data);
    } catch (e) {
      toast.error('Erreur chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (ss) => {
    setEditing(ss);
    setForm({
      name: ss.name || '',
      axes: ss.axes || [],
      period_start: ss.period_start || '',
      period_end: ss.period_end || '',
      target_type: ss.target_type || 'all',
      target_ids: ss.target_ids || [],
      category_ids: ss.category_ids || [],
      agency_ids: ss.agency_ids || [],
      reason: ss.reason || '',
      is_active: ss.is_active !== false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.period_start || !form.period_end) {
      toast.error('Nom et dates requis');
      return;
    }
    if (form.axes.length === 0) {
      toast.error('Sélectionnez au moins un axe de dates');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`${API}/admin/stop-sales/${editing.id}`, form, { headers });
        toast.success('Stop-sale mis à jour');
      } else {
        await axios.post(`${API}/admin/stop-sales`, form, { headers });
        toast.success('Stop-sale créé');
      }
      setDialogOpen(false);
      fetchAll();
    } catch (e) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Désactiver ce stop-sale ?')) return;
    try {
      await axios.delete(`${API}/admin/stop-sales/${id}`, { headers });
      toast.success('Stop-sale désactivé');
      fetchAll();
    } catch (e) {
      toast.error('Erreur suppression');
    }
  };

  const toggleAxis = (axis) => {
    setForm(f => ({
      ...f,
      axes: f.axes.includes(axis) ? f.axes.filter(a => a !== axis) : [...f.axes, axis]
    }));
  };

  const toggleMulti = (field, value) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter(v => v !== value) : [...f[field], value]
    }));
  };

  const activeCount = stopSales.filter(ss => {
    const today = new Date().toISOString().slice(0, 10);
    return ss.is_active && ss.period_start <= today && ss.period_end >= today;
  }).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#3D3A6B]">Stop-Sales</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestion des fermetures de ventes par période, axe de dates et profil partenaire
          </p>
        </div>
        <Button onClick={openCreate} className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90">
          <Plus className="h-4 w-4 mr-2" /> Nouveau stop-sale
        </Button>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg"><Ban className="h-5 w-5 text-red-600" /></div>
              <div>
                <p className="text-2xl font-bold text-red-600">{activeCount}</p>
                <p className="text-xs text-slate-500">Stop-sales actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg"><Clock className="h-5 w-5 text-amber-600" /></div>
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {stopSales.filter(ss => ss.is_active && ss.period_start > new Date().toISOString().slice(0, 10)).length}
                </p>
                <p className="text-xs text-slate-500">À venir</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg"><CheckCircle className="h-5 w-5 text-slate-500" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-600">{stopSales.length}</p>
                <p className="text-xs text-slate-500">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Chargement...</div>
          ) : stopSales.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Ban className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>Aucun stop-sale configuré</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Axes</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Cibles</TableHead>
                  <TableHead>Catégories</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stopSales.map(ss => {
                  const status = getStopSaleStatus(ss);
                  return (
                    <TableRow key={ss.id}>
                      <TableCell>
                        <div className="font-medium">{ss.name}</div>
                        {ss.reason && <div className="text-xs text-slate-400">{ss.reason}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(ss.axes || []).map(a => (
                            <Badge key={a} variant="outline" className="text-xs">
                              {AXES_OPTIONS.find(o => o.value === a)?.label || a}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {ss.period_start} → {ss.period_end}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {ss.target_type === 'all' && <Badge variant="secondary">Tous</Badge>}
                          {ss.target_type === 'role' && (
                            <div className="flex flex-wrap gap-1">
                              {(ss.target_ids || []).map(r => (
                                <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                              ))}
                            </div>
                          )}
                          {ss.target_type === 'network' && (
                            <span className="text-xs text-slate-500">{ss.target_ids?.length} réseau(x)</span>
                          )}
                          {ss.target_type === 'agent' && (
                            <span className="text-xs text-slate-500">{ss.target_ids?.length} agent(s)</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {(ss.category_ids || []).length === 0
                          ? <span className="text-xs text-slate-400">Toutes</span>
                          : <span className="text-xs">{ss.category_ids.length} cat.</span>
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => openEdit(ss)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDelete(ss.id)}>
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

      {/* Dialog création / édition */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier le stop-sale' : 'Nouveau stop-sale'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Nom */}
            <div>
              <Label>Nom du stop-sale *</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="ex: Fermeture SUV influenceurs - Janvier"
              />
            </div>

            {/* Axes de dates */}
            <div>
              <Label className="mb-2 block">Axes de dates bloqués *</Label>
              <div className="space-y-2">
                {AXES_OPTIONS.map(opt => (
                  <div key={opt.value} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Checkbox
                      checked={form.axes.includes(opt.value)}
                      onCheckedChange={() => toggleAxis(opt.value)}
                    />
                    <div>
                      <p className="font-medium text-sm">{opt.label}</p>
                      <p className="text-xs text-slate-500">{opt.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Période */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date début *</Label>
                <Input type="date" value={form.period_start} onChange={e => setForm(f => ({ ...f, period_start: e.target.value }))} />
              </div>
              <div>
                <Label>Date fin *</Label>
                <Input type="date" value={form.period_end} onChange={e => setForm(f => ({ ...f, period_end: e.target.value }))} />
              </div>
            </div>

            {/* Cible */}
            <div>
              <Label>Cible des partenaires</Label>
              <Select value={form.target_type} onValueChange={v => setForm(f => ({ ...f, target_type: v, target_ids: [] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les partenaires</SelectItem>
                  <SelectItem value="role">Par rôle (influenceur, agent...)</SelectItem>
                  <SelectItem value="network">Par réseau</SelectItem>
                  <SelectItem value="agent">Agents spécifiques (ID)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rôles */}
            {form.target_type === 'role' && (
              <div>
                <Label className="mb-2 block">Rôles bloqués</Label>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => toggleMulti('target_ids', r.value)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        form.target_ids.includes(r.value)
                          ? 'bg-red-100 border-red-400 text-red-700'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Réseaux */}
            {form.target_type === 'network' && (
              <div>
                <Label className="mb-2 block">Réseaux bloqués</Label>
                <div className="flex flex-wrap gap-2">
                  {networks.map(n => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => toggleMulti('target_ids', n.id)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        form.target_ids.includes(n.id)
                          ? 'bg-red-100 border-red-400 text-red-700'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {n.name}
                    </button>
                  ))}
                  {networks.length === 0 && <p className="text-sm text-slate-400">Aucun réseau configuré</p>}
                </div>
              </div>
            )}

            {/* Agent IDs manuels */}
            {form.target_type === 'agent' && (
              <div>
                <Label>IDs des agents (un par ligne)</Label>
                <textarea
                  className="w-full border rounded-md p-2 text-sm h-20"
                  value={(form.target_ids || []).join('\n')}
                  onChange={e => setForm(f => ({ ...f, target_ids: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) }))}
                  placeholder="agent-id-1&#10;agent-id-2"
                />
              </div>
            )}

            {/* Catégories */}
            <div>
              <Label className="mb-2 block">Catégories concernées (vide = toutes)</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleMulti('category_ids', cat.id)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      form.category_ids.includes(cat.id)
                        ? 'bg-[#3D3A6B] text-white border-[#3D3A6B]'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {cat.name_fr}
                  </button>
                ))}
              </div>
            </div>

            {/* Agences */}
            <div>
              <Label className="mb-2 block">Agences concernées (vide = toutes)</Label>
              <div className="flex flex-wrap gap-2">
                {agencies.map(ag => (
                  <button
                    key={ag.id}
                    type="button"
                    onClick={() => toggleMulti('agency_ids', ag.id)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      form.agency_ids.includes(ag.id)
                        ? 'bg-[#3D3A6B] text-white border-[#3D3A6B]'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {ag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Raison */}
            <div>
              <Label>Raison / Note interne</Label>
              <Input
                value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="ex: Maintenance fleet, overbooking préventif..."
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
