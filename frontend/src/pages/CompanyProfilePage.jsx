import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import {
  Building2, MapPin, FileText, User, Phone, Mail,
  Edit, Save, XCircle, Download, CreditCard, Calendar
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CompanyProfilePage = () => {
  const { i18n } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    billing_address: '',
    tax_id: '',
    contact_person: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/companies/profile`);
      setProfile(response.data);
      setFormData({
        company_name: response.data.company_name || '',
        billing_address: response.data.billing_address || '',
        tax_id: response.data.tax_id || '',
        contact_person: response.data.contact_person || '',
        phone: response.data.phone || '',
        email: response.data.email || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors du chargement' : 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.patch(`${API}/companies/profile`, formData);
      toast.success(i18n.language === 'fr' ? 'Profil mis à jour' : 'Profile updated');
      setEditMode(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(i18n.language === 'fr' ? 'Erreur lors de la mise à jour' : 'Error updating profile');
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      company_name: profile?.company_name || '',
      billing_address: profile?.billing_address || '',
      tax_id: profile?.tax_id || '',
      contact_person: profile?.contact_person || '',
      phone: profile?.phone || '',
      email: profile?.email || ''
    });
  };

  // Mock pricing grid
  const pricingGrid = [
    { category: 'Économique', discount: 10 },
    { category: 'Berline', discount: 12 },
    { category: 'SUV', discount: 14 },
    { category: 'Premium', discount: 16 },
    { category: 'Utilitaire', discount: 18 },
  ];

  // Mock invoices
  const invoices = [
    { id: 1, number: 'INV-2024-001', date: '2024-01-15', amount: 4500, status: 'paid' },
    { id: 2, number: 'INV-2024-002', date: '2024-02-15', amount: 5200, status: 'paid' },
    { id: 3, number: 'INV-2024-003', date: '2024-03-15', amount: 4800, status: 'pending' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="company-profile-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {i18n.language === 'fr' ? 'Profil Entreprise' : 'Company Profile'}
          </h1>
          <p className="text-slate-600">
            {profile?.company_name}
          </p>
        </div>
        {!editMode ? (
          <Button onClick={() => setEditMode(true)} data-testid="edit-btn">
            <Edit className="h-4 w-4 mr-2" />
            {i18n.language === 'fr' ? 'Modifier' : 'Edit'}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} data-testid="cancel-btn">
              <XCircle className="h-4 w-4 mr-2" />
              {i18n.language === 'fr' ? 'Annuler' : 'Cancel'}
            </Button>
            <Button onClick={handleSave} data-testid="save-btn">
              <Save className="h-4 w-4 mr-2" />
              {i18n.language === 'fr' ? 'Enregistrer' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {i18n.language === 'fr' ? 'Informations entreprise' : 'Company information'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company_name">
                {i18n.language === 'fr' ? 'Nom de l\'entreprise' : 'Company name'}
              </Label>
              {editMode ? (
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  data-testid="company-name-input"
                />
              ) : (
                <p className="text-slate-800 font-medium">{profile?.company_name || '-'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_id">
                {i18n.language === 'fr' ? 'Numéro TVA / SIRET' : 'Tax ID / SIRET'}
              </Label>
              {editMode ? (
                <Input
                  id="tax_id"
                  value={formData.tax_id}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                  data-testid="tax-id-input"
                />
              ) : (
                <p className="text-slate-800 font-medium font-mono">{profile?.tax_id || '-'}</p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="billing_address">
                {i18n.language === 'fr' ? 'Adresse de facturation' : 'Billing address'}
              </Label>
              {editMode ? (
                <Input
                  id="billing_address"
                  value={formData.billing_address}
                  onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                  data-testid="billing-address-input"
                />
              ) : (
                <p className="text-slate-800 flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-slate-500" />
                  {profile?.billing_address || '-'}
                </p>
              )}
            </div>

            <Separator className="sm:col-span-2" />

            <div className="space-y-2">
              <Label htmlFor="contact_person">
                {i18n.language === 'fr' ? 'Personne de contact' : 'Contact person'}
              </Label>
              {editMode ? (
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  data-testid="contact-person-input"
                />
              ) : (
                <p className="text-slate-800 flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  {profile?.contact_person || '-'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                {i18n.language === 'fr' ? 'Téléphone' : 'Phone'}
              </Label>
              {editMode ? (
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  data-testid="phone-input"
                />
              ) : (
                <p className="text-slate-800 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-500" />
                  {profile?.phone || '-'}
                </p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              {editMode ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  data-testid="email-input"
                />
              ) : (
                <p className="text-slate-800 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  {profile?.email || '-'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pricing Grid */}
        <Card>
          <CardHeader>
            <CardTitle>
              {i18n.language === 'fr' ? 'Grille tarifaire négociée' : 'Negotiated pricing grid'}
            </CardTitle>
            <CardDescription>
              {i18n.language === 'fr' ? 'Vos remises par catégorie' : 'Your discounts by category'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pricingGrid.map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200"
                >
                  <span className="font-medium text-slate-700">{item.category}</span>
                  <Badge className="bg-emerald-100 text-emerald-700 text-base">
                    -{item.discount}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {i18n.language === 'fr' ? 'Conditions de paiement' : 'Payment terms'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">
                {i18n.language === 'fr' ? 'Délai de paiement' : 'Payment terms'}
              </p>
              <p className="text-lg font-bold text-[#3D3A6B]">NET 30</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">
                {i18n.language === 'fr' ? 'Type de facturation' : 'Billing type'}
              </p>
              <p className="text-lg font-bold text-slate-800">
                {i18n.language === 'fr' ? 'Facturation mensuelle' : 'Monthly billing'}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 mb-1">
                {i18n.language === 'fr' ? 'Caution globale' : 'Global deposit'}
              </p>
              <p className="text-lg font-bold text-blue-700">5,000 €</p>
              <p className="text-xs text-blue-600 mt-1">
                {i18n.language === 'fr' ? 'Bloquée sur compte' : 'Held on account'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {i18n.language === 'fr' ? 'Historique des factures' : 'Invoices history'}
            </CardTitle>
            <CardDescription>
              {i18n.language === 'fr' ? 'Vos dernières factures' : 'Your recent invoices'}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.info('Export en développement')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="invoices-table">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Numéro</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Date</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Montant</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Statut</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="font-mono font-medium text-[#3D3A6B]">{invoice.number}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {invoice.date}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {invoice.amount.toFixed(2)} €
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                        {invoice.status === 'paid' ? 'Payée' : 'En attente'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => toast.info('Téléchargement simulation')}>
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyProfilePage;
