import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  User, Mail, Phone, MapPin, Building, FileText, Upload, Save, CheckCircle, DollarSign
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AgentProfilePage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    agency_name: '',
    agency_address: '',
    agency_city: '',
    agency_postal_code: '',
    phone: '',
    license_number: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/agents/profile`);
      const data = response.data;

      setProfile(data);
      setFormData({
        agency_name: data.agency_name || '',
        agency_address: data.agency_address || '',
        agency_city: data.agency_city || '',
        agency_postal_code: data.agency_postal_code || '',
        phone: data.phone || '',
        license_number: data.license_number || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(i18n.language === 'fr'
        ? 'Erreur lors du chargement du profil'
        : 'Error loading profile'
      );
      // Use mock data in case of error
      setProfile({
        first_name: user?.first_name || 'Agent',
        last_name: user?.last_name || 'Demo',
        email: user?.email || 'agent@example.com',
        commission_rate: 10,
        agency_name: 'Agence Auto Discount',
        phone: '+33 6 00 00 00 00'
      });
      setFormData({
        agency_name: 'Agence Auto Discount',
        agency_address: '123 Avenue de la République',
        agency_city: 'Paris',
        agency_postal_code: '75001',
        phone: '+33 6 00 00 00 00',
        license_number: 'LIC-12345678',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      await axios.put(`${API}/agents/profile`, formData);

      toast.success(i18n.language === 'fr'
        ? 'Profil mis à jour avec succès'
        : 'Profile updated successfully'
      );

      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(i18n.language === 'fr'
        ? 'Erreur lors de la mise à jour du profil'
        : 'Error updating profile'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(i18n.language === 'fr'
        ? `Document "${file.name}" uploadé (simulation)`
        : `Document "${file.name}" uploaded (simulation)`
      );
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
    <div className="space-y-6" data-testid="agent-profile-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            {i18n.language === 'fr' ? 'Mon Profil' : 'My Profile'}
          </h1>
          <p className="text-slate-600">
            {i18n.language === 'fr'
              ? 'Gérez vos informations personnelles et professionnelles'
              : 'Manage your personal and professional information'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#3D3A6B]" />
              {i18n.language === 'fr' ? 'Informations' : 'Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#3D3A6B] to-[#F5A623] flex items-center justify-center text-white text-3xl font-bold">
                {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-800">
                {profile?.first_name} {profile?.last_name}
              </h3>
              <p className="text-sm text-slate-500">{profile?.email}</p>
              <Badge className="mt-2 bg-[#F5A623]/10 text-[#F5A623]">
                {i18n.language === 'fr' ? 'Agent' : 'Agent'}
              </Badge>
            </div>

            {/* Commission Rate */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-[#F5A623]/10 to-emerald-50 border border-[#F5A623]/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-700">
                  {i18n.language === 'fr' ? 'Taux de commission' : 'Commission Rate'}
                </p>
                <DollarSign className="h-5 w-5 text-[#F5A623]" />
              </div>
              <p className="text-3xl font-bold text-[#F5A623]">
                {profile?.commission_rate || 10}%
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {i18n.language === 'fr' ? 'Non modifiable' : 'Not editable'}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-600">
                  {i18n.language === 'fr' ? 'Réservations totales' : 'Total Reservations'}
                </span>
                <span className="font-semibold text-slate-800">
                  {profile?.total_reservations || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-600">
                  {i18n.language === 'fr' ? 'Commission gagnée' : 'Commission Earned'}
                </span>
                <span className="font-semibold text-emerald-600">
                  {(profile?.total_commission || 0).toFixed(2)} €
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {i18n.language === 'fr' ? 'Informations de l\'agence' : 'Agency Information'}
            </CardTitle>
            <CardDescription>
              {i18n.language === 'fr'
                ? 'Mettez à jour les informations de votre agence'
                : 'Update your agency information'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="profile-form">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Agency Name */}
                <div className="sm:col-span-2">
                  <Label htmlFor="agency_name" className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-slate-500" />
                    {i18n.language === 'fr' ? 'Nom de l\'agence' : 'Agency Name'}
                  </Label>
                  <Input
                    id="agency_name"
                    name="agency_name"
                    value={formData.agency_name}
                    onChange={handleInputChange}
                    placeholder={i18n.language === 'fr' ? 'Ex: Agence Auto Discount Paris' : 'Ex: Auto Discount Paris Agency'}
                    className="mt-2"
                    data-testid="agency-name-input"
                  />
                </div>

                {/* Agency Address */}
                <div className="sm:col-span-2">
                  <Label htmlFor="agency_address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    {i18n.language === 'fr' ? 'Adresse' : 'Address'}
                  </Label>
                  <Input
                    id="agency_address"
                    name="agency_address"
                    value={formData.agency_address}
                    onChange={handleInputChange}
                    placeholder={i18n.language === 'fr' ? 'Ex: 123 Avenue de la République' : 'Ex: 123 Republic Avenue'}
                    className="mt-2"
                    data-testid="agency-address-input"
                  />
                </div>

                {/* City */}
                <div>
                  <Label htmlFor="agency_city">
                    {i18n.language === 'fr' ? 'Ville' : 'City'}
                  </Label>
                  <Input
                    id="agency_city"
                    name="agency_city"
                    value={formData.agency_city}
                    onChange={handleInputChange}
                    placeholder={i18n.language === 'fr' ? 'Ex: Paris' : 'Ex: Paris'}
                    className="mt-2"
                    data-testid="agency-city-input"
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <Label htmlFor="agency_postal_code">
                    {i18n.language === 'fr' ? 'Code postal' : 'Postal Code'}
                  </Label>
                  <Input
                    id="agency_postal_code"
                    name="agency_postal_code"
                    value={formData.agency_postal_code}
                    onChange={handleInputChange}
                    placeholder="75001"
                    className="mt-2"
                    data-testid="agency-postal-code-input"
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-500" />
                    {i18n.language === 'fr' ? 'Téléphone' : 'Phone'}
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+33 6 00 00 00 00"
                    className="mt-2"
                    data-testid="phone-input"
                  />
                </div>

                {/* License Number */}
                <div>
                  <Label htmlFor="license_number" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    {i18n.language === 'fr' ? 'Numéro de licence' : 'License Number'}
                  </Label>
                  <Input
                    id="license_number"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleInputChange}
                    placeholder="LIC-12345678"
                    className="mt-2"
                    data-testid="license-number-input"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  type="submit"
                  className="bg-[#F5A623] hover:bg-[#F5A623]/90"
                  disabled={saving}
                  data-testid="submit-btn"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {i18n.language === 'fr' ? 'Enregistrement...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {i18n.language === 'fr' ? 'Mettre à jour' : 'Update'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#3D3A6B]" />
            {i18n.language === 'fr' ? 'Documents' : 'Documents'}
          </CardTitle>
          <CardDescription>
            {i18n.language === 'fr'
              ? 'Gérez vos documents professionnels (simulation)'
              : 'Manage your professional documents (simulation)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* License Document */}
            <div className="p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-[#F5A623] transition-colors">
              <div className="flex flex-col items-center justify-center text-center">
                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-700 mb-1">
                  {i18n.language === 'fr' ? 'Licence professionnelle' : 'Professional License'}
                </p>
                <p className="text-xs text-slate-500 mb-3">
                  PDF, JPG, PNG (max 5MB)
                </p>
                <input
                  type="file"
                  id="license-upload"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleDocumentUpload}
                  className="hidden"
                  data-testid="license-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('license-upload')?.click()}
                >
                  {i18n.language === 'fr' ? 'Télécharger' : 'Upload'}
                </Button>
              </div>
            </div>

            {/* Insurance Document */}
            <div className="p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-[#F5A623] transition-colors">
              <div className="flex flex-col items-center justify-center text-center">
                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-700 mb-1">
                  {i18n.language === 'fr' ? 'Attestation d\'assurance' : 'Insurance Certificate'}
                </p>
                <p className="text-xs text-slate-500 mb-3">
                  PDF, JPG, PNG (max 5MB)
                </p>
                <input
                  type="file"
                  id="insurance-upload"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleDocumentUpload}
                  className="hidden"
                  data-testid="insurance-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('insurance-upload')?.click()}
                >
                  {i18n.language === 'fr' ? 'Télécharger' : 'Upload'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentProfilePage;
