import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { toast } from 'sonner';
import {
  Car, Plus, Edit, Trash2, Users, Briefcase, Zap, Heart, Sparkles, Tag,
  Upload, Image as ImageIcon, MapPin, Package, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminVehiclesAdvancedPage = () => {
  const { i18n } = useTranslation();
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [motorizationFilter, setMotorizationFilter] = useState('all');

  // Vehicle Dialog
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({
    name: '',
    category: '',
    passengers: '',
    luggage: '',
    motorization: 'essence',
    transmission: 'automatique',
    tags: [],
    image_url: '',
    images: [],
    description: '',
    features: [],
    technical_specs: {
      engine: '',
      power: '',
      fuel_consumption: '',
      co2_emissions: ''
    },
    stock_by_agency: [] // [{agency_id, quantity, status}]
  });

  // Stock Dialog
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Image Upload
  const [uploadingImage, setUploadingImage] = useState(false);

  const motorizations = ['essence', 'diesel', 'électrique', 'hybride', 'GPL'];
  const transmissions = ['manuelle', 'automatique'];
  const availableTags = ['électrique', 'hybride', 'coup de cœur', 'nouveau', 'recommandé', 'premium', 'familial'];
  const defaultFeatures = [
    'Climatisation', 'GPS', 'Bluetooth', 'Régulateur de vitesse', 'Caméra de recul',
    'Sièges chauffants', 'Toit ouvrant', 'Jantes alliage', 'Système audio premium',
    'Capteurs de stationnement', 'Démarrage sans clé', 'Vitres électriques'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, categoriesRes, agenciesRes] = await Promise.all([
        axios.get(`${API}/vehicles`),
        axios.get(`${API}/vehicles/categories`),
        axios.get(`${API}/agencies`)
      ]);
      setVehicles(vehiclesRes.data.vehicles || vehiclesRes.data || []);
      setCategories(categoriesRes.data.categories || categoriesRes.data || []);
      setAgencies(agenciesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const openVehicleDialog = (vehicle = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setVehicleForm({
        ...vehicle,
        stock_by_agency: vehicle.stock_by_agency || agencies.map(a => ({
          agency_id: a.id,
          agency_name: a.name,
          quantity: 0,
          status: 'available'
        }))
      });
    } else {
      setEditingVehicle(null);
      setVehicleForm({
        name: '',
        category: '',
        passengers: '',
        luggage: '',
        motorization: 'essence',
        transmission: 'automatique',
        tags: [],
        image_url: '',
        images: [],
        description: '',
        features: [],
        technical_specs: {
          engine: '',
          power: '',
          fuel_consumption: '',
          co2_emissions: ''
        },
        stock_by_agency: agencies.map(a => ({
          agency_id: a.id,
          agency_name: a.name,
          quantity: 0,
          status: 'available'
        }))
      });
    }
    setVehicleDialogOpen(true);
  };

  const saveVehicle = async () => {
    if (!vehicleForm.name || !vehicleForm.category) {
      toast.error('Le nom et la catégorie sont requis');
      return;
    }

    try {
      if (editingVehicle) {
        await axios.put(`${API}/admin/vehicles/${editingVehicle.id}`, vehicleForm);
        toast.success('Véhicule mis à jour');
      } else {
        await axios.post(`${API}/admin/vehicles`, vehicleForm);
        toast.success('Véhicule créé');
      }
      setVehicleDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const deleteVehicle = async (vehicleId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) return;

    try {
      await axios.delete(`${API}/admin/vehicles/${vehicleId}`);
      toast.success('Véhicule supprimé');
      fetchData();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      // Simulation upload - À remplacer par vraie intégration S3/CloudFlare
      const newImages = files.map(file => ({
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      }));

      setVehicleForm({
        ...vehicleForm,
        images: [...vehicleForm.images, ...newImages],
        image_url: vehicleForm.image_url || newImages[0].url
      });

      toast.success(`${files.length} photo(s) ajoutée(s)`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    const newImages = [...vehicleForm.images];
    newImages.splice(index, 1);
    setVehicleForm({
      ...vehicleForm,
      images: newImages,
      image_url: newImages[0]?.url || ''
    });
  };

  const toggleTag = (tag) => {
    const tags = vehicleForm.tags.includes(tag)
      ? vehicleForm.tags.filter(t => t !== tag)
      : [...vehicleForm.tags, tag];
    setVehicleForm({ ...vehicleForm, tags });
  };

  const toggleFeature = (feature) => {
    const features = vehicleForm.features.includes(feature)
      ? vehicleForm.features.filter(f => f !== feature)
      : [...vehicleForm.features, feature];
    setVehicleForm({ ...vehicleForm, features });
  };

  const updateStock = (agencyId, field, value) => {
    const newStock = vehicleForm.stock_by_agency.map(s =>
      s.agency_id === agencyId ? { ...s, [field]: value } : s
    );
    setVehicleForm({ ...vehicleForm, stock_by_agency: newStock });
  };

  const openStockDialog = (vehicle) => {
    setSelectedVehicle(vehicle);
    setStockDialogOpen(true);
  };

  const filteredVehicles = vehicles.filter(v => {
    if (categoryFilter !== 'all' && v.category !== categoryFilter) return false;
    if (motorizationFilter !== 'all' && v.motorization !== motorizationFilter) return false;
    return true;
  });

  const getTotalStock = (vehicle) => {
    return vehicle.stock_by_agency?.reduce((sum, s) => sum + (s.quantity || 0), 0) || 0;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestion Véhicules & Stock</h1>
          <p className="text-slate-600">Gérez votre flotte et les quantités par agence</p>
        </div>
        <Button
          onClick={() => openVehicleDialog()}
          className="bg-[#F5A623] hover:bg-[#F5A623]/90 text-black"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Véhicule
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Catégorie</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Motorisation</Label>
              <Select value={motorizationFilter} onValueChange={setMotorizationFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {motorizations.map(motor => (
                    <SelectItem key={motor} value={motor}>{motor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Table */}
      <Card>
        <CardHeader>
          <CardTitle>{filteredVehicles.length} véhicule(s)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Motorisation</TableHead>
                  <TableHead>Passagers</TableHead>
                  <TableHead>Stock Total</TableHead>
                  <TableHead>Par Agence</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map(vehicle => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {vehicle.image_url ? (
                          <img src={vehicle.image_url} alt={vehicle.name} className="w-full h-full object-cover" />
                        ) : (
                          <Car className="h-8 w-8 text-slate-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{vehicle.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{vehicle.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        vehicle.motorization === 'électrique' ? 'bg-green-100 text-green-800' :
                        vehicle.motorization === 'hybride' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }>
                        {vehicle.motorization}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {vehicle.passengers}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span className="font-semibold">{getTotalStock(vehicle)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openStockDialog(vehicle)}
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        Voir détail
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {vehicle.tags?.slice(0, 2).map(tag => (
                          <Badge key={tag} className="text-xs bg-[#F5A623]/20 text-[#F5A623]">
                            {tag}
                          </Badge>
                        ))}
                        {vehicle.tags?.length > 2 && (
                          <Badge className="text-xs bg-slate-100 text-slate-600">
                            +{vehicle.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openVehicleDialog(vehicle)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteVehicle(vehicle.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
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

      {/* Vehicle Dialog */}
      <Dialog open={vehicleDialogOpen} onOpenChange={setVehicleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVehicle ? 'Modifier le véhicule' : 'Nouveau véhicule'}
            </DialogTitle>
            <DialogDescription>
              Remplissez tous les détails du véhicule et gérez les stocks par agence
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="specs">Spécifications</TabsTrigger>
              <TabsTrigger value="stock">Stock</TabsTrigger>
            </TabsList>

            {/* Tab General */}
            <TabsContent value="general" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Nom du véhicule *</Label>
                  <Input
                    value={vehicleForm.name}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, name: e.target.value })}
                    placeholder="Ex: Renault Clio"
                  />
                </div>
                <div>
                  <Label>Catégorie *</Label>
                  <Select
                    value={vehicleForm.category}
                    onValueChange={(v) => setVehicleForm({ ...vehicleForm, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Passagers</Label>
                  <Input
                    type="number"
                    value={vehicleForm.passengers}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, passengers: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Bagages</Label>
                  <Input
                    type="number"
                    value={vehicleForm.luggage}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, luggage: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Motorisation</Label>
                  <Select
                    value={vehicleForm.motorization}
                    onValueChange={(v) => setVehicleForm({ ...vehicleForm, motorization: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {motorizations.map(motor => (
                        <SelectItem key={motor} value={motor}>{motor}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Transmission</Label>
                  <Select
                    value={vehicleForm.transmission}
                    onValueChange={(v) => setVehicleForm({ ...vehicleForm, transmission: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {transmissions.map(trans => (
                        <SelectItem key={trans} value={trans}>{trans}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={vehicleForm.description}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, description: e.target.value })}
                  rows={3}
                  placeholder="Description du véhicule..."
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableTags.map(tag => (
                    <Badge
                      key={tag}
                      className={`cursor-pointer ${
                        vehicleForm.tags.includes(tag)
                          ? 'bg-[#F5A623] text-black'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Équipements</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {defaultFeatures.map(feature => (
                    <div key={feature} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={vehicleForm.features.includes(feature)}
                        onChange={() => toggleFeature(feature)}
                        className="rounded"
                      />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Tab Photos */}
            <TabsContent value="photos" className="space-y-4">
              <div>
                <Label>Upload Photos</Label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-12 w-12 text-slate-400" />
                      <div>
                        <p className="font-medium">Cliquez pour uploader</p>
                        <p className="text-sm text-slate-500">ou glissez-déposez vos images</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {vehicleForm.images.length > 0 && (
                <div>
                  <Label>Galerie ({vehicleForm.images.length} photo(s))</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {vehicleForm.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img.url}
                          alt={`Photo ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                        {idx === 0 && (
                          <Badge className="absolute bottom-2 left-2 bg-[#F5A623] text-black">
                            Photo principale
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab Specs */}
            <TabsContent value="specs" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Moteur</Label>
                  <Input
                    value={vehicleForm.technical_specs.engine}
                    onChange={(e) => setVehicleForm({
                      ...vehicleForm,
                      technical_specs: { ...vehicleForm.technical_specs, engine: e.target.value }
                    })}
                    placeholder="Ex: 1.6 L 16V"
                  />
                </div>
                <div>
                  <Label>Puissance</Label>
                  <Input
                    value={vehicleForm.technical_specs.power}
                    onChange={(e) => setVehicleForm({
                      ...vehicleForm,
                      technical_specs: { ...vehicleForm.technical_specs, power: e.target.value }
                    })}
                    placeholder="Ex: 110 ch / 81 kW"
                  />
                </div>
                <div>
                  <Label>Consommation</Label>
                  <Input
                    value={vehicleForm.technical_specs.fuel_consumption}
                    onChange={(e) => setVehicleForm({
                      ...vehicleForm,
                      technical_specs: { ...vehicleForm.technical_specs, fuel_consumption: e.target.value }
                    })}
                    placeholder="Ex: 5.2 L/100km"
                  />
                </div>
                <div>
                  <Label>Émissions CO2</Label>
                  <Input
                    value={vehicleForm.technical_specs.co2_emissions}
                    onChange={(e) => setVehicleForm({
                      ...vehicleForm,
                      technical_specs: { ...vehicleForm.technical_specs, co2_emissions: e.target.value }
                    })}
                    placeholder="Ex: 120 g/km"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab Stock */}
            <TabsContent value="stock" className="space-y-4">
              <div>
                <Label>Stock par Agence</Label>
                <p className="text-sm text-slate-500 mb-4">
                  Définissez la quantité disponible dans chaque agence
                </p>
                <div className="space-y-3">
                  {vehicleForm.stock_by_agency.map((stock, idx) => (
                    <Card key={stock.agency_id}>
                      <CardContent className="p-4">
                        <div className="grid md:grid-cols-3 gap-4 items-center">
                          <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-slate-400" />
                            <div>
                              <div className="font-medium">{stock.agency_name}</div>
                              <div className="text-sm text-slate-500">Agence</div>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Quantité</Label>
                            <Input
                              type="number"
                              min="0"
                              value={stock.quantity}
                              onChange={(e) => updateStock(stock.agency_id, 'quantity', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Statut</Label>
                            <Select
                              value={stock.status}
                              onValueChange={(v) => updateStock(stock.agency_id, 'status', v)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    Disponible
                                  </div>
                                </SelectItem>
                                <SelectItem value="limited">
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-orange-500" />
                                    Stock limité
                                  </div>
                                </SelectItem>
                                <SelectItem value="unavailable">
                                  <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    Indisponible
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Stock Total</span>
                    <span className="text-2xl font-bold text-[#F5A623]">
                      {vehicleForm.stock_by_agency.reduce((sum, s) => sum + (s.quantity || 0), 0)}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setVehicleDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveVehicle} className="bg-[#F5A623] hover:bg-[#F5A623]/90 text-black">
              {editingVehicle ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Detail Dialog */}
      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stock - {selectedVehicle?.name}</DialogTitle>
            <DialogDescription>Disponibilité par agence</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {selectedVehicle?.stock_by_agency?.map(stock => (
              <div key={stock.agency_id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-slate-400" />
                  <div>
                    <div className="font-medium">{stock.agency_name}</div>
                    <div className="text-sm text-slate-500">
                      {stock.status === 'available' && <Badge className="bg-green-100 text-green-800">Disponible</Badge>}
                      {stock.status === 'limited' && <Badge className="bg-orange-100 text-orange-800">Limité</Badge>}
                      {stock.status === 'unavailable' && <Badge className="bg-red-100 text-red-800">Indisponible</Badge>}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold">{stock.quantity}</div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVehiclesAdvancedPage;
