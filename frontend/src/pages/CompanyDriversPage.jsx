import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import {
  UserPlus, Edit, XCircle, CheckCircle, AlertCircle, Upload,
  FileText, Calendar as CalendarIcon
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CompanyDriversPage = () => {
  const { i18n } = useTranslation();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    license_number: '',
    license_expiry: '',
    notes: ''
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(`${API}/companies/drivers`);
      setDrivers(response.data.drivers || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors du chargement' : 'Error loading drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (driver = null) => {
    if (driver) {
      setEditMode(true);
      setCurrentDriver(driver);
      setFormData({
        first_name: driver.first_name || '',
        last_name: driver.last_name || '',
        email: driver.email || '',
        phone: driver.phone || '',
        license_number: driver.license_number || '',
        license_expiry: driver.license_expiry || '',
        notes: driver.notes || ''
      });
    } else {
      setEditMode(false);
      setCurrentDriver(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        license_number: '',
        license_expiry: '',
        notes: ''
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editMode && currentDriver) {
        await axios.patch(`${API}/companies/drivers/${currentDriver.id}`, formData);
        toast.success(i18n.language === 'fr' ? 'Conducteur modifié' : 'Driver updated');
      } else {
        await axios.post(`${API}/companies/drivers`, formData);
        toast.success(i18n.language === 'fr' ? 'Conducteur ajouté' : 'Driver added');
      }
      setModalOpen(false);
      fetchDrivers();
    } catch (error) {
      console.error('Error saving driver:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de l\'enregistrement' : 'Error saving driver');
    }
  };

  const handleDeactivate = async (driver) => {
    if (!window.confirm(i18n.language === 'fr' ? 'Désactiver ce conducteur ?' : 'Deactivate this driver?')) {
      return;
    }

    try {
      await axios.patch(`${API}/companies/drivers/${driver.id}/deactivate`);
      toast.success(i18n.language === 'fr' ? 'Conducteur désactivé' : 'Driver deactivated');
      fetchDrivers();
    } catch (error) {
      console.error('Error deactivating driver:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de la désactivation' : 'Error deactivating');
    }
  };

  const handleUploadDocument = (driver, docType) => {
    toast.info(i18n.language === 'fr' ? 'Fonctionnalité de upload en développement' : 'Upload feature in development');
    // Simulate upload
    console.log(`Upload ${docType} for driver ${driver.id}`);
  };

  const getDocumentStatus = (driver) => {
    // Check if license is expired or about to expire
    if (!driver.license_expiry) {
      return { status: 'incomplete', label: 'Incomplet', class: 'bg-red-100 text-red-800' };
    }

    const expiryDate = new Date(driver.license_expiry);
    const now = new Date();
    const monthFromNow = new Date();
    monthFromNow.setMonth(monthFromNow.getMonth() + 1);

    if (expiryDate < now) {
      return { status: 'expired', label: 'Expiré', class: 'bg-red-100 text-red-800' };
    } else if (expiryDate < monthFromNow) {
      return { status: 'expiring', label: 'À renouveler', class: 'bg-amber-100 text-amber-800' };
    } else {
      return { status: 'complete', label: 'À jour', class: 'bg-emerald-100 text-emerald-800' };
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
    <div className="space-y-6" data-testid="company-drivers-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {i18n.language === 'fr' ? 'Gestion des conducteurs' : 'Drivers management'}
          </h1>
          <p className="text-slate-600">
            {drivers.length} {i18n.language === 'fr' ? 'conducteurs enregistrés' : 'registered drivers'}
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="btn-primary" data-testid="add-driver-btn">
          <UserPlus className="h-4 w-4 mr-2" />
          {i18n.language === 'fr' ? 'Ajouter conducteur' : 'Add driver'}
        </Button>
      </div>

      {/* Drivers Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {i18n.language === 'fr' ? 'Liste des conducteurs' : 'Drivers list'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="drivers-table">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Nom</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Téléphone</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Permis</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Documents</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Dernière utilisation</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => {
                  const docStatus = getDocumentStatus(driver);
                  return (
                    <tr key={driver.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid={`driver-row-${driver.id}`}>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-800">
                            {driver.first_name} {driver.last_name}
                          </p>
                          {driver.license_number && (
                            <p className="text-xs text-slate-500 font-mono">{driver.license_number}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {driver.email}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {driver.phone || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {driver.license_expiry ? (
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {driver.license_expiry}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={docStatus.class}>
                          {docStatus.status === 'complete' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {docStatus.status === 'incomplete' && <XCircle className="h-3 w-3 mr-1" />}
                          {(docStatus.status === 'expired' || docStatus.status === 'expiring') && <AlertCircle className="h-3 w-3 mr-1" />}
                          {docStatus.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {driver.last_used ? driver.last_used : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Modifier"
                            onClick={() => handleOpenModal(driver)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Upload documents"
                            onClick={() => handleUploadDocument(driver, 'license')}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Désactiver"
                            onClick={() => handleDeactivate(driver)}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {drivers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      {i18n.language === 'fr' ? 'Aucun conducteur enregistré' : 'No drivers registered'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Driver Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl" data-testid="driver-modal">
          <DialogHeader>
            <DialogTitle>
              {editMode
                ? (i18n.language === 'fr' ? 'Modifier conducteur' : 'Edit driver')
                : (i18n.language === 'fr' ? 'Ajouter conducteur' : 'Add driver')}
            </DialogTitle>
            <DialogDescription>
              {i18n.language === 'fr'
                ? 'Remplissez les informations du conducteur'
                : 'Fill in the driver information'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                  data-testid="first-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                  data-testid="last-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  data-testid="email-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  data-testid="phone-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license_number">Numéro de permis *</Label>
                <Input
                  id="license_number"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  required
                  data-testid="license-number-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license_expiry">Expiration permis *</Label>
                <Input
                  id="license_expiry"
                  type="date"
                  value={formData.license_expiry}
                  onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                  required
                  data-testid="license-expiry-input"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  data-testid="notes-input"
                />
              </div>
              <div className="sm:col-span-2 p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-700 mb-2">
                  {i18n.language === 'fr' ? 'Documents requis' : 'Required documents'}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                      <FileText className="h-4 w-4 inline mr-2" />
                      Copie du permis de conduire
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toast.info('Upload simulation')}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                      <FileText className="h-4 w-4 inline mr-2" />
                      Pièce d'identité
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toast.info('Upload simulation')}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                {i18n.language === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button type="submit" data-testid="submit-driver">
                {editMode
                  ? (i18n.language === 'fr' ? 'Modifier' : 'Update')
                  : (i18n.language === 'fr' ? 'Ajouter' : 'Add')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyDriversPage;
