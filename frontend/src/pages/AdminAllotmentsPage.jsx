import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Package, ChevronLeft, ChevronRight, BarChart2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const defaultForm = {
  agency_id: '',
  category_id: '',
  date_start: '',
  date_end: '',
  quantity: 5,
  is_active: true,
};

function getStatusBadge(remaining, quantity) {
  if (remaining <= 0) return { label: 'Épuisé', className: 'bg-red-100 text-red-700' };
  if (remaining === 1) return { label: 'Dernier', className: 'bg-orange-100 text-orange-700' };
  if (remaining <= 5) return { label: 'Limité', className: 'bg-amber-100 text-amber-700' };
  return { label: 'Disponible', className: 'bg-green-100 text-green-700' };
}

export default function AdminAllotmentsPage() {
  const [allotments, setAllotments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [filterAgency, setFilterAgency] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [aRes, cRes, agRes] = await Promise.all([
        axios.get(`${API}/allotments`, { headers }),
        axios.get(`${API}/vehicles/categories`),
        axios.get(`${API}/agencies`),
      ]);
      setAllotments(aRes.data);
      setCategories(cRes.data);
      setAgencies(agRes.data);

      // Récupérer disponibilités actuelles
      const today = new Date().toISOString().slice(0, 10);
      const avRes = await Promise.all(
        aRes.data.map(al =>
          axios.get(`${API}/allotments/availability`, {
            params: {
              agency_id: al.agency_id,
              category_id: al.category_id,
              pickup_date: today,
              return_date: today,
            },
          }).then(r => ({ key: `${al.agency_id}-${al.category_id}`, data: r.data }))
            .catch(() => null)
        )
      );
      const avMap = {};
      avRes.filter(Boolean).forEach(r => { avMap[r.key] = r.data; });
      setAvailability(avMap);
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

  const openEdit = (al) => {
    setEditing(al);
    setForm({
      agency_id: al.agency_id,
      category_id: al.category_id,
      date_start: al.date_start,
      date_end: al.date_end,
      quantity: al.quantity,
      is_active: al.is_active !== false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.agency_id || !form.category_id || !form.date_start || !form.date_end) {
      toast.error('Tous les champs sont requis');
      return;
    }
    if (form.quantity < 1) {
      toast.error('La quantité doit être >= 1');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`${API}/admin/allotments/${editing.id}`, form, { headers });
        toast.success('Allotement mis à jour');
      } else {
        await axios.post(`${API}/admin/allotments`, form, { headers });
        toast.success('Allotement créé');
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
    if (!window.confirm('Supprimer cet allotement ?')) return;
    try {
      await axios.delete(`${API}/admin/allotments/${id}`, { headers });
      toast.success('Allotement supprimé');
      fetchAll();
    } catch (e) {
      toast.error('Erreur suppression');
    }
  };

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name_fr || id;
  const getAgencyName = (id) => agencies.find(a => a.id === id)?.name || id;

  const filtered = allotments.filter(al => {
    if (filterAgency !== 'all' && al.agency_id !== filterAgency) return false;
    if (filterCat !== 'all' && al.category_id !== filterCat) return false;
    return true;
  });

  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();

  const prevMonth = () => {
    if (calMonth === 1) { setCalMonth(12); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 12) { setCalMonth(1); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  const getAllotmentsForDay = (day) => {
    const date = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return allotments.filter(al => al.date_start <= date && al.date_end >= date);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#3D3A6B]">Gestion des Allotements</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quotas de véhicules par catégorie, agence et période. Statut dégressif automatique.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90">
          <Plus className="h-4 w-4 mr-2" /> Nouvel allotement
        </Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Vue liste</TabsTrigger>
          <TabsTrigger value="calendar">Vue calendrier</TabsTrigger>
        </TabsList>

        {/* Vue liste */}
        <TabsContent value="list" className="space-y-4">
          {/* Filtres */}
          <div className="flex gap-3 flex-wrap">
            <Select value={filterAgency} onValueChange={setFilterAgency}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Toutes agences" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes agences</SelectItem>
                {agencies.map(ag => <SelectItem key={ag.id} value={ag.id}>{ag.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Toutes catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name_fr}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-slate-500">Chargement...</div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>Aucun allotement configuré</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agence</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Période</TableHead>
                      <TableHead>Quota</TableHead>
                      <TableHead>Disponibilité</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(al => {
                      const avKey = `${al.agency_id}-${al.category_id}`;
                      const av = availability[avKey];
                      const remaining = av?.remaining;
                      const statusBadge = remaining !== undefined && remaining !== null
                        ? getStatusBadge(remaining, al.quantity)
                        : null;
                      return (
                        <TableRow key={al.id}>
                          <TableCell className="font-medium text-sm">{getAgencyName(al.agency_id)}</TableCell>
                          <TableCell>{getCategoryName(al.category_id)}</TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {al.date_start} → {al.date_end}
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-lg">{al.quantity}</span>
                            <span className="text-xs text-slate-400 ml-1">véhicules</span>
                          </TableCell>
                          <TableCell>
                            {statusBadge ? (
                              <div className="space-y-1">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}>
                                  {statusBadge.label}
                                </span>
                                {remaining !== null && (
                                  <div className="text-xs text-slate-500">
                                    {remaining} / {al.quantity} restants
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" variant="outline" onClick={() => openEdit(al)}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDelete(al.id)}>
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
        </TabsContent>

        {/* Vue calendrier */}
        <TabsContent value="calendar" className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
            <h2 className="text-lg font-semibold">{monthNames[calMonth - 1]} {calYear}</h2>
            <Button variant="outline" size="sm" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-slate-500 py-2">{d}</div>
            ))}
            {/* Jours vides au début */}
            {Array.from({ length: (new Date(calYear, calMonth - 1, 1).getDay() + 6) % 7 }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayAllotments = getAllotmentsForDay(day);
              const today = new Date().toISOString().slice(0, 10);
              const thisDate = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = thisDate === today;
              return (
                <div
                  key={day}
                  className={`min-h-16 p-1 border rounded text-xs ${isToday ? 'border-[#3D3A6B] bg-[#3D3A6B]/5' : 'border-slate-100'}`}
                >
                  <div className={`font-medium mb-1 ${isToday ? 'text-[#3D3A6B]' : 'text-slate-600'}`}>{day}</div>
                  {dayAllotments.slice(0, 3).map(al => (
                    <div
                      key={al.id}
                      className="bg-blue-100 text-blue-700 rounded px-1 py-0.5 mb-0.5 truncate"
                      title={`${getCategoryName(al.category_id)} — ${getAgencyName(al.agency_id)} — ${al.quantity} unités`}
                    >
                      {getCategoryName(al.category_id).slice(0, 8)} ({al.quantity})
                    </div>
                  ))}
                  {dayAllotments.length > 3 && (
                    <div className="text-slate-400">+{dayAllotments.length - 3}</div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier l\'allotement' : 'Nouvel allotement'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Agence *</Label>
              <Select value={form.agency_id} onValueChange={v => setForm(f => ({ ...f, agency_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une agence" />
                </SelectTrigger>
                <SelectContent>
                  {agencies.map(ag => <SelectItem key={ag.id} value={ag.id}>{ag.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Catégorie *</Label>
              <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name_fr}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date début *</Label>
                <Input type="date" value={form.date_start} onChange={e => setForm(f => ({ ...f, date_start: e.target.value }))} />
              </div>
              <div>
                <Label>Date fin *</Label>
                <Input type="date" value={form.date_end} onChange={e => setForm(f => ({ ...f, date_end: e.target.value }))} />
              </div>
            </div>

            <div>
              <Label>Quantité maximale *</Label>
              <Input
                type="number"
                min={1}
                value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
              />
              <p className="text-xs text-slate-500 mt-1">
                Statuts dégressifs : &gt;5 = disponible · 2-5 = limité · 1 = dernier · 0 = épuisé
              </p>
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
