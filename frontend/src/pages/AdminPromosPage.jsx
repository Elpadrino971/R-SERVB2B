import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Tag, Zap, Copy, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Checkbox } from '../components/ui/checkbox';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const ROLE_OPTIONS = [
  { value: 'agent', label: 'Agent' },
  { value: 'company', label: 'Entreprise B2B' },
  { value: 'influencer', label: 'Influenceur' },
];

const TRIGGER_TYPES = [
  { value: 'early_bird', label: 'Early Bird', desc: 'Remise si réservé X jours avant' },
  { value: 'min_duration', label: 'Durée minimum', desc: 'Remise si location ≥ N jours' },
  { value: 'partner_profile', label: 'Profil partenaire', desc: 'Remise selon rôle du partenaire' },
  { value: 'period', label: 'Période de location', desc: 'Remise pour une plage de dates' },
];

const defaultCodeForm = {
  code: '',
  name: '',
  description: '',
  discount_type: 'percentage',
  discount_value: 10,
  valid_from: '',
  valid_until: '',
  max_uses: '',
  uses_per_user: 1,
  applicable_roles: [],
  applicable_categories: [],
  conditions: {
    min_days: '',
    max_days: '',
    min_total: '',
    rental_period_start: '',
    rental_period_end: '',
    booking_period_start: '',
    booking_period_end: '',
  },
  is_active: true,
};

const defaultRuleForm = {
  name: '',
  description: '',
  trigger_type: 'early_bird',
  conditions: {
    days_before: 30,
    min_days: '',
    roles: [],
    rental_period_start: '',
    rental_period_end: '',
  },
  discount_type: 'percentage',
  discount_value: 5,
  priority: 0,
  stackable: false,
  applicable_roles: [],
  applicable_categories: [],
  is_active: true,
};

function PromoStatusBadge({ code }) {
  const today = new Date().toISOString().slice(0, 10);
  if (!code.is_active) return <Badge variant="secondary">Désactivé</Badge>;
  if (code.valid_until && code.valid_until < today) return <Badge variant="secondary">Expiré</Badge>;
  if (code.valid_from && code.valid_from > today) return <Badge variant="outline">À venir</Badge>;
  if (code.max_uses && code.used_count >= code.max_uses) return <Badge variant="destructive">Épuisé</Badge>;
  return <Badge className="bg-green-100 text-green-700 border-green-300">Actif</Badge>;
}

