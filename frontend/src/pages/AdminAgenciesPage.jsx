import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  MapPin, Phone, Mail, Clock, Plus, Edit, XCircle, Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminAgenciesPage = () => {
  const { i18n } = useTranslation();
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState(null);
  const [agencyForm, setAgencyForm] = useState({
    name: '',
    address: '',
    city: '',
    country: 'France',
    phone: '',
    email: '',
    opening_hours: '{"mon-fri": "08:00-18:00", "sat": "09:00-17:00", "sun": "Fermé"}',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/agencies`);
      setAgencies(response.data.agencies || response.data || []);
    } catch (error) {
      console.error('Error fetching agencies:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors du chargement' : 'Error loading agencies');
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (agency = null) => {
    if (agency) {
      setEditingAgency(agency);
      setAgencyForm({
        name: agency.name,
        address: agency.address,
        city: agency.city,
        country: agency.country || 'France',
        phone: agency.phone,
        email: agency.email,
        opening_hours: typeof agency.opening_hours === 'string'
          ? agency.opening_hours
          : JSON.stringify(agency.opening_hours || {}),
        latitude: agency.latitude || '',
        longitude: agency.longitude || ''
      });
    } else {
      setEditingAgency(null);
      setAgencyForm({
        name: '',
        address: '',
        city: '',
        country: 'France',
        phone: '',
        email: '',
        opening_hours: '{"mon-fri": "08:00-18:00", "sat": "09:00-17:00", "sun": "Fermé"}',
        latitude: '',
        longitude: ''
      });
    }
    setDialogOpen(true);
  };

  const saveAgency = async () => {
    try {
      // Validate JSON
      let openingHoursObj;
      try {
        openingHoursObj = JSON.parse(agencyForm.opening_hours);
      } catch (e) {
        toast.error(i18n.language === 'fr' ? 'Format JSON invalide pour les horaires' : 'Invalid JSON format for opening hours');
        return;
      }

      const payload = {
        ...agencyForm,
        opening_hours: openingHoursObj,
        latitude: agencyForm.latitude ? parseFloat(agencyForm.latitude) : null,
        longitude: agencyForm.longitude ? parseFloat(agencyForm.longitude) : null
      };

      if (editingAgency) {
        await axios.put(`${API}/admin/agencies/${editingAgency.id}`, payload);
        toast.success(i18n.language === 'fr' ? 'Agence mise à jour' : 'Agency updated');
      } else {
        await axios.post(`${API}/admin/agencies`, payload);
        toast.success(i18n.language === 'fr' ? 'Agence créée' : 'Agency created');
      }

      setDialogOpen(false);
      fetchAgencies();
    } catch (error) {
      console.error('Error saving agency:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de la sauvegarde' : 'Error saving agency');
    }
  };

  const toggleAgencyStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await axios.put(`${API}/admin/agencies/${id}`, { status: newStatus });
      toast.success(i18n.language === 'fr' ? 'Statut mis à jour' : 'Status updated');
      fetchAgencies();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de la mise à jour' : 'Error updating status');
    }
  };

  const handlePhotoUpload = () => {
    toast.info(i18n.language === 'fr' ? 'Fonctionnalité de téléchargement simulée' : 'Upload feature simulated');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-agencies-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {i18n.language === 'fr' ? 'Gestion des agences' : 'Agency Management'}
          </h1>
          <p className="text-slate-600">
            {i18n.language === 'fr'
              ? `${agencies.length} agence(s) disponible(s)`
              : `${agencies.length} agency(ies) available`}
          </p>
        </div>
        <Button onClick={() => openDialog()} className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90" data-testid="create-agency-btn">
          <Plus className="h-4 w-4 mr-2" />
          {i18n.language === 'fr' ? 'Créer agence' : 'Create Agency'}
        </Button>
      </div>

      {/* Agencies Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agencies.map((agency) => (
          <Card key={agency.id} className="card-hover" data-testid={`agency-card-${agency.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{agency.name}</CardTitle>
                <Badge className={agency.status === 'inactive' ? 'bg-slate-100 text-slate-800' : 'bg-emerald-100 text-emerald-800'}>
                  {agency.status === 'inactive' ? 'Inactif' : 'Actif'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p>{agency.address}</p>
                  <p>{agency.city}, {agency.country || 'France'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>{agency.phone}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{agency.email}</span>
              </div>

              {agency.opening_hours && (
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    {typeof agency.opening_hours === 'object'
                      ? Object.entries(agency.opening_hours).slice(0, 2).map(([key, value]) => (
                        <div key={key}>{key}: {value}</div>
                      ))
                      : <div>{agency.opening_hours}</div>
                    }
                  </div>
                </div>
              )}

              {agency.latitude && agency.longitude && (
                <div className="text-xs text-slate-500">
                  GPS: {agency.latitude}, {agency.longitude}
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openDialog(agency)}
                  data-testid={`edit-agency-${agency.id}`}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {i18n.language === 'fr' ? 'Modifier' : 'Edit'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAgencyStatus(agency.id, agency.status || 'active')}
                  data-testid={`toggle-agency-${agency.id}`}
                >
                  <XCircle className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {agencies.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            {i18n.language === 'fr' ? 'Aucune agence trouvée' : 'No agencies found'}
          </div>
        )}
      </div>

      {/* Agency Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="agency-dialog">
          <DialogHeader>
            <DialogTitle>
              {editingAgency
                ? (i18n.language === 'fr' ? 'Modifier l\'agence' : 'Edit Agency')
                : (i18n.language === 'fr' ? 'Créer une agence' : 'Create Agency')}
            </DialogTitle>
            <DialogDescription>
              {i18n.language === 'fr'
                ? 'Remplissez les informations de l\'agence'
                : 'Fill in the agency information'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Nom de l\'agence' : 'Agency Name'} *
                </label>
                <Input
                  value={agencyForm.name}
                  onChange={(e) => setAgencyForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Auto Discount Paris"
                  data-testid="agency-name-input"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Adresse' : 'Address'} *
                </label>
                <Input
                  value={agencyForm.address}
                  onChange={(e) => setAgencyForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Rue de la République"
                  data-testid="agency-address-input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Ville' : 'City'} *
                </label>
                <Input
                  value={agencyForm.city}
                  onChange={(e) => setAgencyForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Paris"
                  data-testid="agency-city-input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Pays' : 'Country'} *
                </label>
                <Input
                  value={agencyForm.country}
                  onChange={(e) => setAgencyForm(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="France"
                  data-testid="agency-country-input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Téléphone' : 'Phone'} *
                </label>
                <Input
                  type="tel"
                  value={agencyForm.phone}
                  onChange={(e) => setAgencyForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+33 1 23 45 67 89"
                  data-testid="agency-phone-input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Email' : 'Email'} *
                </label>
                <Input
                  type="email"
                  value={agencyForm.email}
                  onChange={(e) => setAgencyForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="paris@autodiscount.com"
                  data-testid="agency-email-input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Latitude' : 'Latitude'}
                </label>
                <Input
                  type="number"
                  step="0.000001"
                  value={agencyForm.latitude}
                  onChange={(e) => setAgencyForm(prev => ({ ...prev, latitude: e.target.value }))}
                  placeholder="48.8566"
                  data-testid="agency-latitude-input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Longitude' : 'Longitude'}
                </label>
                <Input
                  type="number"
                  step="0.000001"
                  value={agencyForm.longitude}
                  onChange={(e) => setAgencyForm(prev => ({ ...prev, longitude: e.target.value }))}
                  placeholder="2.3522"
                  data-testid="agency-longitude-input"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Horaires d\'ouverture (JSON)' : 'Opening Hours (JSON)'}
                </label>
                <textarea
                  className="w-full min-h-[100px] p-2 border rounded-md text-sm font-mono"
                  value={agencyForm.opening_hours}
                  onChange={(e) => setAgencyForm(prev => ({ ...prev, opening_hours: e.target.value }))}
                  placeholder='{"mon-fri": "08:00-18:00", "sat": "09:00-17:00", "sun": "Fermé"}'
                  data-testid="agency-hours-input"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {i18n.language === 'fr'
                    ? 'Format JSON requis. Exemple ci-dessus.'
                    : 'JSON format required. Example above.'}
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium mb-2 block">
                  {i18n.language === 'fr' ? 'Photo de l\'agence' : 'Agency Photo'}
                </label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePhotoUpload}
                  className="w-full"
                  data-testid="upload-photo-btn"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {i18n.language === 'fr' ? 'Télécharger une photo (simulation)' : 'Upload Photo (simulation)'}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {i18n.language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button onClick={saveAgency} className="bg-[#3D3A6B] hover:bg-[#3D3A6B]/90" data-testid="save-agency-btn">
              {i18n.language === 'fr' ? 'Enregistrer' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAgenciesPage;
