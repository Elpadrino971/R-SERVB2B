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
  Car, Plus, Edit, Trash2, Users, Briefcase, Zap, Heart, Sparkles, Tag
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminVehiclesPage = () => {
  const { i18n } = useTranslation();
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [motorizationFilter, setMotorizationFilter] = useState('all');

  // Category Dialog
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  // Vehicle Dialog
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({
    name: '',
    category_id: '',
    passengers: '',
    luggage: '',
    motorization: 'essence',
    tags: [],
    image_url: ''
  });

  const motorizations = ['essence', 'diesel', 'électrique', 'hybride'];
  const availableTags = ['électrique', 'hybride', 'coup de cœur', 'nouveau', 'recommandé'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/vehicles`),
        axios.get(`${API}/admin/vehicles/categories`)
      ]);
      setVehicles(vehiclesRes.data.vehicles || vehiclesRes.data || []);
      setCategories(categoriesRes.data.categories || categoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors du chargement' : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  // Category Functions
  const createCategory = async () => {
    if (!categoryName.trim()) {
      toast.error(i18n.language === 'fr' ? 'Le nom est requis' : 'Name is required');
      return;
    }
    try {
      await axios.post(`${API}/admin/vehicles/categories`, { name: categoryName });
      toast.success(i18n.language === 'fr' ? 'Catégorie créée' : 'Category created');
      setCategoryDialogOpen(false);
      setCategoryName('');
      fetchData();
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de la création' : 'Error creating category');
    }
  };

  // Vehicle Functions
  const openVehicleDialog = (vehicle = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setVehicleForm({
        name: vehicle.name,
        category_id: vehicle.category_id,
        passengers: vehicle.passengers,
        luggage: vehicle.luggage,
        motorization: vehicle.motorization || 'essence',
        tags: vehicle.tags || [],
        image_url: vehicle.image_url || ''
      });
    } else {
      setEditingVehicle(null);
      setVehicleForm({
        name: '',
        category_id: '',
        passengers: '',
        luggage: '',
        motorization: 'essence',
        tags: [],
        image_url: ''
      });
    }
    setVehicleDialogOpen(true);
  };

  const saveVehicle = async () => {
    try {
      if (editingVehicle) {
        await axios.put(`${API}/admin/vehicles/${editingVehicle.id}`, vehicleForm);
        toast.success(i18n.language === 'fr' ? 'Véhicule mis à jour' : 'Vehicle updated');
      } else {
        await axios.post(`${API}/admin/vehicles`, vehicleForm);
        toast.success(i18n.language === 'fr' ? 'Véhicule créé' : 'Vehicle created');
      }
      setVehicleDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de la sauvegarde' : 'Error saving vehicle');
    }
  };

  const deleteVehicle = async (id) => {
    if (!window.confirm(i18n.language === 'fr' ? 'Confirmer la suppression ?' : 'Confirm deletion?')) {
      return;
    }
    try {
      await axios.delete(`${API}/admin/vehicles/${id}`);
      toast.success(i18n.language === 'fr' ? 'Véhicule supprimé' : 'Vehicle deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de la suppression' : 'Error deleting vehicle');
    }
  };

  const toggleTag = (tag) => {
    setVehicleForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const getTagIcon = (tag) => {
    switch (tag) {
      case 'électrique': return <Zap className="h-3 w-3" />;
      case 'hybride': return <Zap className="h-3 w-3" />;
      case 'coup de cœur': return <Heart className="h-3 w-3" />;
      case 'nouveau': return <Sparkles className="h-3 w-3" />;
      case 'recommandé': return <Tag className="h-3 w-3" />;
      default: return null;
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    if (categoryFilter !== 'all' && v.category_id !== categoryFilter) return false;
    if (motorizationFilter !== 'all' && v.motorization !== motorizationFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-vehicles-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          {i18n.language === 'fr' ? 'Gestion des véhicules' : 'Vehicle Management'}
        </h1>
        <p className="text-slate-600">
          {i18n.language === 'fr'
            ? `${vehicles.length} véhicule(s) • ${categories.length} catégorie(s)`
            : `${vehicles.length} vehicle(s) • ${categories.length} category(ies)`}
        </p>
      </div>

      <Tabs defaultValue="vehicles" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="categories" data-testid="categories-tab">
            {i18n.language === 'fr' ? 'Catégories' : 'Categories'}
          </TabsTrigger>
          <TabsTrigger value="vehicles" data-testid="vehicles-tab">
            {i18n.language === 'fr' ? 'Véhicules' : 'Vehicles'}
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setCategoryDialogOpen(true)} className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90" data-testid="create-category-btn">
              <Plus className="h-4 w-4 mr-2" />
              {i18n.language === 'fr' ? 'Créer catégorie' : 'Create Category'}
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{i18n.language === 'fr' ? 'Nom' : 'Name'}</TableHead>
                    <TableHead>{i18n.language === 'fr' ? 'Véhicules' : 'Vehicles'}</TableHead>
                    <TableHead>{i18n.language === 'fr' ? 'Date création' : 'Created'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell>
                        {vehicles.filter(v => v.category_id === cat.id).length}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {cat.created_at ? new Date(cat.created_at).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {categories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                        {i18n.language === 'fr' ? 'Aucune catégorie' : 'No categories'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]" data-testid="category-filter">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={motorizationFilter} onValueChange={setMotorizationFilter}>
                <SelectTrigger className="w-[180px]" data-testid="motorization-filter">
                  <SelectValue placeholder="Motorisation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes motorisations</SelectItem>
                  {motorizations.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => openVehicleDialog()} className="bg-[#F5A623] hover:bg-[#F5A623]/90" data-testid="add-vehicle-btn">
              <Plus className="h-4 w-4 mr-2" />
              {i18n.language === 'fr' ? 'Ajouter véhicule' : 'Add Vehicle'}
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="card-hover" data-testid={`vehicle-card-${vehicle.id}`}>
                <CardContent className="p-4">
                  {vehicle.image_url && (
                    <img
                      src={vehicle.image_url}
                      alt={vehicle.name}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-bold text-lg text-slate-800 mb-2">{vehicle.name}</h3>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {vehicle.tags?.map(tag => (
                      <Badge key={tag} className="bg-[#F5A623]/10 text-[#F5A623] text-xs">
                        {getTagIcon(tag)}
                        <span className="ml-1">{tag}</span>
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {vehicle.passengers} {i18n.language === 'fr' ? 'passagers' : 'passengers'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {vehicle.luggage} {i18n.language === 'fr' ? 'bagages' : 'luggage'}
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 mb-3">
                    {vehicle.motorization}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openVehicleDialog(vehicle)}
                      data-testid={`edit-vehicle-${vehicle.id}`}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {i18n.language === 'fr' ? 'Modifier' : 'Edit'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteVehicle(vehicle.id)}
                      data-testid={`delete-vehicle-${vehicle.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredVehicles.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">
                {i18n.language === 'fr' ? 'Aucun véhicule trouvé' : 'No vehicles found'}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent data-testid="category-dialog">
          <DialogHeader>
            <DialogTitle>
              {i18n.language === 'fr' ? 'Créer une catégorie' : 'Create Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder={i18n.language === 'fr' ? 'Nom de la catégorie' : 'Category name'}
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              data-testid="category-name-input"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              {i18n.language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button onClick={createCategory} className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90" data-testid="save-category-btn">
              {i18n.language === 'fr' ? 'Créer' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vehicle Dialog */}
      <Dialog open={vehicleDialogOpen} onOpenChange={setVehicleDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="vehicle-dialog">
          <DialogHeader>
            <DialogTitle>
              {editingVehicle
                ? (i18n.language === 'fr' ? 'Modifier le véhicule' : 'Edit Vehicle')
                : (i18n.language === 'fr' ? 'Ajouter un véhicule' : 'Add Vehicle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Nom' : 'Name'}
                </label>
                <Input
                  value={vehicleForm.name}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, name: e.target.value }))}
                  data-testid="vehicle-name-input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Catégorie' : 'Category'}
                </label>
                <Select
                  value={vehicleForm.category_id}
                  onValueChange={(value) => setVehicleForm(prev => ({ ...prev, category_id: value }))}
                >
                  <SelectTrigger data-testid="vehicle-category-select">
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
                  {i18n.language === 'fr' ? 'Passagers' : 'Passengers'}
                </label>
                <Input
                  type="number"
                  value={vehicleForm.passengers}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, passengers: e.target.value }))}
                  data-testid="vehicle-passengers-input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Bagages' : 'Luggage'}
                </label>
                <Input
                  type="number"
                  value={vehicleForm.luggage}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, luggage: e.target.value }))}
                  data-testid="vehicle-luggage-input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Motorisation' : 'Motorization'}
                </label>
                <Select
                  value={vehicleForm.motorization}
                  onValueChange={(value) => setVehicleForm(prev => ({ ...prev, motorization: value }))}
                >
                  <SelectTrigger data-testid="vehicle-motorization-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {motorizations.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Image URL' : 'Image URL'}
                </label>
                <Input
                  value={vehicleForm.image_url}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://..."
                  data-testid="vehicle-image-input"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {i18n.language === 'fr' ? 'Tags' : 'Tags'}
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <Button
                    key={tag}
                    type="button"
                    variant={vehicleForm.tags.includes(tag) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleTag(tag)}
                    className={vehicleForm.tags.includes(tag) ? 'bg-[#F5A623] hover:bg-[#F5A623]/90' : ''}
                    data-testid={`tag-${tag}`}
                  >
                    {getTagIcon(tag)}
                    <span className="ml-1">{tag}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVehicleDialogOpen(false)}>
              {i18n.language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button onClick={saveVehicle} className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90" data-testid="save-vehicle-btn">
              {i18n.language === 'fr' ? 'Enregistrer' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVehiclesPage;