export default function AdminPromosPage() {
  const [promoCodes, setPromoCodes] = useState([]);
  const [autoRules, setAutoRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Code dialog
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [codeForm, setCodeForm] = useState(defaultCodeForm);
  const [savingCode, setSavingCode] = useState(false);

  // Rule dialog
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [ruleForm, setRuleForm] = useState(defaultRuleForm);
  const [savingRule, setSavingRule] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [cRes, rRes, catRes] = await Promise.all([
        axios.get(`${API}/admin/promos/codes`, { headers }),
        axios.get(`${API}/admin/promos/rules`, { headers }),
        axios.get(`${API}/vehicles/categories`),
      ]);
      setPromoCodes(cRes.data);
      setAutoRules(rRes.data);
      setCategories(catRes.data);
    } catch (e) {
      toast.error('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  // === CODES PROMO ===
  const openCreateCode = () => {
    setEditingCode(null);
    setCodeForm(defaultCodeForm);
    setCodeDialogOpen(true);
  };

  const openEditCode = (code) => {
    setEditingCode(code);
    setCodeForm({
      code: code.code || '',
      name: code.name || '',
      description: code.description || '',
      discount_type: code.discount_type || 'percentage',
      discount_value: code.discount_value || 10,
      valid_from: code.valid_from || '',
      valid_until: code.valid_until || '',
      max_uses: code.max_uses || '',
      uses_per_user: code.uses_per_user || 1,
      applicable_roles: code.applicable_roles || [],
      applicable_categories: code.applicable_categories || [],
      conditions: code.conditions || defaultCodeForm.conditions,
      is_active: code.is_active !== false,
    });
    setCodeDialogOpen(true);
  };

  const handleSaveCode = async () => {
    if (!codeForm.code || !codeForm.name || !codeForm.valid_from || !codeForm.valid_until) {
      toast.error('Code, nom et dates requis');
      return;
    }
    setSavingCode(true);
    const payload = {
      ...codeForm,
      code: codeForm.code.toUpperCase(),
      max_uses: codeForm.max_uses ? parseInt(codeForm.max_uses) : null,
      conditions: Object.fromEntries(
        Object.entries(codeForm.conditions).filter(([_, v]) => v !== '' && v !== null)
      ),
    };
    try {
      if (editingCode) {
        await axios.put(`${API}/admin/promos/codes/${editingCode.id}`, payload, { headers });
        toast.success('Code promo mis à jour');
      } else {
        await axios.post(`${API}/admin/promos/codes`, payload, { headers });
        toast.success('Code promo créé');
      }
      setCodeDialogOpen(false);
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Erreur sauvegarde');
    } finally {
      setSavingCode(false);
    }
  };

  const handleDeleteCode = async (id) => {
    if (!window.confirm('Désactiver ce code promo ?')) return;
    try {
      await axios.delete(`${API}/admin/promos/codes/${id}`, { headers });
      toast.success('Code désactivé');
      fetchAll();
    } catch (e) {
      toast.error('Erreur');
    }
  };

  // === RÈGLES AUTO ===
  const openCreateRule = () => {
    setEditingRule(null);
    setRuleForm(defaultRuleForm);
    setRuleDialogOpen(true);
  };

  const openEditRule = (rule) => {
    setEditingRule(rule);
    setRuleForm({
      name: rule.name || '',
      description: rule.description || '',
      trigger_type: rule.trigger_type || 'early_bird',
      conditions: rule.conditions || defaultRuleForm.conditions,
      discount_type: rule.discount_type || 'percentage',
      discount_value: rule.discount_value || 5,
      priority: rule.priority || 0,
      stackable: rule.stackable || false,
      applicable_roles: rule.applicable_roles || [],
      applicable_categories: rule.applicable_categories || [],
      is_active: rule.is_active !== false,
    });
    setRuleDialogOpen(true);
  };

  const handleSaveRule = async () => {
    if (!ruleForm.name) { toast.error('Nom requis'); return; }
    setSavingRule(true);
    const payload = {
      ...ruleForm,
      conditions: Object.fromEntries(
        Object.entries(ruleForm.conditions).filter(([_, v]) => v !== '' && v !== null && !(Array.isArray(v) && v.length === 0))
      ),
    };
    try {
      if (editingRule) {
        await axios.put(`${API}/admin/promos/rules/${editingRule.id}`, payload, { headers });
        toast.success('Règle mise à jour');
      } else {
        await axios.post(`${API}/admin/promos/rules`, payload, { headers });
        toast.success('Règle créée');
      }
      setRuleDialogOpen(false);
      fetchAll();
    } catch (e) {
      toast.error('Erreur sauvegarde');
    } finally {
      setSavingRule(false);
    }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm('Désactiver cette règle ?')) return;
    try {
      await axios.delete(`${API}/admin/promos/rules/${id}`, { headers });
      toast.success('Règle désactivée');
      fetchAll();
    } catch (e) {
      toast.error('Erreur');
    }
  };

  const toggleRole = (field, setter, role) => {
    setter(f => ({
      ...f,
      [field]: f[field].includes(role) ? f[field].filter(r => r !== role) : [...f[field], role]
    }));
  };

  const toggleCat = (form, setter, catId) => {
    setter(f => ({
      ...f,
      applicable_categories: f.applicable_categories.includes(catId)
        ? f.applicable_categories.filter(c => c !== catId)
        : [...f.applicable_categories, catId]
    }));
  };

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name_fr || id;

  const activeCodesCount = promoCodes.filter(c => {
    const today = new Date().toISOString().slice(0, 10);
    return c.is_active && (!c.valid_from || c.valid_from <= today) && (!c.valid_until || c.valid_until >= today)
      && (!c.max_uses || c.used_count < c.max_uses);
  }).length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#3D3A6B]">Promotions & Codes Promos</h1>
        <p className="text-sm text-slate-500 mt-1">
          Codes manuels et règles automatiques (early bird, durée min, profil partenaire...)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#3D3A6B]/10 rounded-lg"><Tag className="h-5 w-5 text-[#3D3A6B]" /></div>
              <div>
                <p className="text-2xl font-bold">{promoCodes.length}</p>
                <p className="text-xs text-slate-500">Codes créés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-2xl font-bold text-green-600">{activeCodesCount}</p>
                <p className="text-xs text-slate-500">Codes actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg"><Zap className="h-5 w-5 text-amber-600" /></div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{autoRules.filter(r => r.is_active).length}</p>
                <p className="text-xs text-slate-500">Règles auto actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Copy className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {promoCodes.reduce((sum, c) => sum + (c.used_count || 0), 0)}
                </p>
                <p className="text-xs text-slate-500">Utilisations totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="codes">
        <TabsList>
          <TabsTrigger value="codes">Codes Promos ({promoCodes.length})</TabsTrigger>
          <TabsTrigger value="rules">Règles Automatiques ({autoRules.length})</TabsTrigger>
        </TabsList>

        {/* ========== CODES PROMOS ========== */}
        <TabsContent value="codes" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreateCode} className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90">
              <Plus className="h-4 w-4 mr-2" /> Nouveau code promo
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? <div className="p-8 text-center text-slate-500">Chargement...</div>
                : promoCodes.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <Tag className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p>Aucun code promo créé</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Remise</TableHead>
                        <TableHead>Validité</TableHead>
                        <TableHead>Utilisations</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {promoCodes.map(code => (
                        <TableRow key={code.id}>
                          <TableCell>
                            <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono font-bold">
                              {code.code}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-sm">{code.name}</div>
                            {code.description && <div className="text-xs text-slate-400">{code.description}</div>}
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-[#F5A623]">
                              {code.discount_type === 'percentage'
                                ? `-${code.discount_value}%`
                                : `-${code.discount_value}€`}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-slate-600">
                            {code.valid_from} → {code.valid_until}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {code.used_count || 0}
                              {code.max_uses ? ` / ${code.max_uses}` : ' / ∞'}
                            </span>
                          </TableCell>
                          <TableCell><PromoStatusBadge code={code} /></TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" variant="outline" onClick={() => openEditCode(code)}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDeleteCode(code.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== RÈGLES AUTO ========== */}
        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreateRule} className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90">
              <Plus className="h-4 w-4 mr-2" /> Nouvelle règle auto
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? <div className="p-8 text-center text-slate-500">Chargement...</div>
                : autoRules.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <Zap className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p>Aucune règle automatique créée</p>
                    <p className="text-xs mt-1">Les règles s'appliquent automatiquement selon les conditions</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Déclencheur</TableHead>
                        <TableHead>Remise</TableHead>
                        <TableHead>Priorité</TableHead>
                        <TableHead>Cumulable</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {autoRules.map(rule => {
                        const trigger = TRIGGER_TYPES.find(t => t.value === rule.trigger_type);
                        return (
                          <TableRow key={rule.id}>
                            <TableCell>
                              <div className="font-medium text-sm">{rule.name}</div>
                              {rule.description && <div className="text-xs text-slate-400">{rule.description}</div>}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{trigger?.label || rule.trigger_type}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-bold text-[#F5A623]">
                                {rule.discount_type === 'percentage'
                                  ? `-${rule.discount_value}%`
                                  : `-${rule.discount_value}€`}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">P{rule.priority}</Badge>
                            </TableCell>
                            <TableCell>
                              {rule.stackable
                                ? <Badge className="bg-green-100 text-green-700">Oui</Badge>
                                : <Badge variant="secondary">Non</Badge>}
                            </TableCell>
                            <TableCell>
                              {rule.is_active
                                ? <Badge className="bg-green-100 text-green-700">Active</Badge>
                                : <Badge variant="secondary">Inactive</Badge>}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="outline" onClick={() => openEditRule(rule)}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDeleteRule(rule.id)}>
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
      </Tabs>

      {/* ========== DIALOG CODE PROMO ========== */}
      <Dialog open={codeDialogOpen} onOpenChange={setCodeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCode ? 'Modifier le code promo' : 'Nouveau code promo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Code *</Label>
                <Input
                  value={codeForm.code}
                  onChange={e => setCodeForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="EX: ETE25"
                  className="font-mono uppercase"
                />
              </div>
              <div>
                <Label>Nom *</Label>
                <Input value={codeForm.name} onChange={e => setCodeForm(f => ({ ...f, name: e.target.value }))} placeholder="Promo été 2025" />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Input value={codeForm.description} onChange={e => setCodeForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type de remise</Label>
                <Select value={codeForm.discount_type} onValueChange={v => setCodeForm(f => ({ ...f, discount_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                    <SelectItem value="fixed_amount">Montant fixe (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valeur *</Label>
                <Input
                  type="number"
                  min={0}
                  value={codeForm.discount_value}
                  onChange={e => setCodeForm(f => ({ ...f, discount_value: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valide du *</Label>
                <Input type="date" value={codeForm.valid_from} onChange={e => setCodeForm(f => ({ ...f, valid_from: e.target.value }))} />
              </div>
              <div>
                <Label>Valide jusqu'au *</Label>
                <Input type="date" value={codeForm.valid_until} onChange={e => setCodeForm(f => ({ ...f, valid_until: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nb max d'utilisations (vide = illimité)</Label>
                <Input
                  type="number"
                  min={1}
                  value={codeForm.max_uses}
                  onChange={e => setCodeForm(f => ({ ...f, max_uses: e.target.value }))}
                  placeholder="∞"
                />
              </div>
              <div>
                <Label>Utilisations par utilisateur</Label>
                <Input
                  type="number"
                  min={1}
                  value={codeForm.uses_per_user}
                  onChange={e => setCodeForm(f => ({ ...f, uses_per_user: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>

            {/* Conditions */}
            <div className="border rounded-lg p-4 space-y-3 bg-slate-50">
              <p className="font-medium text-sm">Conditions (optionnelles)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Durée min (jours)</Label>
                  <Input type="number" min={1} value={codeForm.conditions.min_days}
                    onChange={e => setCodeForm(f => ({ ...f, conditions: { ...f.conditions, min_days: e.target.value } }))} placeholder="—" />
                </div>
                <div>
                  <Label className="text-xs">Durée max (jours)</Label>
                  <Input type="number" min={1} value={codeForm.conditions.max_days}
                    onChange={e => setCodeForm(f => ({ ...f, conditions: { ...f.conditions, max_days: e.target.value } }))} placeholder="—" />
                </div>
                <div>
                  <Label className="text-xs">Montant min (€)</Label>
                  <Input type="number" min={0} value={codeForm.conditions.min_total}
                    onChange={e => setCodeForm(f => ({ ...f, conditions: { ...f.conditions, min_total: e.target.value } }))} placeholder="—" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Période location début</Label>
                  <Input type="date" value={codeForm.conditions.rental_period_start}
                    onChange={e => setCodeForm(f => ({ ...f, conditions: { ...f.conditions, rental_period_start: e.target.value } }))} />
                </div>
                <div>
                  <Label className="text-xs">Période location fin</Label>
                  <Input type="date" value={codeForm.conditions.rental_period_end}
                    onChange={e => setCodeForm(f => ({ ...f, conditions: { ...f.conditions, rental_period_end: e.target.value } }))} />
                </div>
              </div>
            </div>

            {/* Rôles applicables */}
            <div>
              <Label className="mb-2 block">Rôles applicables (vide = tous)</Label>
              <div className="flex gap-2 flex-wrap">
                {ROLE_OPTIONS.map(r => (
                  <button key={r.value} type="button"
                    onClick={() => toggleRole('applicable_roles', setCodeForm, r.value)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      codeForm.applicable_roles.includes(r.value)
                        ? 'bg-[#3D3A6B] text-white border-[#3D3A6B]'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Catégories applicables */}
            <div>
              <Label className="mb-2 block">Catégories applicables (vide = toutes)</Label>
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <button key={cat.id} type="button"
                    onClick={() => toggleCat(codeForm, setCodeForm, cat.id)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      codeForm.applicable_categories.includes(cat.id)
                        ? 'bg-[#3D3A6B] text-white border-[#3D3A6B]'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}>
                    {cat.name_fr}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCodeDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveCode} disabled={savingCode} className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90">
              {savingCode ? 'Enregistrement...' : (editingCode ? 'Mettre à jour' : 'Créer')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== DIALOG RÈGLE AUTO ========== */}
      <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Modifier la règle' : 'Nouvelle règle automatique'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom *</Label>
                <Input value={ruleForm.name} onChange={e => setRuleForm(f => ({ ...f, name: e.target.value }))} placeholder="Early Bird 30j" />
              </div>
              <div>
                <Label>Priorité</Label>
                <Input type="number" min={0} value={ruleForm.priority}
                  onChange={e => setRuleForm(f => ({ ...f, priority: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Input value={ruleForm.description} onChange={e => setRuleForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            <div>
              <Label className="mb-2 block">Type de déclencheur *</Label>
              <div className="grid grid-cols-2 gap-2">
                {TRIGGER_TYPES.map(t => (
                  <button key={t.value} type="button"
                    onClick={() => setRuleForm(f => ({ ...f, trigger_type: t.value }))}
                    className={`p-3 text-left rounded-lg border transition-all ${
                      ruleForm.trigger_type === t.value
                        ? 'border-[#3D3A6B] bg-[#3D3A6B]/5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}>
                    <p className="font-medium text-sm">{t.label}</p>
                    <p className="text-xs text-slate-500">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Conditions selon type */}
            <div className="border rounded-lg p-4 bg-slate-50 space-y-3">
              <p className="font-medium text-sm">Paramètres du déclencheur</p>
              {ruleForm.trigger_type === 'early_bird' && (
                <div>
                  <Label className="text-xs">Réserver X jours minimum avant le départ</Label>
                  <Input type="number" min={1} value={ruleForm.conditions.days_before || 30}
                    onChange={e => setRuleForm(f => ({ ...f, conditions: { ...f.conditions, days_before: parseInt(e.target.value) || 30 } }))} />
                </div>
              )}
              {ruleForm.trigger_type === 'min_duration' && (
                <div>
                  <Label className="text-xs">Durée minimum (jours)</Label>
                  <Input type="number" min={1} value={ruleForm.conditions.min_days || 7}
                    onChange={e => setRuleForm(f => ({ ...f, conditions: { ...f.conditions, min_days: parseInt(e.target.value) || 7 } }))} />
                </div>
              )}
              {ruleForm.trigger_type === 'period' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Période de location début</Label>
                    <Input type="date" value={ruleForm.conditions.rental_period_start || ''}
                      onChange={e => setRuleForm(f => ({ ...f, conditions: { ...f.conditions, rental_period_start: e.target.value } }))} />
                  </div>
                  <div>
                    <Label className="text-xs">Période de location fin</Label>
                    <Input type="date" value={ruleForm.conditions.rental_period_end || ''}
                      onChange={e => setRuleForm(f => ({ ...f, conditions: { ...f.conditions, rental_period_end: e.target.value } }))} />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type de remise</Label>
                <Select value={ruleForm.discount_type} onValueChange={v => setRuleForm(f => ({ ...f, discount_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                    <SelectItem value="fixed_amount">Montant fixe (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valeur *</Label>
                <Input type="number" min={0} value={ruleForm.discount_value}
                  onChange={e => setRuleForm(f => ({ ...f, discount_value: parseFloat(e.target.value) || 0 }))} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox checked={ruleForm.stackable} onCheckedChange={v => setRuleForm(f => ({ ...f, stackable: v }))} />
              <div>
                <p className="text-sm font-medium">Cumulable avec un code promo</p>
                <p className="text-xs text-slate-500">Si coché, la remise s'additionne avec un code manuel</p>
              </div>
            </div>

            {/* Rôles */}
            <div>
              <Label className="mb-2 block">Rôles applicables (vide = tous)</Label>
              <div className="flex gap-2 flex-wrap">
                {ROLE_OPTIONS.map(r => (
                  <button key={r.value} type="button"
                    onClick={() => toggleRole('applicable_roles', setRuleForm, r.value)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      ruleForm.applicable_roles.includes(r.value)
                        ? 'bg-[#3D3A6B] text-white border-[#3D3A6B]'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Catégories */}
            <div>
              <Label className="mb-2 block">Catégories applicables (vide = toutes)</Label>
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <button key={cat.id} type="button"
                    onClick={() => toggleCat(ruleForm, setRuleForm, cat.id)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      ruleForm.applicable_categories.includes(cat.id)
                        ? 'bg-[#3D3A6B] text-white border-[#3D3A6B]'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}>
                    {cat.name_fr}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRuleDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveRule} disabled={savingRule} className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90">
              {savingRule ? 'Enregistrement...' : (editingRule ? 'Mettre à jour' : 'Créer')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
