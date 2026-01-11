import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  DollarSign, Plus, Edit, Trash2, Calendar, Download, Upload
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminPricingPage = () => {
  const { i18n } = useTranslation();
  const [seasons, setSeasons] = useState([]);
  const [pricingGrids, setPricingGrids] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Season Dialog
  const [seasonDialogOpen, setSeasonDialogOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState(null);
  const [seasonForm, setSeasonForm] = useState({
    name: '',
    start_date: '',
    end_date: '',
    multiplier: '1.0'
  });

  // Pricing Dialog
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState(null);
  const [pricingForm, setPricingForm] = useState({
    category_id: '',
    season_id: '',
    price_1_3_days: '',
    price_4_7_days: '',
    price_8_14_days: '',
    price_15_21_days: '',
    price_22_plus_days: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [seasonsRes, pricingRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/admin/seasons`).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/pricing`).catch(() => ({ data: [] })),
        axios.get(`${API}/admin/vehicles/categories`).catch(() => ({ data: [] }))
      ]);
      setSeasons(seasonsRes.data.seasons || seasonsRes.data || []);
      setPricingGrids(pricingRes.data.pricing || pricingRes.data || []);
      setCategories(categoriesRes.data.categories || categoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors du chargement' : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  // Season Functions
  const openSeasonDialog = (season = null) => {
    if (season) {
      setEditingSeason(season);
      setSeasonForm({
        name: season.name,
        start_date: season.start_date,
        end_date: season.end_date,
        multiplier: season.multiplier?.toString() || '1.0'
      });
    } else {
      setEditingSeason(null);
      setSeasonForm({
        name: '',
        start_date: '',
        end_date: '',
        multiplier: '1.0'
      });
    }
    setSeasonDialogOpen(true);
  };

  const saveSeason = async () => {
    try {
      // Validate dates
      const start = new Date(seasonForm.start_date);
      const end = new Date(seasonForm.end_date);

      if (start >= end) {
        toast.error(i18n.language === 'fr' ? 'La date de fin doit être après la date de début' : 'End date must be after start date');
        return;
      }

      // Check for overlaps
      const overlaps = seasons.filter(s => s.id !== editingSeason?.id).some(s => {
        const sStart = new Date(s.start_date);
        const sEnd = new Date(s.end_date);
        return (start <= sEnd && end >= sStart);
      });

      if (overlaps) {
        toast.error(i18n.language === 'fr' ? 'Chevauchement de dates avec une autre saison' : 'Date overlap with another season');
        return;
      }

      const payload = {
        ...seasonForm,
        multiplier: parseFloat(seasonForm.multiplier)
      };

      if (editingSeason) {
        await axios.put(`${API}/admin/seasons/${editingSeason.id}`, payload);
        toast.success(i18n.language === 'fr' ? 'Saison mise à jour' : 'Season updated');
      } else {
        await axios.post(`${API}/admin/seasons`, payload);
        toast.success(i18n.language === 'fr' ? 'Saison créée' : 'Season created');
      }

      setSeasonDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving season:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de la sauvegarde' : 'Error saving season');
    }
  };

  const deleteSeason = async (id) => {
    if (!window.confirm(i18n.language === 'fr' ? 'Confirmer la suppression ?' : 'Confirm deletion?')) {
      return;
    }
    try {
      await axios.delete(`${API}/admin/seasons/${id}`);
      toast.success(i18n.language === 'fr' ? 'Saison supprimée' : 'Season deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting season:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de la suppression' : 'Error deleting season');
    }
  };

  // Pricing Functions
  const openPricingDialog = (pricing = null) => {
    if (pricing) {
      setEditingPricing(pricing);
      setPricingForm({
        category_id: pricing.category_id,
        season_id: pricing.season_id,
        price_1_3_days: pricing.price_1_3_days?.toString() || '',
        price_4_7_days: pricing.price_4_7_days?.toString() || '',
        price_8_14_days: pricing.price_8_14_days?.toString() || '',
        price_15_21_days: pricing.price_15_21_days?.toString() || '',
        price_22_plus_days: pricing.price_22_plus_days?.toString() || ''
      });
    } else {
      setEditingPricing(null);
      setPricingForm({
        category_id: '',
        season_id: '',
        price_1_3_days: '',
        price_4_7_days: '',
        price_8_14_days: '',
        price_15_21_days: '',
        price_22_plus_days: ''
      });
    }
    setPricingDialogOpen(true);
  };

  const savePricing = async () => {
    try {
      const payload = {
        category_id: pricingForm.category_id,
        season_id: pricingForm.season_id,
        price_1_3_days: parseFloat(pricingForm.price_1_3_days),
        price_4_7_days: parseFloat(pricingForm.price_4_7_days),
        price_8_14_days: parseFloat(pricingForm.price_8_14_days),
        price_15_21_days: parseFloat(pricingForm.price_15_21_days),
        price_22_plus_days: parseFloat(pricingForm.price_22_plus_days)
      };

      if (editingPricing) {
        await axios.put(`${API}/admin/pricing/${editingPricing.id}`, payload);
        toast.success(i18n.language === 'fr' ? 'Grille mise à jour' : 'Pricing updated');
      } else {
        await axios.post(`${API}/admin/pricing`, payload);
        toast.success(i18n.language === 'fr' ? 'Grille créée' : 'Pricing created');
      }

      setPricingDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving pricing:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de la sauvegarde' : 'Error saving pricing');
    }
  };

  const deletePricing = async (id) => {
    if (!window.confirm(i18n.language === 'fr' ? 'Confirmer la suppression ?' : 'Confirm deletion?')) {
      return;
    }
    try {
      await axios.delete(`${API}/admin/pricing/${id}`);
      toast.success(i18n.language === 'fr' ? 'Grille supprimée' : 'Pricing deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting pricing:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de la suppression' : 'Error deleting pricing');
    }
  };

  const exportCSV = async () => {
    toast.info(i18n.language === 'fr' ? 'Export CSV en cours...' : 'Exporting CSV...');
  };

  const importCSV = () => {
    toast.info(i18n.language === 'fr' ? 'Import CSV (simulation)' : 'Import CSV (simulation)');
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || categoryId;
  };

  const getSeasonName = (seasonId) => {
    const season = seasons.find(s => s.id === seasonId);
    return season?.name || seasonId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-pricing-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          {i18n.language === 'fr' ? 'Gestion Tarifs & Saisons' : 'Pricing & Seasons Management'}
        </h1>
        <p className="text-slate-600">
          {i18n.language === 'fr'
            ? `${seasons.length} saison(s) • ${pricingGrids.length} grille(s) tarifaire(s)`
            : `${seasons.length} season(s) • ${pricingGrids.length} pricing grid(s)`}
        </p>
      </div>

      <Tabs defaultValue="seasons" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="seasons" data-testid="seasons-tab">
            {i18n.language === 'fr' ? 'Saisons' : 'Seasons'}
          </TabsTrigger>
          <TabsTrigger value="pricing" data-testid="pricing-tab">
            {i18n.language === 'fr' ? 'Grilles Tarifaires' : 'Pricing Grids'}
          </TabsTrigger>
        </TabsList>

        {/* Seasons Tab */}
        <TabsContent value="seasons" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openSeasonDialog()} className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90" data-testid="create-season-btn">
              <Plus className="h-4 w-4 mr-2" />
              {i18n.language === 'fr' ? 'Créer saison' : 'Create Season'}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                <Calendar className="h-5 w-5 inline mr-2" />
                {i18n.language === 'fr' ? 'Saisons' : 'Seasons'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{i18n.language === 'fr' ? 'Nom' : 'Name'}</TableHead>
                    <TableHead>{i18n.language === 'fr' ? 'Date début' : 'Start Date'}</TableHead>
                    <TableHead>{i18n.language === 'fr' ? 'Date fin' : 'End Date'}</TableHead>
                    <TableHead>{i18n.language === 'fr' ? 'Coefficient' : 'Multiplier'}</TableHead>
                    <TableHead className="text-right">{i18n.language === 'fr' ? 'Actions' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seasons.map((season) => (
                    <TableRow key={season.id} data-testid={`season-row-${season.id}`}>
                      <TableCell className="font-medium">{season.name}</TableCell>
                      <TableCell>{new Date(season.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(season.end_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className="bg-[#F5A623]/10 text-[#F5A623]">
                          x{season.multiplier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openSeasonDialog(season)}
                            data-testid={`edit-season-${season.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSeason(season.id)}
                            data-testid={`delete-season-${season.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {seasons.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        {i18n.language === 'fr' ? 'Aucune saison' : 'No seasons'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={importCSV} data-testid="import-csv-btn">
                <Upload className="h-4 w-4 mr-2" />
                {i18n.language === 'fr' ? 'Import CSV' : 'Import CSV'}
              </Button>
              <Button variant="outline" onClick={exportCSV} data-testid="export-csv-btn">
                <Download className="h-4 w-4 mr-2" />
                {i18n.language === 'fr' ? 'Export CSV' : 'Export CSV'}
              </Button>
            </div>
            <Button onClick={() => openPricingDialog()} className="bg-[#F5A623] hover:bg-[#F5A623]/90" data-testid="create-pricing-btn">
              <Plus className="h-4 w-4 mr-2" />
              {i18n.language === 'fr' ? 'Créer grille' : 'Create Grid'}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                <DollarSign className="h-5 w-5 inline mr-2" />
                {i18n.language === 'fr' ? 'Grilles Tarifaires' : 'Pricing Grids'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{i18n.language === 'fr' ? 'Catégorie' : 'Category'}</TableHead>
                      <TableHead>{i18n.language === 'fr' ? 'Saison' : 'Season'}</TableHead>
                      <TableHead className="text-right">1-3j</TableHead>
                      <TableHead className="text-right">4-7j</TableHead>
                      <TableHead className="text-right">8-14j</TableHead>
                      <TableHead className="text-right">15-21j</TableHead>
                      <TableHead className="text-right">22j+</TableHead>
                      <TableHead className="text-right">{i18n.language === 'fr' ? 'Actions' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricingGrids.map((pricing) => (
                      <TableRow key={pricing.id} data-testid={`pricing-row-${pricing.id}`}>
                        <TableCell className="font-medium">{getCategoryName(pricing.category_id)}</TableCell>
                        <TableCell>{getSeasonName(pricing.season_id)}</TableCell>
                        <TableCell className="text-right">{pricing.price_1_3_days}€</TableCell>
                        <TableCell className="text-right">{pricing.price_4_7_days}€</TableCell>
                        <TableCell className="text-right">{pricing.price_8_14_days}€</TableCell>
                        <TableCell className="text-right">{pricing.price_15_21_days}€</TableCell>
                        <TableCell className="text-right">{pricing.price_22_plus_days}€</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPricingDialog(pricing)}
                              data-testid={`edit-pricing-${pricing.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deletePricing(pricing.id)}
                              data-testid={`delete-pricing-${pricing.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {pricingGrids.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                          {i18n.language === 'fr' ? 'Aucune grille tarifaire' : 'No pricing grids'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Season Dialog */}
      <Dialog open={seasonDialogOpen} onOpenChange={setSeasonDialogOpen}>
        <DialogContent data-testid="season-dialog">
          <DialogHeader>
            <DialogTitle>
              {editingSeason
                ? (i18n.language === 'fr' ? 'Modifier la saison' : 'Edit Season')
                : (i18n.language === 'fr' ? 'Créer une saison' : 'Create Season')}
            </DialogTitle>
            <DialogDescription>
              {i18n.language === 'fr'
                ? 'Les dates ne doivent pas chevaucher d\'autres saisons'
                : 'Dates must not overlap with other seasons'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {i18n.language === 'fr' ? 'Nom' : 'Name'} *
              </label>
              <Input
                value={seasonForm.name}
                onChange={(e) => setSeasonForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Haute saison"
                data-testid="season-name-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Date début' : 'Start Date'} *
                </label>
                <Input
                  type="date"
                  value={seasonForm.start_date}
                  onChange={(e) => setSeasonForm(prev => ({ ...prev, start_date: e.target.value }))}
                  data-testid="season-start-input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Date fin' : 'End Date'} *
                </label>
                <Input
                  type="date"
                  value={seasonForm.end_date}
                  onChange={(e) => setSeasonForm(prev => ({ ...prev, end_date: e.target.value }))}
                  data-testid="season-end-input"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {i18n.language === 'fr' ? 'Coefficient multiplicateur' : 'Multiplier'} *
              </label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={seasonForm.multiplier}
                onChange={(e) => setSeasonForm(prev => ({ ...prev, multiplier: e.target.value }))}
                placeholder="1.0"
                data-testid="season-multiplier-input"
              />
              <p className="text-xs text-slate-500 mt-1">
                {i18n.language === 'fr'
                  ? 'Ex: 1.5 pour +50%, 0.8 pour -20%'
                  : 'Ex: 1.5 for +50%, 0.8 for -20%'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSeasonDialogOpen(false)}>
              {i18n.language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button onClick={saveSeason} className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90" data-testid="save-season-btn">
              {i18n.language === 'fr' ? 'Enregistrer' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pricing Dialog */}
      <Dialog open={pricingDialogOpen} onOpenChange={setPricingDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="pricing-dialog">
          <DialogHeader>
            <DialogTitle>
              {editingPricing
                ? (i18n.language === 'fr' ? 'Modifier la grille' : 'Edit Pricing')
                : (i18n.language === 'fr' ? 'Créer une grille' : 'Create Pricing')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Catégorie' : 'Category'} *
                </label>
                <Select
                  value={pricingForm.category_id}
                  onValueChange={(value) => setPricingForm(prev => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger data-testid="pricing-category-select">
                    <SelectValue placeholder={i18n.language === 'fr' ? 'Sélectionner' : 'Select'} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Saison' : 'Season'} *
                </label>
                <Select
                  value={pricingForm.season_id}
                  onValueChange={(value) => setPricingForm(prev => ({ ...prev, season_id: value }))}
                >
                  <SelectTrigger data-testid="pricing-season-select">
                    <SelectValue placeholder={i18n.language === 'fr' ? 'Sélectionner' : 'Select'} />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map(season => (
                      <SelectItem key={season.id} value={season.id}>{season.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Prix 1-3 jours (€)' : 'Price 1-3 days (€)'} *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={pricingForm.price_1_3_days}
                  onChange={(e) => setPricingForm(prev => ({ ...prev, price_1_3_days: e.target.value }))}
                  data-testid="price-1-3-input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Prix 4-7 jours (€)' : 'Price 4-7 days (€)'} *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={pricingForm.price_4_7_days}
                  onChange={(e) => setPricingForm(prev => ({ ...prev, price_4_7_days: e.target.value }))}
                  data-testid="price-4-7-input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Prix 8-14 jours (€)' : 'Price 8-14 days (€)'} *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={pricingForm.price_8_14_days}
                  onChange={(e) => setPricingForm(prev => ({ ...prev, price_8_14_days: e.target.value }))}
                  data-testid="price-8-14-input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Prix 15-21 jours (€)' : 'Price 15-21 days (€)'} *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={pricingForm.price_15_21_days}
                  onChange={(e) => setPricingForm(prev => ({ ...prev, price_15_21_days: e.target.value }))}
                  data-testid="price-15-21-input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Prix 22+ jours (€)' : 'Price 22+ days (€)'} *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={pricingForm.price_22_plus_days}
                  onChange={(e) => setPricingForm(prev => ({ ...prev, price_22_plus_days: e.target.value }))}
                  data-testid="price-22-plus-input"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPricingDialogOpen(false)}>
              {i18n.language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button onClick={savePricing} className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90" data-testid="save-pricing-btn">
              {i18n.language === 'fr' ? 'Enregistrer' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPricingPage;
